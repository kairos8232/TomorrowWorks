"""Match Coursera courses to the ESCO skills of our nine roles, using RunPod.

Usage (on Carson's Mac; needs numpy and the RunPod key; about 15-30 minutes):
    export RUNPOD_API_KEY=...            # or put it in .env (gitignored)
    export RUNPOD_ENDPOINT_ID=j6ssjfy9z074hp
    python3 scripts/match_courses_runpod.py
    python3 scripts/match_courses_runpod.py --fake 300   # offline test, no RunPod

Steps:
1. Read data/raw/coursera-catalog.json (scripts/import_coursera_catalog.py).
2. Send "name. description" of each course to RunPod Job B (BAAI/bge-m3, the
   same model that embedded the ESCO skills in Job A) in batches. Vectors are
   saved to data/raw/ as they arrive, so a stopped run resumes where it left off.
3. Compare every course with every essential skill of the nine roles
   (cosine similarity against the Job A ESCO vectors).
4. Keep, per skill, the best courses at or above --threshold.

Writes data/derived/coursera-skill-matches.json (committed: course name, link,
Coursera's stated workload, similarity; no descriptions) and
data/derived/coursera-spotcheck.md (a random sample for the team to review).

The model only scores how close existing course texts are to existing ESCO
skills. It never writes a course, a skill or a time estimate.
"""
import argparse
import json
import os
import random
import sys
import time
import urllib.request
from datetime import date
from pathlib import Path

import numpy as np

RAW = Path("data/raw")
CATALOGUE = RAW / "coursera-catalog.json"
VECTORS = RAW / "coursera-vectors.f16.npy"
ESCO = Path("data/derived/esco")
OUT = Path("data/derived/coursera-skill-matches.json")
SPOTCHECK = Path("data/derived/coursera-spotcheck.md")
MODEL = "BAAI/bge-m3"
MAX_CHARS = 1500  # name + start of the description; enough to say what the course teaches


def load_env():
    """Read KEY=value lines from .env if present (never printed, never written)."""
    env = Path(".env")
    if env.exists():
        for line in env.read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def course_text(c):
    return f"{c['name']}. {(c.get('description') or '').strip()}"[:MAX_CHARS]


def embed_runpod(texts, key, endpoint):
    url = f"https://api.runpod.ai/v2/{endpoint}/openai/v1/embeddings"
    body = json.dumps({"model": MODEL, "input": texts}).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    for wait in (10, 30, 90, None):
        try:
            with urllib.request.urlopen(req, timeout=180) as res:
                data = json.load(res)["data"]
            return np.array([d["embedding"] for d in sorted(data, key=lambda d: d["index"])], dtype=np.float32)
        except Exception as err:  # cold start, timeout, 5xx
            if wait is None:
                sys.exit(f"RunPod failed: {err}. Run the script again; it resumes.")
            print(f"\n  RunPod: {err}; retrying in {wait} s")
            time.sleep(wait)


def embed_fake(texts, *_):
    """Deterministic random vectors for testing the pipeline without RunPod."""
    return np.array([np.random.default_rng(abs(hash(t)) % 2**32).standard_normal(1024) for t in texts], dtype=np.float32)


def normalise(m):
    return m / np.clip(np.linalg.norm(m, axis=1, keepdims=True), 1e-12, None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--threshold", type=float, default=0.66, help="minimum cosine similarity to keep a match (set from the spot-check, 21 Oct 2026)")
    ap.add_argument("--top", type=int, default=3, help="courses kept per skill")
    ap.add_argument("--lang", default="en", help="only keep courses whose first language is this (all languages are embedded)")
    ap.add_argument("--fake", type=int, default=0, help="test with N courses and random vectors, no RunPod")
    args = ap.parse_args()

    load_env()
    key, endpoint = os.environ.get("RUNPOD_API_KEY"), os.environ.get("RUNPOD_ENDPOINT_ID")
    embed = embed_fake if args.fake else embed_runpod
    if not args.fake and not (key and endpoint):
        sys.exit("Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID (environment or .env).")

    cat = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    courses = [c for c in cat["courses"] if c.get("slug") and c.get("name") and (c.get("description") or "").strip()]
    if args.fake:
        courses = courses[:args.fake]
    print(f"{len(courses)} courses with a description (catalogue retrieved {cat['source']['retrievedAt']})")

    # 1. Embed on RunPod, resuming from saved vectors.
    vecs_path = VECTORS.with_suffix(".fake.npy") if args.fake else VECTORS
    done = np.load(vecs_path) if vecs_path.exists() else np.zeros((0, 1024), dtype=np.float16)
    started, sent = time.time(), 0
    while len(done) < len(courses):
        batch = courses[len(done):len(done) + args.batch]
        done = np.vstack([done, embed([course_text(c) for c in batch], key, endpoint).astype(np.float16)])
        np.save(vecs_path, done)
        sent += 1
        rate = len(done) / max(time.time() - started, 1e-6)
        print(f"  embedded {len(done)}/{len(courses)}  ({rate:.0f} courses/s)", end="\r", flush=True)
    seconds = round(time.time() - started, 1)
    print(f"\nEmbedding done: {sent} RunPod requests in {seconds} s this run")

    # 2. Essential skills of the nine roles, with their Job A vectors.
    roles = json.loads(Path("data/roles.json").read_text(encoding="utf-8"))["roles"]
    needed = {s["uri"]: s["label"] for r in roles for s in r["essentialSkills"]}
    index = json.loads((ESCO / "esco-skill-index.json").read_text(encoding="utf-8"))
    row = {item["uri"]: i for i, item in enumerate(index)}
    esco = np.load(ESCO / "esco-skill-vectors.f16.npy")
    uris = [u for u in needed if u in row]
    skills = normalise(esco[[row[u] for u in uris]].astype(np.float32))
    sims = skills @ normalise(done.astype(np.float32)).T  # skills x courses
    if args.lang:
        keep = np.array([(c.get("primaryLanguages") or [""])[0] == args.lang for c in courses])
        sims[:, ~keep] = -1  # never pick a course in another language

    # 3. Best courses per skill above the threshold.
    matches = {}
    for i, uri in enumerate(uris):
        best = np.argsort(-sims[i])[:args.top]
        kept = [{"slug": courses[j]["slug"], "name": courses[j]["name"],
                 "url": f"https://www.coursera.org/learn/{courses[j]['slug']}",
                 "workload": (courses[j].get("workload") or "").strip() or None,
                 "similarity": round(float(sims[i, j]), 3)}
                for j in best if sims[i, j] >= args.threshold]
        if kept:
            matches[uri] = {"label": needed[uri], "courses": kept}

    OUT.write_text(json.dumps({
        "method": {
            "model": MODEL,
            "where": "fake vectors (test only)" if args.fake else f"RunPod Serverless endpoint {endpoint} (Job B)",
            "catalogue": cat["source"],
            "coursesEmbedded": len(courses),
            "skillsCompared": len(uris),
            "threshold": args.threshold,
            "language": args.lang or "any",
            "topPerSkill": args.top,
            "matchedAt": date.today().isoformat(),
            "embedSecondsLastRun": seconds,
            "spotCheck": "21 Oct 2026, random samples per similarity band: 0.62-0.66 about half relevant; 0.66-0.70 about 10 in 12; 0.70+ nearly all. Threshold set to 0.66.",
            "note": "Similarity between Coursera's own course text and ESCO skill text. Not checked by hand; spot-check sample in coursera-spotcheck.md.",
        },
        "skills": matches,
    }, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}: {len(matches)} of {len(uris)} skills have at least one course >= {args.threshold}")

    # 4. Spot-check sample for the team.
    random.seed(7)
    sample = random.sample(sorted(matches), min(20, len(matches)))
    lines = ["# Coursera match spot-check", "",
             f"Random sample of 20 skills, top 3 courses each (threshold {args.threshold}). Mark each line ok / wrong.", ""]
    for uri in sample:
        lines.append(f"## {matches[uri]['label']}")
        lines += [f"- [ ] {c['similarity']:.3f} — {c['name']}" for c in matches[uri]["courses"][:3]]
        lines.append("")
    SPOTCHECK.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {SPOTCHECK} for review")


if __name__ == "__main__":
    main()

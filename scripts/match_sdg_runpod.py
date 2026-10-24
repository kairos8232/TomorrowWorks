"""Match the essential ESCO skills of our nine roles to official UN SDG targets, using RunPod.

Usage (on Carson's Mac; needs numpy, internet and the RunPod key; about 1 minute):
    export RUNPOD_API_KEY=...            # or put it in .env (gitignored)
    export RUNPOD_ENDPOINT_ID=j6ssjfy9z074hp
    python3 scripts/match_sdg_runpod.py
    python3 scripts/match_sdg_runpod.py --fake    # offline test, random vectors, no internet

Steps:
1. Download the official target list from the UN Statistics Division SDG API
   (https://unstats.un.org/SDGAPI/v1/sdg/Target/List) and keep the numbered
   targets (1.1 ... 17.19). Lettered targets (1.a, 1.b ...) are about how
   governments implement the goals, not about work skills, so they are left out.
   Saved as data/sources/un-sdg-targets.json (code, goal, official text).
2. Send each target's official text to RunPod Job B (BAAI/bge-m3, the same model
   that embedded the ESCO skills in Job A). One or a few requests in total.
3. Compare every essential skill of the nine roles with every target (cosine
   similarity against the Job A ESCO vectors) and keep the top 3 targets per
   skill with their similarity. The app applies the threshold, so it can be
   changed after the spot-check without running this again.

Writes data/derived/sdg-skill-matches.json and data/derived/sdg-spotcheck.md
(random skills per similarity band, for the team to mark ok / wrong).

The model only scores how close existing ESCO skill text is to existing UN
target text. It never writes a target, a skill or a reason.
"""
import argparse
import json
import random
import sys
import urllib.request
from datetime import date
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from match_courses_runpod import embed_fake, embed_runpod, load_env, normalise, MODEL, ESCO  # same model and helpers

API = "https://unstats.un.org/SDGAPI/v1/sdg/Target/List?includechildren=false"
TARGETS = Path("data/sources/un-sdg-targets.json")
OUT = Path("data/derived/sdg-skill-matches.json")
SPOTCHECK = Path("data/derived/sdg-spotcheck.md")


def download_targets():
    req = urllib.request.Request(API, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    with urllib.request.urlopen(req, timeout=60) as res:
        raw = json.load(res)
    numbered = [t for t in raw if t["code"].split(".")[1].isdigit()]
    numbered.sort(key=lambda t: tuple(int(x) for x in t["code"].split(".")))
    data = {
        "source": {
            "name": "UN Statistics Division, SDG API: Target list",
            "url": API,
            "publisher": "United Nations",
            "retrievedAt": date.today().isoformat(),
            "note": "Numbered targets only (lettered means-of-implementation targets left out). Text as published.",
        },
        "targets": [{"code": t["code"], "goal": t["goal"], "title": t["title"].strip()} for t in numbered],
    }
    TARGETS.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=3, help="targets kept per skill")
    ap.add_argument("--fake", action="store_true", help="random vectors and the saved target list; no internet")
    args = ap.parse_args()

    load_env()
    import os
    key, endpoint = os.environ.get("RUNPOD_API_KEY"), os.environ.get("RUNPOD_ENDPOINT_ID")
    if not args.fake and not (key and endpoint):
        sys.exit("Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID (environment or .env).")

    if args.fake:
        if not TARGETS.exists():
            sys.exit(f"--fake needs {TARGETS} (run once without --fake first).")
        data = json.loads(TARGETS.read_text(encoding="utf-8"))
    else:
        data = download_targets()
    targets = data["targets"]
    print(f"{len(targets)} numbered UN SDG targets (retrieved {data['source']['retrievedAt']})")

    # 1. Embed the official target texts on RunPod (32 per request).
    embed = embed_fake if args.fake else embed_runpod
    vecs = np.vstack([embed([t["title"] for t in targets[i:i + 32]], key, endpoint) for i in range(0, len(targets), 32)])
    print(f"Embedded {len(targets)} targets in {(len(targets) + 31) // 32} RunPod requests")

    # 2. Essential skills of the nine roles, with their Job A vectors.
    roles = json.loads(Path("data/roles.json").read_text(encoding="utf-8"))["roles"]
    needed = {s["uri"]: s["label"] for r in roles for s in r["essentialSkills"]}
    index = json.loads((ESCO / "esco-skill-index.json").read_text(encoding="utf-8"))
    row = {item["uri"]: i for i, item in enumerate(index)}
    esco = np.load(ESCO / "esco-skill-vectors.f16.npy")
    uris = [u for u in needed if u in row]
    sims = normalise(esco[[row[u] for u in uris]].astype(np.float32)) @ normalise(vecs.astype(np.float32)).T

    # 3. Top targets per skill, with similarity (threshold applied in the app).
    skills = {}
    for i, uri in enumerate(uris):
        best = np.argsort(-sims[i])[:args.top]
        skills[uri] = {"label": needed[uri], "targets": [{"code": targets[j]["code"], "similarity": round(float(sims[i, j]), 3)} for j in best]}

    top1 = np.sort(sims.max(axis=1))
    OUT.write_text(json.dumps({
        "method": {
            "model": MODEL,
            "where": "fake vectors (test only)" if args.fake else f"RunPod Serverless endpoint {endpoint} (Job B)",
            "targets": data["source"],
            "targetsEmbedded": len(targets),
            "skillsCompared": len(uris),
            "topPerSkill": args.top,
            "matchedAt": date.today().isoformat(),
            "bestSimilarity": {"min": round(float(top1[0]), 3), "median": round(float(np.median(top1)), 3), "max": round(float(top1[-1]), 3)},
            "note": "Similarity between ESCO skill text and the official UN target text. Not checked by hand; spot-check in sdg-spotcheck.md.",
        },
        "skills": skills,
    }, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}: {len(uris)} skills; best similarity min {top1[0]:.3f}, median {np.median(top1):.3f}, max {top1[-1]:.3f}")

    # 4. Spot-check: 6 random skills per band of best similarity, to choose the threshold.
    title = {t["code"]: t["title"] for t in targets}
    random.seed(7)
    lines = ["# SDG match spot-check", "", "For each skill, is the best UN target a fair link? Mark ok / wrong. Pick the threshold where most are ok.", ""]
    for lo, hi in [(0.0, 0.45), (0.45, 0.50), (0.50, 0.55), (0.55, 0.60), (0.60, 1.01)]:
        band = [u for u in skills if lo <= skills[u]["targets"][0]["similarity"] < hi]
        lines.append(f"## Best similarity {lo:.2f}–{min(hi, 1):.2f} ({len(band)} skills)")
        for u in random.sample(band, min(6, len(band))):
            b = skills[u]["targets"][0]
            lines.append(f"- [ ] {b['similarity']:.3f} — **{skills[u]['label']}** → {b['code']} {title[b['code']][:110]}")
        lines.append("")
    SPOTCHECK.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {SPOTCHECK} for review")


if __name__ == "__main__":
    main()

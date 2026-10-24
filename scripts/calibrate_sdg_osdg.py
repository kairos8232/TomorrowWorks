"""Measure how well our SDG matcher works, on texts labelled by people (OSDG Community Dataset).

Why: the SDG matching (scripts/match_sdg_runpod.py) compares ESCO skills with UN target
texts using BAAI/bge-m3 on RunPod. Its threshold (0.60) was chosen by looking at examples.
This script measures the same matcher on the OSDG Community Dataset, where volunteers
checked which SDG each text is about, so we can report an accuracy instead of a guess.

Usage (on Carson's Mac; needs numpy, internet and the RunPod key; about 10-20 minutes):
    export RUNPOD_API_KEY=...            # or put it in .env (gitignored)
    export RUNPOD_ENDPOINT_ID=j6ssjfy9z074hp
    python3 scripts/calibrate_sdg_osdg.py
    python3 scripts/calibrate_sdg_osdg.py --per-goal 100        # smaller and faster
    python3 scripts/calibrate_sdg_osdg.py --csv path/to/osdg.csv  # use a CSV you downloaded
    python3 scripts/calibrate_sdg_osdg.py --fake --csv small.csv  # offline test, no RunPod

Steps:
1. Download the latest OSDG Community Dataset CSV from Zenodo (the publisher's record,
   CC BY 4.0) into data/raw/osdg/ (gitignored), unless --csv is given.
2. Keep texts the volunteers agreed on (more positive than negative votes and an
   agreement score of at least --min-agreement), and take a fixed random sample of
   --per-goal texts for each SDG (seed 7, so the sample is the same every run).
3. Embed the sample and the 126 UN target texts (data/sources/un-sdg-targets.json) on
   RunPod Job B. Vectors are saved to data/raw/osdg/ as they arrive, so a stopped run
   resumes where it left off.
4. For each text, take the closest UN target. Count it correct if that target belongs
   to the SDG the volunteers gave the text. Report accuracy overall and per similarity
   band, and how many texts each threshold keeps.

Writes data/derived/sdg-osdg-calibration.json and data/derived/sdg-osdg-calibration.md.

Limits (also written into the report): OSDG labels are goals (e.g. 12), not targets
(12.6), so this measures goal-level accuracy. OSDG texts are paragraphs from documents,
not short skill names, so similarity values are not on exactly the same scale as our
skill matches: use the accuracy per band as evidence for the matcher, not as an exact
threshold for skills. The team review of our own matches (sdg-validation.csv) is still needed.
"""
import argparse
import csv
import json
import os
import random
import sys
import time
import urllib.request
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from match_courses_runpod import embed_fake, embed_runpod, load_env, normalise, MODEL  # same model and helpers

ZENODO_LATEST = "https://zenodo.org/api/records/5550238/versions/latest"
RAW = Path("data/raw/osdg")
TARGETS = Path("data/sources/un-sdg-targets.json")
OUT_JSON = Path("data/derived/sdg-osdg-calibration.json")
OUT_MD = Path("data/derived/sdg-osdg-calibration.md")
MAX_CHARS = 1500
BANDS = [(0.0, 0.45), (0.45, 0.50), (0.50, 0.55), (0.55, 0.60), (0.60, 0.65), (0.65, 1.01)]


def download_latest():
    """Find the newest version of the OSDG record on Zenodo and download its CSV."""
    req = urllib.request.Request(ZENODO_LATEST, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    with urllib.request.urlopen(req, timeout=60) as res:
        rec = json.load(res)
    files = [f for f in rec.get("files", []) if f["key"].lower().endswith(".csv")]
    if not files:
        sys.exit("No CSV in the latest OSDG record; download it by hand and pass --csv.")
    f = files[0]
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / f["key"]
    if not path.exists():
        print(f"Downloading {f['key']} ...")
        urllib.request.urlretrieve(f["links"]["self"], path)
    meta = rec.get("metadata", {})
    return path, {
        "name": "OSDG Community Dataset (OSDG-CD)",
        "publisher": "OSDG, UNDP SDG AI Lab and partners (Zenodo)",
        "url": rec.get("links", {}).get("html", "https://zenodo.org/records/5550238"),
        "doi": rec.get("doi") or meta.get("doi"),
        "version": meta.get("version"),
        "published": meta.get("publication_date"),
        "licence": "CC BY 4.0",
        "file": f["key"],
        "retrievedAt": date.today().isoformat(),
    }


def read_osdg(path):
    """OSDG CSV is tab-separated (as its record says); fall back to commas."""
    text = path.read_text(encoding="utf-8")
    delim = "\t" if text.split("\n", 1)[0].count("\t") > 0 else ","
    rows = list(csv.DictReader(text.splitlines(), delimiter=delim))
    if not rows or not {"text", "sdg"} <= set(rows[0]):
        sys.exit(f"Unexpected columns in {path}: {list(rows[0]) if rows else 'empty file'}")
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", help="OSDG CSV already downloaded (skips the download)")
    ap.add_argument("--per-goal", type=int, default=200, help="texts sampled per SDG (default 200)")
    ap.add_argument("--min-agreement", type=float, default=0.6, help="minimum OSDG agreement score (0-1)")
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--fake", action="store_true", help="random vectors, no RunPod (pipeline test only)")
    args = ap.parse_args()

    load_env()
    key, endpoint = os.environ.get("RUNPOD_API_KEY"), os.environ.get("RUNPOD_ENDPOINT_ID")
    if not args.fake and not (key and endpoint):
        sys.exit("Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID (environment or .env).")
    embed = embed_fake if args.fake else embed_runpod

    # 1. Data.
    if args.csv:
        path, source = Path(args.csv), {"name": "OSDG Community Dataset (OSDG-CD)", "url": "https://zenodo.org/records/5550238", "licence": "CC BY 4.0", "file": Path(args.csv).name, "retrievedAt": "given with --csv"}
    else:
        path, source = download_latest()
    rows = read_osdg(path)
    print(f"{len(rows)} OSDG texts in {path.name}")

    # 2. Agreed texts, fixed sample per goal.
    def agreed(r):
        try:
            pos, neg = int(r.get("labels_positive") or 0), int(r.get("labels_negative") or 0)
            agr = float(r.get("agreement") or 0)
        except ValueError:
            return False
        return pos > neg and agr >= args.min_agreement and (r.get("text") or "").strip()
    by_goal = defaultdict(list)
    for r in rows:
        if agreed(r):
            by_goal[str(int(float(r["sdg"])))].append(r)
    random.seed(7)
    sample = []
    for g in sorted(by_goal, key=int):
        sample += random.sample(by_goal[g], min(args.per_goal, len(by_goal[g])))
    goals_in_data = sorted(by_goal, key=int)
    print(f"Sample: {len(sample)} agreed texts across SDGs {', '.join(goals_in_data)} (agreement >= {args.min_agreement})")

    # 3. Embed (resumable) the texts and the UN targets.
    targets = json.loads(TARGETS.read_text(encoding="utf-8"))["targets"]
    RAW.mkdir(parents=True, exist_ok=True)
    tag = "fake" if args.fake else "runpod"
    tpath = RAW / f"un-targets-{tag}.f16.npy"
    if tpath.exists():
        tvecs = np.load(tpath).astype(np.float32)
    else:
        tvecs = np.vstack([embed([t["title"] for t in targets[i:i + 32]], key, endpoint) for i in range(0, len(targets), 32)])
        np.save(tpath, tvecs.astype(np.float16))
    vpath = RAW / f"osdg-sample-{args.per_goal}-{tag}.f16.npy"
    done = np.load(vpath) if vpath.exists() else np.zeros((0, 1024), dtype=np.float16)
    started, sent = time.time(), 0
    while len(done) < len(sample):
        batch = sample[len(done):len(done) + args.batch]
        done = np.vstack([done, embed([r["text"].strip()[:MAX_CHARS] for r in batch], key, endpoint).astype(np.float16)])
        np.save(vpath, done)
        sent += 1
        print(f"  embedded {len(done)}/{len(sample)}", end="\r", flush=True)
    print(f"\nEmbedding done: {sent} RunPod requests in {round(time.time() - started, 1)} s this run")

    # 4. Closest target per text; correct if its goal is the volunteers' goal.
    sims = normalise(done.astype(np.float32)) @ normalise(tvecs).T
    best = sims.argmax(axis=1)
    best_sim = sims.max(axis=1)
    goal_of = [t["goal"] for t in targets]
    truth = [str(int(float(r["sdg"]))) for r in sample]
    correct = np.array([goal_of[j] == g for j, g in zip(best, truth)])
    # Is the right goal among the 3 closest goals? (a goal's score = its best target)
    goal_ids = sorted({g for g in goal_of}, key=int)
    goal_sim = np.stack([sims[:, [i for i, g in enumerate(goal_of) if g == gid]].max(axis=1) for gid in goal_ids], axis=1)
    top3 = np.argsort(-goal_sim, axis=1)[:, :3]
    in_top3 = np.array([gid in [goal_ids[k] for k in row] for gid, row in zip(truth, top3)])

    bands = []
    for lo, hi in BANDS:
        m = (best_sim >= lo) & (best_sim < hi)
        bands.append({"from": lo, "to": min(hi, 1.0), "texts": int(m.sum()), "accuracy": round(float(correct[m].mean()), 3) if m.any() else None})
    at = []
    for th in (0.50, 0.55, 0.60, 0.65):
        m = best_sim >= th
        at.append({"threshold": th, "textsKept": int(m.sum()), "shareKept": round(float(m.mean()), 3), "accuracy": round(float(correct[m].mean()), 3) if m.any() else None})
    per_goal = {g: round(float(correct[np.array(truth) == g].mean()), 3) for g in goals_in_data}
    result = {
        "method": {
            "model": MODEL,
            "where": "fake vectors (test only)" if args.fake else f"RunPod Serverless endpoint {endpoint} (Job B)",
            "dataset": source,
            "sample": {"texts": len(sample), "perGoal": args.per_goal, "minAgreement": args.min_agreement, "seed": 7, "goals": goals_in_data},
            "targets": "data/sources/un-sdg-targets.json (126 numbered UN targets, official text)",
            "correctIf": "the closest UN target belongs to the SDG the OSDG volunteers gave the text (goal level)",
            "chance": round(1 / len(goal_ids), 3),
            "ranAt": date.today().isoformat(),
            "limits": "Goal-level labels, not targets. OSDG texts are document paragraphs, not short skill names, so similarity values are not on exactly the same scale as skill matches. Evidence for the matcher, not an exact threshold for skills.",
        },
        "overall": {"accuracy": round(float(correct.mean()), 3), "rightGoalInTop3": round(float(in_top3.mean()), 3)},
        "byBand": bands,
        "atThreshold": at,
        "byGoal": per_goal,
    }
    OUT_JSON.write_text(json.dumps(result, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    pct = lambda x: "–" if x is None else f"{x * 100:.0f}%"
    lines = ["# SDG matcher calibration on the OSDG Community Dataset", "",
             f"Run {result['method']['ranAt']} with {MODEL} ({result['method']['where']}). "
             f"Data: {source['name']}, {source.get('version') or ''} {source['url']} ({source['licence']}). "
             f"Sample: {len(sample)} texts the volunteers agreed on (agreement ≥ {args.min_agreement}), up to {args.per_goal} per SDG, seed 7.", "",
             f"**Overall:** the closest UN target is in the right SDG for **{pct(result['overall']['accuracy'])}** of texts "
             f"(chance: {pct(result['method']['chance'])}); the right SDG is among the 3 closest goals for {pct(result['overall']['rightGoalInTop3'])}.", "",
             "| Similarity of the closest target | Texts | Right SDG |", "|---|---|---|"]
    lines += [f"| {b['from']:.2f}–{b['to']:.2f} | {b['texts']} | {pct(b['accuracy'])} |" for b in bands]
    lines += ["", "| Keep matches at or above | Texts kept | Right SDG among kept |", "|---|---|---|"]
    lines += [f"| {a['threshold']:.2f} | {a['textsKept']} ({pct(a['shareKept'])}) | {pct(a['accuracy'])} |" for a in at]
    lines += ["", "By SDG: " + ", ".join(f"{g}: {pct(v)}" for g, v in per_goal.items()), "", f"Limits: {result['method']['limits']}", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[4:]))
    print(f"Wrote {OUT_JSON} and {OUT_MD}")


if __name__ == "__main__":
    main()

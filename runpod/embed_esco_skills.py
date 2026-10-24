"""Embed every ESCO skill on a RunPod GPU Pod (Stage 2 batch job).

Run this on a RunPod GPU Pod, not on a laptop: ~14,000 skills with ~87,000
alternative labels is quick on a GPU and slow on a CPU.

On the Pod (PyTorch template):
    pip install sentence-transformers
    python embed_esco_skills.py skills_en.csv out/

Locally, check the input without a GPU or model download:
    python3 runpod/embed_esco_skills.py "data/raw/ESCO dataset - v1.2.1 - classification - en - csv/skills_en.csv" out/ --dry-run

Writes:
    out/esco-skill-vectors.f16.npy   one normalised vector per skill (float16)
    out/esco-skill-index.json        row order: ESCO URI, preferred label, type
    out/run-info.json                model, GPU, counts, runtime (for the Tools Declaration)

Only text from ESCO is embedded. The vectors let the app *retrieve* existing
ESCO skills for a person's own description; nothing is generated.
"""
import argparse
import csv
import json
import platform
import time
from pathlib import Path

MODEL = "BAAI/bge-m3"  # multilingual (incl. Malay and Chinese queries); 1024-dim dense vectors
MAX_ALT_LABELS = 8     # keep the text short enough to embed well


def skill_texts(csv_path):
    """One text per skill: preferred label, a few alternative labels, description."""
    rows = []
    with open(csv_path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            if r["status"] != "released":
                continue
            alts = [a.strip() for a in r["altLabels"].split("\n") if a.strip()][:MAX_ALT_LABELS]
            parts = [r["preferredLabel"].strip()]
            if alts:
                parts.append("Also called: " + "; ".join(alts))
            if r["description"].strip():
                parts.append(r["description"].strip())
            rows.append({
                "uri": r["conceptUri"],
                "label": r["preferredLabel"].strip(),
                "type": r["skillType"] or "unspecified",
                "text": ". ".join(parts),
            })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("skills_csv")
    ap.add_argument("out_dir")
    ap.add_argument("--dry-run", action="store_true", help="build texts only; no model, no GPU")
    ap.add_argument("--batch-size", type=int, default=128)
    args = ap.parse_args()

    rows = skill_texts(args.skills_csv)
    print(f"{len(rows)} ESCO skills; example text:\n  {rows[0]['text'][:200]}")
    if args.dry_run:
        return

    import numpy as np
    import torch
    from sentence_transformers import SentenceTransformer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    gpu = torch.cuda.get_device_name(0) if device == "cuda" else None
    print(f"Device: {device} {gpu or ''}")

    start = time.time()
    model = SentenceTransformer(MODEL, device=device)
    vectors = model.encode([r["text"] for r in rows], batch_size=args.batch_size,
                           normalize_embeddings=True, show_progress_bar=True,
                           convert_to_numpy=True)
    seconds = round(time.time() - start, 1)

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    np.save(out / "esco-skill-vectors.f16.npy", vectors.astype("float16"))
    (out / "esco-skill-index.json").write_text(json.dumps(
        [{k: r[k] for k in ("uri", "label", "type")} for r in rows], ensure_ascii=False), encoding="utf-8")
    (out / "run-info.json").write_text(json.dumps({
        "model": MODEL, "device": device, "gpu": gpu, "skills": len(rows),
        "dimensions": int(vectors.shape[1]), "seconds": seconds,
        "source": "ESCO v1.2.1 skills_en.csv (European Commission)",
        "python": platform.python_version(), "torch": torch.__version__,
    }, indent=2), encoding="utf-8")
    print(f"Done in {seconds}s -> {out}")


if __name__ == "__main__":
    main()

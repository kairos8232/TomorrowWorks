"""Fetch OpenDOSM's monthly Labour Force Survey (lfs_month) into a JSON snapshot.

Usage (needs internet; standard library only):
    python3 scripts/import_lfs_month.py

Writes data/sources/opendosm-lfs-month.json with the latest 13 months, so the
app can show the newest unemployment rate and the change from a year earlier.

Measure notes (from the OpenDOSM catalogue page):
- lf, lf_employed, lf_unemployed, lf_outside are counts in thousands of persons.
- u_rate (unemployment rate), p_rate (participation rate) and ep_ratio are in %.
- Data from 2025 onwards uses 2020 Census population; earlier data uses the
  2010 Census, so there is a trend break. We only show the latest months.
This is a different measure from DOSM's online job ads and never feeds scores.
"""
import json
import sys
import urllib.request
from datetime import date
from pathlib import Path

API = "https://api.data.gov.my/data-catalogue?id=lfs_month&sort=-date&limit=13"
PAGE = "https://open.dosm.gov.my/data-catalogue/lfs_month"
FIELDS = ("date", "u_rate", "p_rate", "ep_ratio", "lf", "lf_employed", "lf_unemployed", "lf_outside")


def main():
    req = urllib.request.Request(API, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    with urllib.request.urlopen(req, timeout=30) as res:
        rows = json.load(res)
    if not isinstance(rows, list) or not rows:
        sys.exit(f"Unexpected response: {str(rows)[:200]}")
    missing = [f for f in FIELDS if f not in rows[0]]
    if missing:
        sys.exit(f"OpenDOSM fields changed; missing {missing}. Got {sorted(rows[0])}")

    months = sorted(({k: r[k] for k in FIELDS} for r in rows), key=lambda r: r["date"], reverse=True)
    snapshot = {
        "source": {
            "name": "OpenDOSM: Monthly Principal Labour Force Statistics (lfs_month)",
            "publisher": "Department of Statistics Malaysia (DOSM)",
            "url": PAGE,
            "api": API,
            "retrievedAt": date.today().isoformat(),
            "latestMonth": months[0]["date"][:7],
            "geography": "Malaysia",
            "measure": "Labour force counts in thousands of persons; unemployment and participation rates in %",
            "coverage": "Survey estimates. From 2025 the series uses 2020 Census population (trend break with earlier data).",
            "licence": "CC BY 4.0",
        },
        "months": months,
    }
    out = Path("data/sources/opendosm-lfs-month.json")
    out.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    latest = months[0]
    print(f"Wrote {out}: {len(months)} months, latest {latest['date'][:7]} unemployment {latest['u_rate']}%")


if __name__ == "__main__":
    main()

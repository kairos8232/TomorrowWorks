"""Download Coursera's public course catalogue (courses.v1) into data/raw/.

Usage (needs internet; standard library only; about 5 minutes):
    python3 scripts/import_coursera_catalog.py

Writes data/raw/coursera-catalog.json (gitignored: the descriptions are
Coursera's text). Only derived matches (course name, link, stated workload,
similarity) are committed, by scripts/match_courses_runpod.py.

Fields kept: id, slug, name, description, workload (as Coursera states it,
often empty), primaryLanguages, courseType. Pages of 100, one request per
second; retries a failed page 3 times.
"""
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

API = "https://api.coursera.org/api/courses.v1"
FIELDS = "name,slug,description,workload,primaryLanguages,courseType"
PAGE = 100


def get(start):
    url = f"{API}?fields={FIELDS}&start={start}&limit={PAGE}"
    req = urllib.request.Request(url, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    for wait in (5, 20, 60, None):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return json.load(res)
        except (urllib.error.URLError, TimeoutError) as err:
            if wait is None:
                sys.exit(f"Coursera page at start={start} failed: {err}. Run again later.")
            print(f"  page {start} failed ({err}); retrying in {wait} s")
            time.sleep(wait)


def main():
    courses, start, total = [], 0, None
    while True:
        body = get(start)
        total = body.get("paging", {}).get("total", total)
        for c in body.get("elements", []):
            courses.append({k: c.get(k) for k in ("id", "slug", "name", "description", "workload", "primaryLanguages", "courseType")})
        nxt = body.get("paging", {}).get("next")
        print(f"{len(courses)} / {total}", end="\r", flush=True)
        if not nxt:
            break
        start = int(nxt)
        time.sleep(1)
    out = Path("data/raw/coursera-catalog.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "source": {
            "name": "Coursera course catalogue API (courses.v1)",
            "url": API,
            "retrievedAt": date.today().isoformat(),
            "total": total,
        },
        "courses": courses,
    }, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {out}: {len(courses)} courses (Coursera says {total}).")


if __name__ == "__main__":
    main()

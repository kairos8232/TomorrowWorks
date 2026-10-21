"""Fetch recent Malaysian workplace headlines from the GDELT DOC 2.0 API.

Usage (needs internet; standard library only; one request, a few seconds):
    python3 scripts/import_gdelt_news.py

Writes data/sources/gdelt-news.json: headline, link, outlet, language, the
date GDELT first saw it, and topic tags.

Rules (see API_PLAN.md):
- Only metadata and a link to the original article are stored; no article text.
- ONE request covers all four topics (GDELT rate-limits repeated calls).
  Topic tags are then given by matching each topic's search terms in the
  headline; a headline matching none is tagged "Other". No article is read.
- News shows what was reported. It is not a count of jobs and never changes
  any score in the app.
- On "429 Too Many Requests" the script waits 60, 120, then 300 s and tries
  again. If it still fails, try again in an hour (GDELT limits by IP).
- Cite GDELT and link each original article (https://gdeltproject.org/about.html).
"""
import json
import re
import sys
import urllib.error
import time
import urllib.parse
import urllib.request
from datetime import date, datetime
from pathlib import Path

API = "https://api.gdeltproject.org/api/v2/doc/doc"
WINDOW = "4w"            # last four weeks
MAX_RECORDS = 100     # one request for all topics

# sourcecountry:MY = outlets GDELT locates in Malaysia (FIPS country code MY).
# Each topic's terms are used in the single query and again to tag headlines.
TOPICS = {
    "AI and automation": ["artificial intelligence", "generative AI", "automation", "AI"],
    "Layoffs": ["layoff", "layoffs", "retrenchment", "job cuts"],
    "Hiring": ["hiring", "job openings", "recruitment", "talent shortage"],
    "Reskilling": ["reskilling", "upskilling", "HRD Corp", "TVET"],
}
# "AI" alone is too short for GDELT's query, so it is only used for tagging.
QUERY = "(" + " OR ".join(
    f'"{t}"' if " " in t else t for terms in TOPICS.values() for t in terms if t != "AI") + ")"


def topics_for(title):
    """Topics whose terms appear in the headline as whole words (case-insensitive)."""
    found = [topic for topic, terms in TOPICS.items()
             if any(re.search(rf"\b{re.escape(t)}\b", title, re.IGNORECASE) for t in terms)]
    return found or ["Other"]


def fetch(query):
    params = {"query": f"sourcecountry:MY {query}", "mode": "artlist", "format": "json",
              "maxrecords": str(MAX_RECORDS), "timespan": WINDOW, "sort": "datedesc"}
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    for wait in (60, 120, 300, None):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                raw = res.read().decode("utf-8", errors="replace")
            break
        except urllib.error.HTTPError as err:
            if err.code != 429 or wait is None:
                sys.exit(f"GDELT error {err.code} for {query!r}. If it is 429, try again in an hour.")
            print(f"  GDELT says too many requests; waiting {wait} s and trying again...")
            time.sleep(wait)
    try:
        body = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        sys.exit(f"GDELT did not return JSON for {query!r}: {raw[:200]}")
    return url, body.get("articles", [])


def seen_iso(value):
    # GDELT format: 20261015T083000Z
    return datetime.strptime(value, "%Y%m%dT%H%M%SZ").isoformat() + "Z"


def main():
    url, found = fetch(QUERY)
    articles = {}
    for a in found:
        for field in ("url", "title", "seendate", "domain"):
            if field not in a:
                sys.exit(f"GDELT article is missing {field!r}; fields were {sorted(a)}")
        title = a["title"].strip()
        articles.setdefault(a["url"], {
            "title": title,
            "url": a["url"],
            "outlet": a["domain"],
            "language": a.get("language", ""),
            "seenAt": seen_iso(a["seendate"]),
            "topics": topics_for(title),
        })
    queries = [{"topic": "All topics (tagged by headline terms)", "query": f"sourcecountry:MY {QUERY}", "url": url, "results": len(found)}]
    for topic in [*TOPICS, "Other"]:
        print(f"{topic}: {sum(topic in a['topics'] for a in articles.values())} headlines")

    snapshot = {
        "source": {
            "name": "GDELT DOC 2.0 API (news metadata)",
            "publisher": "The GDELT Project",
            "url": "https://www.gdeltproject.org/",
            "terms": "https://gdeltproject.org/about.html",
            "retrievedAt": date.today().isoformat(),
            "window": "last 4 weeks before retrieval",
            "geography": "News outlets located in Malaysia (GDELT sourcecountry:MY)",
            "measure": "Headlines reported; not job counts. Topic = search terms found in the headline.",
        },
        "queries": queries,
        "articles": sorted(articles.values(), key=lambda a: a["seenAt"], reverse=True),
    }
    out = Path("data/sources/gdelt-news.json")
    out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}: {len(articles)} unique articles")


if __name__ == "__main__":
    main()

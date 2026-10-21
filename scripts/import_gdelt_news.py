"""Fetch recent Malaysian workplace headlines from the GDELT DOC 2.0 API.

Usage (needs internet; standard library only; takes about 30 seconds):
    python3 scripts/import_gdelt_news.py

Writes data/sources/gdelt-news.json: headline, link, outlet, language, the
date GDELT first saw it, and which topic query found it.

Rules (see API_PLAN.md):
- Only metadata and a link to the original article are stored; no article text.
- Topic tags come from the query that matched, not from reading the article.
- News shows what was reported. It is not a count of jobs and never changes
  any score in the app.
- GDELT asks for at most one request every 5 seconds; this script waits 6.
- Cite GDELT and link each original article (https://gdeltproject.org/about.html).
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import date, datetime
from pathlib import Path

API = "https://api.gdeltproject.org/api/v2/doc/doc"
WINDOW = "4w"            # last four weeks
PER_TOPIC = 25

# sourcecountry:MY = outlets GDELT locates in Malaysia (FIPS country code MY).
TOPICS = {
    "AI and automation": '("artificial intelligence" OR "generative AI" OR automation)',
    "Layoffs": '(layoff OR layoffs OR retrenchment OR "job cuts")',
    "Hiring": '(hiring OR "job openings" OR recruitment OR "talent shortage")',
    "Reskilling": '(reskilling OR upskilling OR "HRD Corp" OR TVET)',
}


def fetch(query):
    params = {"query": f"sourcecountry:MY {query}", "mode": "artlist", "format": "json",
              "maxrecords": str(PER_TOPIC), "timespan": WINDOW, "sort": "datedesc"}
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "TomorrowWorks hackathon prototype"})
    with urllib.request.urlopen(req, timeout=60) as res:
        raw = res.read().decode("utf-8", errors="replace")
    try:
        body = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        sys.exit(f"GDELT did not return JSON for {query!r}: {raw[:200]}")
    return url, body.get("articles", [])


def seen_iso(value):
    # GDELT format: 20261015T083000Z
    return datetime.strptime(value, "%Y%m%dT%H%M%SZ").isoformat() + "Z"


def main():
    articles, queries = {}, []
    for i, (topic, query) in enumerate(TOPICS.items()):
        if i:
            time.sleep(6)
        url, found = fetch(query)
        queries.append({"topic": topic, "query": f"sourcecountry:MY {query}", "url": url, "results": len(found)})
        for a in found:
            for field in ("url", "title", "seendate", "domain"):
                if field not in a:
                    sys.exit(f"GDELT article is missing {field!r}; fields were {sorted(a)}")
            item = articles.setdefault(a["url"], {
                "title": a["title"].strip(),
                "url": a["url"],
                "outlet": a["domain"],
                "language": a.get("language", ""),
                "seenAt": seen_iso(a["seendate"]),
                "topics": [],
            })
            if topic not in item["topics"]:
                item["topics"].append(topic)
        print(f"{topic}: {len(found)} articles")

    snapshot = {
        "source": {
            "name": "GDELT DOC 2.0 API (news metadata)",
            "publisher": "The GDELT Project",
            "url": "https://www.gdeltproject.org/",
            "terms": "https://gdeltproject.org/about.html",
            "retrievedAt": date.today().isoformat(),
            "window": "last 4 weeks before retrieval",
            "geography": "News outlets located in Malaysia (GDELT sourcecountry:MY)",
            "measure": "Headlines reported; not job counts. Topic = the query that matched.",
        },
        "queries": queries,
        "articles": sorted(articles.values(), key=lambda a: a["seenAt"], reverse=True),
    }
    out = Path("data/sources/gdelt-news.json")
    out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}: {len(articles)} unique articles")


if __name__ == "__main__":
    main()

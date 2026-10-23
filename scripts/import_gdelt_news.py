"""Fetch recent Malaysian workplace headlines from the GDELT DOC 2.0 API.

Usage (needs internet; standard library only; one request, a few seconds):
    python3 scripts/import_gdelt_news.py
    python3 scripts/import_gdelt_news.py --retag data/sources/gdelt-news.json   # re-tag only, no network

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
# Topic words live in data/sources/news-topics.json, shared with server/news.mjs.
_TOPIC_FILE = json.loads(Path(__file__).resolve().parent.parent.joinpath("data/sources/news-topics.json").read_text(encoding="utf-8"))
TOPICS = _TOPIC_FILE["query"]
TAG_ONLY = _TOPIC_FILE["tagOnly"]
REQUIRES = _TOPIC_FILE.get("requires", {})
EXCLUDE = _TOPIC_FILE.get("exclude", {})
QUERY = "(" + " OR ".join(f'"{t}"' if " " in t else t for terms in TOPICS.values() for t in terms) + ")"


def has_term(title, term):
    """Whole-word match for Latin script; plain substring for Chinese (no spaces between words)."""
    if re.search(r"[\u4e00-\u9fff]", term):
        return term in title
    return re.search(rf"\b{re.escape(term)}\b", title, re.IGNORECASE) is not None


def topics_for(title):
    """Topics whose terms appear in the headline, after the 'requires' and 'exclude' rules in
    news-topics.json (same rule as server/news.mjs); "Other" if none."""
    has = lambda words: any(has_term(title, t) for t in words or [])
    found = []
    for n in dict.fromkeys([*TOPICS, *TAG_ONLY]):
        if not has(TOPICS.get(n, []) + TAG_ONLY.get(n, [])) or has(EXCLUDE.get(n)):
            continue
        need = REQUIRES.get(n)
        found.append(need["otherwise"] if need and not has(need["words"]) else n)
    found = list(dict.fromkeys(x for x in found if x))
    return found or ["Other"]


def clean_title(title):
    """Undo GDELT's tokenised spacing ("RM2 , 000", "deepfakes , extremist") without changing words."""
    t = re.sub(r"\s+", " ", title)
    t = re.sub(r"(\d) , (\d{3})\b", r"\1,\2", t)
    t = re.sub(r" ([,.:;?!%)])", r"\1", t)
    t = t.replace("( ", "(")
    t = re.sub(r"\s*([，。：；？！、])\s*", r"\1", t)
    return t.strip()


def dedupe(articles):
    """Drop a headline already seen from another URL (outlets syndicate the same story)."""
    seen, kept = set(), []
    for a in articles:
        key = " ".join(a["title"].lower().split())
        if key not in seen:
            seen.add(key)
            kept.append(a)
    return kept


def coverage(articles):
    seen = sorted(a["seenAt"] for a in articles)
    return {"from": seen[0][:10], "to": seen[-1][:10]} if seen else None


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


def retag(path):
    """Re-tag an existing snapshot with the current topic words (no network)."""
    snap = json.loads(Path(path).read_text(encoding="utf-8"))
    seen = set()
    kept = []
    for a in snap["articles"]:  # newest first; the same headline from a second URL is dropped
        key = " ".join(a["title"].lower().split())
        if key in seen:
            continue
        seen.add(key)
        a["title"] = clean_title(a["title"])
        a["topics"] = topics_for(a["title"])
        kept.append(a)
    snap["articles"] = kept
    snap["source"]["covered"] = coverage(snap["articles"])
    snap["source"]["measure"] = "Headlines reported; not job counts. Topic = topic words (English, Malay, Chinese) found in the headline, with the 'requires' and 'exclude' rules in news-topics.json (AI without a work word = 'AI industry'); 'Other' = none."
    Path("data/sources/gdelt-news.json").write_text(json.dumps(snap, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for topic in [*dict.fromkeys([*TOPICS, *TAG_ONLY, *(r["otherwise"] for r in REQUIRES.values())]), "Other"]:
        print(f"{topic}: {sum(topic in a['topics'] for a in snap['articles'])} headlines")


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--retag":
        return retag(sys.argv[2])
    url, found = fetch(QUERY)
    articles = {}
    for a in found:
        for field in ("url", "title", "seendate", "domain"):
            if field not in a:
                sys.exit(f"GDELT article is missing {field!r}; fields were {sorted(a)}")
        title = clean_title(a["title"])
        articles.setdefault(a["url"], {
            "title": title,
            "url": a["url"],
            "outlet": a["domain"],
            "language": a.get("language", ""),
            "seenAt": seen_iso(a["seendate"]),
            "topics": topics_for(title),
        })
    queries = [{"topic": "All topics (tagged by headline terms)", "query": f"sourcecountry:MY {QUERY}", "url": url, "results": len(found)}]
    for topic in [*dict.fromkeys([*TOPICS, *TAG_ONLY]), "Other"]:
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
            "measure": "Headlines reported; not job counts. Topic = topic words (English, Malay, Chinese) found in the headline, with the 'requires' and 'exclude' rules in news-topics.json (AI without a work word = 'AI industry'); 'Other' = none.",
            "covered": coverage(list(articles.values())),
        },
        "queries": queries,
        "articles": dedupe(sorted(articles.values(), key=lambda a: a["seenAt"], reverse=True)),
    }
    out = Path("data/sources/gdelt-news.json")
    out.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}: {len(articles)} unique articles")


if __name__ == "__main__":
    main()

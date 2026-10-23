"""Check whether DOSM has published a newer Job Market Insights (JMI) quarter.

Usage:
    python3 scripts/check_dosm_jmi.py              # check, print what to do next
    python3 scripts/check_dosm_jmi.py --download   # also save the xlsx to data/raw/
    python3 scripts/check_dosm_jmi.py --check 2026-Q2   # test on a quarter you know exists
    python3 scripts/check_dosm_jmi.py --selftest   # offline tests of the helper functions

How it works (plain steps, nothing is imported automatically):
  1. Read the newest snapshot in data/sources/dosm-jmi-*.json (its latestQuarter and release URL).
  2. Work out the next quarter and its release page URL. DOSM names the page
     big-data-analytics-job-market-insights-q<Q><YEAR> (for example ...-q22026).
  3. Ask DOSM for that page.
  4. A quarter counts as published only if the page lists an .xlsx file whose name mentions
     that quarter and year (for example Data_JMI_Q3_2026.xlsx). A page address that answers
     but lists no such file (DOSM's site may answer for any address) is reported as not published.
  5. If it is published, print the links and the import command to run.
Test it on a quarter that exists: --check 2026-Q2 must find Data_JMI_Q2_2026.xlsx.
A person still downloads/checks the file and runs scripts/import_dosm_jmi.py, so every
number in the app stays traceable to a file someone looked at.

Needs internet (DOSM is blocked in Claude's workspace; run it on Carson's Mac or in Replit's Shell).
Not yet run against the live DOSM site: the page naming is taken from the Q2 2026 URL.
"""
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "data" / "sources"
RAW = ROOT / "data" / "raw"


def next_quarter(latest: str) -> str:
    """'2026-Q2' -> '2026-Q3'; '2026-Q4' -> '2027-Q1'."""
    year, q = latest.split("-Q")
    year, q = int(year), int(q)
    return f"{year + 1}-Q1" if q == 4 else f"{year}-Q{q + 1}"


def release_url(latest_url: str, latest: str, wanted: str) -> str:
    """Swap the quarter in the latest release URL: ...-q22026 -> ...-q32026."""
    def slug(quarter: str) -> str:
        year, q = quarter.split("-Q")
        return f"q{q}{year}"
    old = slug(latest)
    if not latest_url.endswith(old):
        raise ValueError(f"Release URL does not end with {old}: {latest_url}")
    return latest_url[: -len(old)] + slug(wanted)


def find_xlsx_links(html: str, base: str) -> list[str]:
    """All .xlsx links on the page, made absolute and de-duplicated."""
    links = []
    for href in re.findall(r"""href=["']([^"']+\.xlsx)(?:\?[^"']*)?["']""", html, flags=re.I):
        if href.startswith("//"):
            href = "https:" + href
        elif href.startswith("/"):
            href = re.match(r"https?://[^/]+", base).group(0) + href
        if href not in links:
            links.append(href)
    return links


def quarter_files(links: list[str], quarter: str) -> list[str]:
    """Links whose file name mentions the quarter and year, e.g. Data_JMI_Q3_2026.xlsx for 2026-Q3."""
    year, q = quarter.split("-Q")
    pattern = re.compile(rf"Q{q}\D*{year}|{year}\D*Q{q}", re.I)
    return [link for link in links if pattern.search(link.rsplit("/", 1)[-1])]


def newest_snapshot() -> dict:
    files = sorted(SOURCES.glob("dosm-jmi-*.json"))
    if not files:
        sys.exit("No data/sources/dosm-jmi-*.json found.")
    return json.loads(files[-1].read_text(encoding="utf-8"))["source"]


def fetch(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "TomorrowWorks-check/1.0 (hackathon prototype)"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as err:
        return err.code, ""


def selftest() -> None:
    assert next_quarter("2026-Q2") == "2026-Q3"
    assert next_quarter("2026-Q4") == "2027-Q1"
    base = "https://www.dosm.gov.my/portal-main/release-content/big-data-analytics-job-market-insights-q22026"
    assert release_url(base, "2026-Q2", "2026-Q3").endswith("insights-q32026")
    assert release_url(base, "2026-Q2", "2027-Q1").endswith("insights-q12027")
    assert quarter_files(["https://x.test/Data_JMI_Q3_2026.xlsx", "https://x.test/Data_JMI_Q2_2026.xlsx"], "2026-Q3") == ["https://x.test/Data_JMI_Q3_2026.xlsx"]
    assert quarter_files(["https://x.test/other.xlsx"], "2026-Q3") == []
    html = '<a href="/uploads/Data_JMI_Q3_2026.xlsx?x=1">a</a> <a href="https://x.test/b.xlsx">b</a> <a href="/uploads/Data_JMI_Q3_2026.xlsx">dup</a>'
    assert find_xlsx_links(html, base) == ["https://www.dosm.gov.my/uploads/Data_JMI_Q3_2026.xlsx", "https://x.test/b.xlsx"]
    try:
        release_url("https://example.test/page", "2026-Q2", "2026-Q3")
        raise SystemExit("expected ValueError")
    except ValueError:
        pass
    print("selftest ok")


def main() -> None:
    if "--selftest" in sys.argv:
        selftest()
        return
    source = newest_snapshot()
    latest = source["latestQuarter"]
    wanted = sys.argv[sys.argv.index("--check") + 1] if "--check" in sys.argv else next_quarter(latest)
    url = release_url(source["url"], latest, wanted)
    print(f"Imported: {latest} ({source['name']}, published {source['publishedAt']}).")
    print(f"Checking for {wanted}: {url}")
    try:
        status, html = fetch(url)
    except urllib.error.URLError as err:
        sys.exit(f"Could not reach DOSM: {err.reason}. Run this on a computer with internet access (it is blocked in Claude's workspace).")
    if status not in (200, 404):
        sys.exit(f"Unexpected answer from DOSM: HTTP {status}. Open the page in a browser to check.")
    links = quarter_files(find_xlsx_links(html, url), wanted) if status == 200 else []
    if not links:
        print(f"{wanted} is not published yet: HTTP {status}, and no {wanted} data file is listed on the page. Nothing to import.")
        print(f"(Page size {len(html)} characters. If you know {wanted} exists, open the page in a browser and tell the team.)")
        return
    print(f"{wanted} data file found.")
    for link in links:
        print("  file:", link)
    if "--download" in sys.argv:
        RAW.mkdir(parents=True, exist_ok=True)
        target = RAW / links[0].rsplit("/", 1)[-1]
        urllib.request.urlretrieve(links[0], target)
        print(f"Saved {target.relative_to(ROOT)}.")
        file_hint = target.relative_to(ROOT)
    else:
        file_hint = "data/raw/<file>.xlsx"
    print("Next, after checking the file and the release date on the page:")
    print(f"  python3 scripts/import_dosm_jmi.py {file_hint} <release date> <today's date>")
    print("  npm run build && npm test, then republish.")


if __name__ == "__main__":
    main()

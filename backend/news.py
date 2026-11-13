"""Recent phishing and scam news from around the world.

Pulls public RSS feeds (no API key needed): Google News searches in several
country editions, plus two security news sites. Results are cached in memory
so the feeds are fetched at most once every CACHE_SECONDS.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import re
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CACHE_SECONDS = 30 * 60
TIMEOUT_SECONDS = 6
USER_AGENT = "Baitcheck/1.0 (+https://github.com/neethanjayaseelan/Baitcheck)"

GOOGLE_QUERY = 'phishing OR smishing OR "scam email" OR "scam text" when:14d'

# (country label, Google News edition parameters)
GOOGLE_EDITIONS = [
    ("United States", "en-US", "US", "US:en"),
    ("United Kingdom", "en-GB", "GB", "GB:en"),
    ("Canada", "en-CA", "CA", "CA:en"),
    ("India", "en-IN", "IN", "IN:en"),
    ("Australia", "en-AU", "AU", "AU:en"),
    ("Singapore", "en-SG", "SG", "SG:en"),
]

# Security sites cover everything; only keep stories about phishing and scams.
SECURITY_FEEDS = [
    ("BleepingComputer", "https://www.bleepingcomputer.com/feed/"),
    ("The Hacker News", "https://feeds.feedburner.com/TheHackersNews"),
]
TOPIC = re.compile(
    r"phish|smish|vish|scam|fraud|impersonat|credential|business email compromise|\bBEC\b|spoof",
    re.I,
)

_cache = {"time": 0.0, "stories": []}
_lock = threading.Lock()


def google_news_url(hl, gl, ceid):
    params = urllib.parse.urlencode({"q": GOOGLE_QUERY, "hl": hl, "gl": gl, "ceid": ceid})
    return f"https://news.google.com/rss/search?{params}"


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return response.read()


def parse_date(value):
    try:
        parsed = parsedate_to_datetime(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def parse_feed(xml_bytes, default_source=None, region=None, topic_filter=False):
    """Parse an RSS 2.0 feed into story dicts."""
    stories = []
    root = ET.fromstring(xml_bytes)
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        url = (item.findtext("link") or "").strip()
        published = parse_date(item.findtext("pubDate"))
        if not title or not url.startswith("http") or published is None:
            continue

        source_el = item.find("source")
        source = (source_el.text or "").strip() if source_el is not None else default_source
        # Google News titles end with " - Outlet name"; drop it since we show the source separately.
        if source and title.endswith(f" - {source}"):
            title = title[: -len(f" - {source}")].strip()

        if topic_filter and not TOPIC.search(title):
            continue

        stories.append({
            "title": title,
            "url": url,
            "source": source or "Unknown source",
            "region": region,
            "published": published,
        })
    return stories


def _load(feed):
    url, kwargs = feed
    try:
        return parse_feed(fetch(url), **kwargs)
    except Exception:  # one broken feed shouldn't break the whole list
        return []


def normalise(title):
    return re.sub(r"[^a-z0-9 ]", "", title.lower())[:80]


def select(stories, limit):
    """Newest first, without duplicates, and no single feed taking over the list."""
    stories = sorted(stories, key=lambda s: s["published"], reverse=True)
    per_group = max(2, -(-limit // 3))
    seen, counts, picked = set(), {}, []
    for story in stories:
        key = normalise(story["title"])
        group = story["region"] or story["source"]
        if key in seen or counts.get(group, 0) >= per_group:
            continue
        seen.add(key)
        counts[group] = counts.get(group, 0) + 1
        picked.append(story)
        if len(picked) == limit:
            break
    return picked


def gather():
    feeds = [
        (google_news_url(hl, gl, ceid), {"region": label}) for label, hl, gl, ceid in GOOGLE_EDITIONS
    ] + [
        (url, {"default_source": name, "topic_filter": True}) for name, url in SECURITY_FEEDS
    ]
    with ThreadPoolExecutor(max_workers=len(feeds)) as pool:
        results = pool.map(_load, feeds)
    return [story for batch in results for story in batch]


def get_stories(limit=9):
    with _lock:
        fresh = time.time() - _cache["time"] < CACHE_SECONDS
        if not fresh:
            stories = gather()
            if stories:
                _cache.update(time=time.time(), stories=stories)
            else:  # every feed failed: keep the last good list and retry in 2 minutes
                _cache["time"] = time.time() - CACHE_SECONDS + 120
        cached = _cache["stories"]

    return [
        {**story, "published": story["published"].astimezone(timezone.utc).isoformat()}
        for story in select(cached, limit)
    ]

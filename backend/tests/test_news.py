"""Tests for news.py using small sample feeds (no network needed).

Run from the backend folder:  python -m unittest discover tests
"""

from datetime import datetime, timezone
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import news  # noqa: E402

GOOGLE_FEED = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>phishing - Google News</title>
<item>
  <title>Police warn of fake parking fine texts - BBC</title>
  <link>https://news.google.com/rss/articles/abc</link>
  <pubDate>Mon, 16 Nov 2026 09:00:00 GMT</pubDate>
  <source url="https://www.bbc.co.uk">BBC</source>
</item>
<item>
  <title>Bank customers targeted by refund scam emails - The Guardian</title>
  <link>https://news.google.com/rss/articles/def</link>
  <pubDate>Sun, 15 Nov 2026 18:30:00 GMT</pubDate>
  <source url="https://www.theguardian.com">The Guardian</source>
</item>
<item>
  <title>Missing date is skipped - Example</title>
  <link>https://news.google.com/rss/articles/ghi</link>
</item>
</channel></rss>"""

SECURITY_FEED = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Security site</title>
<item>
  <title>New phishing kit bypasses two-factor authentication</title>
  <link>https://security.example/phishing-kit</link>
  <pubDate>Mon, 16 Nov 2026 12:00:00 +0000</pubDate>
</item>
<item>
  <title>Browser update fixes memory bug</title>
  <link>https://security.example/browser-update</link>
  <pubDate>Mon, 16 Nov 2026 13:00:00 +0000</pubDate>
</item>
</channel></rss>"""


def story(title, region, hour):
    return {
        "title": title,
        "url": "https://example.com/" + title,
        "source": "Outlet",
        "region": region,
        "published": datetime(2026, 11, 16, hour, tzinfo=timezone.utc),
    }


class ParseFeedTests(unittest.TestCase):
    def test_google_news_strips_outlet_from_title(self):
        stories = news.parse_feed(GOOGLE_FEED, region="United Kingdom")
        self.assertEqual(len(stories), 2)
        self.assertEqual(stories[0]["title"], "Police warn of fake parking fine texts")
        self.assertEqual(stories[0]["source"], "BBC")
        self.assertEqual(stories[0]["region"], "United Kingdom")

    def test_security_feed_keeps_only_scam_stories(self):
        stories = news.parse_feed(SECURITY_FEED, default_source="Security site", topic_filter=True)
        self.assertEqual([s["title"] for s in stories], ["New phishing kit bypasses two-factor authentication"])
        self.assertEqual(stories[0]["source"], "Security site")


class SelectTests(unittest.TestCase):
    def test_newest_first_without_duplicates(self):
        picked = news.select(
            [story("Old scam", "Canada", 1), story("New scam", "India", 5), story("New scam!", "Canada", 4)],
            limit=9,
        )
        self.assertEqual([s["title"] for s in picked], ["New scam", "Old scam"])

    def test_one_region_cannot_fill_the_list(self):
        many = [story(f"US story {i}", "United States", i) for i in range(10)]
        picked = news.select(many + [story("UK story", "United Kingdom", 0)], limit=6)
        regions = [s["region"] for s in picked]
        self.assertEqual(regions.count("United States"), 2)
        self.assertIn("United Kingdom", regions)


class GetStoriesTests(unittest.TestCase):
    def setUp(self):
        news._cache.update(time=0.0, stories=[])

    def test_serialises_dates_and_caches(self):
        with mock.patch.object(news, "gather", return_value=[story("Scam", "Canada", 3)]) as gather:
            first = news.get_stories()
            news.get_stories()
        self.assertEqual(gather.call_count, 1)
        self.assertEqual(first[0]["published"], "2026-11-16T03:00:00+00:00")

    def test_keeps_last_good_list_when_feeds_fail(self):
        news._cache.update(time=0.0, stories=[story("Cached scam", "India", 2)])
        with mock.patch.object(news, "gather", return_value=[]):
            result = news.get_stories()
        self.assertEqual(result[0]["title"], "Cached scam")


if __name__ == "__main__":
    unittest.main()

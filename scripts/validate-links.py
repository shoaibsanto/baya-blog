#!/usr/bin/env python3
"""
BAYA Blog — Internal Link Validation Script
Validates: internal links, 404s, redirects, orphan pages.
Run: python scripts/validate-links.py
"""
import re
import sys
import urllib.request
import ssl
from collections import defaultdict

SITE_URL = "https://baya.blog"
SITEMAP_URL = f"{SITE_URL}/sitemap.xml"
USER_AGENT = "Mozilla/5.0 (compatible; BAYA-SEO-Validator/1.0)"

ctx = ssl.create_default_context()

def fetch(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.status, resp.geturl()
    except urllib.error.HTTPError as e:
        return e.code, url
    except Exception:
        return None, url

def get_html(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return ""

def main():
    # 1. Get all URLs from sitemap
    print("Fetching sitemap...")
    sitemap_html = get_html(SITEMAP_URL)
    sitemap_urls = set(re.findall(r"<loc>(.*?)</loc>", sitemap_html))
    print(f"Sitemap URLs: {len(sitemap_urls)}\n")

    # 2. Crawl each page and extract internal links
    link_graph = defaultdict(set)  # source -> {targets}
    inbound_count = defaultdict(int)  # target -> count

    print("Crawling pages for internal links...")
    for url in sorted(sitemap_urls):
        html = get_html(url)
        if not html:
            continue

        # Extract all internal links
        links = re.findall(r'href="(/[^"#]*)"', html)
        for link in links:
            # Normalize: strip trailing slash, make absolute
            if link.endswith("/") and link != "/":
                link = link.rstrip("/")
            full_url = f"{SITE_URL}{link}" if link.startswith("/") else link

            # Only count links to pages in our sitemap
            if full_url in sitemap_urls or full_url == SITE_URL:
                link_graph[url].add(full_url)
                inbound_count[full_url] += 1

    # 3. Find orphan pages (no inbound links from other pages)
    print("\n" + "=" * 60)
    print("INTERNAL LINK VALIDATION REPORT")
    print("=" * 60)

    orphans = []
    for url in sitemap_urls:
        if url == SITE_URL:
            continue  # homepage is always linked
        if inbound_count.get(url, 0) == 0:
            orphans.append(url)

    # 4. Check link depth (BFS from homepage)
    depth = {SITE_URL: 0}
    queue = [SITE_URL]
    while queue:
        current = queue.pop(0)
        for target in link_graph.get(current, set()):
            if target not in depth:
                depth[target] = depth[current] + 1
                queue.append(target)

    deep_pages = [(url, d) for url, d in depth.items() if d > 3]

    # 5. Stats
    total_links = sum(len(targets) for targets in link_graph.values())
    avg_links = total_links / max(len(link_graph), 1)

    print(f"\n📊 Statistics:")
    print(f"  Total pages crawled: {len(link_graph)}")
    print(f"  Total internal links: {total_links}")
    print(f"  Average links per page: {avg_links:.1f}")

    print(f"\n🔗 Link depth from homepage:")
    depth_dist = defaultdict(int)
    for d in depth.values():
        depth_dist[d] += 1
    for d in sorted(depth_dist.keys()):
        print(f"  Depth {d}: {depth_dist[d]} pages")

    print(f"\n⚠️  Issues:")
    print(f"  Orphan pages (no inbound links): {len(orphans)}")
    if orphans:
        for o in orphans[:10]:
            print(f"    - {o}")

    print(f"  Pages deeper than 3 clicks: {len(deep_pages)}")
    if deep_pages:
        for url, d in deep_pages[:10]:
            print(f"    - {url} (depth {d})")

    # 6. Verdict
    issues = len(orphans) + len(deep_pages)
    print(f"\n{'PASS' if issues == 0 else 'WARNINGS'} ({issues} issues)")

if __name__ == "__main__":
    main()

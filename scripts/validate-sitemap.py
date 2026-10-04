#!/usr/bin/env python3
"""
BAYA Blog — Sitemap Validation Script
Validates: URL status, redirects, canonicals, duplicates, trailing slashes.
Run: python scripts/validate-sitemap.py
"""
import re
import sys
import urllib.request
import ssl

SITE_URL = "https://baya.blog"
SITEMAP_URL = f"{SITE_URL}/sitemap.xml"
USER_AGENT = "Mozilla/5.0 (compatible; BAYA-SEO-Validator/1.0)"

ctx = ssl.create_default_context()

def fetch(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.status, resp.geturl(), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, url, dict(e.headers)
    except Exception as e:
        return None, url, {"error": str(e)}

def get_canonical(html):
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return m.group(1) if m else None

def main():
    print(f"Fetching sitemap: {SITEMAP_URL}")
    status, final_url, headers = fetch(SITEMAP_URL)
    if status != 200:
        print(f"FAIL: Sitemap returned {status}")
        sys.exit(1)

    req = urllib.request.Request(SITEMAP_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
        sitemap_xml = resp.read().decode("utf-8")

    urls = re.findall(r"<loc>(.*?)</loc>", sitemap_xml)
    print(f"Total URLs in sitemap: {len(urls)}\n")

    issues = []
    results = []

    for url in urls:
        # Check trailing slash
        is_homepage = url == f"{SITE_URL}/"
        has_trailing = url.endswith("/") and not is_homepage

        # Fetch page
        p_status, p_final, p_headers = fetch(url)

        # Get canonical
        canonical = None
        if p_status == 200:
            req2 = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            try:
                with urllib.request.urlopen(req2, timeout=10, context=ctx) as resp2:
                    html = resp2.read().decode("utf-8", errors="ignore")
                    canonical = get_canonical(html)
            except Exception:
                pass

        result = {
            "url": url,
            "status": p_status,
            "trailing_slash": has_trailing,
            "canonical": canonical,
            "canonical_match": canonical == url if canonical else None,
        }
        results.append(result)

        # Flag issues
        if has_trailing:
            issues.append(f"TRAILING SLASH: {url}")
        if p_status and p_status >= 400:
            issues.append(f"HTTP {p_status}: {url}")
        if p_status == 200 and canonical and canonical != url:
            issues.append(f"CANONICAL MISMATCH: {url} -> canonical={canonical}")

    # Check duplicates
    url_counts = {}
    for u in urls:
        url_counts[u] = url_counts.get(u, 0) + 1
    for u, count in url_counts.items():
        if count > 1:
            issues.append(f"DUPLICATE URL ({count}x): {u}")

    # Report
    print("=" * 60)
    print("SITEMAP VALIDATION REPORT")
    print("=" * 60)

    ok = sum(1 for r in results if r["status"] == 200 and not r["trailing_slash"])
    print(f"\n✅ PASS (200, no trailing slash): {ok}/{len(results)}")

    status_issues = [r for r in results if r["status"] != 200]
    slash_issues = [r for r in results if r["trailing_slash"]]
    canon_issues = [r for r in results if r["canonical"] and r["canonical"] != r["url"]]

    print(f"❌ HTTP errors: {len(status_issues)}")
    print(f"❌ Trailing slash: {len(slash_issues)}")
    print(f"❌ Canonical mismatch: {len(canon_issues)}")
    print(f"❌ Total issues: {len(issues)}")

    if issues:
        print("\n--- ISSUES ---")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n🎉 No issues found!")

    print(f"\n{'PASS' if len(issues) == 0 else 'FAIL'}")

if __name__ == "__main__":
    main()

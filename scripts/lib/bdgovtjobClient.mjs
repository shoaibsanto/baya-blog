const BASE = "https://bdgovtjob.net/wp-json/wp/v2";

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "baya-blog-discovery-bot/1.0 (+https://baya.blog)" },
  });
  if (!res.ok) throw new Error(`bdgovtjob.net fetch failed: ${res.status} ${url}`);
  return res.json();
}

/** Latest posts, newest first, with just enough fields to detect new ones and their categories. */
export async function listLatestPosts(perPage = 20) {
  return fetchJson(
    `${BASE}/posts?per_page=${perPage}&orderby=date&order=desc&_fields=id,date,modified,slug,link,title,categories`
  );
}

/** Full post content (HTML) for fact extraction. */
export async function getPostContent(postId) {
  const post = await fetchJson(`${BASE}/posts/${postId}?_fields=content`);
  return post.content.rendered;
}

let categoryCache = null;

/** Maps category id -> slug, cached for the process lifetime (categories rarely change). */
export async function getCategorySlugMap() {
  if (categoryCache) return categoryCache;
  const categories = await fetchJson(`${BASE}/categories?per_page=100&_fields=id,slug`);
  categoryCache = new Map(categories.map((c) => [c.id, c.slug]));
  return categoryCache;
}

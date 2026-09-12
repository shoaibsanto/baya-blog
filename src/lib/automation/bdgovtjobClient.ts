const BASE = "https://bdgovtjob.net/wp-json/wp/v2";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "baya-blog-discovery-bot/1.0 (+https://baya.blog)" },
  });
  if (!res.ok) throw new Error(`bdgovtjob.net fetch failed: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

export interface SourcePost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title: { rendered: string };
  categories: number[];
}

/** Latest posts, newest first, with just enough fields to detect new/changed ones and their categories. */
export async function listLatestPosts(perPage = 50): Promise<SourcePost[]> {
  return fetchJson<SourcePost[]>(
    `${BASE}/posts?per_page=${perPage}&orderby=date&order=desc&_fields=id,date,modified,slug,link,title,categories`
  );
}

/** Full post content (HTML) for fact extraction. */
export async function getPostContent(postId: number): Promise<string> {
  const post = await fetchJson<{ content: { rendered: string } }>(`${BASE}/posts/${postId}?_fields=content`);
  return post.content.rendered;
}

let categoryCache: Map<number, string> | null = null;

/** Maps category id -> slug, cached for the process lifetime (categories rarely change). */
export async function getCategorySlugMap(): Promise<Map<number, string>> {
  if (categoryCache) return categoryCache;
  const categories = await fetchJson<{ id: number; slug: string }[]>(`${BASE}/categories?per_page=100&_fields=id,slug`);
  categoryCache = new Map(categories.map((c) => [c.id, c.slug]));
  return categoryCache;
}

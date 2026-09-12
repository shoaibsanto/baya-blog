// Commits a batch of file writes directly to GitHub via the Git Data API — no local
// git checkout needed, which matters because Vercel serverless functions have a
// read-only, ephemeral filesystem (nothing written to disk here would survive past
// the invocation). Building one tree/commit for the whole run (rather than one
// commit per file via the simpler Contents API) means a day's worth of new +
// updated articles land as a single push, which triggers exactly one Vercel deploy.

const OWNER = "shoaibsanto";
const REPO = "baya-blog";
const BRANCH = "main";
const API = "https://api.github.com";

function authHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "baya-blog-discovery-bot/1.0",
  };
}

async function gh<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status} on ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface FileWrite {
  /** Repo-relative path, e.g. "content-data/jobs/some-slug.json" */
  path: string;
  content: string;
}

/**
 * Commits `files` in one atomic commit to `main` and returns the new commit SHA.
 * Returns null if `files` is empty (nothing to do — callers should treat that as
 * "no-op, don't bother," not an error).
 */
export async function commitFiles(token: string, files: FileWrite[], message: string): Promise<string | null> {
  if (files.length === 0) return null;

  const ref = await gh<{ object: { sha: string } }>(token, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  const baseCommitSha = ref.object.sha;

  const baseCommit = await gh<{ tree: { sha: string } }>(
    token,
    `/repos/${OWNER}/${REPO}/git/commits/${baseCommitSha}`
  );
  const baseTreeSha = baseCommit.tree.sha;

  const blobs = await Promise.all(
    files.map((f) =>
      gh<{ sha: string }>(token, `/repos/${OWNER}/${REPO}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
      })
    )
  );

  const newTree = await gh<{ sha: string }>(token, `/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: files.map((f, i) => ({
        path: f.path,
        mode: "100644",
        type: "blob",
        sha: blobs[i].sha,
      })),
    }),
  });

  const newCommit = await gh<{ sha: string }>(token, `/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [baseCommitSha],
      author: { name: "baya-blog-bot", email: "bot@baya.blog" },
    }),
  });

  await gh(token, `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });

  return newCommit.sha;
}

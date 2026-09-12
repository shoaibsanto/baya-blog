import type { ExtractedFacts } from "./extractFacts";

// Content generation backend: OpenCode Go (opencode.ai/zen), model mimo-v2.5.
//
// IMPORTANT CAVEAT (see ARCHITECTURE.md "Automation Pipeline" for the full note):
// OpenCode Go is a personal $10/mo subscription meant for interactive coding-agent
// sessions, not unattended server-side automation — their own docs say traffic is
// monitored for abuse patterns exactly like a cron job calling this endpoint daily.
// The user was told this explicitly and chose to proceed anyway. To behave as close
// to their intended usage pattern as possible, a stable x-opencode-session ID is
// reused across every run (persisted alongside the discovery state), not regenerated
// per call, and a descriptive User-Agent identifies this as a real bot.

const OPENCODE_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "mimo-v2.5";

const SYSTEM_PROMPT = `তুমি BAYA Blog-এর জন্য বাংলাদেশ সরকারি/বেসরকারি চাকরির বিজ্ঞপ্তি নিয়ে original বাংলা কনটেন্ট লেখো।

কঠোর নিয়ম (এগুলো ভাঙা যাবে না):
1. তোমাকে একটি "FACTS" ব্লক দেওয়া হবে (প্রতিষ্ঠানের নাম, পদসংখ্যা, ডেডলাইন, বেতন, ইত্যাদি) — এই তথ্যগুলোই একমাত্র সত্য উৎস।
2. FACTS-এ যা নেই এমন কোনো সংখ্যা, তারিখ, নাম, বা সুনির্দিষ্ট শর্ত কখনো উদ্ভাবন করবে না। কোনো তথ্য না থাকলে সেই অংশ বাদ দাও অথবা সাধারণ (generic) পরামর্শ দাও যা নির্দিষ্ট তথ্যের ওপর নির্ভরশীল নয়।
3. bdgovtjob.net বা অন্য কোনো ওয়েবসাইটের বাক্য/লেখা কখনো হুবহু বা প্যারাফ্রেজ করে ব্যবহার করবে না — সব লেখা সম্পূর্ণ original হতে হবে।
4. bdgovtjob.net-এর version-এর চেয়ে content সমৃদ্ধ করার জন্য এক্সট্রা সেকশন যোগ করো: "এই চাকরি কাদের জন্য উপযুক্ত" বিশ্লেষণ, প্রস্তুতি টিপস, বিস্তারিত FAQ (৪-৬টি প্রশ্ন)।
5. শুধু বৈধ JSON আউটপুট দেবে, অন্য কোনো ব্যাখ্যা বা মার্কডাউন ফেন্স ছাড়া।
6. output অবশ্যই দেওয়া JSON schema-এর সাথে হুবহু মিলতে হবে।`;

function buildUserPrompt(facts: ExtractedFacts, category: string): string {
  return `FACTS (একমাত্র সত্য উৎস, এর বাইরের কোনো তথ্য উদ্ভাবন করবে না):
${JSON.stringify(facts, null, 2)}

ক্যাটাগরি: ${category}

নিচের ঠিক এই JSON schema অনুযায়ী আউটপুট দাও (শুধু JSON, আর কিছু না):

{
  "title": "string — বাংলা শিরোনাম, FACTS.organization.name ও পদসংখ্যা/পদের নাম উল্লেখ করে",
  "excerpt": "string — ১-২ বাক্যের সারাংশ",
  "tags": ["string", "..."],
  "primaryTopic": "string — kebab-case slug, প্রতিষ্ঠানের নামের ওপর ভিত্তি করে",
  "qualificationLevels": ["jsc" | "ssc" | "hsc" | "diploma" | "graduate" | "masters", "..."],
  "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN" | "OTHER",
  "requiredDocuments": ["string", "..."],
  "body": [
    // ContentBlock[] — নিচের যেকোনো টাইপ ব্যবহার করা যাবে, ক্রমানুসারে:
    { "type": "callout", "variant": "info" | "warning" | "success", "title": "string", "text": "string" },
    { "type": "heading", "level": 2, "text": "string", "id": "kebab-case-id" },
    { "type": "paragraph", "text": "string" },
    { "type": "list", "ordered": false, "items": ["string"] },
    { "type": "checklist", "items": ["string"] },
    { "type": "steps", "steps": [{ "title": "string", "text": "string" }] }
    // note: positions table ও summary table কোড নিজে থেকেই বসাবে, তাই body-তে position/summary
    // table বানানোর দরকার নেই — শুধু "পদ ও পদসংখ্যা" নামে একটা heading (id: "positions") রাখো,
    // কোডটাই সেখানে টেবিল বসিয়ে দেবে।
  ],
  "faq": [{ "question": "string", "answer": "string" }]
}

শুধু JSON আউটপুট দাও, কোনো markdown code fence বা ব্যাখ্যা ছাড়া।`;
}

export interface GeneratedArticleContent {
  title: string;
  excerpt: string;
  tags: string[];
  primaryTopic: string;
  qualificationLevels: string[];
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN" | "OTHER";
  requiredDocuments: string[];
  body: unknown[];
  faq: { question: string; answer: string }[];
}

/**
 * Calls OpenCode Go to turn extracted facts into original Bengali article content.
 * `sessionId` should be a stable ID reused across runs, not a fresh one per call.
 * Throws if OPENCODE_API_KEY is missing or the API call fails — callers should
 * treat a thrown error as "skip this post, try again next run," never fall back
 * to inventing content some other way.
 */
export async function generateArticleContent(
  facts: ExtractedFacts,
  category: string,
  sessionId: string
): Promise<GeneratedArticleContent> {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    throw new Error("OPENCODE_API_KEY is not set — cannot generate article content.");
  }

  // Hard per-call cap: a single hung/slow generation call has been observed pushing
  // the whole cron invocation past Vercel's 300s function ceiling (FUNCTION_INVOCATION_TIMEOUT,
  // no commit at all that run — worse than just skipping one post). 110s covers every
  // successful call seen in testing (max ~90s) with margin, and leaves enough of the
  // orchestrator's time budget for the post-loop git commit step.
  const res = await fetch(OPENCODE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "user-agent": "baya-blog-discovery-bot/1.0 (+https://baya.blog)",
      "x-opencode-session": sessionId,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      max_tokens: 16000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(facts, category) },
      ],
    }),
    signal: AbortSignal.timeout(110_000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenCode Go API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason !== "stop") {
    throw new Error(
      `Generation did not finish cleanly (finish_reason: ${choice?.finish_reason ?? "unknown"}) — likely truncated, skipping rather than publishing incomplete content.`
    );
  }

  const text: string | undefined = choice.message?.content;
  if (!text) throw new Error("OpenCode Go API returned no content");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model did not return parseable JSON");

  return JSON.parse(jsonMatch[0]) as GeneratedArticleContent;
}

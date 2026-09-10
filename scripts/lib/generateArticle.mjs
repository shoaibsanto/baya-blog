const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `তুমি BAYA Blog-এর জন্য বাংলাদেশ সরকারি/বেসরকারি চাকরির বিজ্ঞপ্তি নিয়ে original বাংলা কনটেন্ট লেখো।

কঠোর নিয়ম (এগুলো ভাঙা যাবে না):
1. তোমাকে একটি "FACTS" ব্লক দেওয়া হবে (প্রতিষ্ঠানের নাম, পদসংখ্যা, ডেডলাইন, বেতন, ইত্যাদি) — এই তথ্যগুলোই একমাত্র সত্য উৎস।
2. FACTS-এ যা নেই এমন কোনো সংখ্যা, তারিখ, নাম, বা সুনির্দিষ্ট শর্ত কখনো উদ্ভাবন করবে না। কোনো তথ্য না থাকলে সেই অংশ বাদ দাও অথবা সাধারণ (generic) পরামর্শ দাও যা নির্দিষ্ট তথ্যের ওপর নির্ভরশীল নয়।
3. bdgovtjob.net বা অন্য কোনো ওয়েবসাইটের বাক্য/লেখা কখনো হুবহু বা প্যারাফ্রেজ করে ব্যবহার করবে না — সব লেখা সম্পূর্ণ original হতে হবে।
4. bdgovtjob.net-এর version-এর চেয়ে content সমৃদ্ধ করার জন্য এক্সট্রা সেকশন যোগ করো: "এই চাকরি কাদের জন্য উপযুক্ত" বিশ্লেষণ, প্রস্তুতি টিপস, বিস্তারিত FAQ (৪-৬টি প্রশ্ন)।
5. শুধু বৈধ JSON আউটপুট দেবে, অন্য কোনো ব্যাখ্যা বা মার্কডাউন ফেন্স ছাড়া।
6. output অবশ্যই দেওয়া JSON schema-এর সাথে হুবহু মিলতে হবে।`;

function buildUserPrompt(facts, category) {
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
}`;
}

/**
 * Calls Claude to turn extracted facts into original Bengali article content.
 * Throws if ANTHROPIC_API_KEY is missing or the API call fails — callers should
 * treat a thrown error as "skip this post, try again next run," never fall back
 * to inventing content some other way.
 */
export async function generateArticleContent(facts, category) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set — cannot generate article content.");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(facts, category) }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Anthropic API returned no content");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model did not return parseable JSON");

  return JSON.parse(jsonMatch[0]);
}

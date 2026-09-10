import { NextRequest, NextResponse } from "next/server";
import { findRelevantJobs, type JobContext } from "@/lib/chat/findRelevantJobs";

// Same backend as the content-generation pipeline (see ARCHITECTURE.md "Automation
// Pipeline" and scripts/lib/generateArticle.mjs) — reusing OPENCODE_API_KEY rather than
// provisioning a separate key, per explicit user decision. OpenCode Go is a personal
// $10/mo subscription not meant for unattended/high-volume traffic; if this key gets
// rate-limited or flagged, that's the accepted tradeoff — don't silently swap providers.
const OPENCODE_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const MODEL = "mimo-v2.5";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 8;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(jobs: JobContext[]): string {
  const jobsBlock =
    jobs.length > 0
      ? jobs
          .map(
            (j) =>
              `- "${j.title}" | ক্যাটাগরি: ${j.category} | প্রতিষ্ঠান: ${j.organization ?? "N/A"} | পদসংখ্যা: ${
                j.totalVacancy ?? "N/A"
              } | আবেদন ফি: ${j.applicationFee ?? "N/A"} | শিক্ষাগত যোগ্যতা: ${
                j.educationRequirement ?? "N/A"
              } | ডেডলাইন: ${j.deadline ?? "N/A"} (${j.deadlineStatus}) | লিংক: ${j.url}`
          )
          .join("\n")
      : "(এই প্রশ্নের সাথে মিলে এমন কোনো চাকরির পোস্ট সাইটে পাওয়া যায়নি)";

  return `তুমি BAYA Blog (baya.blog) ওয়েবসাইটের একজন সহায়ক চ্যাট অ্যাসিস্ট্যান্ট। ইউজারদের বাংলাদেশের চাকরির বিজ্ঞপ্তি খুঁজে পেতে সাহায্য করাই তোমার একমাত্র কাজ।

কঠোর নিয়ম:
1. নিচের "প্রাসঙ্গিক চাকরি" তালিকাই তোমার একমাত্র তথ্য উৎস। এখানে না থাকা কোনো পদসংখ্যা, বেতন, ডেডলাইন, যোগ্যতা বা প্রতিষ্ঠানের নাম কখনো নিজে থেকে বানাবে না।
2. তালিকায় প্রাসঙ্গিক কিছু না থাকলে সরাসরি বলবে যে এই মুহূর্তে সাইটে মিলে এমন পোস্ট নেই, এবং ইউজারকে baya.blog-এর ক্যাটাগরি বা সার্চ ব্যবহার করার পরামর্শ দাও — কখনো অনুমান করে চাকরির তথ্য দেবে না।
3. উত্তর সংক্ষিপ্ত ও স্পষ্ট রাখো (৩-৫ বাক্য বা ছোট বুলেট লিস্ট), অপ্রয়োজনীয় ভূমিকা ছাড়া।
4. প্রাসঙ্গিক পোস্ট উল্লেখ করলে অবশ্যই তার লিংক দাও।
5. তুমি চাকরির বাইরের বিষয়ে (রাজনীতি, ব্যক্তিগত পরামর্শ, ইত্যাদি) কথা বলবে না — বিনয়ের সাথে বিষয়টি চাকরি-সংক্রান্ত প্রশ্নে ফিরিয়ে আনো।
6. ইউজার বাংলায় লিখলে বাংলায়, ইংরেজিতে লিখলে ইংরেজিতে উত্তর দাও।

প্রাসঙ্গিক চাকরি:
${jobsBlock}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "চ্যাট সহায়ক এই মুহূর্তে কনফিগার করা নেই। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 503 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "অবৈধ রিকোয়েস্ট।" }, { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(
      (m): m is ChatMessage =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }))
    .slice(-MAX_HISTORY);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage || !lastUserMessage.content.trim()) {
    return NextResponse.json({ error: "একটি প্রশ্ন লিখুন।" }, { status: 400 });
  }

  const jobs = findRelevantJobs(lastUserMessage.content);

  try {
    const res = await fetch(OPENCODE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "user-agent": "baya-blog-chatbot/1.0 (+https://baya.blog)",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 4000,
        messages: [{ role: "system", content: buildSystemPrompt(jobs) }, ...messages],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`OpenCode Go chat error ${res.status}: ${errText}`);
      return NextResponse.json(
        { error: "চ্যাট সহায়ক এই মুহূর্তে সাড়া দিতে পারছে না। একটু পর আবার চেষ্টা করুন।" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const reply: string | undefined = choice?.message?.content?.trim();

    if (!reply || (choice?.finish_reason && choice.finish_reason !== "stop")) {
      return NextResponse.json(
        { error: "উত্তর তৈরি করা যায়নি। প্রশ্নটি আরেকটু ছোট করে আবার জিজ্ঞাসা করুন।" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply,
      sources: jobs.slice(0, 3).map((j) => ({ title: j.title, url: j.url })),
    });
  } catch (err) {
    console.error("Chat API request failed:", err);
    return NextResponse.json(
      { error: "নেটওয়ার্ক সমস্যার কারণে উত্তর পাওয়া যায়নি।" },
      { status: 502 }
    );
  }
}

import { NextRequest } from "next/server";
import { runDiscovery } from "@/lib/automation/orchestrator";

// Vercel Hobby plan: 300s is both the default and the maximum function duration.
// The orchestrator's internal time budget (240s) leaves headroom for the final
// git-commit step and Vercel's own invocation overhead.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runDiscovery();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("discover-jobs cron failed:", err);
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

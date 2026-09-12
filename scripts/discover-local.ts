#!/usr/bin/env -S npx tsx
// Local test runner for the discovery pipeline — exercises the exact same
// src/lib/automation/* modules the deployed cron route uses, so this is a
// faithful test, not a separate reimplementation.
//
// Usage:
//   npm run discover:local              # dry-run: no commits, no local file writes
//   npm run discover:local -- --live    # real run: requires GITHUB_TOKEN + OPENCODE_API_KEY,
//                                       # commits directly to GitHub main (same as production)

import { runDiscovery } from "../src/lib/automation/orchestrator";

const LIVE = process.argv.includes("--live");

runDiscovery({ dryRun: !LIVE })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

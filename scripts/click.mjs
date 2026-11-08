#!/usr/bin/env node
// Click a platform button by accessible name — required for the publish bar
// and 暂存离开, which are not reachable through normal DOM queries.
//
// Usage: node scripts/click.mjs <targetId> "暂存离开"
//        node scripts/click.mjs <targetId> "暂存离开" --pos-only
import { Session, axButtonPos } from "./lib.mjs";

const [targetId, label] = process.argv.slice(2);
const posOnly = process.argv.includes("--pos-only");
if (!targetId || !label) { console.error('usage: click.mjs <targetId> "按钮名"'); process.exit(1); }

const s = await Session.attach(targetId);
try {
  const pos = await axButtonPos(s, label);
  if (!pos) { console.log("NOT FOUND:", label); process.exit(2); }
  console.log(`${label} @ ${Math.round(pos.x)},${Math.round(pos.y)}`);
  if (posOnly) process.exit(0);
  await s.clickAt(pos.x, pos.y);
  console.log("clicked", label);
} finally { s.close(); process.exit(0); }

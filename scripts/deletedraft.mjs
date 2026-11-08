#!/usr/bin/env node
// Delete a saved draft (with its confirmation dialog).
// Usage: node scripts/deletedraft.mjs <targetId> "标题"
import { Session, deleteDraft, listDrafts } from "./lib.mjs";

const [targetId, title] = process.argv.slice(2);
if (!targetId || !title) { console.error('usage: deletedraft.mjs <targetId> "标题"'); process.exit(1); }

const s = await Session.attach(targetId);
try {
  const ok = await deleteDraft(s, title);
  if (!ok) { console.log("not found:", title); process.exit(2); }
  const items = await listDrafts(s);
  console.log(`deleted. ${items.length} left`);
} finally { s.close(); process.exit(0); }

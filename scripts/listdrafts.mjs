#!/usr/bin/env node
// List every saved draft (image notes tab).
// Usage: node scripts/listdrafts.mjs <targetId>
import { Session, listDrafts } from "./lib.mjs";

const targetId = process.argv[2];
if (!targetId) { console.error("usage: listdrafts.mjs <targetId>"); process.exit(1); }

const s = await Session.attach(targetId);
try {
  const items = await listDrafts(s);
  console.log(JSON.stringify({ count: items.length, items }, null, 1));
} finally { s.close(); process.exit(0); }

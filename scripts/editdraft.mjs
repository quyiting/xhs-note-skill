#!/usr/bin/env node
// Open a saved draft for editing.
// Usage: node scripts/editdraft.mjs <targetId> "标题"
import { Session, openDraft, editorState } from "./lib.mjs";

const [targetId, title] = process.argv.slice(2);
if (!targetId || !title) { console.error('usage: editdraft.mjs <targetId> "标题"'); process.exit(1); }

const s = await Session.attach(targetId);
try {
  await openDraft(s, title);
  console.log("STATE:", JSON.stringify(await editorState(s)));
} finally { s.close(); process.exit(0); }

#!/usr/bin/env node
// Open each draft and check title / image count / paragraphs / topics.
// Leaves every draft as-is (no saving, no publishing).
//
// Usage: node scripts/verifydrafts.mjs <targetId> "标题1" "标题2" ...
import { Session, openDraft, editorState, clickButton } from "./lib.mjs";

const [targetId, ...titles] = process.argv.slice(2);
if (!targetId || !titles.length) {
  console.error('usage: verifydrafts.mjs <targetId> "标题" ...');
  process.exit(1);
}

const s = await Session.attach(targetId);
let bad = 0;
try {
  for (const title of titles) {
    try {
      await openDraft(s, title);
      const st = await editorState(s);
      const ok = st.title === title && st.images === 1 && st.topics.length >= 4 && st.paras >= 10;
      if (!ok) bad++;
      console.log(`${ok ? "OK   " : "CHECK"} ${title}`);
      console.log(`      images=${st.images} paras=${st.paras} topics=[${st.topics.join(", ")}]`);
    } catch (e) {
      bad++;
      console.log("FAIL ", title, "|", e.message);
    }
  }
  console.log(bad ? `\n${bad} draft(s) need attention` : "\nall drafts OK");
} finally { s.close(); process.exit(bad ? 1 : 0); }

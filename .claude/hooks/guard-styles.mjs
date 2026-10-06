#!/usr/bin/env node
// PreToolUse hook: blocks edits that break the style rules agents ignore most often
// (styles.md §1.4, §18; ui-kit.md §9). Exit code 2 blocks the edit and shows stderr to the agent.
import { relative } from "node:path";

const STYLE_FILE = /\.(vue|scss|css)$/;
const KIT_OR_GLOBAL_STYLES = /^client-app\/(ui-kit|assets\/styles)\//;
// `.vc-x` as a selector: preceded by start, whitespace, a combinator, `&`, `(` or `:` — not inside a JS string.
const VC_SELECTOR = /(^|[\s,>+~&(:])\.vc-[\w-]+/;
const IMPORTANT = /!important|@apply[^;]*\s![a-z]|class="([^"]*\s)?![a-z]/i;

export function check(toolInput, projectDir) {
  const file = relative(projectDir, toolInput.file_path ?? "");

  if (file.endsWith("_custom.scss")) {
    return "`_custom.scss` is reserved for client forks; the theme never adds rules there (styles.md §1.4).";
  }
  if (!STYLE_FILE.test(file)) {
    return null;
  }

  const addedLines = getAddedLines(toolInput);

  if (addedLines.some((line) => IMPORTANT.test(line))) {
    return "`!important` is forbidden in every form (styles.md §18). Fix the conflict at its cause: kit props / `--vc-<component>-…` tokens, or selector order. If that isn't possible, ask the developer.";
  }
  if (!KIT_OR_GLOBAL_STYLES.test(file) && addedLines.some((line) => VC_SELECTOR.test(line))) {
    return "No `.vc-*` selectors outside the UI kit (ui-kit.md §9). Use the component's props/slots or its `--vc-<component>-…` tokens; if neither fits, tell the developer instead of working around it.";
  }
  return null;
}

// Lines the edit introduces; lines already present in the replaced text are legacy and pass.
function getAddedLines({ content, old_string, new_string, edits }) {
  const pairs = edits ?? [{ old_string, new_string: new_string ?? content }];
  return pairs.flatMap(({ old_string: before = "", new_string: after = "" }) => {
    const existing = new Set(before.split("\n"));
    return after.split("\n").filter((line) => !existing.has(line));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  const { tool_input: toolInput } = JSON.parse(raw);
  const reason = check(toolInput, process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
  if (reason) {
    process.stderr.write(`${reason}\n`);
    process.exit(2);
  }
}

#!/usr/bin/env node
// PreToolUse hook: blocks edits that break the style rules agents ignore most often
// (styles.md §1.4, §18; ui-kit.md §9). Exit code 2 blocks the edit and shows stderr to the agent.
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

const STYLE_FILE = /\.(vue|scss|css)$/;
const KIT_OR_GLOBAL_STYLES = /(^|\/)client-app\/(ui-kit|assets\/styles)\//;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;
const VC_SELECTOR = /\.vc-[\w-]+/;
const APPLY = /@apply\s([^;]+)/g;
// `class="…"` (static value) or `:class="…"` / `v-bind:class="…"` (JS expression).
const CLASS_ATTR = /(?<=\s)(:|v-bind:)?class="([^"]*)"/g;
const JS_STRING = /'([^']*)'|`([^`]*)`/g;
// Tailwind important utility: `!mt-4`, `!-mt-4`, `lg:!hidden`.
const IMPORTANT_UTILITY = /^(\S*:)?!-?[\w[]/;

export function check(toolInput, readCurrent) {
  const file = (toolInput.file_path ?? "").replaceAll("\\", "/");

  if (file.endsWith("_custom.scss") && process.env.VC_THEME_FORK !== "1") {
    return "`_custom.scss` is reserved for client forks; the theme never adds rules there (styles.md §1.4). In a fork, set VC_THEME_FORK=1.";
  }
  if (!STYLE_FILE.test(file)) {
    return null;
  }

  const current = readCurrent(toolInput.file_path);
  const before = findViolations(file, current);
  const after = findViolations(file, applyEdit(toolInput, current));

  if (getAdded(before.important, after.important).length) {
    return "`!important` is forbidden in every form (styles.md §18). Fix the conflict at its cause: kit props / `--vc-<component>-…` tokens, or selector order. If that isn't possible, ask the developer.";
  }
  if (getAdded(before.vcSelectors, after.vcSelectors).length) {
    return "No `.vc-*` selectors outside the UI kit (ui-kit.md §9). Use the component's props/slots or its `--vc-<component>-…` tokens; if neither fits, tell the developer instead of working around it.";
  }
  return null;
}

function applyEdit({ content, old_string, new_string, replace_all, edits }, current) {
  if (content !== undefined) {
    return content;
  }
  return (edits ?? [{ old_string, new_string, replace_all }]).reduce(
    (text, edit) =>
      edit.replace_all
        ? text.replaceAll(edit.old_string, () => edit.new_string)
        : text.replace(edit.old_string, () => edit.new_string),
    current,
  );
}

function findViolations(file, text) {
  const styles = file.endsWith(".vue") ? [...text.matchAll(STYLE_BLOCK)].map((match) => match[1]).join("\n") : text;
  const classLists = [
    ...[...text.matchAll(CLASS_ATTR)].flatMap(([, bound, value]) =>
      bound ? [...value.matchAll(JS_STRING)].map((match) => match[1] ?? match[2]) : [value],
    ),
    ...[...styles.matchAll(APPLY)].map((match) => match[1]),
  ];

  return {
    important: [
      ...getLines(text).filter((line) => line.includes("!important")),
      ...classLists.flatMap((list) => list.split(/\s+/)).filter((name) => IMPORTANT_UTILITY.test(name)),
    ],
    vcSelectors: KIT_OR_GLOBAL_STYLES.test(file) ? [] : getLines(styles).filter((line) => VC_SELECTOR.test(line)),
  };
}

function getLines(text) {
  return text.split("\n").map((line) => line.trim());
}

// Violations the edit introduces. Counted as a multiset, so legacy ones stay editable but copying them is caught.
function getAdded(before, after) {
  const counts = new Map();
  before.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return after.filter((item) => {
    const count = counts.get(item) ?? 0;
    counts.set(item, count - 1);
    return count <= 0;
  });
}

function readFileOrEmpty(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    // New file.
    return "";
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  const { tool_input: toolInput } = JSON.parse(raw);
  const reason = check(toolInput, readFileOrEmpty);
  if (reason) {
    process.stderr.write(`${reason}\n`);
    process.exit(2);
  }
}

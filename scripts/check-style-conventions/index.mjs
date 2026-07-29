#!/usr/bin/env node
/**
 * Checks style-block conventions that ESLint cannot see.
 *
 * `vue/no-restricted-class` only inspects `class` attributes in <template>. Roughly half of
 * our RTL / theme-token violations live in `@apply` directives and raw CSS inside <style>
 * blocks and .scss files, which no configured linter reads. This script covers that gap.
 *
 * Plain .mjs rather than the .ts + vite-node pattern used by the other scripts in this
 * folder: it runs on every commit via lint-staged, where vite-node's ~1.5s startup is a
 * noticeable tax against this script's ~50ms of actual work. It has no dependencies.
 *
 * Advisory by default (always exits 0) to establish a baseline without blocking commits,
 * mirroring how the security rules were introduced in eslint.config.js. Pass --strict to
 * exit non-zero once the existing violations are remediated.
 *
 *   node scripts/check-style-conventions/index.mjs [--strict] [--changed] [files...]
 *
 * With no file arguments it scans all .vue/.scss files under client-app/.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict");
// `--changed` restricts findings to lines that differ from HEAD, so committing a legacy file does
// not reprint violations someone else introduced. The full audit deliberately reports everything.
const CHANGED_ONLY = process.argv.includes("--changed");
const FILE_ARGS = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

/**
 * Utility patterns that break right-to-left locales or ignore theme tokens, matched inside
 * `@apply`. The leading `(?:^|\s)` anchors to a class boundary and `(?:[\w-]+:)*` absorbs any
 * variant prefix, so `xl:ml-4` and `sm:hover:pr-2` match as well as the bare utility.
 *
 * The whole class is captured as `cls` and that is what gets reported — matching on `hit[0]`
 * instead would print the delimiter and truncate the prefix (`:ml-4` rather than `xl:ml-4`).
 */
const RULES = [
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*(?:ml|mr)-[\w[\].%/-]+)/g,
    message: "physical margin -> use ms-* / me-*",
  },
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*(?:pl|pr)-[\w[\].%/-]+)/g,
    message: "physical padding -> use ps-* / pe-*",
  },
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*text-(?:left|right))\b/g,
    message: "physical text alignment -> use text-start / text-end",
  },
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*(?:border-l|border-r)(?:-[\w[\].%/-]+)?)\b/g,
    message: "physical border side -> use border-s-* / border-e-*",
  },
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*float-(?:left|right))\b/g,
    message: "physical float -> use float-start / float-end",
  },
  {
    pattern: /(?:^|\s)(?<cls>(?:[\w-]+:)*rounded(?:-(?:sm|md|lg|xl|2xl|3xl))?)(?![\w[-])/g,
    message: "fixed corner radius -> use rounded-[--vc-radius]",
  },
];

/** Raw CSS declarations with the same problem. */
const CSS_RULES = [
  { pattern: /\bmargin-(left|right)\s*:/g, message: "physical margin -> use margin-inline-start/end" },
  { pattern: /\bpadding-(left|right)\s*:/g, message: "physical padding -> use padding-inline-start/end" },
  { pattern: /\bborder-(left|right)\s*:/g, message: "physical border -> use border-inline-start/end" },
  { pattern: /\btext-align\s*:\s*(left|right)\b/g, message: "physical text-align -> use start / end" },
];

/** Responsive variants belong in @media blocks, not inline @apply variants. */
const RESPONSIVE_VARIANT = /@apply[^;{}]*?(^|\s)(sm|md|lg|xl|2xl):/;

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) {
      continue;
    }

    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      collectFiles(full, acc);
    } else if (/\.(vue|scss)$/.test(full)) {
      acc.push(full);
    }
  }

  return acc;
}

/**
 * Returns the [start, end) character ranges that are style context for a given file:
 * the whole file for .scss, only <style> blocks for .vue.
 */
function styleRanges(source, file) {
  if (file.endsWith(".scss")) {
    return [[0, source.length]];
  }

  const ranges = [];
  const styleTag = /<style\b[^>]*>/g;
  let match;

  while ((match = styleTag.exec(source)) !== null) {
    const start = match.index + match[0].length;
    const end = source.indexOf("</style>", start);

    ranges.push([start, end === -1 ? source.length : end]);
  }

  return ranges;
}

function lineNumberAt(source, index) {
  let line = 1;

  for (let i = 0; i < index; i++) {
    if (source[i] === "\n") {
      line++;
    }
  }

  return line;
}

/** Blanks out comments so commented-out code and prose don't produce findings. */
function stripComments(block) {
  const blank = (match) => " ".repeat(match.length);

  return block.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/\/\/[^\n]*/g, blank);
}

/** Runs one rule set over `haystack`, reporting every hit at `lineOf(index)`. */
function collect(rules, haystack, lineOf) {
  const findings = [];

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;

    let hit;

    while ((hit = rule.pattern.exec(haystack)) !== null) {
      // RULES capture the class as `cls`; CSS_RULES have no such group and report the whole match.
      findings.push({ line: lineOf(hit.index), token: (hit.groups?.cls ?? hit[0]).trim(), message: rule.message });
    }
  }

  return findings;
}

/** Tailwind utility rules only apply inside `@apply` directives. */
function checkApplyDirectives(scrubbed, start, lineAt) {
  const findings = [];
  const applyDirective = /@apply\b([^;{}]*)/g;
  let apply;

  while ((apply = applyDirective.exec(scrubbed)) !== null) {
    const line = lineAt(start + apply.index);

    findings.push(...collect(RULES, apply[1], () => line));

    if (RESPONSIVE_VARIANT.test(apply[0])) {
      findings.push({
        line,
        token: "@apply <breakpoint>:",
        message: "responsive variant in @apply -> move into an @media (min-width: theme(...)) block",
      });
    }
  }

  return findings;
}

function checkFile(file) {
  const source = readFileSync(file, "utf8");
  const lineAt = (index) => lineNumberAt(source, index);

  return styleRanges(source, file).flatMap(([start, end]) => {
    const scrubbed = stripComments(source.slice(start, end));

    return [
      ...checkApplyDirectives(scrubbed, start, lineAt),
      // Raw CSS declarations apply to the whole style context, not just @apply.
      ...collect(CSS_RULES, scrubbed, (index) => lineAt(start + index)),
    ];
  });
}

/**
 * Line numbers this file has uncommitted changes on, or `null` when that can't be determined
 * (not a git repo, git missing). An untracked file counts as entirely new.
 *
 * Without this the hook would re-report a legacy file's pre-existing violations on every edit,
 * which is noise the team would rightly switch off.
 */
function changedLines(file) {
  const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

  try {
    try {
      git(["ls-files", "--error-unmatch", "--", file]);
    } catch {
      return null; // untracked - every line is new, so report everything
    }

    const lines = new Set();
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
    const diff = git(["diff", "-U0", "--no-color", "HEAD", "--", file]);
    let m;

    while ((m = hunk.exec(diff)) !== null) {
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);

      for (let i = 0; i < count; i++) {
        lines.add(start + i);
      }
    }

    return lines;
  } catch {
    return null; // no git - fall back to reporting everything
  }
}

// Exported for scripts/check-style-conventions/index.test.mjs. Everything below this line is CLI wiring
// and only runs when the file is executed directly, so importing it has no side effects.
export { RULES, CSS_RULES, checkFile, styleRanges, stripComments, changedLines };

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (!isMain) {
  // imported by the test suite - skip the CLI entirely
} else if (process.argv.includes("--hook")) {
  /*
   * `--hook` mode: run as a Claude Code PostToolUse hook. Reads the hook payload on stdin, checks
   * only the file that was just edited, and exits 2 with the findings on stderr — the exit code
   * that feeds stderr back to Claude as context. Every other path is silent, so a clean edit
   * costs nothing and a malformed payload can never get in the way.
   */
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  let file;

  try {
    file = JSON.parse(Buffer.concat(chunks).toString()).tool_input?.file_path;
  } catch {
    process.exit(0); // not a payload we understand - never get in the way of an edit
  }

  if (!file || !/\.(vue|scss)$/.test(file)) {
    process.exit(0);
  }

  let findings = [];

  try {
    findings = checkFile(file);
  } catch {
    process.exit(0);
  }

  // Only surface findings on lines this change actually touched, so a legacy file's existing
  // violations stay quiet until someone edits those particular lines.
  const touched = changedLines(file);
  const scoped = touched === null ? findings : findings.filter((f) => touched.has(f.line));

  if (scoped.length === 0) {
    process.exit(0);
  }

  const lines = scoped.map(({ line, token, message }) => `  ${line}:  ${token}  -  ${message}`);
  const shown = relative(ROOT, file);
  const where = touched === null ? "has style-convention issues" : "- style-convention issues on lines you changed";

  process.stderr.write(
    `${shown.startsWith("..") ? file : shown} ${where}:\n${lines.join("\n")}\n` +
      "RTL-safe logical utilities and --vc-radius keep the theme customizable in every locale.\n",
  );
  process.exit(2);
} else {
  // Batch mode: explicit files (lint-staged passes them) or the whole of client-app.
  const files =
    FILE_ARGS.length > 0 ? FILE_ARGS.filter((f) => /\.(vue|scss)$/.test(f)) : collectFiles(join(ROOT, "client-app"));

  let total = 0;

  for (const file of files) {
    let findings;

    try {
      findings = checkFile(file);
    } catch {
      continue; // unreadable / deleted staged file
    }

    if (CHANGED_ONLY) {
      const touched = changedLines(file);

      findings = touched === null ? findings : findings.filter((f) => touched.has(f.line));
    }

    if (findings.length === 0) {
      continue;
    }

    console.log(`\n${relative(ROOT, file)}`);

    for (const { line, token, message } of findings) {
      console.log(`  ${line}:  ${token}  -  ${message}`);
    }

    total += findings.length;
  }

  if (total === 0) {
    console.log("check:style-conventions - no issues");
    process.exit(0);
  }

  const scope = CHANGED_ONLY ? " on changed lines" : "";

  console.log(`\ncheck:style-conventions - ${total} issue(s)${scope} in ${files.length} file(s) scanned`);
  console.log("RTL-safe logical utilities and --vc-radius keep the theme customizable in every locale.");

  process.exit(STRICT ? 1 : 0);
}

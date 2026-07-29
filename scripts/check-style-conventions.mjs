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
 *   node scripts/check-style-conventions.mjs [--strict] [files...]
 *
 * With no file arguments it scans all .vue/.scss files under client-app/.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict");
const FILE_ARGS = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

/** Utility/property patterns that break right-to-left locales or ignore theme tokens. */
const RULES = [
  {
    // Tailwind utilities inside @apply. `(^|[\s:])` so variant-prefixed (`xl:ml-4`) matches too.
    pattern: /(^|[\s:])(ml|mr)-[\w[\].%/-]+/g,
    message: "physical margin -> use ms-* / me-*",
  },
  {
    pattern: /(^|[\s:])(pl|pr)-[\w[\].%/-]+/g,
    message: "physical padding -> use ps-* / pe-*",
  },
  {
    pattern: /(^|[\s:])text-(left|right)\b/g,
    message: "physical text alignment -> use text-start / text-end",
  },
  {
    pattern: /(^|[\s:])(border-l|border-r)(-[\w[\].%/-]+)?\b/g,
    message: "physical border side -> use border-s-* / border-e-*",
  },
  {
    pattern: /(^|[\s:])float-(left|right)\b/g,
    message: "physical float -> use float-start / float-end",
  },
  {
    pattern: /(^|[\s:])rounded(-(sm|md|lg|xl|2xl|3xl))?(?![\w[-])/g,
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
      findings.push({ line: lineOf(hit.index), token: hit[0].trim(), message: rule.message });
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
  const findings = [];

  for (const [start, end] of styleRanges(source, file)) {
    const scrubbed = stripComments(source.slice(start, end));

    findings.push(...checkApplyDirectives(scrubbed, start, lineAt));
    // Raw CSS declarations apply to the whole style context.
    findings.push(...collect(CSS_RULES, scrubbed, (index) => lineAt(start + index)));
  }

  return findings;
}

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

console.log(`\ncheck:style-conventions - ${total} issue(s) in ${files.length} file(s) scanned`);
console.log("RTL-safe logical utilities and --vc-radius keep the theme customizable in every locale.");

process.exit(STRICT ? 1 : 0);

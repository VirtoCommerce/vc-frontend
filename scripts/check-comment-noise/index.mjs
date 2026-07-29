#!/usr/bin/env node
/**
 * Flags comments that only make sense inside the session that wrote them.
 *
 * A comment earns its place by explaining something the code cannot say for itself — why a
 * workaround exists, which upstream bug is being dodged, what an unobvious invariant is. A comment
 * narrating the edit ("changed this to...", "as requested", "for now") is addressed to whoever was
 * in the room at the time, and reads as noise to everyone after them. This is mostly an
 * AI-authoring problem: the patterns below match nothing in client-app today.
 *
 *   node scripts/check-comment-noise/index.mjs [--changed] [--hook] [files...]
 *
 * Advisory: it never fails a commit. In --hook mode it exits 2 so the findings reach the agent
 * that just wrote them, which is the only moment the comment is cheap to fix.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { changedLines } from "../lib/changed-lines.mjs";

const ROOT = process.cwd();
const CHANGED_ONLY = process.argv.includes("--changed");
const FILE_ARGS = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const EXT = /\.(ts|vue|mjs|js)$/;

/**
 * Each pattern targets a phrase that only carries meaning in the authoring session. Kept
 * deliberately narrow — a rule that fires on ordinary prose gets the whole check ignored.
 */
const RULES = [
  { pattern: /\bas (?:you )?requested\b/i, message: "addressed to the person who asked, not to a reader" },
  { pattern: /\bas (?:we )?discussed\b/i, message: "refers to a conversation the reader cannot see" },
  { pattern: /\bper (?:the )?review\b/i, message: "refers to a review the reader cannot see" },
  { pattern: /\bper your (?:comment|feedback)\b/i, message: "refers to a conversation the reader cannot see" },
  { pattern: /\bnote to self\b/i, message: "not addressed to the reader" },
  { pattern: /\bkeeping (?:this|it) for now\b/i, message: "if it is kept, say why - otherwise delete it" },
  { pattern: /\bfor now\b/i, message: "'for now' has no meaning once the session ends - say what would change it" },
  { pattern: /\b(?:temporary|temp) (?:fix|workaround|hack|solution)\b/i, message: "say what makes it temporary" },
  { pattern: /\bno longer needed\b|\bnot needed anymore\b/i, message: "if it is not needed, delete it" },
  {
    // Uppercase and a colon, deliberately: "Before that, ..." and "* After field stripping, ..."
    // are ordinary prose and start comments all over this codebase.
    pattern: /^(?:\/\/|\*|\/\*)\s*(?:NEW|OLD|WAS|BEFORE|AFTER|CHANGED|ADDED|REMOVED):/,
    message: "narrates the edit; git already records that",
  },
];

/** Comment text on each line, as [lineNumber, text]. Block comments count line by line. */
function commentLines(source) {
  const out = [];
  let inBlock = false;

  source.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    let text = null;

    if (inBlock) {
      text = line;

      if (line.includes("*/")) {
        inBlock = false;
      }
    } else if (line.startsWith("//")) {
      text = line;
    } else if (line.startsWith("/*")) {
      text = line;
      inBlock = !line.includes("*/");
    }
    // Anything else, including a trailing `// ...` after code, is left alone: those tend to be the
    // useful kind, and stripping strings well enough not to match a URL or a message literal costs
    // more than it is worth.

    if (text) {
      out.push([index + 1, text]);
    }
  });

  return out;
}

function checkFile(file) {
  const source = readFileSync(file, "utf8");

  return commentLines(source).flatMap(([line, text]) => {
    const rule = RULES.find((candidate) => candidate.pattern.test(text));

    return rule ? [{ line, text, message: rule.message }] : [];
  });
}

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) {
      continue;
    }

    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      collectFiles(full, acc);
    } else if (EXT.test(full)) {
      acc.push(full);
    }
  }

  return acc;
}

function report(file, findings) {
  const shown = relative(ROOT, file);

  return [
    `${shown.startsWith("..") ? file : shown}`,
    ...findings.map(({ line, text, message }) => `  ${line}:  ${text.slice(0, 72)}\n      ${message}`),
  ].join("\n");
}

export { RULES, checkFile, commentLines };

const isMain = process.argv[1]?.endsWith("check-comment-noise/index.mjs");

if (isMain && process.argv.includes("--hook")) {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  let file;

  try {
    file = JSON.parse(Buffer.concat(chunks).toString()).tool_input?.file_path;
  } catch {
    process.exit(0);
  }

  if (!file || !EXT.test(file)) {
    process.exit(0);
  }

  let findings = [];

  try {
    findings = checkFile(file);
  } catch {
    process.exit(0);
  }

  const touched = changedLines(file, ROOT);

  findings = touched === null ? findings : findings.filter((f) => touched.has(f.line));

  if (findings.length === 0) {
    process.exit(0);
  }

  process.stderr.write(
    `${report(file, findings)}\n` + "Keep the comment only if it says something the code cannot. Otherwise trim it.\n",
  );
  process.exit(2);
} else if (isMain) {
  const files = FILE_ARGS.length > 0 ? FILE_ARGS.filter((f) => EXT.test(f)) : collectFiles(join(ROOT, "client-app"));
  let total = 0;

  for (const file of files) {
    let findings;

    try {
      findings = checkFile(file);
    } catch {
      continue;
    }

    if (CHANGED_ONLY) {
      const touched = changedLines(file, ROOT);

      findings = touched === null ? findings : findings.filter((f) => touched.has(f.line));
    }

    if (findings.length === 0) {
      continue;
    }

    console.log(`\n${report(file, findings)}`);
    total += findings.length;
  }

  console.log(
    total === 0
      ? "check:comment-noise - no issues"
      : `\ncheck:comment-noise - ${total} comment(s) in ${files.length} file(s) scanned`,
  );
  process.exit(0);
}

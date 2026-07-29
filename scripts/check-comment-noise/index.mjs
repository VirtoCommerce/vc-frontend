#!/usr/bin/env node
/**
 * @file Flags comments that only make sense inside the session that wrote them, and blocks long
 * enough to be worth trimming. Advisory in every mode: it never fails a commit. In --hook mode it
 * exits 2 so findings reach the agent that just wrote them, the one moment they are cheap to fix.
 *
 * @example node scripts/check-comment-noise/index.mjs [--changed] [--hook] [files...]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { changedLines } from "../lib/changed-lines.mjs";

const ROOT = process.cwd();
const CHANGED_ONLY = process.argv.includes("--changed");
const FILE_ARGS = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const EXT = /\.(ts|vue|mjs|js)$/;

/**
 * A comment block longer than this is asked to justify itself. Aimed low on purpose: nothing here
 * blocks, so a block that genuinely needs the room can keep it. Tagged JSDoc is exempt outright.
 */
const MAX_COMMENT_BLOCK_LINES = 5;

/** `@param`/`@example` and friends mark API documentation, which is meant to be long. */
const DOC_TAG = /@(?:param|returns?|example|description|see|deprecated|link|type|typedef|template|throws|file)\b/;

/**
 * Whatever opens a comment, so a rule can anchor to the start of the text. Optional, because a
 * continuation line inside an HTML comment carries no marker of its own.
 */
const OPENER = String.raw`(?:\/\/+|\*+|\/\*+|<!--)?`;

/**
 * Each pattern targets a phrase that only carries meaning in the authoring session. Kept
 * deliberately narrow — a rule that fires on ordinary prose gets the whole check ignored. Every
 * pattern here was measured at zero hits against `client-app` before being added.
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
    pattern: /\bcommented out\b|\bleaving\b.{0,40}\bin case\b/i,
    message: "delete it - git is how code comes back",
  },
  {
    pattern: /\b(?:not sure if|hopefully|should probably|should work now|i think this|trying a different)\b/i,
    message: "hedging - resolve the doubt or leave the reader a concrete open question",
  },
  { pattern: /\b(?:i've|i'll|let's)\b/i, message: "addressed to whoever was in the room, not to a reader" },
  {
    // Past tense and a following particle, deliberately: "Remove the specific filterValue from
    // termValues" is an ordinary imperative describing the next line, and reads all over this repo.
    pattern: new RegExp(
      `^${OPENER}\\s*(?:updated|removed|renamed|switched|refactored|reverted|moved|extracted|simplified|replaced|converted|changed|fixed)\\s+(?:to|from|this|these|it|back|into|out|the|so)\\b`,
      "i",
    ),
    message: "narrates the edit; git already records that",
  },
  {
    // Uppercase and a colon, deliberately: "Before that, ..." and "* After field stripping, ..."
    // are ordinary prose and start comments all over this codebase.
    pattern: new RegExp(`^${OPENER}\\s*(?:NEW|OLD|WAS|BEFORE|AFTER|CHANGED|ADDED|REMOVED):`),
    message: "narrates the edit; git already records that",
  },
];

/** Comment text on each line, as [lineNumber, text]. Block comments count line by line. */
function commentLines(source) {
  const out = [];
  let closer = null;

  source.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    let text = null;

    if (closer !== null) {
      text = line;

      if (line.includes(closer)) {
        closer = null;
      }
    } else if (line.startsWith("//")) {
      text = line;
    } else if (line.startsWith("/*")) {
      text = line;
      closer = line.includes("*/") ? null : "*/";
    } else if (line.startsWith("<!--")) {
      text = line;
      closer = line.includes("-->") ? null : "-->";
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

/** Consecutive comment lines, grouped, so length can be judged per block rather than per line. */
function commentBlocks(lines) {
  return lines.reduce((blocks, [line, text]) => {
    const open = blocks.at(-1);

    if (open && line === open.end + 1) {
      open.end = line;
      open.texts.push(text);
    } else {
      blocks.push({ start: line, end: line, texts: [text] });
    }

    return blocks;
  }, []);
}

function checkPhrases(lines) {
  return lines.flatMap(([line, text]) => {
    const rule = RULES.find((candidate) => candidate.pattern.test(text));

    return rule ? [{ line, text, message: rule.message }] : [];
  });
}

function checkLength(lines) {
  return commentBlocks(lines).flatMap((block) => {
    const size = block.end - block.start + 1;

    if (size <= MAX_COMMENT_BLOCK_LINES || DOC_TAG.test(block.texts.join(" "))) {
      return [];
    }

    return [
      {
        line: block.start,
        text: block.texts[0],
        message: `${size} lines of comment - keep what the code cannot say and cut the rest`,
      },
    ];
  });
}

function checkFile(file) {
  const lines = commentLines(readFileSync(file, "utf8"));

  return [...checkPhrases(lines), ...checkLength(lines)].sort((a, b) => a.line - b.line);
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

export { MAX_COMMENT_BLOCK_LINES, RULES, checkFile, commentBlocks, commentLines };

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

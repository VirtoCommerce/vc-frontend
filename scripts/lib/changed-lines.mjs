import { execFileSync } from "node:child_process";

/**
 * Line numbers `file` has uncommitted changes on, or `null` when that can't be determined
 * (not a git repo, git missing). An untracked file counts as entirely new, so `null` is returned
 * and the caller reports everything.
 *
 * Checks that report on edits use this so a legacy file's pre-existing findings stay quiet until
 * someone touches those particular lines — otherwise the noise gets the check switched off.
 */
export function changedLines(file, root = process.cwd()) {
  // Found on PATH rather than pinned to an absolute path (Sonar S4036, reviewed and accepted): the
  // paths differ per platform, and a Windows per-user or NixOS install would miss the list and turn
  // the filter off. Anyone able to plant a `git` can equally plant the `eslint` the same hook runs.
  // eslint-disable-next-line sonarjs/no-os-command-from-path
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

  try {
    try {
      git(["ls-files", "--error-unmatch", "--", file]);
    } catch {
      return null; // untracked - every line is new
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
    return null; // no git
  }
}

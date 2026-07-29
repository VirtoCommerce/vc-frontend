import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/**
 * Where git is looked for, most standard first. Resolved here rather than left to a `PATH` search,
 * so a `git` planted earlier in a developer's `PATH` is not what a commit hook ends up running.
 * Every entry is a location only an administrator can write to.
 */
const GIT = [
  "/usr/bin/git",
  "/usr/local/bin/git",
  "/opt/homebrew/bin/git",
  "C:\\Program Files\\Git\\cmd\\git.exe",
].find((candidate) => existsSync(candidate));

/**
 * Line numbers `file` has uncommitted changes on, or `null` when that can't be determined
 * (not a git repo, git missing). An untracked file counts as entirely new, so `null` is returned
 * and the caller reports everything.
 *
 * Checks that report on edits use this so a legacy file's pre-existing findings stay quiet until
 * someone touches those particular lines — otherwise the noise gets the check switched off.
 */
export function changedLines(file, root = process.cwd()) {
  if (GIT === undefined) {
    return null;
  }

  const git = (args) => execFileSync(GIT, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

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

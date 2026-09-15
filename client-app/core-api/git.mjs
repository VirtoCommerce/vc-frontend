/** One `git` for the core-api tooling. Never resolved through PATH (S4036). */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

export const GIT_BIN = [
  "/usr/bin/git",
  "/usr/local/bin/git",
  "/opt/homebrew/bin/git",
  String.raw`C:\Program Files\Git\cmd\git.exe`,
].find((candidate) => existsSync(candidate));

/** maxBuffer: node's 1MB default kills the child on a large artifact, which reads as "no baseline". */
export const gitIn = (cwd) => (args) =>
  spawnSync(GIT_BIN, args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

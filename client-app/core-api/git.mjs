/** One `git` for the core-api tooling. Never resolved through PATH (S4036). */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const GIT_BIN = [
  "/usr/bin/git",
  "/usr/local/bin/git",
  "/opt/homebrew/bin/git",
  String.raw`C:\Program Files\Git\cmd\git.exe`,
].find((candidate) => existsSync(candidate));

/** No git at those paths: every call fails like a spawn that never started, and callers skip their git-backed checks. */
const NO_GIT = Object.freeze({ status: null, stdout: "", stderr: "" });

/** maxBuffer: node's 1MB default kills the child on a large artifact, which reads as "no baseline". */
export const gitIn = (cwd) => (args) =>
  GIT_BIN ? spawnSync(GIT_BIN, args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }) : NO_GIT;

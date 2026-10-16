/** Hand-written types for git.mjs. Keep in sync with the .mjs exports. */

export declare const gitIn: (
  cwd: string,
) => (args: string[]) => { status: number | null; stdout: string; stderr: string };

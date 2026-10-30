// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";
import loadConfig from "tailwindcss/loadConfig.js";
import resolveConfig from "tailwindcss/resolveConfig.js";
import { describe, expect, it } from "vitest";

interface ITableRow {
  name: string;
  pattern: RegExp;
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const README = readFileSync(path.join(ROOT, "client-app/assets/styles/README.md"), "utf-8");

const THEME_KEYS = ["fontFamily", "fontSize", "lineHeight", "borderRadius", "fontWeight", "letterSpacing", "boxShadow"];
const SHAPE_OR_TYPE =
  /-(?:radius|shadow|font-family|font-size|font-weight|font-style|letter-spacing|text-transform|line-height)$/;
const THEME_TOKEN = /var\((--vc-[\w-]+)/g;
const READ = /(?:var\(|\[)(--[\w-]+)/g;
const FIRST_CELL = /^\| `([^`]+)` \|/;

function tableRows(): ITableRow[] {
  const section = README.split(/^### Token table$/m)[1]?.split(/^#{2,3} /m)[0] ?? "";

  return section.split("\n").flatMap((line) => {
    const name = FIRST_CELL.exec(line)?.[1];

    if (!name) {
      return [];
    }

    const source = name.replaceAll("<key>", "[a-z0-9]+").replaceAll("<n>", String.raw`\d+`);

    return [{ name, pattern: new RegExp(`^${source}$`) }];
  });
}

/** The `var(--vc-…)` scale and role tokens in Tailwind's font, radius and shadow scales. */
function themeTokens(): string[] {
  // `tailwind.config.ts` sets `module.exports`, so it is loaded the way Tailwind loads it, not imported.
  const { theme } = resolveConfig(loadConfig(path.join(ROOT, "tailwind.config.ts")));
  const scales = theme as Record<string, unknown>;

  return THEME_KEYS.flatMap((key) => [...JSON.stringify(scales[key]).matchAll(THEME_TOKEN)].map((match) => match[1]));
}

/**
 * Shape and typography tokens the styles read. A component's private variable (`--radius`,
 * `--day-radius`, `--props-*`) is neither a kit token (`--vc-*`) nor its own block's (`--<block>-*`).
 */
function componentTokens(): string[] {
  const files = globSync("client-app/**/*.{vue,scss}", {
    cwd: ROOT,
    ignore: ["client-app/designs/**", "**/*.{test,spec,stories}.*"],
  });

  return files.flatMap((file) => {
    const block = path.basename(file, path.extname(file));

    return [...readFileSync(path.join(ROOT, file), "utf-8").matchAll(READ)]
      .map((match) => match[1])
      .filter((name) => SHAPE_OR_TYPE.test(name) && (name.startsWith("--vc-") || name.startsWith(`--${block}-`)));
  });
}

const codeTokens = [...new Set([...themeTokens(), ...componentTokens()])].sort((a, b) => a.localeCompare(b));
const rows = tableRows();

function matchingRows(name: string): ITableRow[] {
  return rows.filter((row) => row.pattern.test(name));
}

describe("design token table in client-app/assets/styles/README.md", () => {
  it("lists every shape and typography token the code reads, each in one row", () => {
    expect(codeTokens.filter((name) => matchingRows(name).length !== 1)).toEqual([]);
  });

  it("lists no token the code does not read", () => {
    expect(rows.filter((row) => !codeTokens.some((name) => row.pattern.test(name))).map((row) => row.name)).toEqual([]);
  });
});

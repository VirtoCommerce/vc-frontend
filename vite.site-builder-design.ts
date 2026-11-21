import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import loadConfig from "tailwindcss/loadConfig.js";
import { BREAKPOINTS } from "./client-app/ui-kit/constants/tailwind.js";
import { ICON_ALIASES } from "./client-app/ui-kit/utilities/icon-aliases.js";
import type { IDesignFacts, IDesignToken } from "./client-app/shared/static-content/custom-sections/design-facts.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/** The set `VcIcon` draws by default; legacy names reach it through the aliases. */
const ICON_FOLDER = "client-app/ui-kit/icons/outline";
const ICON_FILE_REGEX = /\.svg$/;

/** The stylesheets that declare or read the tokens outside the Tailwind theme. */
const STYLE_SOURCES = ["client-app/assets/styles/main.scss", "client-app/assets/styles/_typography-roles.scss"];

const TOKEN_DESCRIPTIONS: [RegExp, (key: string) => string][] = [
  [/^--vc-base-font-family$/, () => "The page font."],
  [/^--vc-heading-font-family$/, () => "The font of headings."],
  [/^--vc-heading-(.+)$/, (key) => `The ${key.replaceAll("-", " ")} of headings.`],
  [/^--vc-font-size-(.+)$/, (key) => `The font size of the ${key} text step.`],
  [/^--vc-line-height-(.+)$/, (key) => `The ${key} line height; a text step's own where a font size has its key.`],
  [/^--vc-radius$/, () => "The default corner radius of controls."],
  [/^--vc-radius-(.+)$/, (key) => `The ${key} corner radius.`],
  [/^--vc-shadow-(.+)-\d+$/, (key) => `A part of the ${key} shadow; join its parts with commas.`],
];

const VAR_START = "var(--vc-";
const DECLARATION_REGEX = /(--vc-[\w-]+):([^;{}]+);/g;

/** Every `var(--vc-…, fallback)` in a value, read with its nested parentheses. */
export function readTokenFallbacks(text: string): [name: string, fallback: string][] {
  const found: [string, string][] = [];

  for (let start = text.indexOf(VAR_START); start !== -1; start = text.indexOf(VAR_START, start + 1)) {
    const comma = text.indexOf(",", start);
    let depth = 1;
    let end = comma + 1;

    for (; end < text.length && depth > 0; end++) {
      depth += text[end] === "(" ? 1 : 0;
      depth -= text[end] === ")" ? 1 : 0;
    }

    if (comma !== -1 && depth === 0) {
      found.push([text.slice(start + "var(".length, comma).trim(), text.slice(comma + 1, end - 1).trim()]);
    }
  }

  return found;
}

function describeToken(name: string): string | undefined {
  for (const [pattern, toDescription] of TOKEN_DESCRIPTIONS) {
    const match = pattern.exec(name);

    if (match) {
      return toDescription(match[1] ?? "");
    }
  }

  return undefined;
}

export function collectDesignFacts(): IDesignFacts {
  const themeText = JSON.stringify(loadConfig(path.join(ROOT, "tailwind.config.ts")).theme);
  const styleTexts = STYLE_SOURCES.map((file) => readFileSync(path.join(ROOT, file), "utf8"));
  const declared = styleTexts.flatMap((text) =>
    [...text.matchAll(DECLARATION_REGEX)].map(([, name, value]): [string, string] => [name, value.trim()]),
  );
  const pairs = [...readTokenFallbacks(themeText), ...styleTexts.flatMap(readTokenFallbacks), ...declared];
  const tokens: Record<string, IDesignToken> = {};

  for (const [name, fallback] of pairs) {
    const description = describeToken(name);

    if (description && !Object.hasOwn(tokens, name)) {
      tokens[name] = { fallback, description };
    }
  }

  return { breakpoints: { ...BREAKPOINTS }, containerMaxWidth: BREAKPOINTS.xl, tokens };
}

/** Every name `VcIcon` draws: the outline set's files and the legacy names aliased to them. */
export function collectIconNames(): string[] {
  const files = readdirSync(path.join(ROOT, ICON_FOLDER))
    .filter((file) => ICON_FILE_REGEX.test(file))
    .map((file) => file.replace(ICON_FILE_REGEX, ""));

  return [...new Set([...files, ...Object.keys(ICON_ALIASES)])].sort((a, b) => a.localeCompare(b));
}

/** Inlined where the preview builds its catalog. */
export function designFactsDefine(): Record<string, string> {
  return {
    __SB_DESIGN_FACTS__: JSON.stringify(collectDesignFacts()),
    __SB_ICON_NAMES__: JSON.stringify(collectIconNames()),
  };
}

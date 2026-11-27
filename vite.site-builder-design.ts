import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import loadConfig from "tailwindcss/loadConfig.js";
import { BREAKPOINTS } from "./client-app/ui-kit/constants/tailwind.js";
import { uiKitPreset } from "./client-app/ui-kit/tailwind-preset.js";
import { ICON_ALIASES } from "./client-app/ui-kit/utilities/icon-aliases.js";
import type { IDesignFacts, IDesignToken } from "./client-app/shared/static-content/custom-sections/design-facts.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/** The set `VcIcon` draws by default; legacy names reach it through the aliases. */
const ICON_FOLDER = "client-app/ui-kit/icons/outline";
/** The set `VcShape` cuts its mask from. */
const MASK_FOLDER = "client-app/ui-kit/icons/solid";
const ICON_EXTENSION = ".svg";
const ELEMENT_START_REGEX = /<[a-z][\w:-]*/gi;

/** The stylesheets that declare or read the tokens outside the Tailwind theme. */
const STYLE_SOURCES = [
  "client-app/ui-kit/styles/_ui-kit-tokens.scss",
  "client-app/assets/styles/main.scss",
  "client-app/assets/styles/_typography-roles.scss",
];

const TOKEN_DESCRIPTIONS: [RegExp, (key: string) => string][] = [
  [/^--vc-base-font-family$/, () => "The page font."],
  [/^--vc-heading-font-family$/, () => "The font of headings."],
  [/^--vc-heading-(.+)$/, (key) => `The ${key.replaceAll("-", " ")} of headings.`],
  [/^--vc-font-size-(.+)$/, (key) => `The font size of the ${key} text step.`],
  [/^--vc-line-height-(.+)$/, (key) => `The ${key} line height; a text step's own where a font size has its key.`],
  [/^--vc-font-weight-(.+)$/, (key) => `The ${key} font weight.`],
  [/^--vc-letter-spacing-(.+)$/, (key) => `The ${key} letter spacing.`],
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
  // The scales sit in ui-kit's preset, which `loadConfig` does not resolve; the theme config only extends them.
  const themeText = JSON.stringify([uiKitPreset.theme, loadConfig(path.join(ROOT, "tailwind.config.ts")).theme]);
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
  return [...new Set([...readIconNames(ICON_FOLDER), ...Object.keys(ICON_ALIASES)])].sort((a, b) => a.localeCompare(b));
}

/** Every name `VcShape` takes as its mask. */
export function collectMaskNames(): string[] {
  return readIconNames(MASK_FOLDER).sort((a, b) => a.localeCompare(b));
}

function readIconNames(folder: string): string[] {
  return readdirSync(path.join(ROOT, folder))
    .filter((file) => file.endsWith(ICON_EXTENSION))
    .map((file) => path.basename(file, ICON_EXTENSION));
}

/** The most elements an icon draws, its own `svg` included: a kit tag's cost counts it. */
export function collectIconElements(): number {
  return Math.max(
    ...readIconNames(ICON_FOLDER).map(
      (name) =>
        readFileSync(path.join(ROOT, ICON_FOLDER, `${name}${ICON_EXTENSION}`), "utf8").match(ELEMENT_START_REGEX)
          ?.length ?? 0,
    ),
  );
}

/** Inlined where the preview builds its catalog. */
export function designFactsDefine(): Record<string, string> {
  return {
    __SB_DESIGN_FACTS__: JSON.stringify(collectDesignFacts()),
    __SB_ICON_NAMES__: JSON.stringify(collectIconNames()),
    __SB_MASK_NAMES__: JSON.stringify(collectMaskNames()),
    __SB_ICON_ELEMENTS__: JSON.stringify(collectIconElements()),
  };
}

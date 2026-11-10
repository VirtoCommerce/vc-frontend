import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { globSync } from "glob";
import postcss from "postcss";
import postcssScss from "postcss-scss";
import selectorParser from "postcss-selector-parser";
import { compileString } from "sass";
import tailwindcss from "tailwindcss";
import loadConfig from "tailwindcss/loadConfig.js";
import resolveConfig from "tailwindcss/resolveConfig.js";
import type { Dirent } from "node:fs";
import type { AtRule, ChildNode, Container, CssSyntaxError, Declaration, Root, Rule } from "postcss";
import type { Exception, Importer } from "sass";

// The rules are in client-app/assets/styles/README.md; `yarn lint` does not parse SCSS, so this runs in CI.

export interface ICheckOptions {
  /** The blocks the stylesheets and components define, from `sourceBlocks`. */
  blocks: Set<string>;
  /** The semantic colours (`--link-color` …) a colour may read, from `colorSemantics`. */
  semantics: ReadonlySet<string>;
}

export interface IDesignCheckOptions extends ICheckOptions {
  designsDir: string;
}

export interface IPresetCheckOptions extends ICheckOptions {
  presetsDir: string;
}

export interface IDesignCheckResult {
  errors: string[];
  designCount: number;
  /** The `.scss` files checked. */
  fileCount: number;
}

export interface IPresetCheckResult {
  errors: string[];
  /** The preset stylesheets checked. */
  fileCount: number;
}

type FileKindType = "tokens" | "blocks" | "dark";

interface ICheckedFileType {
  file: string;
  kind: FileKindType;
  ref: string;
  keys: Set<string>;
}

interface IDesignFiles {
  tokens?: string;
  index?: string;
  blocks: string[];
  dark: string[];
}

type ReportType = (node: ChildNode, message: string) => void;

const DESIGN_NAME = /^[a-z][a-z0-9-]*$/;
const CLASSIC = "classic";
const LAYOUT = new Map([
  ["design.ts", "file"],
  ["_tokens.scss", "file"],
  ["index.scss", "file"],
  ["blocks", "folder"],
  ["dark", "folder"],
]);
const DESIGN_ATTRIBUTE = /data-design\s*=\s*["']?([\w-]+)/g;
const COLORS_FILE = "client-app/assets/styles/_colors.scss";
const PRESET_LAYER = "@layer vc.preset";
const LOAD_CSS = /load-css\(\s*(?:\$url\s*:\s*)?["']([^"']+)["']/g;

/** The kit names its public colour tokens `…color…`, `…bg…`, `…-text`, `…-border` or `…-icon`. */
const COLOR_TOKEN = /(?:color|bg)|(?:-(?:text|border|icon)$)/i;
/** A shadow token holds its shadow's colour: `--vc-widget-shadow`, `--vc-shadow-md-1`. */
const SHADOW_TOKEN = /^--vc-(?:[a-z\d]+-)*shadow(?:-[a-z\d]+)*$/i;
/**
 * The default `shadow` step keeps Tailwind's black when a design reshapes it, and so do the theme's `drop-shadow-*`
 * steps (`DROP_SHADOW_STEPS`); the other `shadow-*` steps read the preset.
 */
const BLACK_SHADOW = /^--vc-shadow-default-\d+$/;
const DROP_SHADOW = "--tw-drop-shadow";
const DEFAULT_SHADOW_BLACK = /(?<![\w-])rgb\(\s*0\s+0\s+0\s*\/\s*[\d.]+%?\s*\)/gi;
/** The default step's black in its token's fallback, as `@apply shadow` writes it. */
const DEFAULT_SHADOW_FALLBACK_BLACK =
  /(var\(\s*--vc-shadow-default-\d+\s*,[^()]*)(?<![\w-])rgb\(\s*0\s+0\s+0\s*\/\s*[\d.]+%?\s*\)/gi;
/** Tailwind's shadow geometry, which reads the colour from `--tw-shadow-color`. */
const SHADOW_GEOMETRY = "--tw-shadow-colored";
const COLOR_PROPERTY = /^(?:color|fill|stroke|.+-color)$/i;
/** A shorthand counts with or without a `-webkit-` or `-moz-` prefix: `-webkit-column-rule` is `column-rule`. */
const COLOR_SHORTHAND =
  /^(?:-(?:webkit|moz)-)?(?:background|outline|column-rule|text-decoration|text-emphasis|box-shadow|text-shadow|text-stroke|filter|backdrop-filter)$/;
/** The shorthands without a colour longhand; the others have `<shorthand>-color`. */
const NO_COLOR_LONGHAND = /(?:shadow|filter)$/;
/** `border` and its sides, `border-inline-start` too; `before` and `after` are the sides of `-webkit-border-before`. */
const BORDER_SHORTHAND =
  /^(?:-(?:webkit|moz)-)?border(?:-(?:block|inline))?(?:-(?:top|right|bottom|left|before|after|start|end))?$/;
// Tailwind writes these besides the `--tw-*-color` tokens: a gradient's stops and the alpha of a colour.
const TAILWIND_COLOR = /^--tw-(?:gradient-(?:from|to)|(?:bg|text|border|divide|placeholder|ring)-opacity)$/;
const NO_COLOR = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "none",
  "auto",
]);
const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid
mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen
paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue
saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(/\s+/),
);
/** What a colour may read besides the `_colors.scss` semantics: the preset's keys, public tokens, Tailwind's own. */
const PRESET_VARIABLE = /^--(?:color|vc|tw)-/;
/** A component's public token or Tailwind's own; any other custom property is private, a preset key included. */
const PUBLIC_VARIABLE = /^--(?:vc|tw)-/;
const COLOR_RULE = "colours come only from preset variables";
const QUOTED_OR_URL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;
const VAR_REFERENCE = /var\(\s*(--[^\s,)]+)/gi;
const COLOR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const COLOR_FUNCTION_CALL = /(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/gi;
/** Relative colour syntax, `rgb(from var(--color-x) r g b / 0.5)`: the colour is its origin's. */
const RELATIVE_COLOR = /^\s*from\s/i;
/** Alpha 0, `rgb(0 0 0 / 0)` or `rgba(0, 0, 0, 0)`: transparent, as Tailwind writes it in a gradient stop. */
const ZERO_ALPHA = /^(?:[^(),/]*\/|(?:[^(),/]*,){3})\s*(?:0*\.)?0+%?\s*\)/;
const HEX = /#[\da-f]+/gi;
/** A hex colour with alpha 0, `#fff0` or `#ffffff00`; `#0000` is Tailwind's fallback, `var(--tw-shadow, 0 0 #0000)`. */
const ZERO_ALPHA_HEX = /^#(?:[\da-f]{3}0|[\da-f]{6}00)$/i;
/**
 * The text before a relative colour's origin, whose alpha does not count: `rgb(from rgb(0 0 0 / 0) r g b / 1)`, also
 * in a `var()` fallback, `rgb(from var(--x, #fff0) r g b / 1)`, which reads `from  , #fff0` once the `var(--x` is cut.
 */
const BEFORE_ORIGIN = /(?<![\w-])from\s+(?:,\s*)*$/i;
/** A word, not a function's name: `tan(10deg)` holds no colour. */
const IDENTIFIER = /(?<![\w-])[a-z][\w-]*(?![\w(-])/gi;

/** At-rules a design file may emit; any other one, `@layer` or `@keyframes`, ships CSS out of its place. */
const ALLOWED_AT_RULES = new Set(["media", "supports", "container", "starting-style"]);
const OS_COLOR_SCHEME = /prefers-color-scheme/i;
/** The query Tailwind's `dark:` writes, as `darkMode` stays `media`. */
const DARK_VARIANT_QUERY = "(prefers-color-scheme: dark)";

const require = createRequire(import.meta.url);
// The build's print-only test (postcss.sfc-layers.cjs), so both read the same queries as print.
const { isPrintOnly } = require("../postcss.sfc-layers.cjs") as { isPrintOnly: (node: ChildNode) => boolean };

const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;

// `tailwind.config.ts` sets `module.exports`, so it is loaded the way Tailwind loads it, not imported.
const tailwindConfig = loadConfig(fileURLToPath(new URL("../tailwind.config.ts", import.meta.url)));
const tailwind = tailwindcss({ ...tailwindConfig, content: [{ raw: "" }] });
const { dropShadow } = resolveConfig(tailwindConfig).theme as { dropShadow: Record<string, string | string[]> };
/** `--tw-drop-shadow` as the theme's `drop-shadow-*` steps write it; an arbitrary `drop-shadow-[…]` is none of them. */
const DROP_SHADOW_STEPS = new Set(
  Object.values(dropShadow).map((step) => `drop-shadow(${[step].flat().join(") drop-shadow(")})`),
);

function styleText(file: string): string {
  const text = readFileSync(file, "utf-8");

  return file.endsWith(".vue") ? [...text.matchAll(STYLE_BLOCK)].map((match) => match[1]).join("\n") : text;
}

/** The block a class names: `.vc-button--primary:hover` gives `vc-button`. */
const LEADING_BLOCK = /^\.((?:[a-z0-9]|-(?!-))+)/i;

/** Vue transition classes (`fade-enter-active`, `list-move`) and state classes (`is-visible`, `has-x`). */
const NOT_A_BLOCK = /^(?:is|has)-|-(?:enter|leave)-(?:from|active|to)$|-move$/i;

function blockOf(className: string): string | undefined {
  const block = LEADING_BLOCK.exec(`.${className}`)?.[1];

  return block && !NOT_A_BLOCK.test(block) ? block : undefined;
}

/** A selector that only reaches into a block, `.variations-default .vc-line-item`, does not define it. */
export function definedBlocks(sources: { file: string; css: string }[]): Set<string> {
  const blocks = new Set<string>();

  for (const { file, css } of sources) {
    postcssScss.parse(css, { from: file }).walkRules((rule) => {
      for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
        if (parent.type === "rule") {
          return;
        }
      }

      for (const selector of rule.selectors) {
        const block = selector.trim().startsWith(".") ? blockOf(selector.trim().slice(1)) : undefined;

        if (block) {
          blocks.add(block);
        }
      }
    });
  }

  return blocks;
}

export function sourceBlocks(sources: string[]): Set<string> {
  const blocks = definedBlocks(sources.map((file) => ({ file, css: styleText(file) })));

  // A component is a block named after its file, styled or not (VcLink has no <style>).
  for (const file of sources.filter((source) => source.endsWith(".vue"))) {
    blocks.add(path.basename(file, ".vue"));
  }

  return blocks;
}

function belongsToBlock(className: string, block: string): boolean {
  return className === block || className.startsWith(`${block}__`) || className.startsWith(`${block}--`);
}

function hasBlockClass(compound: selectorParser.Node[], block: string): boolean {
  return compound.some((node) => node.type === "class" && belongsToBlock(node.value, block));
}

function isHtml(node: selectorParser.Node): boolean {
  return node.type === "tag" && node.value.toLowerCase() === "html";
}

function isDark(node: selectorParser.Node): boolean {
  return node.type === "class" && node.value === "dark";
}

function prefixKind(
  compound: selectorParser.Node[],
  design: string,
  attribute = "data-design",
): FileKindType | undefined {
  const isDesign = (node: selectorParser.Node) =>
    node.type === "attribute" &&
    node.attribute.toLowerCase() === attribute &&
    node.operator === "=" &&
    node.value === design;
  const count = (test: (node: selectorParser.Node) => boolean) => compound.filter(test).length;

  if (count(isHtml) !== 1 || count(isDesign) !== 1 || count(isDark) > 1) {
    return undefined;
  }

  if (compound.length !== 2 + count(isDark)) {
    return undefined;
  }

  return count(isDark) ? "dark" : "blocks";
}

function splitCompounds(selector: string): selectorParser.Node[][] {
  const compounds: selectorParser.Node[][] = [[]];

  selectorParser((root) => {
    root.first.each((node) => {
      if (node.type === "combinator") {
        compounds.push([]);
      } else {
        compounds.at(-1)!.push(node);
      }
    });
  }).processSync(selector);

  return compounds;
}

/** `:not(:not(.x))` names `.x` again. */
function isNegated(node: selectorParser.Node): boolean {
  let negated = false;

  for (let parent = node.parent; parent; parent = parent.parent) {
    negated = negated !== (parent.type === "pseudo" && parent.value === ":not");
  }

  return negated;
}

function isClassAttribute(node: selectorParser.Node): node is selectorParser.Attribute {
  return node.type === "attribute" && node.attribute.toLowerCase() === "class";
}

/** `[class]` by presence, prefix or substring could match any class, so it is not read as classes. */
function isUnreadableClassMatch(node: selectorParser.Node): boolean {
  return isClassAttribute(node) && node.operator !== "=" && node.operator !== "~=";
}

/** The classes a node names: a class selector, or `[class="…"]` / `[class~="…"]` read as classes. */
function classNames(node: selectorParser.Node): string[] {
  if (node.type === "class") {
    return [node.value];
  }

  if (!isClassAttribute(node) || isUnreadableClassMatch(node)) {
    return [];
  }

  return (node.insensitive ? node.value!.toLowerCase() : node.value!).split(/\s+/).filter(Boolean);
}

/** `null`, or why a selector names another block outside `:not()` or matches `[class]` by presence, prefix or substring. */
export function checkForeignBlocks(selector: string, own: string, blocks: Set<string>): string | null {
  let problem: string | null = null;

  selectorParser((root) => {
    root.walk((node) => {
      if (problem || isNegated(node)) {
        return;
      }

      if (isUnreadableClassMatch(node)) {
        problem = `"${selector}" matches [class] by presence, prefix or substring; name the class`;
        return;
      }

      const foreign = classNames(node).find((name) => {
        const block = blockOf(name);

        return block !== undefined && block !== own && blocks.has(block);
      });

      if (foreign) {
        problem = `"${selector}" names .${foreign}, another block; a block file restyles only its own block`;
      }
    });
  }).processSync(selector);

  return problem;
}

/** The design's or the preset's html alone (`html[data-design="<name>"]`, `html.dark[data-preset="<name>"]`). */
function isRootSelector(selector: string, name: string, attribute = "data-design"): boolean {
  const compounds = splitCompounds(selector);

  return compounds.length === 1 && prefixKind(compounds[0], name, attribute) !== undefined;
}

export function checkTokensSelector(selector: string, design: string): string | null {
  return isRootSelector(selector, design)
    ? null
    : `"${selector}": _tokens.scss sets tokens only on html[data-design="${design}"] or html.dark[data-design="${design}"]`;
}

/** `null` when a block or dark file's selector is allowed, otherwise why it is not. */
export function checkBlockSelector(
  selector: string,
  block: string,
  kind: Exclude<FileKindType, "tokens"> = "blocks",
): string | null {
  let namesWiring = false;
  let namesDark = false;

  selectorParser((root) => {
    root.walk((node) => {
      if (isHtml(node) || (node.type === "attribute" && node.attribute.toLowerCase() === "data-design")) {
        namesWiring = true;
      }

      if (isDark(node)) {
        namesDark = true;
      }
    });
  }).processSync(selector);

  if (namesWiring) {
    return `"${selector}": a block file names no html and no [data-design]; index.scss adds them`;
  }

  // `.dark` is on <html>, so below the design's html it never matches.
  if (namesDark) {
    return kind === "dark"
      ? `"${selector}": a dark file names no .dark; index.scss adds it`
      : `"${selector}": a block file names no .dark; put dark rules in dark/${block}.scss`;
  }

  return hasBlockClass(splitCompounds(selector).at(-1)!, block)
    ? null
    : `"${selector}" does not style .${block}: its last compound has no .${block}, .${block}__* or .${block}--* class`;
}

function isWiring(node: selectorParser.Node): boolean {
  return (
    isHtml(node) ||
    isDark(node) ||
    (node.type === "attribute" && ["data-design", "data-preset"].includes(node.attribute.toLowerCase()))
  );
}

/** `null` when a preset stylesheet's selector is allowed, otherwise why it is not. */
export function checkPresetSelector(selector: string, preset: string, blocks: Set<string>): string | null {
  const [prefix, ...below] = splitCompounds(selector);

  if (!prefixKind(prefix, preset, "data-preset")) {
    return `"${selector}": a preset stylesheet sets tokens on html[data-preset="${preset}"] or html.dark[data-preset="${preset}"], or styles blocks below them`;
  }

  if (!below.length) {
    return null;
  }

  if (below.flat().some(isWiring)) {
    return `"${selector}": html, .dark, [data-preset] and [data-design] belong to the prefix only`;
  }

  const isStyled = below.at(-1)!.some((node) => node.type === "class" && blocks.has(blockOf(node.value) ?? ""));

  return isStyled ? null : `"${selector}" styles no block: its last compound has no class of a component's block`;
}

/** The selector below the prefix; `keepCombinator` keeps a child or sibling combinator the file wrote first. */
function stripPrefix(selector: string, kind: FileKindType, design: string, keepCombinator = false): string | undefined {
  let stripped: string | undefined;

  selectorParser((root) => {
    const nodes = root.first.nodes;
    const end = nodes.findIndex((node) => node.type === "combinator");
    const combinator = end > 0 ? nodes[end] : undefined;
    const isDescendant = combinator?.type === "combinator" && combinator.value.trim() === "";

    if (combinator && (isDescendant || keepCombinator) && prefixKind(nodes.slice(0, end), design) === kind) {
      stripped = nodes
        .slice(isDescendant ? end + 1 : end)
        .map(String)
        .join("")
        .trim();
    }
  }).processSync(selector);

  return stripped;
}

function hasCompoundBeforePrefix(selector: string, design: string): boolean {
  return splitCompounds(selector).some((compound, index) => index > 0 && prefixKind(compound, design) !== undefined);
}

/** The files Sass may load for `target`: the file or its partial, and without an extension also an index. */
function loadCandidates(target: string): string[] {
  const dir = path.dirname(target);
  const base = path.basename(target);

  if (/\.(scss|sass|css)$/.test(target)) {
    return [target, path.join(dir, `_${base}`)];
  }

  return ["scss", "sass", "css"].flatMap((extension) => [
    `${target}.${extension}`,
    path.join(dir, `_${base}.${extension}`),
    path.join(target, `index.${extension}`),
    path.join(target, `_index.${extension}`),
  ]);
}

function designImporter(designDir: string): Importer<"sync"> {
  const designRoot = realpathSync(designDir) + path.sep;

  return {
    canonicalize(url) {
      if (!url.startsWith("file:") && !url.startsWith("@/")) {
        return null;
      }

      const target = url.startsWith("@/") ? path.resolve("client-app", url.slice(2)) : fileURLToPath(url);
      const found = loadCandidates(target).filter((candidate) => existsSync(candidate));

      // Sass then tries the URL as written, which is how `@/…` arrives.
      if (!found.length) {
        return null;
      }

      if (found.length > 1) {
        throw new Error(`${url} matches ${found.length} files`);
      }

      const real = realpathSync(found[0]);

      if (!(real.startsWith(designRoot) && real.endsWith(".scss"))) {
        throw new Error(
          `${path.relative(".", real)} is not a .scss file in ${designDir}, so this check does not read it`,
        );
      }

      return pathToFileURL(real);
    },
    load(url) {
      // Without `sourceMapUrl` the source map names the file by a `data:` URL of its text.
      return { contents: readFileSync(fileURLToPath(url), "utf-8"), syntax: "scss", sourceMapUrl: url };
    },
  };
}

async function compileDesignFile(file: string, designDir: string): Promise<Root> {
  const importer = designImporter(designDir);
  const { css, sourceMap } = compileString(readFileSync(file, "utf-8"), {
    url: pathToFileURL(realpathSync(file)),
    importer,
    importers: [importer],
    sourceMap: true,
    charset: false,
    logger: { warn: () => undefined, debug: () => undefined },
  });
  const result = await postcss([tailwind]).process(css, {
    from: file,
    map: { prev: JSON.stringify(sourceMap), inline: false, annotation: false },
  });

  return result.root;
}

async function compileOrReport(file: string, designDir: string, errors: string[]): Promise<Root | undefined> {
  try {
    return await compileDesignFile(file, designDir);
  } catch (error) {
    if (error instanceof Error && error.name === "CssSyntaxError") {
      const { file: source, line, reason } = error as CssSyntaxError;
      const at = source ? `${path.relative(".", source)}:${line}` : file;

      errors.push(`${at}  ${reason}`);
    } else {
      const { sassMessage, span } = error as Exception;
      const at = span?.url ? `${path.relative(".", fileURLToPath(span.url))}:${span.start.line + 1}` : file;

      errors.push(`${at}  ${sassMessage ?? (error as Error).message}`);
    }

    return undefined;
  }
}

function origin(node: ChildNode): { file: string; line: number } | undefined {
  const start = node.source?.start;
  const position = start && node.source?.input.origin(start.line, start.column);

  return position && position.file ? { file: position.file, line: position.line } : undefined;
}

function where(node: ChildNode, fallback: string): string {
  const at = origin(node);

  return at ? `${path.relative(".", at.file)}:${at.line}` : fallback;
}

/** Sass keeps an escape in an interpolated property name, `#{"--x-c\\6f lor"}`; the browser reads `--x-color`. */
function unescapeIdent(name: string): string {
  return name.replaceAll(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (_match, hex: string | undefined, char: string | undefined) =>
    hex ? codePoint(Number.parseInt(hex, 16)) : char!,
  );
}

/** As CSS reads an escape: zero, a surrogate or a value past U+10FFFF is U+FFFD. */
function codePoint(value: number): string {
  const isReadable = value !== 0 && (value < 0xd800 || value > 0xdfff) && value <= 0x10ffff;

  return String.fromCodePoint(isReadable ? value : 0xfffd);
}

function isCustomProperty(prop: string): boolean {
  return unescapeIdent(prop).startsWith("--");
}

/** A custom property named as a colour token once its escapes are read, so `-\-x-bg` counts too. */
function isColorToken(prop: string): boolean {
  const name = unescapeIdent(prop);

  return name.startsWith("--") && name !== SHADOW_GEOMETRY && COLOR_TOKEN.test(name);
}

function hasColor(value: string): boolean {
  const variables = [...value.matchAll(VAR_REFERENCE)].map((match) => match[1]);
  const rest = value.replaceAll(VAR_REFERENCE, " ").toLowerCase();

  return (
    variables.some((name) => isColorToken(name)) ||
    COLOR_FUNCTION.test(rest) ||
    (rest.match(HEX) ?? []).some((hex) => !ZERO_ALPHA_HEX.test(hex)) ||
    (rest.match(IDENTIFIER) ?? []).some((word) => NAMED_COLORS.has(word))
  );
}

function setsColor(prop: string, value: string): boolean {
  const name = unescapeIdent(prop).toLowerCase();

  if (name.startsWith("--")) {
    return TAILWIND_COLOR.test(name);
  }

  if (COLOR_PROPERTY.test(name)) {
    return !NO_COLOR.has(value.trim().toLowerCase());
  }

  const text = value.replaceAll(QUOTED_OR_URL, " ");

  // A gradient's colours count in whatever property it stands; `bg-gradient-to-r` sets only a direction.
  return (/gradient\(/i.test(text) || COLOR_SHORTHAND.test(name) || BORDER_SHORTHAND.test(name)) && hasColor(text);
}

/** The semantic colours `_colors.scss` derives from the preset's keys, `--link-color` and the like. */
export function colorSemantics(file = COLORS_FILE): Set<string> {
  const names = new Set<string>();

  if (existsSync(file)) {
    postcssScss.parse(readFileSync(file, "utf-8")).walkDecls((node) => {
      if (isCustomProperty(node.prop)) {
        names.add(unescapeIdent(node.prop));
      }
    });
  }

  return names;
}

/**
 * `null` when every colour in a value comes from preset variables: `var()` of a preset key (`--color-*`),
 * a `_colors.scss` semantic, a public `--vc-*` token or Tailwind's `--tw-*`, `color-mix()` or a relative colour
 * of these, the keywords (`transparent` only where it is no origin) and a colour function or hex with alpha 0 that
 * is no origin; otherwise why not: the first foreign variable or literal.
 */
export function checkColorValue(value: string, semantics: ReadonlySet<string>): string | null {
  const text = value.replaceAll(QUOTED_OR_URL, " ");
  const foreign = [...text.matchAll(VAR_REFERENCE)]
    .map((match) => unescapeIdent(match[1]))
    .find((name) => !PRESET_VARIABLE.test(name) && !semantics.has(name));

  if (foreign) {
    return `var(${foreign}) is no preset variable`;
  }

  const rest = text.replaceAll(VAR_REFERENCE, " ").toLowerCase();
  // A relative colour's origin counts whatever its alpha: `rgb(from #fff0 r g b / 1)` is opaque.
  const isOrigin = (index: number) => BEFORE_ORIGIN.test(rest.slice(0, index));
  const hex = [...rest.matchAll(HEX)].find((match) => !ZERO_ALPHA_HEX.test(match[0]) || isOrigin(match.index));

  if (hex) {
    return `${hex[0]} is a literal colour`;
  }

  const literal = [...rest.matchAll(COLOR_FUNCTION_CALL)].find((match) => {
    const args = rest.slice(match.index + match[0].length);

    return match[1] !== "color-mix" && !RELATIVE_COLOR.test(args) && (!ZERO_ALPHA.test(args) || isOrigin(match.index));
  });

  if (literal) {
    return `${literal[1]}() without "from" is a literal colour`;
  }

  // `rgb(from transparent r g b / 1)` is opaque black.
  const named = [...rest.matchAll(IDENTIFIER)].find(
    (match) => NAMED_COLORS.has(match[0]) || (match[0] === "transparent" && isOrigin(match.index)),
  );

  return named ? `${named[0]} is a named colour` : null;
}

/** The at-rules around a rule, outermost first: `@layer vc.design > @media (width >= 1px)`. */
function wrappers(rule: Rule): string {
  const list: string[] = [];

  for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
    if (parent.type === "atrule") {
      list.unshift(`@${parent.name} ${parent.params}`);
    }
  }

  return list.join(" > ");
}

function ruleKey(selectors: string[], declarations: Declaration[]): string {
  const text = declarations.map((node) => `${node.important ? "important " : ""}${node.prop}:${node.value}`);

  return `${selectors.join(",")}{${text.join(";")}}`;
}

/** Tailwind merges adjacent rules with one selector, so one rule of `index.scss` can hold two files' declarations. */
function declarationsByFile(rule: Rule): Map<string | undefined, Declaration[]> {
  const groups = new Map<string | undefined, Declaration[]>();

  for (const node of rule.nodes) {
    if (node.type === "decl") {
      const file = origin(node)?.file;

      groups.set(file, [...(groups.get(file) ?? []), node]);
    }
  }

  return groups;
}

/**
 * Reports an `@media` on the OS colour scheme (`@apply dark:…` writes one) or a print-only one (`print:`):
 * the storefront's dark mode is `html.dark`, and print rules sit in `vc.print`, above every design and preset.
 * `places` says where the file's dark-mode rules and the rest go.
 */
function reportMedia(node: ChildNode, report: ReportType, owner: string, places: string): void {
  if (node.type !== "atrule" || node.name !== "media") {
    return;
  }

  if (OS_COLOR_SCHEME.test(node.params)) {
    const source = node.params === DARK_VARIANT_QUERY ? " (`dark:` writes it)" : "";

    report(
      node,
      `@media ${node.params} follows the OS theme, not the storefront's dark mode${source}; drop it: ${places}`,
    );
  } else if (isPrintOnly(node)) {
    report(
      node,
      `@media ${node.params}: ${owner} holds no print rules (\`print:\` writes them); they go in vc.print, client-app/assets/styles/print/`,
    );
  }
}

/** An at-rule a file may not hold is reported once, and what is inside it is not read. */
function shippedNodes(
  container: Container,
  isAllowed: (atRule: AtRule) => boolean,
  report: ReportType,
  owner = "a design file",
): ChildNode[] {
  const nodes: ChildNode[] = [];

  container.each((node) => {
    if (node.type === "atrule" && !isAllowed(node)) {
      report(node, `@${node.name} is not allowed in ${owner}`);
      return;
    }

    nodes.push(node);

    if ((node.type === "atrule" || node.type === "rule") && node.nodes) {
      nodes.push(...shippedNodes(node, isAllowed, report, owner));
    }
  });

  return nodes;
}

function placeOf(kind: FileKindType, design: string): string {
  if (kind === "tokens") {
    return "@layer theme";
  }

  return `@layer vc.design > html${kind === "dark" ? ".dark" : ""}[data-design="${design}"]`;
}

function shippedKey(
  rule: Rule,
  declarations: Declaration[],
  kind: FileKindType,
  design: string,
  keepCombinator = false,
): string | undefined {
  const outer = kind === "tokens" ? "@layer theme" : "@layer vc.design";
  const actual = wrappers(rule);

  if (actual !== outer && !actual.startsWith(`${outer} > `)) {
    return undefined;
  }

  // Below the outer layer a rule keeps its own at-rules.
  const own = actual.slice(outer.length + 3);
  const selectors =
    kind === "tokens"
      ? rule.selectors
      : rule.selectors.map((selector) => stripPrefix(selector, kind, design, keepCombinator));

  return selectors.every((selector) => selector !== undefined)
    ? `${own}|${ruleKey(selectors, declarations)}`
    : undefined;
}

/** The reported declarations of one source line: one `@apply` writes several. */
interface IColorLine {
  index: number;
  props: Set<string>;
  problem: string;
}

/**
 * In a design: a colour property, a shorthand or gradient that holds a colour, a colour or shadow token, and a
 * public custom property whose value holds one (`--vc-brand: #e30613`, the `--tw-shadow` of `shadow-[…]`).
 */
function isDesignColor(prop: string, value: string, text: string): boolean {
  const name = unescapeIdent(prop);

  return (
    SHADOW_TOKEN.test(name) ||
    COLOR_PROPERTY.test(name) ||
    setsColor(prop, value) ||
    isColorToken(prop) ||
    (PUBLIC_VARIABLE.test(name) && hasColor(text))
  );
}

/** In a preset, what sets a colour and nothing else: a colour longhand (`border-color`, not `border`) or token. */
function isPresetColor(prop: string): boolean {
  const name = unescapeIdent(prop).toLowerCase();

  return COLOR_PROPERTY.test(name) || TAILWIND_COLOR.test(name) || isColorToken(prop);
}

/** Why a preset may not set a property; a shorthand that holds a colour sets geometry too, so its longhand is named. */
function presetProblem(prop: string, text: string): string {
  const name = unescapeIdent(prop).toLowerCase();
  const problem = "a preset stylesheet sets colours only";

  if (!(COLOR_SHORTHAND.test(name) || BORDER_SHORTHAND.test(name)) || !hasColor(text)) {
    return problem;
  }

  return NO_COLOR_LONGHAND.test(name)
    ? `a shorthand sets geometry too, and ${problem}; ${name} has no colour longhand`
    : `a shorthand sets geometry too, and ${problem}: set ${name}-color, not ${name}`;
}

/**
 * Why a declaration breaks the colour rules, or `undefined`. A colour (`isDesignColor`) comes only from preset
 * variables, and no private variable carries one, whatever its name. A preset stylesheet sets colour longhands
 * and tokens only (`isPresetColor`), and no private variable at all.
 */
function colorProblem(
  { prop, value }: Declaration,
  semantics: ReadonlySet<string>,
  isPreset = false,
): string | undefined {
  const name = unescapeIdent(prop);
  const text = value.replaceAll(QUOTED_OR_URL, " ");
  const isPrivate = isCustomProperty(prop) && !PUBLIC_VARIABLE.test(name);
  const isColor = isPreset ? isPresetColor(prop) : isDesignColor(prop, value, text);
  const keepsBlack = BLACK_SHADOW.test(name) || (name === DROP_SHADOW && DROP_SHADOW_STEPS.has(value));
  const colors = (keepsBlack ? value.replaceAll(DEFAULT_SHADOW_BLACK, " ") : value).replaceAll(
    DEFAULT_SHADOW_FALLBACK_BLACK,
    "$1 ",
  );
  const valueProblem = isColor ? checkColorValue(colors, semantics) : null;
  const privateProblem = "a private variable; set the component's public --vc-* token, or the property itself";

  if (isPrivate && isPreset) {
    return privateProblem;
  }

  if (!isColor && isPreset) {
    return presetProblem(prop, text);
  }

  if (valueProblem) {
    return `${valueProblem}; ${COLOR_RULE}`;
  }

  return isPrivate && hasColor(text) ? privateProblem : undefined;
}

/** A declared property comes before Tailwind's `--tw-*` companions: `background-color, --tw-bg-opacity`. */
function colorMessage({ props, problem }: IColorLine): string {
  const names = [...props].sort((a, b) => Number(isCustomProperty(a)) - Number(isCustomProperty(b)));

  return `${names.join(", ")}: ${problem}`;
}

/** Reports a line's declarations once, under the first problem found on it. */
function colorReporter(errors: string[], file: string): (node: Declaration, problem: string) => void {
  const colorLines = new Map<string, IColorLine>();

  return (node, problem) => {
    const at = where(node, file);
    const line = colorLines.get(at) ?? { index: errors.push("") - 1, props: new Set<string>(), problem };

    line.props.add(node.prop);
    colorLines.set(at, line);
    errors[line.index] = `${at}  ${colorMessage(line)}`;
  };
}

function checkCompiledFile(
  css: Root,
  file: string,
  kind: FileKindType,
  design: string,
  blocks: Set<string>,
  semantics: ReadonlySet<string>,
): { errors: string[]; keys: Set<string> } {
  const errors: string[] = [];
  const keys = new Set<string>();
  const report: ReportType = (node, message) => errors.push(`${where(node, file)}  ${message}`);
  const block = path.basename(file, ".scss");
  const real = realpathSync(file);
  const selectorProblem = (selector: string) =>
    kind === "tokens"
      ? checkTokensSelector(selector, design)
      : (checkBlockSelector(selector, block, kind) ?? checkForeignBlocks(selector, block, blocks));
  const reportAll = (node: ChildNode, problems: (string | null | undefined)[]) => {
    for (const problem of problems) {
      if (problem) {
        report(node, problem);
      }
    }
  };
  const reportColor = colorReporter(errors, file);
  const places =
    kind === "tokens"
      ? `dark-mode tokens go on html.dark[data-design="${design}"], the rest on html[data-design="${design}"]`
      : `dark-mode rules go in dark/${block}.scss, the rest in blocks/${block}.scss`;

  for (const node of shippedNodes(css, (atRule) => ALLOWED_AT_RULES.has(atRule.name), report)) {
    reportMedia(node, report, "a design file", places);

    if (node.type === "rule") {
      reportAll(node, node.selectors.map(selectorProblem));

      const own = declarationsByFile(node).get(real);

      if (own) {
        keys.add(`${wrappers(node)}|${ruleKey(node.selectors, own)}`);
      }
    } else if (node.type === "decl" && kind === "tokens" && !isCustomProperty(node.prop)) {
      report(node, `${node.prop}: _tokens.scss sets custom properties only`);
    } else if (node.type === "decl") {
      const problem = colorProblem(node, semantics);

      if (problem) {
        reportColor(node, problem);
      }
    }
  }

  return { errors, keys };
}

function isIndexAtRule(atRule: AtRule): boolean {
  return (
    ALLOWED_AT_RULES.has(atRule.name) || (atRule.name === "layer" && atRule.parent?.type === "root" && !!atRule.nodes)
  );
}

/** Where `index.scss` loads `ref`, found in its text as `checkDesignName` finds `data-design`. */
function loadLine(indexFile: string, ref: string): string {
  const text = readFileSync(indexFile, "utf-8");
  const match = [...text.matchAll(LOAD_CSS)].find((load) => load[1].replace(/\.scss$/, "") === ref);

  return match ? `${indexFile}:${text.slice(0, match.index).split("\n").length}` : indexFile;
}

/** Each rule `index.scss` ships stands in its file's place, and every rule of every checked file ships. */
function checkWiring(index: Root, indexFile: string, design: string, checked: ICheckedFileType[]): string[] {
  const errors: string[] = [];
  const report: ReportType = (node, message) => errors.push(`${where(node, indexFile)}  ${message}`);
  const byFile = new Map(checked.map((source) => [realpathSync(source.file), source]));
  const shipped = new Map(checked.map((source) => [source, new Set<string>()]));
  const misplaced = new Set<ICheckedFileType>();
  const reported = new Set<ICheckedFileType>();

  const ship = (rule: Rule, file: string | undefined, declarations: Declaration[]) => {
    const source = file === undefined ? undefined : byFile.get(file);
    const key = source && shippedKey(rule, declarations, source.kind, design);
    const outside = (misplacedSource: ICheckedFileType) =>
      `"${rule.selector}" ships outside ${placeOf(misplacedSource.kind, design)}, where index.scss loads ${misplacedSource.ref}`;

    if (!source) {
      report(declarations[0], `"${rule.selector}": index.scss holds no rules of its own; put them in a block file`);
    } else if (key !== undefined && source.keys.has(key)) {
      shipped.get(source)!.add(key);
    } else if (rule.selectors.some((selector) => hasCompoundBeforePrefix(selector, design))) {
      reported.add(source);
      report(
        declarations[0],
        `"${rule.selector}": a variant that styles an ancestor or sibling (group-*, peer-*) puts a selector before html[data-design] and never matches; write the rule out`,
      );
    } else if (source.keys.has(shippedKey(rule, declarations, source.kind, design, true) ?? "")) {
      // index.scss put the file in its place; the file's own selector starts with `>`, `+` or `~`.
      reported.add(source);
      report(declarations[0], outside(source));
    } else if (!misplaced.has(source)) {
      misplaced.add(source);
      reported.add(source);
      errors.push(`${loadLine(indexFile, source.ref)}  ${outside(source)}`);
    }
  };

  for (const node of shippedNodes(index, isIndexAtRule, report)) {
    if (node.type === "rule") {
      for (const [file, declarations] of declarationsByFile(node)) {
        ship(node, file, declarations);
      }
    }
  }

  for (const source of checked) {
    const loaded = shipped.get(source)!;

    // A file with a rule reported above is loaded, only not in its place.
    if (!reported.has(source) && [...source.keys].some((key) => !loaded.has(key))) {
      const place = placeOf(source.kind, design);

      errors.push(
        `${source.file}  index.scss does not load it: add @include meta.load-css("${source.ref}"); inside ${place}`,
      );
    }
  }

  return errors;
}

/** A hidden entry (`.DS_Store`, `.gitkeep`) is the system's or git's, not part of the design. */
function entriesOf(dir: string): Dirent[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function blockFiles(dir: string, errors: string[]): string[] {
  const files: string[] = [];

  for (const entry of entriesOf(dir)) {
    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      errors.push(`${file}  blocks/ and dark/ hold files directly, named after their block`);
    } else if (entry.name.endsWith(".scss")) {
      files.push(file);
    } else {
      errors.push(`${file}  blocks/ and dark/ hold only .scss files, named after their block`);
    }
  }

  return files;
}

function layoutOf(dir: string, errors: string[]): IDesignFiles {
  const files: IDesignFiles = { blocks: [], dark: [] };

  for (const entry of entriesOf(dir)) {
    const at = path.join(dir, entry.name);

    if (LAYOUT.get(entry.name) !== (entry.isDirectory() ? "folder" : "file")) {
      errors.push(`${at}  is not part of a design folder (design.ts, _tokens.scss, index.scss, blocks/, dark/)`);
    } else if (entry.name === "_tokens.scss") {
      files.tokens = at;
    } else if (entry.name === "index.scss") {
      files.index = at;
    } else if (entry.name === "blocks" || entry.name === "dark") {
      files[entry.name] = blockFiles(at, errors);
    }
  }

  return files;
}

function checkDesignName(file: string, design: string): string[] {
  const text = readFileSync(file, "utf-8");

  return [...text.matchAll(DESIGN_ATTRIBUTE)]
    .filter((match) => match[1] !== design)
    .map((match) => {
      const line = text.slice(0, match.index).split("\n").length;

      return `${file}:${line}  data-design="${match[1]}" must be "${design}", the folder name`;
    });
}

async function checkFolder(
  dir: string,
  blocks: Set<string>,
  semantics: ReadonlySet<string>,
  errors: string[],
): Promise<number> {
  const design = path.basename(dir);

  if (!DESIGN_NAME.test(design) || design === CLASSIC) {
    errors.push(
      `${dir}  a design folder is named in lower case (a-z, 0-9, -), starts with a letter and is not "${CLASSIC}"`,
    );
  }

  const files = layoutOf(dir, errors);

  for (const file of [files.index, files.tokens]) {
    if (file) {
      errors.push(...checkDesignName(file, design));
    }
  }

  const sources = [
    ...(files.tokens ? [{ file: files.tokens, kind: "tokens" as const, ref: "tokens" }] : []),
    ...files.blocks.map((file) => ({ file, kind: "blocks" as const, ref: `blocks/${path.basename(file, ".scss")}` })),
    ...files.dark.map((file) => ({ file, kind: "dark" as const, ref: `dark/${path.basename(file, ".scss")}` })),
  ];
  const checked: ICheckedFileType[] = [];

  const compiled = await Promise.all(
    sources.map(async (source) => {
      const compileErrors: string[] = [];
      const css = await compileOrReport(source.file, dir, compileErrors);

      return { css, compileErrors };
    }),
  );

  for (const [position, source] of sources.entries()) {
    const block = path.basename(source.file, ".scss");
    const { css, compileErrors } = compiled[position];

    if (source.kind !== "tokens" && !blocks.has(block)) {
      errors.push(`${source.file}  .${block} is not a block of any component`);
    }

    errors.push(...compileErrors);

    if (css) {
      const result = checkCompiledFile(css, source.file, source.kind, design, blocks, semantics);

      errors.push(...result.errors);
      checked.push({ ...source, keys: result.keys });
    }
  }

  if (!files.index) {
    errors.push(`${path.join(dir, "index.scss")} is missing; a design ships only what its index.scss loads`);

    return sources.length;
  }

  const index = await compileOrReport(files.index, dir, errors);

  if (index) {
    errors.push(...checkWiring(index, files.index, design, checked));
  }

  return sources.length + 1;
}

function designFolders(designsDir: string): string[] {
  return readdirSync(designsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export async function checkDesigns({
  designsDir,
  blocks,
  semantics,
}: IDesignCheckOptions): Promise<IDesignCheckResult> {
  // A moved folder is reported as a check failure, not as readdirSync's ENOENT stack trace.
  if (!existsSync(designsDir)) {
    return {
      errors: [`${designsDir} is missing; the designs are not where this check looks`],
      designCount: 0,
      fileCount: 0,
    };
  }

  const folders = designFolders(designsDir);
  const errors: string[] = [];
  let fileCount = 0;

  const results = await Promise.all(
    folders.map(async (folder) => {
      const folderErrors: string[] = [];
      const count = await checkFolder(path.join(designsDir, folder), blocks, semantics, folderErrors);

      return { count, folderErrors };
    }),
  );

  for (const { count, folderErrors } of results) {
    fileCount += count;
    errors.push(...folderErrors);
  }

  // A problem in a file that index.scss loads is reported once, at the line that wrote it.
  return { errors: [...new Set(errors)], designCount: folders.length, fileCount };
}

function isPresetLayer(atRule: AtRule): boolean {
  return atRule.parent?.type === "root" && `@${atRule.name} ${atRule.params.trim()}` === PRESET_LAYER && !!atRule.nodes;
}

function presetRuleProblems(rule: Rule, preset: string, blocks: Set<string>): string[] {
  const place = wrappers(rule);
  const problems = rule.selectors.map((selector) => checkPresetSelector(selector, preset, blocks));

  if (place !== PRESET_LAYER && !place.startsWith(`${PRESET_LAYER} > `)) {
    problems.unshift(`"${rule.selector}" ships outside ${PRESET_LAYER}`);
  }

  return problems.filter((problem): problem is string => problem !== null);
}

/** A declaration on the preset's html alone, where a token is inherited, so a block's own setting wins. */
function isOnPresetRoot(node: Declaration, preset: string): boolean {
  const rule = node.parent;

  return rule?.type === "rule" && rule.selectors.some((selector) => isRootSelector(selector, preset, "data-preset"));
}

function checkPresetFile(
  css: Root,
  file: string,
  preset: string,
  blocks: Set<string>,
  semantics: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const report: ReportType = (node, message) => errors.push(`${where(node, file)}  ${message}`);
  const reportColor = colorReporter(errors, file);
  const isAllowed = (atRule: AtRule) => ALLOWED_AT_RULES.has(atRule.name) || isPresetLayer(atRule);
  const places = `dark-mode rules go under html.dark[data-preset="${preset}"], the rest under html[data-preset="${preset}"]`;

  for (const node of shippedNodes(css, isAllowed, report, "a preset stylesheet")) {
    reportMedia(node, report, "a preset stylesheet", places);

    if (node.type === "rule") {
      for (const problem of presetRuleProblems(node, preset, blocks)) {
        report(node, problem);
      }
    } else if (node.type === "decl") {
      const problem =
        isOnPresetRoot(node, preset) && !unescapeIdent(node.prop).startsWith("--vc-")
          ? "the preset's html takes public --vc-* tokens only"
          : colorProblem(node, semantics, true);

      if (problem) {
        reportColor(node, problem);
      }
    }
  }

  return errors;
}

/** Every `<name>.scss` next to the preset JSON files: a preset's optional stylesheet. */
export async function checkPresets({
  presetsDir,
  blocks,
  semantics,
}: IPresetCheckOptions): Promise<IPresetCheckResult> {
  // A moved folder fails the check, as in checkDesigns, instead of passing with nothing checked.
  if (!existsSync(presetsDir)) {
    return { errors: [`${presetsDir} is missing; the presets are not where this check looks`], fileCount: 0 };
  }

  const files = entriesOf(presetsDir)
    .filter((entry) => entry.isFile() && entry.name.endsWith(".scss"))
    .map((entry) => entry.name);

  if (!files.length) {
    return { errors: [], fileCount: 0 };
  }

  const errors: string[] = [];

  const compiled = await Promise.all(
    files.map(async (name) => {
      const compileErrors: string[] = [];
      const css = await compileOrReport(path.join(presetsDir, name), presetsDir, compileErrors);

      return { css, compileErrors };
    }),
  );

  for (const [position, name] of files.entries()) {
    const file = path.join(presetsDir, name);
    const preset = path.basename(name, ".scss");
    const { css, compileErrors } = compiled[position];

    if (preset.endsWith(".dark")) {
      errors.push(`${file}  dark rules go in ${preset.slice(0, -".dark".length)}.scss under html.dark[data-preset]`);

      continue;
    }

    if (!existsSync(path.join(presetsDir, `${preset}.json`))) {
      errors.push(`${file}  is a preset's stylesheet only next to its preset: ${preset}.json is missing`);
    }

    errors.push(...compileErrors);

    if (css) {
      errors.push(...checkPresetFile(css, file, preset, blocks, semantics));
    }
  }

  return { errors: [...new Set(errors)], fileCount: files.length };
}

async function main(): Promise<void> {
  const sources = globSync("client-app/**/*.{vue,scss}", {
    ignore: [
      "client-app/designs/**",
      "client-app/assets/presets/**",
      "client-app/assets/styles/{dark,print}/**",
      "client-app/assets/styles/_custom.scss",
    ],
  });
  const blocks = sourceBlocks(sources);
  const semantics = colorSemantics();
  const designs = await checkDesigns({ designsDir: "client-app/designs", blocks, semantics });
  const presets = await checkPresets({ presetsDir: "client-app/assets/presets", blocks, semantics });
  const errors = [...designs.errors, ...presets.errors];

  if (errors.length) {
    console.error(`Design check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }

  console.log(
    `Design check passed: ${designs.designCount} designs, ${designs.fileCount} files, ${presets.fileCount} preset stylesheets.`,
  );
}

// vite-node leaves the script out of process.argv, so a test import is told apart by vitest's flag.
if (!process.env.VITEST) {
  await main();
}

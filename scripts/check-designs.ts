import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { globSync } from "glob";
import postcss from "postcss";
import postcssScss from "postcss-scss";
import selectorParser from "postcss-selector-parser";
import { compileString } from "sass";
import tailwindcss from "tailwindcss";
import loadConfig from "tailwindcss/loadConfig.js";
import type { Dirent } from "node:fs";
import type { AtRule, ChildNode, Container, CssSyntaxError, Declaration, Root, Rule } from "postcss";
import type { Exception, Importer } from "sass";

// The rules are in client-app/assets/styles/README.md; `yarn lint` does not parse SCSS, so this runs in CI.

export interface IDesignCheckOptions {
  designsDir: string;
  /** Stylesheets and components that define the blocks. */
  sources: string[];
}

export interface IDesignCheckResult {
  errors: string[];
  designCount: number;
  /** The `.scss` files checked. */
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
  ["_tokens.scss", "file"],
  ["index.scss", "file"],
  ["blocks", "folder"],
  ["dark", "folder"],
]);
const DESIGN_ATTRIBUTE = /data-design\s*=\s*["']?([\w-]+)/g;
const LOAD_CSS = /load-css\(\s*(?:\$url\s*:\s*)?["']([^"']+)["']/g;

/** The kit names its public colour tokens `…color…`, `…bg…`, `…-text`, `…-border` or `…-icon`. */
const COLOR_TOKEN = /(?:color|bg)|(?:-(?:text|border|icon)$)/i;
/** Tailwind's shadow geometry, which reads the colour from `--tw-shadow-color`. */
const SHADOW_GEOMETRY = "--tw-shadow-colored";
const COLOR_PROPERTY = /^(?:color|fill|stroke|.+-color)$/;
const COLOR_SHORTHAND =
  /^(?:background|outline|column-rule|text-decoration|text-emphasis|box-shadow|text-shadow|-webkit-text-stroke)$/;
const BORDER_SHORTHAND = /^border(?:-(?:top|right|bottom|left|(?:block|inline)(?:-(?:start|end))?))?$/;
// Tailwind writes these besides the `--tw-*-color` tokens: a gradient's stops and the alpha of a colour.
const TAILWIND_COLOR = /^--tw-(?:gradient-(?:from|to)|(?:bg|text|border|divide|placeholder|ring)-opacity)$/;
// `#0000` is Tailwind's transparent fallback, `var(--tw-shadow, 0 0 #0000)`.
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
  "#0000",
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
const QUOTED_OR_URL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\([^)]*\)/gi;
const VAR_REFERENCE = /var\(\s*(--[^\s,)]+)/gi;
const COLOR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const HEX = /#[\da-f]+/gi;
const IDENTIFIER = /(?<![\w-])[a-z][\w-]*/gi;

/** At-rules a design file may emit; any other one, `@layer` or `@keyframes`, ships CSS out of its place. */
const ALLOWED_AT_RULES = new Set(["media", "supports", "container", "starting-style"]);

const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;

// `tailwind.config.ts` sets `module.exports`, so it is loaded the way Tailwind loads it, not imported.
const tailwindConfig = loadConfig(fileURLToPath(new URL("../tailwind.config.ts", import.meta.url)));
const tailwind = tailwindcss({ ...tailwindConfig, content: [{ raw: "" }] });

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

function sourceBlocks(sources: string[]): Set<string> {
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

function prefixKind(compound: selectorParser.Node[], design: string): FileKindType | undefined {
  const isHtml = (node: selectorParser.Node) => node.type === "tag" && node.value.toLowerCase() === "html";
  const isDesign = (node: selectorParser.Node) =>
    node.type === "attribute" &&
    node.attribute.toLowerCase() === "data-design" &&
    node.operator === "=" &&
    node.value === design;
  const isDark = (node: selectorParser.Node) => node.type === "class" && node.value === "dark";
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

export function checkTokensSelector(selector: string, design: string): string | null {
  const compounds = splitCompounds(selector);

  return compounds.length === 1 && prefixKind(compounds[0], design)
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
      if (
        (node.type === "tag" && node.value.toLowerCase() === "html") ||
        (node.type === "attribute" && node.attribute.toLowerCase() === "data-design")
      ) {
        namesWiring = true;
      }

      if (node.type === "class" && node.value === "dark") {
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
    (rest.match(HEX) ?? []).some((hex) => !NO_COLOR.has(hex)) ||
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

/** An at-rule a file may not hold is reported once, and what is inside it is not read. */
function shippedNodes(container: Container, isAllowed: (atRule: AtRule) => boolean, report: ReportType): ChildNode[] {
  const nodes: ChildNode[] = [];

  container.each((node) => {
    if (node.type === "atrule" && !isAllowed(node)) {
      report(node, `@${node.name} is not allowed in a design file`);
      return;
    }

    nodes.push(node);

    if ((node.type === "atrule" || node.type === "rule") && node.nodes) {
      nodes.push(...shippedNodes(node, isAllowed, report));
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

type ColorProblemType = "value" | "token";

/** The colour declarations of one source line: one `@apply` writes several. */
interface IColorLine {
  index: number;
  props: Set<string>;
  isToken: boolean;
}

function colorProblem({ prop, value }: Declaration): ColorProblemType | undefined {
  if (setsColor(prop, value)) {
    return "value";
  }

  return isColorToken(prop) ? "token" : undefined;
}

/** A declared property comes before Tailwind's `--tw-*` companions: `background-color, --tw-bg-opacity`. */
function colorMessage({ props, isToken }: IColorLine): string {
  const names = [...props].sort((a, b) => Number(isCustomProperty(a)) - Number(isCustomProperty(b)));

  return `${names.join(", ")}: ${isToken ? "colour tokens belong to presets, not to a design" : "colours come from the preset"}`;
}

function checkCompiledFile(
  css: Root,
  file: string,
  kind: FileKindType,
  design: string,
  blocks: Set<string>,
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
  const colorLines = new Map<string, IColorLine>();
  const reportColor = (node: Declaration, problem: ColorProblemType) => {
    const at = where(node, file);
    const line = colorLines.get(at) ?? { index: errors.push("") - 1, props: new Set<string>(), isToken: true };

    line.props.add(node.prop);
    line.isToken &&= problem === "token";
    colorLines.set(at, line);
    errors[line.index] = `${at}  ${colorMessage(line)}`;
  };

  for (const node of shippedNodes(css, (atRule) => ALLOWED_AT_RULES.has(atRule.name), report)) {
    if (node.type === "rule") {
      reportAll(node, node.selectors.map(selectorProblem));

      const own = declarationsByFile(node).get(real);

      if (own) {
        keys.add(`${wrappers(node)}|${ruleKey(node.selectors, own)}`);
      }
    } else if (node.type === "decl" && kind === "tokens" && !isCustomProperty(node.prop)) {
      report(node, `${node.prop}: _tokens.scss sets custom properties only`);
    } else if (node.type === "decl") {
      const problem = colorProblem(node);

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
      errors.push(`${at}  is not part of a design folder (_tokens.scss, index.scss, blocks/, dark/)`);
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

async function checkFolder(dir: string, blocks: Set<string>, errors: string[]): Promise<number> {
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

  for (const source of sources) {
    const block = path.basename(source.file, ".scss");

    if (source.kind !== "tokens" && !blocks.has(block)) {
      errors.push(`${source.file}  .${block} is not a block of any component`);
    }

    const css = await compileOrReport(source.file, dir, errors);

    if (css) {
      const result = checkCompiledFile(css, source.file, source.kind, design, blocks);

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

export async function checkDesigns({ designsDir, sources }: IDesignCheckOptions): Promise<IDesignCheckResult> {
  // readdirSync would throw a bare ENOENT; this names the folder the check expected.
  if (!existsSync(designsDir)) {
    return {
      errors: [`${designsDir} is missing; the designs are not where this check looks`],
      designCount: 0,
      fileCount: 0,
    };
  }

  const blocks = sourceBlocks(sources);
  const folders = designFolders(designsDir);
  const errors: string[] = [];
  let fileCount = 0;

  for (const folder of folders) {
    fileCount += await checkFolder(path.join(designsDir, folder), blocks, errors);
  }

  // A problem in a file that index.scss loads is reported once, at the line that wrote it.
  return { errors: [...new Set(errors)], designCount: folders.length, fileCount };
}

async function main(): Promise<void> {
  const { errors, designCount, fileCount } = await checkDesigns({
    designsDir: "client-app/designs",
    sources: globSync("client-app/**/*.{vue,scss}", {
      ignore: [
        "client-app/designs/**",
        "client-app/assets/styles/{dark,print}/**",
        "client-app/assets/styles/_custom.scss",
      ],
    }),
  });

  if (errors.length) {
    console.error(`Design check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }

  console.log(`Design check passed: ${designCount} designs, ${fileCount} files.`);
}

// vite-node leaves the script out of process.argv, so a test import is told apart by vitest's flag.
if (!process.env.VITEST) {
  await main();
}

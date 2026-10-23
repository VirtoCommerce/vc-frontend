import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { globSync } from "glob";
import postcss from "postcss";
import postcssScss from "postcss-scss";
import selectorParser from "postcss-selector-parser";
import { compileString } from "sass";
import type { ChildNode, Root } from "postcss";
import type { Exception, Importer } from "sass";

/**
 * A soft design file, `soft/.../<block>.scss`, may only restyle its own block, on its own side, and
 * sets no colour tokens. Each file is compiled with Sass and the rules are checked on the CSS it emits,
 * so nesting, captures, interpolation and `@extend` are read as Sass resolves them. The rules are the
 * table under "Checks" in client-app/assets/styles/README.md. `yarn lint` does not parse SCSS, so this
 * runs in CI.
 */

export interface ISideType {
  name: string;
  softDir: string;
  /** Stylesheets of that side, where its blocks are defined. */
  sources: string[];
  /** The layer its `index.scss` loads the block files into, inside `@media screen`. */
  layer: string;
  /** A side whose blocks name no soft file of this side, even where this side also styles the class. */
  excludes?: string;
}

const SIDES: ISideType[] = [
  {
    name: "ui-kit",
    softDir: "client-app/ui-kit/styles/soft",
    sources: globSync("client-app/ui-kit/**/*.{vue,scss}", { ignore: ["client-app/ui-kit/styles/soft/**"] }),
    layer: "vc.design.kit",
  },
  {
    name: "app",
    softDir: "client-app/assets/styles/soft",
    sources: globSync("client-app/**/*.{vue,scss}", {
      ignore: [
        "client-app/ui-kit/**",
        "client-app/assets/styles/{dark,print,soft}/**",
        "client-app/assets/styles/_custom.scss",
      ],
    }),
    layer: "vc.design.app",
    excludes: "ui-kit",
  },
];

/** The kit names its public colour tokens `…color…`, `…bg…`, `…-text`, `…-border` or `…-icon`. */
const COLOR_TOKEN = /(?:color|bg)|(?:-(?:text|border|icon)$)/i;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;
const LAYERS_FILE = path.resolve("client-app/assets/styles/_layers.scss");

/** The style source of a stylesheet, or of a component's `<style>` blocks. */
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

/**
 * Blocks the sources define: those a rule outside any other rule starts with. A selector that only
 * reaches into a block, `.variations-default .vc-line-item`, does not define it.
 */
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

const blocksBySide = new Map<ISideType, Set<string>>();

function sideBlocks(side: ISideType): Set<string> {
  if (!blocksBySide.has(side)) {
    const blocks = definedBlocks(side.sources.map((file) => ({ file, css: styleText(file) })));

    // A component is a block named after its file, styled or not (VcLink has no <style>).
    for (const file of side.sources.filter((source) => source.endsWith(".vue"))) {
      blocks.add(path.basename(file, ".vue"));
    }

    blocksBySide.set(side, blocks);
  }

  return blocksBySide.get(side)!;
}

function belongsToBlock(className: string, block: string): boolean {
  return className === block || className.startsWith(`${block}__`) || className.startsWith(`${block}--`);
}

function hasBlockClass(compound: selectorParser.Node[], block: string): boolean {
  return compound.some((node) => node.type === "class" && belongsToBlock(node.value, block));
}

function isSoftPrefix(compound: selectorParser.Node[]): boolean {
  const isHtml = compound.some((node) => node.type === "tag" && node.value === "html");
  const isSoft = compound.some(
    (node) => node.type === "attribute" && node.attribute === "data-design" && node.value === "soft",
  );
  const onlyDark = compound.every(
    (node) => node.type === "tag" || node.type === "attribute" || (node.type === "class" && node.value === "dark"),
  );

  return isHtml && isSoft && onlyDark;
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

/**
 * Whether the selector names a block other than `own`, outside `:not()` and the soft prefix.
 * `blocks` maps every block of every side to its side.
 */
export function checkForeignBlocks(selector: string, own: string, blocks: Map<string, string>): string | null {
  let problem: string | null = null;

  selectorParser((root) => {
    const end = root.first.nodes.findIndex((node) => node.type === "combinator");
    const prefix: selectorParser.Node[] = end === -1 ? root.first.nodes : root.first.nodes.slice(0, end);

    root.walk((node) => {
      if (problem || isNegated(node) || prefix.includes(node)) {
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
        problem = `"${selector}" names .${foreign}, a block of the ${blocks.get(blockOf(foreign)!)} side; a soft file restyles only its own block`;
      }
    });
  }).processSync(selector);

  return problem;
}

/** Rules in `_tokens.scss` set hooks on `<html>` itself, so their selector is the soft prefix alone. */
export function checkTokensSelector(selector: string): string | null {
  const compounds = splitCompounds(selector);

  return compounds.length === 1 && isSoftPrefix(compounds[0])
    ? null
    : `"${selector}": _tokens.scss only sets tokens on html[data-design="soft"]`;
}

/** `null` when the selector is allowed, otherwise why it is not. */
export function checkBlockSelector(selector: string, block: string): string | null {
  const compounds = splitCompounds(selector);
  const [prefix, ...rest] = compounds;

  if (!isSoftPrefix(prefix)) {
    return `"${selector}" must start with html[data-design="soft"]`;
  }

  // `html` is the root, so it never matches below the first compound. A captured `$x: &` holds the
  // prefix, so `#{$x} &` writes it twice.
  if (rest.some((compound) => compound.some((node) => node.type === "tag" && node.value.toLowerCase() === "html"))) {
    return `"${selector}" never matches: html below the first compound; a capture read as an ancestor (#{$x} &) repeats the soft prefix`;
  }

  const subject = rest.at(-1);

  if (!subject) {
    return `"${selector}" targets <html> itself; soft tokens go in _tokens.scss`;
  }

  return hasBlockClass(subject, block)
    ? null
    : `"${selector}" does not style .${block}: its last compound has no .${block}, .${block}__* or .${block}--* class`;
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

/**
 * Loads only what this check reads: a `.scss` file in the side's `soft/` or the real `_layers.scss`.
 * `sass:` modules are built in and never reach it.
 */
function softImporter(softDir: string): Importer<"sync"> {
  const softRoot = realpathSync(softDir) + path.sep;

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

      if (real !== LAYERS_FILE && !(real.startsWith(softRoot) && real.endsWith(".scss"))) {
        throw new Error(
          `${path.relative(".", real)} is not a .scss file in ${softDir}, so this check does not read it`,
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

/** The CSS a soft file emits, with a source map back to the line that wrote each rule. */
function compileSoftFile(file: string, softDir: string): Root {
  const importer = softImporter(softDir);
  const { css, sourceMap } = compileString(readFileSync(file, "utf-8"), {
    url: pathToFileURL(realpathSync(file)),
    importer,
    importers: [importer],
    sourceMap: true,
    charset: false,
    logger: { warn: () => undefined, debug: () => undefined },
  });

  return postcss.parse(css, { from: file, map: { prev: JSON.stringify(sourceMap) } });
}

function where(node: ChildNode, fallback: string): string {
  const start = node.source?.start;
  const origin = start && node.source?.input.origin(start.line, start.column);

  return origin && origin.file ? `${path.relative(".", origin.file)}:${origin.line}` : fallback;
}

/** Sass keeps an escape in an interpolated property name, `#{"--x-c\\6f lor"}`; the browser reads `--x-color`. */
function unescapeIdent(name: string): string {
  return name.replaceAll(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (_match, hex: string | undefined, char: string | undefined) =>
    hex ? codePoint(Number.parseInt(hex, 16)) : char!,
  );
}

/** As CSS reads an escape: zero, a surrogate or a value past U+10FFFF is U+FFFD. */
function codePoint(value: number): string {
  return value === 0 || (value >= 0xd800 && value <= 0xdfff) || value > 0x10ffff
    ? "\uFFFD"
    : String.fromCodePoint(value);
}

/** A custom property named as a colour token once its escapes are read, so `-\-x-bg` counts too. */
function isColorToken(prop: string): boolean {
  const name = unescapeIdent(prop);

  return name.startsWith("--") && COLOR_TOKEN.test(name);
}

/** At-rules the emitted CSS may hold; any other one, `@apply` or `@keyframes`, ships CSS this check does not read. */
const ALLOWED_AT_RULES = new Set(["media", "supports", "container", "layer", "starting-style"]);

/** `null` when the rule is allowed, otherwise why it is not. */
type SelectorCheckType = (selector: string) => string | null;

/** How a file's rules are checked: by selector, or, for `index` and the partials but `_tokens` (`null`), only as rules of checked files. */
type FileRoleType = SelectorCheckType | null;

interface ICompiledType {
  file: string;
  role: FileRoleType;
  css?: Root;
}

function ruleKey(rule: postcss.Rule): string {
  return `${rule.selectors.join(",")}{${rule.nodes.map(String).join(";")}}`;
}

/** The problems in one compiled soft file. An entry's rules must each be a rule a checked file emits. */
function checkCompiledFile(css: Root, file: string, role: FileRoleType, checkedRules: Map<string, string>): string[] {
  const errors: string[] = [];
  const report = (node: ChildNode, message: string) => errors.push(`${where(node, file)}  ${message}`);

  css.walk((node) => {
    if (node.type === "atrule" && !ALLOWED_AT_RULES.has(node.name)) {
      report(node, `@${node.name} is not allowed in a soft file`);
    } else if (node.type === "decl" && isColorToken(node.prop)) {
      report(node, `${node.prop}: colour tokens belong to presets, not to the soft design`);
    } else if (node.type === "rule" && !role) {
      if (!checkedRules.has(ruleKey(node))) {
        report(node, `"${node.selector}": an entry or partial holds no rules of its own; put them in a block file`);
      }
    } else if (node.type === "rule" && role) {
      for (const selector of node.selectors) {
        const problem = role(selector);

        if (problem) {
          report(node, problem);
        }
      }
    }
  });

  return errors;
}

/** Each block of every side, mapped to the first side that owns it. */
function blockOwners(sides: ISideType[]): Map<string, string> {
  const owners = new Map<string, string>();

  for (const side of sides) {
    for (const block of sideBlocks(side)) {
      owners.set(block, owners.get(block) ?? side.name);
    }
  }

  return owners;
}

function fileRole(
  file: string,
  side: ISideType,
  sides: ISideType[],
  owners: Map<string, string>,
  errors: string[],
): FileRoleType {
  const name = path.basename(file, ".scss");

  if (name === "_tokens") {
    return checkTokensSelector;
  }

  if (name === "index" || name.startsWith("_")) {
    return null;
  }

  const excluded = sides.find((other) => other.name === side.excludes);

  if (excluded && sideBlocks(excluded).has(name)) {
    errors.push(`${file}  .${name} is a block of the ${excluded.name} side; restyle it there`);

    return (selector) => checkBlockSelector(selector, name);
  }

  if (!sideBlocks(side).has(name)) {
    errors.push(`${file}  .${name} is not a block of the ${side.name} side`);
  }

  return (selector) => checkBlockSelector(selector, name) ?? checkForeignBlocks(selector, name, owners);
}

function compileOrReport(file: string, softDir: string, errors: string[]): Root | undefined {
  try {
    return compileSoftFile(file, softDir);
  } catch (error) {
    const { sassMessage, span } = error as Exception;
    const at = span?.url ? `${path.relative(".", fileURLToPath(span.url))}:${span.start.line + 1}` : file;

    errors.push(`${at}  ${sassMessage ?? (error as Error).message}`);

    return undefined;
  }
}

/** The at-rules around a rule, outermost first: `@media screen > @layer theme`. */
function wrappers(rule: postcss.Rule): string {
  const list: string[] = [];

  for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
    if (parent.type === "atrule") {
      list.unshift(`@${parent.name} ${parent.params}`);
    }
  }

  return list.join(" > ");
}

/**
 * `index.scss` ships: each rule a checked file emits sits in `@media screen` and its layer, and every
 * file that emits rules is loaded.
 */
function checkEntry(
  index: Root,
  side: ISideType,
  compiled: ICompiledType[],
  checkedRules: Map<string, string>,
): string[] {
  const errors: string[] = [];
  const shipped = new Set<string>();

  index.walkRules((rule) => {
    const key = ruleKey(rule);
    const layer = checkedRules.get(key);
    const expected = `@media screen > @layer ${layer}`;
    const actual = wrappers(rule);
    // Below the entry's two wrappers a block keeps its own `@media`, `@supports` and `@container`, but no layer.
    const below = actual.startsWith(`${expected} > `) ? actual.slice(expected.length + 3) : undefined;

    shipped.add(key);

    if (layer && actual !== expected && (below === undefined || below.includes("@layer "))) {
      errors.push(
        `${where(rule, side.softDir)}  "${rule.selector}" ships in ${actual || "no at-rule"}; ${side.softDir}/index.scss must load its file inside ${expected}, and the file adds no @layer`,
      );
    }
  });

  for (const { file, css, role } of compiled) {
    const keys: string[] = [];

    css?.walkRules((rule) => {
      keys.push(ruleKey(rule));
    });

    if (role && keys.length && !keys.some((key) => shipped.has(key))) {
      errors.push(
        `${file}  ships none of its rules through ${side.softDir}/index.scss: it is not loaded there, or its rules are dropped there (e.g. by @media print)`,
      );
    }
  }

  return errors;
}

function checkSide(side: ISideType, sides: ISideType[], owners: Map<string, string>, errors: string[]): number {
  // A moved or renamed folder would otherwise leave nothing to check, and the check would pass.
  if (!existsSync(`${side.softDir}/index.scss`)) {
    errors.push(`${side.softDir}/index.scss is missing; the ${side.name} soft styles are not where this check looks`);
    return 0;
  }

  // `dot`: a hidden `.x.scss` can be loaded as well. Other files cannot: the importer loads `.scss` only.
  const files = globSync(`${side.softDir}/**/*.scss`, { dot: true }).sort((a, b) => a.localeCompare(b));
  const compiled: ICompiledType[] = files.map((file) => ({
    file,
    role: fileRole(file, side, sides, owners, errors),
    css: compileOrReport(file, side.softDir, errors),
  }));
  // The layer an entry loads each checked rule into: tokens are hooks in `theme`, blocks go in the side's layer.
  const checkedRules = new Map<string, string>();

  for (const { css, role } of compiled) {
    if (role) {
      css?.walkRules((rule) => {
        checkedRules.set(ruleKey(rule), role === checkTokensSelector ? "theme" : side.layer);
      });
    }
  }

  for (const { file, css, role } of compiled) {
    errors.push(...(css ? checkCompiledFile(css, file, role, checkedRules) : []));

    if (css && path.resolve(file) === path.resolve(side.softDir, "index.scss")) {
      errors.push(...checkEntry(css, side, compiled, checkedRules));
    }
  }

  return files.length;
}

export function checkSides(sides: ISideType[]): { errors: string[]; fileCount: number } {
  const errors: string[] = [];
  const owners = blockOwners(sides);
  const fileCount = sides.reduce((count, side) => count + checkSide(side, sides, owners, errors), 0);

  // A problem in a block file that an entry loads is reported once, at the line that wrote it.
  return { errors: [...new Set(errors)], fileCount };
}

function main(): void {
  const { errors, fileCount } = checkSides(SIDES);

  if (errors.length) {
    console.error(`Soft style check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }

  console.log(`Soft style check passed: ${fileCount} files.`);
}

// vite-node leaves the script out of process.argv, so a test import is told apart by vitest's flag.
if (!process.env.VITEST) {
  main();
}

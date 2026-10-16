import { readFileSync } from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import postcssScss from "postcss-scss";
import selectorParser from "postcss-selector-parser";
import type { ChildNode, Container, Declaration, Rule } from "postcss";

/**
 * A soft design file, `soft/.../<block>.scss`, may only restyle its own block, on its own side, and
 * sets no colour tokens. `yarn lint` does not parse SCSS, so this runs in CI.
 */

interface ISideType {
  name: string;
  softDir: string;
  /** Stylesheets of that side, where its blocks are defined. */
  sources: string[];
}

const SIDES: ISideType[] = [
  {
    name: "ui-kit",
    softDir: "client-app/ui-kit/styles/soft",
    sources: globSync("client-app/ui-kit/**/*.{vue,scss}", { ignore: ["client-app/ui-kit/styles/soft/**"] }),
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
  },
];

const COLOR_TOKEN = /color|bg/i;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;
const INTERPOLATION = /#\{\s*\$([\w-]+)\s*\}|#\{[^}]*\}/g;

/** `null` when the selector is allowed in the file, otherwise why it is not. */
type SelectorCheckType = (selector: string) => string | null;

const errors: string[] = [];

function report(file: string, node: ChildNode, message: string): void {
  errors.push(`${file}:${node.source?.start?.line ?? 0}  ${message}`);
}

const COMMENT = /(?:\/\*[\s\S]*?\*\/)|(?:(^|\s)\/\/.*$)/gm;

/** Style source without comments, so a block named only in a comment does not count as defined. */
function styleText(file: string): string {
  const text = readFileSync(file, "utf-8");
  const css = file.endsWith(".vue") ? [...text.matchAll(STYLE_BLOCK)].map((match) => match[1]).join("\n") : text;

  return css.replaceAll(COMMENT, "$1");
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function isBlockDefined(block: string, side: ISideType): boolean {
  const selector = new RegExp(String.raw`\.${escapeRegExp(block)}(?![\w-])`);

  return side.sources.some((file) => selector.test(styleText(file)));
}

function splitSelectorList(selector: string): string[] {
  const list: string[] = [];

  selectorParser((root) => {
    root.each((item) => {
      list.push(item.toString().trim());
    });
  }).processSync(selector);

  return list;
}

/** Replaces Sass interpolation: a captured `$state: &` by its selector, a name fragment by a stand-in. */
function interpolate(selector: string, captures: Map<string, string>): string {
  return selector.replaceAll(INTERPOLATION, (match: string, name: string | undefined, offset: number) => {
    if (name && captures.has(name)) {
      return captures.get(name)!;
    }

    if (/[\w-]/.test(selector[offset - 1] ?? "") || /[\w-]/.test(selector[offset + match.length] ?? "")) {
      return "x";
    }

    throw new Error(`cannot resolve the interpolation ${match}`);
  });
}

function resolveSelectors(parents: string[], selector: string): string[] {
  const children = splitSelectorList(selector);

  if (!parents.length) {
    return children;
  }

  return parents.flatMap((parent) =>
    children.map((child) => (child.includes("&") ? child.replaceAll("&", parent) : `${parent} ${child}`)),
  );
}

function belongsToBlock(className: string, block: string): boolean {
  return className === block || className.startsWith(`${block}__`) || className.startsWith(`${block}--`);
}

function hasBlockClass(compound: selectorParser.Node[], block: string): boolean {
  return compound.some((node) => node.type === "class" && belongsToBlock(node.value, block));
}

/** A block class in `node`, also inside nested `:is`/`:where`/`:has`; a class inside `:not` names what is absent. */
function namesBlock(node: selectorParser.Node, block: string): boolean {
  if (node.type === "class") {
    return belongsToBlock(node.value, block);
  }

  if (node.type === "pseudo" && node.value === ":not") {
    return false;
  }

  return "nodes" in node && (node.nodes as selectorParser.Node[]).some((child) => namesBlock(child, block));
}

function hasBlockInHas(compound: selectorParser.Node[], block: string): boolean {
  return compound.some((node) => {
    if (node.type !== "pseudo" || node.value !== ":has") {
      return false;
    }

    // A relative selector that starts with `~` / `+` looks at the subject's siblings, not inside it.
    return node.nodes.some((relative) => {
      const first = relative.first;

      if (first?.type === "combinator" && ["~", "+"].includes(first.value.trim())) {
        return false;
      }

      return namesBlock(relative, block);
    });
  });
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

interface ICompoundsType {
  compounds: selectorParser.Node[][];
  /** `combinators[i]` joins `compounds[i]` and `compounds[i + 1]`. */
  combinators: string[];
}

function splitCompounds(selector: string): ICompoundsType {
  const compounds: selectorParser.Node[][] = [[]];
  const combinators: string[] = [];

  selectorParser((root) => {
    root.first.each((node) => {
      if (node.type === "combinator") {
        combinators.push(node.value.trim());
        compounds.push([]);
      } else {
        compounds.at(-1)!.push(node);
      }
    });
  }).processSync(selector);

  return { compounds, combinators };
}

/** Rules in `_tokens.scss` set hooks on `<html>` itself, so their selector is the soft prefix alone. */
function checkTokensSelector(selector: string): string | null {
  const { compounds } = splitCompounds(selector);

  return compounds.length === 1 && isSoftPrefix(compounds[0])
    ? null
    : `"${selector}": _tokens.scss only sets tokens on html[data-design="soft"]`;
}

/** `null` when the selector is allowed, otherwise why it is not. */
function checkBlockSelector(selector: string, block: string): string | null {
  const { compounds, combinators } = splitCompounds(selector);
  const [prefix, ...rest] = compounds;

  if (!isSoftPrefix(prefix)) {
    return `"${selector}" must start with html[data-design="soft"]`;
  }

  const subject = rest.at(-1);

  if (!subject) {
    return `"${selector}" targets <html> itself; soft tokens go in _tokens.scss`;
  }

  // An ancestor of the subject: followed by a descendant or child combinator. `~` / `+` lead to a sibling.
  const isAncestor = (index: number) => ["", ">"].includes(combinators[index + 1]);
  const anchored =
    hasBlockClass(subject, block) ||
    rest.slice(0, -1).some((compound, index) => isAncestor(index) && hasBlockClass(compound, block)) ||
    hasBlockInHas(subject, block);

  return anchored ? null : `"${selector}" does not name the block .${block}`;
}

const STYLING_AT_RULES = new Set(["apply", "include", "extend"]);
const CONDITIONAL_AT_RULES = new Set([
  "media",
  "supports",
  "container",
  "layer",
  "scope",
  "starting-style",
  "if",
  "else",
  "each",
  "for",
  "while",
]);

/** Whether a rule styles its own selector, directly or inside a conditional or Sass control-flow at-rule. */
function stylesItself(container: Container): boolean {
  return (container.nodes ?? []).some(
    (node) =>
      (node.type === "decl" && !node.prop.startsWith("$")) ||
      (node.type === "atrule" &&
        (STYLING_AT_RULES.has(node.name) ||
          (CONDITIONAL_AT_RULES.has(node.name) && !!node.nodes && stylesItself(node)))),
  );
}

function checkColorToken(file: string, declaration: Declaration): void {
  if (declaration.prop.startsWith("--") && COLOR_TOKEN.test(declaration.prop)) {
    report(file, declaration, `${declaration.prop}: colour tokens belong to presets, not to the soft design`);
  }
}

/** `captures` is per file: Sass assigns `$state: &` in a modifier to the block-level variable. */
function walk(
  file: string,
  container: Container,
  parents: string[],
  check: SelectorCheckType,
  captures: Map<string, string>,
): void {
  container.each((node) => {
    if (node.type === "decl") {
      checkColorToken(file, node);

      if (node.prop.startsWith("$") && node.value.trim() === "&" && parents.length) {
        captures.set(node.prop.slice(1), parents.join(", "));
      }
    } else if (node.type === "rule") {
      walkRule(file, node, parents, check, captures);
    } else if (node.type === "atrule" && node.name !== "mixin" && node.name !== "function" && node.nodes) {
      walk(file, node, node.name === "at-root" ? [] : parents, check, captures);
    }
  });
}

function walkRule(
  file: string,
  rule: Rule,
  parents: string[],
  check: SelectorCheckType,
  captures: Map<string, string>,
): void {
  let selectors: string[];

  try {
    selectors = resolveSelectors(parents, interpolate(rule.selector, captures));
  } catch (error) {
    report(file, rule, `"${rule.selector}": ${(error as Error).message}`);
    return;
  }

  if (stylesItself(rule)) {
    for (const selector of selectors) {
      const problem = check(selector);

      if (problem) {
        report(file, rule, problem);
      }
    }
  }

  walk(file, rule, selectors, check, captures);
}

let fileCount = 0;

for (const side of SIDES) {
  for (const file of globSync(`${side.softDir}/**/*.scss`).sort((a, b) => a.localeCompare(b))) {
    const name = path.basename(file, ".scss");
    const root = postcssScss.parse(readFileSync(file, "utf-8"), { from: file });
    let check: SelectorCheckType;

    if (name === "_tokens") {
      check = checkTokensSelector;
    } else if (name === "index" || name.startsWith("_")) {
      check = (selector) => `"${selector}": an entry or partial holds no rules; put them in a block file`;
    } else {
      check = (selector) => checkBlockSelector(selector, name);

      if (!isBlockDefined(name, side)) {
        errors.push(`${file}  .${name} is not a block of the ${side.name} side`);
      }
    }

    fileCount++;
    walk(file, root, [], check, new Map());
  }
}

if (errors.length) {
  console.error(`Soft style check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

console.log(`Soft style check passed: ${fileCount} files.`);

import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { globSync } from "glob";
import { CssSyntaxError } from "postcss";
import postcssScss from "postcss-scss";
import ts from "typescript";
import { parse as parseSfc } from "vue/compiler-sfc";
import { isImportantUtility, matchImportant, matchImportantValue } from "./important-patterns.mjs";
import type { AtRule, Declaration } from "postcss";
import type { SFCTemplateBlock } from "vue/compiler-sfc";

// The rule is in client-app/assets/styles/README.md: a layered `!important` cannot be overridden by a fork.
// Reads styles, templates and string literals, never comments, Markdown or locale files.

export interface IImportantFinding {
  file: string;
  line: number;
  text: string;
}

const SOURCES = ["client-app/**/*.{vue,scss,css,html,ts,tsx,js,mjs,cjs,mts,cts}", "index.html"];
/** Reserved for client forks (`_custom.scss` loads unlayered, after every layer). */
const IGNORE = ["client-app/assets/styles/_custom.scss"];

const TOKEN = /\S+/g;
const NEWLINE = /\n/g;
/** An HTML tag in a string: a story's or test's template, a `render` helper's markup. */
const MARKUP = /<[a-z][\w-]*[\s/>]/i;
const SCRIPT_KINDS: Record<string, ts.ScriptKind> = {
  ".ts": ts.ScriptKind.TS,
  ".mts": ts.ScriptKind.TS,
  ".cts": ts.ScriptKind.TS,
  ".tsx": ts.ScriptKind.TSX,
  ".js": ts.ScriptKind.JS,
  ".mjs": ts.ScriptKind.JS,
  ".cjs": ts.ScriptKind.JS,
};

type ReportType = (line: number, text: string) => void;
type MatchType = (text: string) => RegExpExecArray[];
type TemplateChildNodeType = NonNullable<SFCTemplateBlock["ast"]>["children"][number];
type ElementNodeType = Extract<TemplateChildNodeType, { tag: string }>;
type PropNodeType = ElementNodeType["props"][number];

function lineAt(text: string, index: number, startLine: number): number {
  return startLine + (text.slice(0, index).match(NEWLINE)?.length ?? 0);
}

function checkImportant(text: string, startLine: number, report: ReportType, match: MatchType = matchImportant): void {
  for (const { 0: found, index } of match(text)) {
    report(lineAt(text, index, startLine), found);
  }
}

/** `!important` and important utilities in a class list, an inline style or a string literal. */
function checkText(text: string, startLine: number, report: ReportType, match: MatchType = matchImportant): void {
  checkImportant(text, startLine, report, match);

  for (const { 0: token, index } of text.matchAll(TOKEN)) {
    if (isImportantUtility(token)) {
      report(lineAt(text, index, startLine), token);
    }
  }
}

/** Utilities only in `@apply`: elsewhere `!default`, `!global` and `!optional` are Sass flags. */
function checkStyles(css: string, startLine: number, report: ReportType): void {
  const root = postcssScss.parse(css);
  const lineOf = (node: Declaration | AtRule) => startLine + (node.source?.start?.line ?? 1) - 1;

  // Rebuilt from the clean value, so a comment is never read and a line break before the match still counts.
  root.walkDecls((decl) => {
    const text = `${decl.prop}${decl.raws.between ?? ""}${decl.value}`;
    checkImportant(text, lineOf(decl), report);

    if (decl.important) {
      const flag = decl.raws.important ?? " !important";
      report(lineAt(text + flag, text.length + flag.search(/\S/), lineOf(decl)), flag.trim());
    }
  });

  root.walkAtRules((rule) => {
    const text = `@${rule.name}${rule.raws.afterName ?? ""}${rule.params}`;
    (rule.name === "apply" ? checkText : checkImportant)(text, lineOf(rule), report);
  });
}

function stringLiteralText(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateTail(node)) {
    return node.getText(sourceFile).slice(1, -1);
  }

  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node)) {
    return node.getText(sourceFile).slice(1, -2);
  }

  return undefined;
}

/** A whole string or template literal as written, each `${…}` replaced by a placeholder on as many lines. */
function literalMarkup(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.getText(sourceFile).slice(1, -1);
  }

  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.reduce(
      (text, span) =>
        text +
        "_" +
        "\n".repeat(span.expression.getText(sourceFile).match(NEWLINE)?.length ?? 0) +
        (span.literal.rawText ?? span.literal.text),
      node.head.rawText ?? node.head.text,
    );
  }

  return undefined;
}

/**
 * Markup in a string is read as a template: its class and style attributes, bindings and inline styles.
 * A `<style>` that is no CSS (docs naming the tag) falls back to reading the string as text.
 */
function checkMarkup(markup: string, startLine: number, report: ReportType): void {
  const { descriptor } = parseSfc(`${"\n".repeat(startLine - 1)}<template>${markup}</template>`);
  const found: [number, string][] = [];

  try {
    checkTemplate(descriptor.template?.ast?.children ?? [], (line, text) => found.push([line, text]));
  } catch (error) {
    if (!(error instanceof CssSyntaxError)) {
      throw error;
    }

    checkText(markup, startLine, report, matchImportantValue);
    return;
  }

  found.forEach(([line, text]) => report(line, text));
}

function checkScript(code: string, kind: ts.ScriptKind, startLine: number, report: ReportType): void {
  const sourceFile = ts.createSourceFile("source", code, ts.ScriptTarget.Latest, true, kind);
  const lineOf = (node: ts.Node) =>
    startLine + sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line;

  const visit = (node: ts.Node): void => {
    const markup = literalMarkup(node, sourceFile);

    if (markup !== undefined && MARKUP.test(markup)) {
      checkMarkup(markup, lineOf(node), report);
      // Only the expressions in `${…}`: the literal parts were read as markup.
      ts.forEachChild(node, (child) => (ts.isTemplateSpan(child) ? visit(child.expression) : undefined));
      return;
    }

    const text = stringLiteralText(node, sourceFile);

    if (text !== undefined) {
      // In a string, `!important` counts only where it ends a CSS value, so prose that names it passes.
      checkText(text, lineOf(node), report, matchImportantValue);
    }

    // `style.setProperty(name, value, "important")`
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "setProperty" &&
      node.arguments[2] &&
      ts.isStringLiteralLike(node.arguments[2]) &&
      node.arguments[2].text === "important"
    ) {
      report(lineOf(node.arguments[2]), 'setProperty(…, "important")');
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

function checkAttribute(prop: PropNodeType, report: ReportType): void {
  if ("value" in prop) {
    if (prop.value) {
      checkText(prop.value.content, prop.value.loc.start.line, report);
    }
    return;
  }

  if (prop.exp && "content" in prop.exp) {
    checkScript(prop.exp.content, ts.ScriptKind.TS, prop.exp.loc.start.line, report);
  }

  if (prop.arg && "content" in prop.arg && !prop.arg.isStatic) {
    checkScript(prop.arg.content, ts.ScriptKind.TS, prop.arg.loc.start.line, report);
  }
}

function checkInlineScript(code: string, startLine: number, report: ReportType): void {
  checkScript(code, ts.ScriptKind.JS, startLine, report);
}

function checkElement(element: ElementNodeType, report: ReportType): void {
  element.props.forEach((prop) => checkAttribute(prop, report));

  // Raw text: an inline `<style>` or `<script>` of index.html.
  const [text] = element.children;
  const tag = element.tag.toLowerCase();

  if (tag !== "style" && tag !== "script") {
    checkTemplate(element.children, report);
  } else if (text && "content" in text && typeof text.content === "string") {
    (tag === "style" ? checkStyles : checkInlineScript)(text.content, text.loc.start.line, report);
  }
}

function checkTemplate(nodes: TemplateChildNodeType[], report: ReportType): void {
  for (const node of nodes) {
    // `{{ … }}`
    const expression = "content" in node && typeof node.content === "object" ? node.content : undefined;

    if (expression && "content" in expression && typeof expression.content === "string") {
      checkScript(expression.content, ts.ScriptKind.TS, expression.loc.start.line, report);
    }

    if ("tag" in node) {
      checkElement(node, report);
    }
  }
}

function checkVue(source: string, report: ReportType): void {
  const { descriptor, errors } = parseSfc(source);

  for (const error of errors) {
    report("loc" in error && error.loc ? error.loc.start.line : 1, `cannot parse: ${error.message}`);
  }

  for (const script of [descriptor.script, descriptor.scriptSetup]) {
    if (script) {
      checkScript(script.content, SCRIPT_KINDS[`.${script.lang ?? "js"}`], script.loc.start.line, report);
    }
  }

  for (const style of descriptor.styles) {
    checkStyles(style.content, style.loc.start.line, report);
  }

  if (descriptor.template?.ast) {
    checkTemplate(descriptor.template.ast.children, report);
  }
}

function checkHtml(source: string, report: ReportType): void {
  // Wrapped in a <template> so the SFC parser reads the page; the doctype is dropped in place, lines stay.
  const { descriptor } = parseSfc(`<template>${source.replace(/<!doctype[^>]*>/i, "")}</template>`);

  if (descriptor.template?.ast) {
    checkTemplate(descriptor.template.ast.children, report);
  }
}

export function findImportant(file: string, source: string): IImportantFinding[] {
  const findings: IImportantFinding[] = [];
  const report: ReportType = (line, text) => findings.push({ file, line, text });
  const extension = path.extname(file);

  if (extension === ".vue") {
    checkVue(source, report);
  } else if (extension === ".html") {
    checkHtml(source, report);
  } else if (extension === ".scss" || extension === ".css") {
    checkStyles(source, 1, report);
  } else if (extension in SCRIPT_KINDS) {
    checkScript(source, SCRIPT_KINDS[extension], 1, report);
  }

  return findings.sort((a, b) => a.line - b.line);
}

/** The checked files; with `only` (the files lint-staged passes), just those of them. */
export function importantSources(cwd: string, only?: string[]): string[] {
  const files = globSync(SOURCES, { cwd, ignore: IGNORE, posix: true }).sort((a, b) => a.localeCompare(b));

  if (!only) {
    return files;
  }

  const wanted = new Set(only.map((file) => path.relative(cwd, path.resolve(cwd, file)).replaceAll(path.sep, "/")));

  return files.filter((file) => wanted.has(file));
}

function main(): void {
  const args = process.argv.slice(2);
  const files = importantSources(process.cwd(), args.length ? args : undefined);
  const findings = files.flatMap((file) => findImportant(file, readFileSync(file, "utf-8")));

  if (findings.length) {
    console.error(
      `!important check failed (${findings.length}):\n  ` +
        findings.map(({ file, line, text }) => `${file}:${line}: ${text}`).join("\n  ") +
        "\nFix the conflict at its cause (kit props, --vc-* tokens, selector order); see client-app/assets/styles/README.md.",
    );
    process.exit(1);
  }

  console.log(`!important check passed: ${files.length} files.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  main();
}

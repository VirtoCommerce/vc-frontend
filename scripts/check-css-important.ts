import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { globSync } from "glob";
import postcssScss from "postcss-scss";
import ts from "typescript";
import { parse as parseSfc } from "vue/compiler-sfc";
import { isImportantUtility, matchImportant } from "./important-patterns.ts";
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
type TemplateChildNodeType = NonNullable<SFCTemplateBlock["ast"]>["children"][number];
type ElementNodeType = Extract<TemplateChildNodeType, { tag: string }>;
type PropNodeType = ElementNodeType["props"][number];

function lineAt(text: string, index: number, startLine: number): number {
  return startLine + (text.slice(0, index).match(/\n/g)?.length ?? 0);
}

function checkImportant(text: string, startLine: number, report: ReportType): void {
  for (const match of matchImportant(text)) {
    report(lineAt(text, match.index, startLine), match[0]);
  }
}

/** `!important` and important utilities in a class list, an inline style or a string literal. */
function checkText(text: string, startLine: number, report: ReportType): void {
  checkImportant(text, startLine, report);

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

  root.walkDecls((decl) => {
    if (decl.important) {
      report(lineOf(decl), decl.raws.important?.trim() || "!important");
    }

    checkImportant(decl.value, lineOf(decl), report);
  });

  root.walkAtRules((rule) => {
    (rule.name === "apply" ? checkText : checkImportant)(rule.params, lineOf(rule), report);
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

function checkScript(code: string, kind: ts.ScriptKind, startLine: number, report: ReportType): void {
  const sourceFile = ts.createSourceFile("source", code, ts.ScriptTarget.Latest, true, kind);

  const visit = (node: ts.Node): void => {
    const text = stringLiteralText(node, sourceFile);

    if (text !== undefined) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      checkText(text, startLine + line, report);
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
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.arguments[2].getStart(sourceFile));
      report(startLine + line, 'setProperty(…, "important")');
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

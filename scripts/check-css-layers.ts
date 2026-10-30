import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import postcss from "postcss";
import postcssScss from "postcss-scss";
import type { AtRule, Root } from "postcss";

/**
 * Checks the built CSS (`yarn build` output, lazy chunks included) against the order in
 * `_layers.scss`. Reads layer names in order of first appearance, statements, blocks and
 * `@import … layer(…)` alike, not the statement text.
 *
 * Usage: vite-node scripts/check-css-layers.ts
 */

const LAYERS_FILE = "client-app/assets/styles/_layers.scss";
const STYLESHEET_LINK = /<link\b[^>]*\brel=["']?stylesheet["']?[^>]*>/g;
const HREF = /\bhref=["']?([^"'\s>]+)/;
const IMPORT_URL = /url\([^)]*\)|"[^"]*"|'[^']*'/gi;
const IMPORT_LAYER = /(?:^|\s)layer(?:\(([^)]*)\))?(?![\w-])/i;

const distDir = "dist";
const errors: string[] = [];

function parentOf(name: string): string {
  return name.split(".").slice(0, -1).join(".");
}

/** Every name with its ancestors (`vc.kit` also declares `vc`), in order. */
function withAncestors(name: string): string[] {
  const parts = name.split(".");

  return parts.map((_, index) => parts.slice(0, index + 1).join("."));
}

/** The full name of the layer blocks a rule is nested in, `""` at the top. */
function enclosingLayer(rule: AtRule): string {
  const names: string[] = [];

  for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
    if (parent.type === "atrule" && (parent as AtRule).name === "layer") {
      names.unshift((parent as AtRule).params.trim());
    }
  }

  return names.join(".");
}

/** The layer names a rule declares, `[""]` for an anonymous layer, none for a rule that is no layer. */
function declaredLayers(rule: AtRule): string[] {
  if (rule.name === "layer") {
    return rule.params.split(",").map((param) => param.trim());
  }

  if (rule.name === "import") {
    const layer = IMPORT_LAYER.exec(rule.params.replaceAll(IMPORT_URL, ""));

    return layer ? [(layer[1] ?? "").trim()] : [];
  }

  return [];
}

/** Layer names in order of first appearance; statement, block and import names, by full dotted name. */
function layerNames(root: Root, file: string): string[] {
  const names: string[] = [];

  root.walkAtRules((rule: AtRule) => {
    const params = declaredLayers(rule);

    if (!params.length) {
      return;
    }

    const prefix = enclosingLayer(rule);

    if (!params[0]) {
      errors.push(`${file}: an anonymous layer is not in the declared order`);
      return;
    }

    for (const param of params) {
      for (const name of withAncestors(prefix ? `${prefix}.${param}` : param)) {
        if (!names.includes(name)) {
          names.push(name);
        }
      }
    }
  });

  return names;
}

function childrenByParent(names: string[]): Map<string, string[]> {
  const children = new Map<string, string[]>();

  for (const name of names) {
    const parent = parentOf(name);
    children.set(parent, [...(children.get(parent) ?? []), name]);
  }

  return children;
}

function linkedStylesheets(): string[] {
  const html = readFileSync(path.join(distDir, "index.html"), "utf-8");

  return [...html.matchAll(STYLESHEET_LINK)]
    .map((link) => HREF.exec(link[0])?.[1])
    .filter((href): href is string => !!href && href.startsWith("/") && !href.startsWith("//"))
    .map((href) => path.join(distDir, href));
}

if (!existsSync(path.join(distDir, "index.html"))) {
  console.error(`No build output in "${distDir}". Run \`yarn build\` first.`);
  process.exit(1);
}

const declared = layerNames(postcssScss.parse(readFileSync(LAYERS_FILE, "utf-8")), LAYERS_FILE);
const declaredChildren = childrenByParent(declared);
const namesByFile = new Map<string, string[]>();

for (const file of globSync(`${distDir}/**/*.css`).sort((a, b) => a.localeCompare(b))) {
  const names = layerNames(postcss.parse(readFileSync(file, "utf-8"), { from: file }), file);
  namesByFile.set(path.normalize(file), names);

  for (const name of names.filter((item) => !declared.includes(item))) {
    errors.push(`${file}: layer "${name}" is not declared in ${LAYERS_FILE}`);
  }
}

const loadOrder = linkedStylesheets();
const firstLayered = loadOrder.find((file) => namesByFile.get(path.normalize(file))?.length);

if (firstLayered) {
  const firstNames = namesByFile.get(path.normalize(firstLayered))!;
  const appeared = childrenByParent(firstNames);

  // A name first seen in a later chunk is appended after every placed sibling, whatever the declared order.
  for (const name of declared.filter((item) => !firstNames.includes(item))) {
    errors.push(`${firstLayered}: does not place "${name}"; a later stylesheet would append it out of order`);
  }

  for (const [parent, children] of appeared) {
    const expected = (declaredChildren.get(parent) ?? []).filter((name) => children.includes(name));

    if (children.join() !== expected.join()) {
      errors.push(
        `${firstLayered}: layers under "${parent || "(top)"}" appear as ${children.join(", ")}; declared: ${expected.join(", ")}`,
      );
    }
  }

  const [firstDeclared] = declared;

  if (firstNames[0] !== firstDeclared) {
    errors.push(`${firstLayered}: the first stylesheet that declares layers must start with "${firstDeclared}"`);
  }
} else {
  errors.push(`${distDir}/index.html: no linked stylesheet declares the layer order`);
}

if (errors.length) {
  console.error(`CSS layer check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

const loadedBefore = loadOrder.slice(0, loadOrder.indexOf(firstLayered!));

console.log(
  `CSS layer check passed: ${namesByFile.size} stylesheets; order from ${firstLayered}` +
    (loadedBefore.length ? `, loaded after ${loadedBefore.join(", ")}.` : ", the first linked stylesheet."),
);

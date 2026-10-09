import { readdirSync } from "node:fs";
import { resolveIconName } from "../client-app/ui-kit/utilities/icon-aliases.js";

const base = "client-app/ui-kit/icons";

const names = (dir: string): string[] =>
  readdirSync(`${base}/${dir}`)
    // eslint-disable-next-line sonarjs/null-dereference -- readdirSync returns string[]; false positive
    .filter((f) => f.endsWith(".svg"))
    // eslint-disable-next-line sonarjs/null-dereference -- readdirSync returns string[]; false positive
    .map((f) => f.replace(".svg", ""));

const solid = new Set(names("solid"));
const outline = new Set(names("outline"));

// solid/ uses legacy names, outline/ uses Lucide names, bridged by icon-aliases. Compare
// THROUGH the alias map: a solid (legacy) icon is covered if its canonical name resolves into
// outline/. Raw-filename comparison would flag nearly the whole Lucide set as false "orphans".
const solidWithoutOutline = [...solid].filter((name) => !outline.has(resolveIconName(name)));

if (solidWithoutOutline.length) {
  console.warn(
    `Solid icons with no outline counterpart (${solidWithoutOutline.length}):\n  ${solidWithoutOutline.join(", ")}`,
  );
}

console.log(`solid: ${solid.size}, outline: ${outline.size}, gaps: ${solidWithoutOutline.length}`);

import { readdirSync } from "node:fs";

const base = "client-app/ui-kit/icons";
const svgs = (dir) =>
  readdirSync(`${base}/${dir}`)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.replace(".svg", ""));

const solid = new Set(svgs("solid"));
const outline = new Set(svgs("outline"));

const orphanOutline = [...outline].filter((n) => !solid.has(n));

if (orphanOutline.length) {
  console.warn(`Outline icons with no solid counterpart: ${orphanOutline.join(", ")}`);
}

console.log(`solid: ${solid.size}, outline: ${outline.size}`);

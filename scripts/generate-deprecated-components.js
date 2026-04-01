import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

const indexFiles = [
  "client-app/ui-kit/components/atoms/index.ts",
  "client-app/ui-kit/components/molecules/index.ts",
  "client-app/ui-kit/components/organisms/index.ts",
];

const deprecatedCommentRe = /\/\*\*\s*@deprecated\s+([^*]*)/;
const exportLineRe = /export\s*\{[^}]*\bas\s+(\w+)/;

const result = {};

for (const file of indexFiles) {
  const source = readFileSync(join(root, file), "utf-8");
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const deprecatedMatch = deprecatedCommentRe.exec(lines[i]);
    if (!deprecatedMatch) {
      continue;
    }

    const message = deprecatedMatch[1].trim();
    const exportMatch = exportLineRe.exec(lines[i + 1] ?? "");

    if (exportMatch) {
      result[exportMatch[1]] = message;
    }
  }
}

const outDir = join(root, ".storybook", "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "deprecated-components.json"), JSON.stringify(result, null, 2) + "\n");

const count = Object.keys(result).length;
// eslint-disable-next-line no-console
console.log(`Generated deprecated-components.json (${count} components)`);

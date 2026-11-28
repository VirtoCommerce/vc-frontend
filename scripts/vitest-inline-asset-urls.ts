import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizePath } from "vite";
import type { Plugin } from "vite";

/**
 * Vitest-only. An eager `?url` glob (the icon registry in `ui-kit/utilities/icons.ts`, or Vite's
 * rewrite of `new URL(\`…${name}…\`, import.meta.url)` in `ui-kit/utilities/images.ts`) becomes one
 * import per file: ~2.7k asset modules that every test file loads one by one, again after each
 * `vi.resetModules()`. Replaces each such import with the string the dev server would serve for it.
 */

const URL_IMPORT_RE = /(?<=^|;)import\s+(\{[^}]*\}|\w+)\s+from\s+"([^"?]+)\?url";/gm;
const DEFAULT_BINDING_RE = /^(?:\{\s*default\s+as\s+(\w+)\s*\}|(\w+))$/;

export interface IInlineAssetUrlsOptions {
  root: string;
  publicDir: string;
  base: string;
  /** Whether the dev server may serve this `.svg` as a `data:` URL rather than a path. */
  mayInlineSvg: (file: string) => boolean;
}

/** Returns the rewritten code, or `undefined` when there is nothing to inline. */
export function inlineAssetUrlImports(
  code: string,
  importer: string,
  options: IInlineAssetUrlsOptions,
): string | undefined {
  if (!code.includes("?url")) {
    return;
  }

  const importerDir = path.dirname(importer.split("?")[0]);

  const result = code.replace(URL_IMPORT_RE, (statement, clause: string, specifier: string) => {
    const binding = DEFAULT_BINDING_RE.exec(clause);
    // Vite passes `root`, `publicDir` and `importer` with forward slashes on every OS.
    const file = normalizePath(
      specifier.startsWith("/") ? path.join(options.root, specifier) : path.resolve(importerDir, specifier),
    );
    const isServedFromRoot =
      file.startsWith(`${options.root}/`) &&
      !file.startsWith(`${options.publicDir}/`) &&
      !file.includes("/node_modules/");

    if (!binding || !isServedFromRoot || (file.endsWith(".svg") && options.mayInlineSvg(file))) {
      return statement;
    }

    const url = options.base + file.slice(options.root.length + 1);
    return `const ${binding[1] ?? binding[2]} = ${JSON.stringify(url)};`;
  });

  return result === code ? undefined : result;
}

export function inlineAssetUrls(): Plugin {
  let options: IInlineAssetUrlsOptions;

  return {
    name: "vc-frontend:vitest-inline-asset-urls",
    // After vite:import-glob and vite:asset-import-meta-url have expanded the globs.
    enforce: "post",
    configResolved(config) {
      const limit = config.build.assetsInlineLimit;

      options = {
        root: config.root,
        publicDir: config.publicDir,
        base: config.base,
        // The dev server inlines a small `.svg` as a `data:` URL unless `assetsInlineLimit` returns `false` for it.
        mayInlineSvg: (file) => typeof limit !== "function" || limit(file, readFileSync(file)) !== false,
      };
    },
    transform(code, id) {
      const result = inlineAssetUrlImports(code, id, options);
      // `map: null` keeps the incoming source map: every rewrite stays on its import's line.
      return result === undefined ? undefined : { code: result, map: null };
    },
  };
}

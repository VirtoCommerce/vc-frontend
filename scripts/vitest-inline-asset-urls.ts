import { readFileSync } from "node:fs";
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

/** Resolves an import specifier the way Vite does, to an absolute file path, or `undefined`. */
export type ResolveImportType = (specifier: string) => Promise<string | undefined>;

/** Returns the rewritten code, or `undefined` when there is nothing to inline. */
export async function inlineAssetUrlImports(
  code: string,
  resolveImport: ResolveImportType,
  options: IInlineAssetUrlsOptions,
): Promise<string | undefined> {
  if (!code.includes("?url")) {
    return;
  }

  const specifiers = new Set(Array.from(code.matchAll(URL_IMPORT_RE), ([, , specifier]) => specifier));
  const files = new Map<string, string | undefined>();

  await Promise.all(
    Array.from(specifiers, async (specifier) => {
      const file = await resolveImport(specifier);
      // Vite passes `root` and `publicDir` with forward slashes on every OS.
      files.set(specifier, file === undefined ? undefined : normalizePath(file));
    }),
  );

  const result = code.replace(URL_IMPORT_RE, (statement, clause: string, specifier: string) => {
    const binding = DEFAULT_BINDING_RE.exec(clause);
    const file = files.get(specifier);
    const isServedFromRoot =
      file !== undefined &&
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
    async transform(code, id) {
      const result = await inlineAssetUrlImports(
        code,
        async (specifier) => {
          // Vite's own resolver, given the request as written, so `resolve.alias` and every other resolve rule apply.
          const resolved = await this.resolve(`${specifier}?url`, id);
          return resolved && !resolved.external ? resolved.id.split("?")[0] : undefined;
        },
        options,
      );
      // `map: null` keeps the incoming source map: every rewrite stays on its import's line.
      return result === undefined ? undefined : { code: result, map: null };
    },
  };
}

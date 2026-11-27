import { DevEnvironment } from "vite";
import type { Plugin } from "vite";

/**
 * Vitest-only. An eager `?url` glob (the icon registry in `ui-kit/utilities/icons.ts`, or Vite's
 * rewrite of `new URL(\`…${name}…\`, import.meta.url)` in `ui-kit/utilities/images.ts`) becomes one
 * import per file: ~2.7k asset modules that every test file loads one by one, again after each
 * `vi.resetModules()`. Replaces each such import with the URL Vite's asset plugin serves for it.
 */

const URL_IMPORT_RE = /(?<=^|;)import\s+(\{[^}]*\}|\w+)\s+from\s+"([^"?]+)\?url";/gm;
const DEFAULT_BINDING_RE = /^(?:\{\s*default\s+as\s+(\w+)\s*\}|(\w+))$/;
// What Vite's asset plugin loads for a `?url` request: the URL as a JSON string literal.
const ASSET_MODULE_RE = /^export default ("(?:[^"\\]|\\.)*")$/;

export function inlineAssetUrls(): Plugin {
  return {
    name: "vc-frontend:vitest-inline-asset-urls",
    apply: "serve",
    // After vite:import-glob and vite:asset-import-meta-url have expanded the globs.
    enforce: "post",
    async transform(code, id) {
      const { environment } = this;

      if (!code.includes("?url") || !(environment instanceof DevEnvironment)) {
        return;
      }

      const urls = new Map<string, string | undefined>();
      const specifiers = new Set(Array.from(code.matchAll(URL_IMPORT_RE), ([, , specifier]) => specifier));

      await Promise.all(
        Array.from(specifiers, async (specifier) => {
          const resolved = await this.resolve(`${specifier}?url`, id);
          const loaded = resolved && !resolved.external ? await environment.pluginContainer.load(resolved.id) : null;
          const assetModule = typeof loaded === "object" ? loaded?.code : loaded;

          urls.set(specifier, assetModule ? ASSET_MODULE_RE.exec(assetModule)?.[1] : undefined);
        }),
      );

      const result = code.replace(URL_IMPORT_RE, (statement, clause: string, specifier: string) => {
        const binding = DEFAULT_BINDING_RE.exec(clause);
        const url = urls.get(specifier);

        return binding && url ? `const ${binding[1] ?? binding[2]} = ${url};` : statement;
      });

      // `map: null` keeps the incoming source map: every rewrite stays on its import's line.
      return result === code ? undefined : { code: result, map: null };
    },
  };
}

/**
 * Type side of `@vc-frontend/core/tailwind-preset`. The preset itself is a generated CommonJS file
 * (`contract/tailwind-preset.cjs`), and the subpath shipped without any `types` condition — so a
 * plugin whose `tailwind.config.ts` is TypeScript failed with TS7016 ("could not find a declaration
 * file"), which `skipLibCheck` does not suppress because the error is at the import site.
 *
 * Deliberately not typed as tailwind's own `Config`: importing it here would add `tailwindcss` to
 * the published contract's dependency surface for every consumer, tailwind users or not. A plugin
 * that wants the precise type can cast at its own call site, where tailwindcss is installed.
 */
declare const preset: Record<string, unknown>;
export = preset;

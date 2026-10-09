import { Logger } from "@/core/utilities";
import type { ILanguage } from "@/core/types";
import type { I18n } from "@/i18n";

/**
 * Loads and merges extra locale messages (UI kit, module bundles, …) for the given language.
 * Registered via `registerLocaleLoader` and re-run by `applyLocale` (see useLanguages) on every
 * locale switch, so runtime switches (e.g. the builder preview applying the edited page's culture,
 * VCST-5219) stay in sync with what boot loaded.
 *
 * Loaders run concurrently and must merge messages under namespaces they own (e.g. `ui_kit.*`,
 * a module's own keys); overlapping keys across loaders would resolve last-writer-wins.
 */
export type LocaleLoaderType = (i18n: I18n, language: ILanguage) => Promise<void>;

const localeLoaders = new Map<string, LocaleLoaderType>();

/**
 * Registers a locale loader under a stable key ("ui-kit", "module:quotes", …).
 * Re-registering the same key overwrites the previous loader, so repeated boots
 * (HMR, tests) don't accumulate duplicates.
 */
export function registerLocaleLoader(key: string, loader: LocaleLoaderType): void {
  localeLoaders.set(key, loader);
}

/**
 * Runs every registered loader for the given language. Loader failures are isolated and logged:
 * a missing optional bundle must degrade to fallback messages, never break the locale switch.
 */
export async function runLocaleLoaders(i18n: I18n, language: ILanguage): Promise<void> {
  await Promise.all(
    Array.from(localeLoaders.values(), (load) =>
      load(i18n, language).catch((error: unknown) =>
        Logger.error(`Failed to load extra locale messages for "${language.cultureName}"`, error),
      ),
    ),
  );
}

/** Test/HMR hygiene: clears all registered loaders. */
export function resetLocaleLoaders(): void {
  localeLoaders.clear();
}

import type { IThemeConfigPreset, IThemeContext } from "./types";
import type { InjectionKey } from "vue";

/**
 * @example
 * const config = inject(configInjectionKey, {});
 *
 * @see https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
 */

export const configInjectionKey = Symbol() as InjectionKey<IThemeConfigPreset>;
export const contextInjectionKey = Symbol() as InjectionKey<IThemeContext>;

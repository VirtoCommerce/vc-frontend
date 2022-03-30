import { InjectionKey } from "vue";
import { IThemeConfigPreset, IThemeContext } from "@core/types";
import { MenuLinkType } from "./api/graphql/types";

/**
 * @example
 * const config = inject(configInjectionKey, {});
 *
 * @see https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
 */

export const configInjectionKey = Symbol() as InjectionKey<IThemeConfigPreset>;
export const contextInjectionKey = Symbol() as InjectionKey<IThemeContext>;
export const menuInjectionKey = Symbol() as InjectionKey<Record<string, MenuLinkType[]>>;

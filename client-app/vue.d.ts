/* eslint-disable @typescript-eslint/naming-convention */
import type { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import type { IThemeConfigSettings, IThemeContext } from "@/core/types";
import type { VueI18nDateTimeFormatting, VueI18nNumberFormatting, VueI18nTranslation } from "vue-i18n";

export {};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigSettings;
    $context: IThemeContext;
    $permissions: { xApi: typeof XApiPermissions; storefront: typeof StorefrontPermissions };
    $can: (...permissions: string[]) => boolean;
    $t: typeof VueI18nTranslation;
    $tc: typeof VueI18nTranslation;
    $d: typeof VueI18nDateTimeFormatting;
    $n: typeof VueI18nNumberFormatting;
    $router: import("vue-router").Router;
    $route: import("vue-router").RouteLocationNormalized;
  }
}

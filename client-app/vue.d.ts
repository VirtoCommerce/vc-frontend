/* eslint-disable @typescript-eslint/naming-convention */
import type { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import type { IThemeConfigSettings, IThemeContext } from "@/core/types";
import type { Composer } from "vue-i18n";

export {};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigSettings;
    $context: IThemeContext;
    $permissions: { xApi: typeof XApiPermissions; storefront: typeof StorefrontPermissions };
    $can: (...permissions: string[]) => boolean;
    $t: Composer["t"];
    $tc: Composer["t"];
    $d: Composer["d"];
    $n: Composer["n"];
    $router: import("vue-router").Router;
    $route: import("vue-router").RouteLocationNormalized;
  }
}

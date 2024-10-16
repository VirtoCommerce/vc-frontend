/* eslint-disable @typescript-eslint/naming-convention */
import type { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import type { IThemeConfigSettings, IThemeContext } from "@/core/types";

export {};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigSettings;
    $context: IThemeContext;
    $permissions: { xApi: typeof XApiPermissions; storefront: typeof StorefrontPermissions };
    $can: (...permissions: string[]) => boolean;
  }
}

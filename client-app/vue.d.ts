/* eslint-disable @typescript-eslint/naming-convention */
import { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import { IThemeConfigPreset, IThemeContext } from "@/core/types";

export {};

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
    $context: IThemeContext;
    $permissions: { xApi: typeof XApiPermissions; storefront: typeof StorefrontPermissions };
    $can: (...permissions: string[]) => boolean;
  }
}

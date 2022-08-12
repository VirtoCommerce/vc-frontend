import { IThemeConfigPreset, IThemeContext } from "@/core/types";
import { StorefrontPermissions } from "@/core/constants";

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>; // eslint-disable-line
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
    $context: IThemeContext;
    $permissions: typeof StorefrontPermissions;
    $can: (...permissions: string[]) => boolean;
  }
}

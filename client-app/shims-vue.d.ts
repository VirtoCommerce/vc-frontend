import { IThemeConfigPreset, IThemeContext } from "@/core/types";

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>; // eslint-disable-line
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
    $context: IThemeContext;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    layout?: "Main" | "Payment";
    requiresAuth?: boolean;
    hideNavigation?: boolean;
  }
}

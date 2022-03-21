import { IThemeConfigPreset, IThemeContext } from "@core/types";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
    $context: IThemeContext;
  }
}

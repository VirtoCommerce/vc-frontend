import { IThemeConfigPreset } from "@core/types";

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
  }
}

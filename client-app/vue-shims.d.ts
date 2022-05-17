import { IThemeConfigPreset, IThemeContext } from "@core/types";
import { MenuLinkType } from "./core/api/graphql/types";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $cfg: IThemeConfigPreset;
    $context: IThemeContext;
    $menus: Record<string, MenuLinkType[]>;
  }
}

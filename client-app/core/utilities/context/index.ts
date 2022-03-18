import { IThemeContext } from "@/core/types";

export let themeContext: IThemeContext = {};

export async function initContext(): Promise<IThemeContext> {
  themeContext = (await (await fetch("/storefrontapi/theme/context")).json()) as IThemeContext;
  return themeContext;
}

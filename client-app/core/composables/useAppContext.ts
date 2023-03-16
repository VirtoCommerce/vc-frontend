import { readonly } from "vue";
import type { IAppContext } from "../types";

/** @see ~/snippets/head-content.liquid */
const appContextString = document.getElementById("vcAppContext")?.textContent ?? "";

if (!appContextString) {
  throw new Error("App context is missing.");
}

const appContext: IAppContext = readonly(JSON.parse(appContextString));

export function useAppContext(): IAppContext {
  return appContext;
}

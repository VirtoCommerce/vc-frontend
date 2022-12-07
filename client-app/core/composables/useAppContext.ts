import { readonly } from "vue";
import { IAppContext } from "@/core";

/** @see ~/snippets/head-content.liquid */
const appContextString = document.getElementById("vcAppContext")?.textContent ?? "";

if (!appContextString) {
  throw new Error("App context is missing.");
}

const appContext: IAppContext = readonly(JSON.parse(appContextString));

export default (): IAppContext => appContext;

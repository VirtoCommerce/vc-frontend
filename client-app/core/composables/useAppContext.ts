import { readonly } from "vue";
import { IS_CLIENT, IS_DEVELOPMENT } from "@/core/constants";
import type { IAppContext } from "../types";

/** @see ~/snippets/head-content.liquid */
const appContextString =
  IS_CLIENT && !IS_DEVELOPMENT
    ? document.getElementById("vcAppContext")?.textContent
    : // Mock settings for DEV mode
      `{
        "storeSettings": {
          "anonymousAccessEnabled": true
        }
      }`;

if (!appContextString) {
  throw new Error("App context is missing.");
}

const appContext: IAppContext = readonly(JSON.parse(appContextString));

export function useAppContext(): IAppContext {
  return appContext;
}

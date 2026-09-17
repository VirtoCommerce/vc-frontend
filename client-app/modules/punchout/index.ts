import { useUser } from "@/shared/account/composables/useUser";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

//const { isEnabled } = useModuleSettings(MODULE_ID);
//const { isAuthenticated } = useUser();

export function init(router: Router, i18n: I18n) {
  //if (isEnabled(ENABLED_KEY)) {
  const route: RouteRecordRaw = {
    path: "/punchout/:sessionToken",
    redirect: "/",
    //component: PushMessage,
  };
  router.addRoute(route);
  void loadModuleLocale(i18n, "punchout");
  //}
}

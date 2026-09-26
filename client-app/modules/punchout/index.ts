import { defineAsyncComponent, watch } from "vue";
import { useCartContext } from "@/core/composables/useCartContext";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { usePunchoutSession } from "./composables/usePunchoutSession";
import { MODULE_ID, ENABLED_KEY, PUNCHOUT_MODE_LABEL_ID, PUNCHOUT_EXIT_BUTTON_ID } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const PunchoutSession = () => import("./pages/punchout-session.vue");
const { isEnabled } = useModuleSettings(MODULE_ID);

// Points the cart queries at the punchout cart for as long as the session is active
// Runs at boot, before the app is mounted, so a session restored from local storage is already in place when the header fires the first cart
function syncCartContext() {
  const { isPunchoutMode, punchoutCartName } = usePunchoutSession();
  const { isAuthenticated } = useUser();
  const { setCartName } = useCartContext();

  // A punchout session left in local storage must not aim an anonymous at the punchout cart after a sign out
  watch(
    [isPunchoutMode, punchoutCartName, isAuthenticated],
    ([isActive, cartName, isSignedIn]) => setCartName(isActive && isSignedIn ? cartName : undefined),
    { immediate: true },
  );
}

// Drops a punchout session. Sign-out reloads the page, so this check is actually ends the session (a watch would be racing the reload)
function endSessionIfSignedOut() {
  const { isAuthenticated } = useUser();
  const { endSession } = usePunchoutSession();

  if (!isAuthenticated.value) {
    endSession();
  }
}

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    const route: RouteRecordRaw = {
      path: "/punchout/:sessionToken",
      name: "PunchoutSession",
      component: PunchoutSession,
      props: true,
      meta: { requiresAuth: true },
    };

    router.addRoute(route);
    endSessionIfSignedOut();
    syncCartContext();

    const { register } = useExtensionRegistry();
    register("topHeaderStatus", PUNCHOUT_MODE_LABEL_ID, {
      component: defineAsyncComponent(() => import("./components/punchout-mode-label.vue")),
    });
    register("topHeaderAccountMenu", PUNCHOUT_EXIT_BUTTON_ID, {
      component: defineAsyncComponent(() => import("./components/punchout-exit-button.vue")),
    });

    void loadModuleLocale(i18n, "punchout");
  }
}

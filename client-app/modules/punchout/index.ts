import { defineAsyncComponent, watch } from "vue";
import { useCartContext } from "@/core/composables/useCartContext";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { usePunchoutSession } from "./composables/usePunchoutSession";
import { PUNCHOUT_MODE_LABEL_ID, PUNCHOUT_EXIT_BUTTON_ID } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

// By using () => import('./MyPage.vue'), you ensure that Vue Router can handle the component as a lazy-loaded route, which is the intended usage pattern.
const PunchoutSession = () => import("./pages/punchout-session.vue");

/**
 * Points the cart queries at the punchout cart for as long as the session is active.
 *
 * Runs at boot, before the app is mounted, so a session restored from local storage is already in
 * place when the header fires the first cart query - no request against the default cart first.
 */
function syncCartContext() {
  const { isPunchoutMode, punchoutCartName } = usePunchoutSession();
  const { isAuthenticated } = useUser();
  const { setCartName } = useCartContext();

  // Gated on sign-in as well: a punchout session left in local storage must not aim an anonymous
  // visitor's cart at the punchout cart - after a sign-out that cart is no longer theirs to touch.
  watch(
    [isPunchoutMode, punchoutCartName, isAuthenticated],
    ([isActive, cartName, isSignedIn]) => setCartName(isActive && isSignedIn ? cartName : undefined),
    { immediate: true },
  );
}

/**
 * Drops a session left over from a signed-out visit. Sign-out reloads the page, so this boot check
 * is what actually ends the session - a watch would be racing that reload.
 */
function endSessionIfSignedOut() {
  const { isAuthenticated } = useUser();
  const { endSession } = usePunchoutSession();

  if (!isAuthenticated.value) {
    endSession();
  }
}

export function init(router: Router, i18n: I18n) {
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

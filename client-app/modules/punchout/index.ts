import { provideApolloClient } from "@vue/apollo-composable";
import { useEventListener } from "@vueuse/core";
import { defineAsyncComponent, watch } from "vue";
import { apolloClient } from "@/core/api/graphql/client";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useSignMeOut } from "@/shared/account/composables/useSignMeOut";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { usePunchoutSession } from "./composables/usePunchoutSession";
import { MODULE_ID, ENABLED_KEY, PUNCHOUT_MODE_LABEL_ID } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const PunchoutSession = () => import("./pages/punchout-session.vue");
const { isEnabled } = useModuleSettings(MODULE_ID);

const MAX_TIMER_DELAY = 24 * 60 * 60 * 1000;

provideApolloClient(apolloClient);

// Drops a punchout session. Sign-out reloads the page, so this check is actually ends the session (a watch would be racing the reload)
function endSessionIfSignedOut() {
  const { isAuthenticated } = useUser();
  const { endSession } = usePunchoutSession();

  if (!isAuthenticated.value) {
    endSession();
  }
}

// Drops a punchout session once its time is up. The time is checked again when the tab comes back.
function endSessionOnExpiry() {
  const { session, endSession } = usePunchoutSession();
  let timerId: ReturnType<typeof setTimeout> | undefined;

  function checkExpiry() {
    clearTimeout(timerId);

    const { expiresAt } = session.value;
    if (!expiresAt) {
      return;
    }

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      endSession();
      void useSignMeOut().signMeOut();
    } else {
      timerId = setTimeout(checkExpiry, Math.min(remaining, MAX_TIMER_DELAY));
    }
  }

  checkExpiry();
  watch(() => session.value.expiresAt, checkExpiry);
  useEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkExpiry();
    }
  });
}

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    // The route is the sign-in for a punchout visitor, it exchanges the session token for an access token.
    const route: RouteRecordRaw = {
      path: "/punchout/:sessionToken",
      name: "PunchoutSession",
      component: PunchoutSession,
      props: true,
      meta: { public: true },
    };

    router.addRoute(route);
    endSessionIfSignedOut();
    endSessionOnExpiry();

    const { register } = useExtensionRegistry();
    register("topHeaderStatus", PUNCHOUT_MODE_LABEL_ID, {
      component: defineAsyncComponent(() => import("./components/punchout-mode-label.vue")),
    });

    void loadModuleLocale(i18n, "punchout");
  }
}

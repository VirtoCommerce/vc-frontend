import { provideApolloClient } from "@vue/apollo-composable";
import { useEventListener } from "@vueuse/core";
import { defineAsyncComponent, watch } from "vue";
import { apolloClient } from "@/core/api/graphql/client";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useSignMeOut } from "@/shared/account/composables/useSignMeOut";
import { useUser } from "@/shared/account/composables/useUser";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { usePunchoutSession } from "./composables/usePunchoutSession";
import { MODULE_ID, ENABLED_KEY, PUNCHOUT_MODE_LABEL_ID } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const PunchoutSession = () => import("./pages/punchout-session.vue");
const { isEnabled } = useModuleSettings(MODULE_ID);

const MAX_TIMER_DELAY = 24 * 60 * 60 * 1000;
const PUNCHOUT_SESSION_ROUTE_NAME = "PunchoutSession";

provideApolloClient(apolloClient);

// Drops a punchout session. Sign-out reloads the page, so this check is actually ends the session (a watch would be racing the reload)
function endSessionIfSignedOut() {
  const { isAuthenticated } = useUser();
  const { endSession } = usePunchoutSession();

  if (!isAuthenticated.value) {
    endSession();
  }
}

// Reloads the current tab itself: the broadcast listener that would do it is set up only once the app is mounted
async function signOut() {
  const { signMeOut } = useSignMeOut({ reloadPage: false });
  const broadcast = useBroadcast();

  await signMeOut();

  void broadcast.emit(pageReloadEvent, undefined, TabsType.OTHERS);
  location.reload();
}

// Drops a punchout session once its time is up. The time is checked again when the tab comes back.
function endSessionOnExpiry(router: Router) {
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

      // The punchout sign-in route issues new tokens, a sign-out racing it would revoke them
      if (router.currentRoute.value.name !== PUNCHOUT_SESSION_ROUTE_NAME) {
        void signOut();
      }
    } else {
      timerId = setTimeout(checkExpiry, Math.min(remaining, MAX_TIMER_DELAY));
    }
  }

  function start() {
    checkExpiry();
    watch(() => session.value.expiresAt, checkExpiry);
    useEventListener(document, "visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkExpiry();
      }
    });
  }

  // The initial route is needed to tell the punchout sign-in apart
  void router.isReady().then(start, start);
}

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    // The route is the sign-in for a punchout visitor, it exchanges the session token for an access token.
    const route: RouteRecordRaw = {
      path: "/punchout/:sessionToken",
      name: PUNCHOUT_SESSION_ROUTE_NAME,
      component: PunchoutSession,
      props: true,
      meta: { public: true },
    };

    router.addRoute(route);
    endSessionIfSignedOut();
    endSessionOnExpiry(router);

    const { register } = useExtensionRegistry();
    register("topHeaderStatus", PUNCHOUT_MODE_LABEL_ID, {
      component: defineAsyncComponent(() => import("./components/punchout-mode-label.vue")),
    });

    void loadModuleLocale(i18n, "punchout");
  }
}

import { provideApolloClient } from "@vue/apollo-composable";
import { createGlobalState } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import { apolloClient } from "@/core/api/graphql";
import { useAddFcmToken } from "@/core/api/graphql/push-messages/mutations/addFcmToken";
import { useDeleteFcmToken } from "@/core/api/graphql/push-messages/mutations/deleteFcmToken";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { FcmSettingsType } from "@/core/api/graphql/types";
import type { Messaging } from "firebase/messaging";

const MODULE_KEYS = {
  ID: "VirtoCommerce.PushMessages",
  FCM_SETTINGS: "PushMessages.FcmSettings",
};
const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";
const DEFAULT_ICON_URL = "/static/icons/favicon-32x32.png";
const PREFERRED_ICON_PROPERTIES = { type: "image/png", sizes: "32x32" };

provideApolloClient(apolloClient);

function _useWebPushNotifications() {
  let initialized = false;
  let messaging: Messaging | undefined;
  let currentToken: string | undefined;

  const { favIcons } = useWhiteLabeling();
  const { isAuthenticated } = useUser();
  const { mutate: addFcmTokenMutation } = useAddFcmToken();
  const { mutate: deleteFcmTokenMutation } = useDeleteFcmToken();
  const { modulesSettings } = useThemeContext();

  const icon =
    favIcons.value?.find(
      ({ type, sizes }) => type === PREFERRED_ICON_PROPERTIES.type && sizes === PREFERRED_ICON_PROPERTIES.sizes,
    )?.href ?? DEFAULT_ICON_URL;

  async function init() {
    if (isAuthenticated.value === false || !(await isSupported())) {
      return;
    }

    // TODO: Delete when the module settings are available in the theme context
    const firebaseConfig = {
      apiKey: "AIzaSyAh1GH8SFIx4ULiaZUNZRnxNNM2jFLGdaE",
      authDomain: "test-97e05.firebaseapp.com",
      projectId: "test-97e05",
      storageBucket: "test-97e05.appspot.com",
      messagingSenderId: "518395609520",
      appId: "1:518395609520:web:53952423cba605aa771675",
      vapidKey: "BE1iGYmRsbdI1FB-qTiIUvGrWvC91GCfnXSHtfzcPLgXfQ28fbpKFlD8YlbI7w-aHVepW3Ih17oRB53ceYNaM6k",
    };

    const moduleSettings = modulesSettings?.value?.find(({ moduleId }) => moduleId === MODULE_KEYS.ID) ?? {
      settings: [],
    };
    const fcmSettings =
      (moduleSettings?.settings?.find(({ name }) => name === MODULE_KEYS.FCM_SETTINGS)
        ?.value as unknown as FcmSettingsType) ?? firebaseConfig;

    if (initialized) {
      await getFcmToken(messaging!, fcmSettings.vapidKey);
      return;
    }

    const firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);

    await getFcmToken(messaging, fcmSettings.vapidKey);
    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
    serviceWorkerRegistration?.active?.postMessage({ type: "initialize", config: firebaseConfig, icon });
    initialized = true;

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        badge: icon,
        body: payload?.notification?.body ?? "",
        icon,
      });
    });
  }

  // workaround for the issue with the first token request https://github.com/firebase/firebase-js-sdk/issues/7693
  function tryGetToken(count: number = 3) {
    const TIMEOUT = 1000;
    let retryCount = 0;
    return async function retry(messagingInstance: Messaging, vapidKey: string) {
      try {
        return await getToken(messagingInstance, { vapidKey });
      } catch (e) {
        if (retryCount >= count) {
          return;
        }
        retryCount++;
        await await new Promise((resolve) => {
          setTimeout(resolve, TIMEOUT);
        });
        return await retry(messagingInstance, vapidKey);
      }
    };
  }

  async function getFcmToken(messagingInstance: Messaging, vapidKey: string): Promise<string | undefined> {
    try {
      currentToken = await tryGetToken()(messagingInstance, vapidKey);
      if (currentToken) {
        await addFcmTokenMutation({ command: { token: currentToken } });
        return;
      }
      await Notification.requestPermission();
    } catch (e) {
      Logger.error(getFcmToken.name, e);
    }
  }

  async function deleteFcmToken(revokeCurrentToken = true) {
    try {
      if (revokeCurrentToken && initialized) {
        await deleteToken(messaging!);
      }
      if (currentToken) {
        await deleteFcmTokenMutation({ command: { token: currentToken } });
      }
    } catch (e) {
      Logger.error(deleteFcmToken.name, e);
    }
  }

  return { deleteFcmToken, init };
}

export const useWebPushNotifications = createGlobalState(_useWebPushNotifications);

import { provideApolloClient } from "@vue/apollo-composable";
import { createGlobalState } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import omit from "lodash/omit";
import { apolloClient } from "@/core/api/graphql";
import { useAddFcmToken } from "@/core/api/graphql/push-messages/mutations/addFcmToken";
import { useDeleteFcmToken } from "@/core/api/graphql/push-messages/mutations/deleteFcmToken";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { userBeforeUnauthorizeEvent, useBroadcast } from "@/shared/broadcast";
import type { FcmSettingsType } from "@/core/api/graphql/types";
import type { Messaging } from "firebase/messaging";

const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";
const DEFAULT_ICON_URL = "/static/icons/favicon-32x32.png";
const PREFERRED_ICON_PROPERTIES = { type: "image/png", sizes: "32x32" };
const HTML_TAG_REGEX = /(<([^>]+)>)/gi;
const MODULE_ID = "VirtoCommerce.PushMessages";
const SETTINGS_MAPPING = {
  "PushMessages.FcmReceiverOptions.ApiKey": "apiKey",
  "PushMessages.FcmReceiverOptions.AuthDomain": "authDomain",
  "PushMessages.FcmReceiverOptions.ProjectId": "projectId",
  "PushMessages.FcmReceiverOptions.StorageBucket": "storageBucket",
  "PushMessages.FcmReceiverOptions.MessagingSenderId": "messagingSenderId",
  "PushMessages.FcmReceiverOptions.AppId": "appId",
  "PushMessages.FcmReceiverOptions.VapidKey": "vapidKey",
} as const;
type SettingNameType = keyof typeof SETTINGS_MAPPING;

provideApolloClient(apolloClient);

function _useWebPushNotifications() {
  let initialized = false;
  let messaging: Messaging | undefined;
  let currentToken: string | undefined;

  const broadcast = useBroadcast();
  const { favIcons } = useWhiteLabeling();
  const { isAuthenticated } = useUser();
  const { mutate: addFcmTokenMutation } = useAddFcmToken();
  const { mutate: deleteFcmTokenMutation } = useDeleteFcmToken();

  const icon =
    favIcons.value?.find(
      ({ type, sizes }) => type === PREFERRED_ICON_PROPERTIES.type && sizes === PREFERRED_ICON_PROPERTIES.sizes,
    )?.href || DEFAULT_ICON_URL;

  async function init() {
    const { modulesSettings } = useThemeContext();
    const moduleSettings = modulesSettings?.value?.find(({ moduleId }) => moduleId === MODULE_ID);

    if (isAuthenticated.value === false || !moduleSettings || !(await isSupported())) {
      return;
    }

    const fcmSettings = moduleSettings.settings.reduce((settings: Partial<FcmSettingsType>, { name, value }) => {
      const settingName = SETTINGS_MAPPING[name as SettingNameType];
      settings[settingName] = value as string;
      return settings;
    }, {});

    const vapidKey = fcmSettings?.vapidKey as string;
    const firebaseConfig = omit(fcmSettings, "vapidKey") as FcmSettingsType;

    if (initialized) {
      await getFcmToken(messaging!, vapidKey);
      return;
    }

    const firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);

    await getFcmToken(messaging, vapidKey);
    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
    serviceWorkerRegistration?.active?.postMessage({
      type: "initialize",
      config: firebaseConfig,
      icon,
    });
    initialized = true;

    broadcast.on(userBeforeUnauthorizeEvent, deleteFcmToken);

    onMessage(messaging, (payload) => {
      new Notification(payload?.data?.title ?? "", {
        badge: payload.data?.icon || icon,
        body: payload?.data?.body?.replace(HTML_TAG_REGEX, "")?.trim() ?? "",
        icon: payload.data?.icon || icon,
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

  async function deleteFcmToken() {
    try {
      if (initialized && messaging) {
        await deleteToken(messaging);
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

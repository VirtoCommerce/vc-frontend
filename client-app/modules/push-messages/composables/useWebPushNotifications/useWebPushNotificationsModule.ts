import { provideApolloClient } from "@vue/apollo-composable";
import { createGlobalState, useLocalStorage, useEventBus } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken } from "firebase/messaging";
import omit from "lodash/omit";
import { computed, ref, watch } from "vue";
import { apolloClient } from "@/core/api/graphql";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { WHITE_LABELING_EVENTS } from "@/core/constants/modules-events";
import { Logger } from "@/core/utilities";
import { userBeforeUnauthorizeEvent, useBroadcast } from "@/shared/broadcast";
import { useAddFcmToken } from "../../api/graphql/mutations/addFcmToken";
import { useDeleteFcmToken } from "../../api/graphql/mutations/deleteFcmToken";
import type { FcmSettingsType } from "../../api/graphql/types";
import type { Messaging } from "firebase/messaging";

const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";
const DEFAULT_ICON_URL = "/static/icons/favicon-32x32.png";
const PREFERRED_ICON_PROPERTIES = { type: "image/png", sizes: "32x32" };
const SETTINGS_MAPPING = {
  "PushMessages.FcmReceiverOptions.ApiKey": "apiKey",
  "PushMessages.FcmReceiverOptions.AuthDomain": "authDomain",
  "PushMessages.FcmReceiverOptions.ProjectId": "projectId",
  "PushMessages.FcmReceiverOptions.StorageBucket": "storageBucket",
  "PushMessages.FcmReceiverOptions.MessagingSenderId": "messagingSenderId",
  "PushMessages.FcmReceiverOptions.AppId": "appId",
  "PushMessages.FcmReceiverOptions.VapidKey": "vapidKey",
} as const;

provideApolloClient(apolloClient);

const { getModuleSettings } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
type FaviconType = { type: string; sizes: string; href: string };

function _useWebPushNotifications() {
  let initialized = false;
  let messaging: Messaging | undefined;
  let currentToken: string | undefined;

  const broadcast = useBroadcast();
  const { mutate: addFcmTokenMutation } = useAddFcmToken();
  const { mutate: deleteFcmTokenMutation } = useDeleteFcmToken();
  const savedFcmToken = useLocalStorage<string | null>("saved-fcm-token", null);

  async function initModule() {
    if (!(await isSupported())) {
      return;
    }
    const favIcons = ref<FaviconType[]>([]);
    const icon = computed(
      () =>
        favIcons.value?.find(
          ({ type, sizes }) => type === PREFERRED_ICON_PROPERTIES.type && sizes === PREFERRED_ICON_PROPERTIES.sizes,
        )?.href ?? DEFAULT_ICON_URL,
    );

    const { on } = useEventBus<string, { favicons: FaviconType[] }>(WHITE_LABELING_EVENTS.FETCHED_SETTINGS);
    on((key, settings) => {
      favIcons.value = settings?.favicons ?? [];
    });

    const fcmSettings = getModuleSettings(SETTINGS_MAPPING);

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
    });

    initialized = true;

    watch(
      icon,
      () => {
        serviceWorkerRegistration?.active?.postMessage({
          type: "update-icon",
          icon: icon.value,
        });
      },
      { immediate: true },
    );

    broadcast.on(userBeforeUnauthorizeEvent, deleteFcmToken);
  }

  // workaround for the issue with the first token request https://github.com/firebase/firebase-js-sdk/issues/7693
  function tryGetToken(count: number = 3) {
    const TIMEOUT = 3000;
    let retryCount = 0;
    return async function retry(messagingInstance: Messaging, vapidKey: string) {
      try {
        return await getToken(messagingInstance, { vapidKey });
      } catch (e) {
        if (retryCount >= count) {
          return;
        }
        retryCount++;
        await new Promise((resolve) => {
          setTimeout(resolve, TIMEOUT);
        });
        return await retry(messagingInstance, vapidKey);
      }
    };
  }

  async function getFcmToken(messagingInstance: Messaging, vapidKey: string): Promise<string | undefined> {
    try {
      currentToken = await tryGetToken()(messagingInstance, vapidKey);
      if (currentToken && currentToken !== savedFcmToken.value) {
        await addFcmTokenMutation({ command: { token: currentToken } });
        savedFcmToken.value = currentToken;
      }
      if (currentToken) {
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

  return { initModule };
}

export const useWebPushNotificationsModule = createGlobalState(_useWebPushNotifications);

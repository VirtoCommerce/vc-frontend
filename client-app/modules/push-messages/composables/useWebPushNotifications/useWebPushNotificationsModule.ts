import { provideApolloClient } from "@vue/apollo-composable";
import { createGlobalState, useLocalStorage, useEventBus } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken } from "firebase/messaging";
import omit from "lodash/omit";
import { computed, ref, watch } from "vue";
import { apolloClient } from "@/core/api/graphql";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { MODULE_ID_PUSH_MESSAGES } from "@/core/constants/modules";
import { WHITE_LABELING_FETCHED_SETTINGS_EVENT } from "@/core/constants/modules-events";
import { Logger } from "@/core/utilities";
import { userBeforeUnauthorizeEvent, useBroadcast } from "@/shared/broadcast";
import { useAddFcmToken } from "../../api/graphql/mutations/addFcmToken";
import { useDeleteFcmToken } from "../../api/graphql/mutations/deleteFcmToken";
import {
  REGISTRATION_SCOPE,
  SERVICE_WORKER_PATH,
  DEFAULT_ICON_URL,
  PREFERRED_ICON_PROPERTIES,
  SETTINGS_MAPPING,
} from "../../constants";
import type { FcmSettingsType } from "../../api/graphql/types";
import type { EventBusKey } from "@vueuse/core";
import type { Messaging } from "firebase/messaging";

provideApolloClient(apolloClient);

const { getModuleSettings } = useModuleSettings(MODULE_ID_PUSH_MESSAGES);
type ExtractedWhiteLabelingSettingsType =
  typeof WHITE_LABELING_FETCHED_SETTINGS_EVENT extends EventBusKey<infer T> ? T : never;

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

    const fcmSettings = getModuleSettings(SETTINGS_MAPPING);

    const vapidKey = fcmSettings?.vapidKey as string;
    const firebaseConfig = omit(fcmSettings, "vapidKey") as FcmSettingsType;

    if (initialized && messaging) {
      const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
      await getFcmToken(messaging, vapidKey, serviceWorkerRegistration);
      return;
    }

    const firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
    await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: REGISTRATION_SCOPE,
    });
    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(REGISTRATION_SCOPE);
    await getFcmToken(messaging, vapidKey, serviceWorkerRegistration);
    serviceWorkerRegistration?.active?.postMessage({
      type: "initialize",
      config: firebaseConfig,
    });

    initialized = true;

    updateAndObserveNotificationIcon(serviceWorkerRegistration);
    broadcast.on(userBeforeUnauthorizeEvent, deleteFcmToken);
  }

  async function getFcmToken(
    messagingInstance: Messaging,
    vapidKey: string,
    serviceWorkerRegistration?: ServiceWorkerRegistration,
  ): Promise<string | undefined> {
    try {
      currentToken = await getToken(messagingInstance, { vapidKey, serviceWorkerRegistration });
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

  function updateAndObserveNotificationIcon(serviceWorkerRegistration?: ServiceWorkerRegistration) {
    const { favIcons: favIconsFromWhiteLabeling } = useWhiteLabeling();
    const favIcons = ref<ExtractedWhiteLabelingSettingsType["favicons"]>(favIconsFromWhiteLabeling.value ?? []);
    const icon = computed(
      () =>
        favIcons.value?.find(
          ({ type, sizes }) => type === PREFERRED_ICON_PROPERTIES.type && sizes === PREFERRED_ICON_PROPERTIES.sizes,
        )?.href ?? DEFAULT_ICON_URL,
    );

    const { on } = useEventBus(WHITE_LABELING_FETCHED_SETTINGS_EVENT);
    on((settings) => {
      favIcons.value = settings?.favicons ?? [];
    });

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
  }

  return { initModule };
}

export const useWebPushNotificationsModule = createGlobalState(_useWebPushNotifications);

import { useLocalStorage } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import { ref } from "vue";
import { useAddFcmToken } from "@/core/api/graphql/push-messages/mutations/addFcmToken";
import { useDeleteFcmToken } from "@/core/api/graphql/push-messages/mutations/deleteFcmToken";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { FcmSettingsType } from "@/core/api/graphql/types";
import type { Messaging } from "firebase/messaging";

const initialized = ref(false);
let messaging: Messaging | undefined;
let currentToken: string | undefined;
let firebaseApp: ReturnType<typeof initializeApp>;
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;

const MODULE_KEYS = {
  ID: "VirtoCommerce.PushMessages",
  FCM_SETTINGS: "PushMessages.FcmSettings",
};

export function useWebPushNotifications() {
  const { isAuthenticated, user } = useUser();
  const savedFcmToken = useLocalStorage<{ userId: string; token: string }>("fcmToken", { userId: "", token: "" });
  const { mutate: addFcmTokenMutation } = useAddFcmToken();
  const { mutate: deleteFcmTokenMutation } = useDeleteFcmToken();

  async function init() {
    if (!(await isSupported())) {
      Logger.warn("Firebase messaging is not supported in this browser");
      return;
    }
    const { modulesSettings } = useThemeContext();

    // TODO: Replace with config from module settings
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

    if (initialized.value) {
      await getFcmToken(messaging!, fcmSettings.vapidKey);
      return;
    }
    if (isAuthenticated.value === false) {
      return;
    }
    firebaseApp = initializeApp(firebaseConfig);
    serviceWorkerRegistration = await navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope");
    serviceWorkerRegistration?.active?.postMessage({ type: "initialize", config: firebaseConfig });
    messaging = getMessaging(firebaseApp);
    initialized.value = true;

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        body: payload?.notification?.body ?? "",
        icon: "/static/icons/favicon.svg",
        tag: payload?.messageId,
      });
    });

    await getFcmToken(messaging!, fcmSettings.vapidKey);
  }

  async function getFcmToken(messagingInstance: Messaging, vapidKey: string): Promise<string | undefined> {
    try {
      currentToken = await getToken(messagingInstance, {
        vapidKey,
      });
      if (currentToken) {
        console.log({ currentToken: currentToken });
        void updateFcmToken(currentToken);
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        void deleteFcmToken(false);
      }
    } catch (e) {
      Logger.warn(getFcmToken.name, e);
    }
  }

  async function updateFcmToken(token: string) {
    const userId = user.value?.id;
    const identicalUsers = savedFcmToken.value.userId === userId;
    const identicalUserAndToken = identicalUsers && savedFcmToken.value.token === token;
    if (!userId || identicalUserAndToken || !isAuthenticated.value) {
      return;
    }
    if (identicalUsers) {
      await deleteFcmToken(false);
    }
    void addFcmToken(token, userId);
  }

  async function addFcmToken(token: string, userId: string) {
    try {
      savedFcmToken.value = { userId, token };
      await addFcmTokenMutation({ command: { token } });
    } catch (e) {
      Logger.warn(addFcmToken.name, e);
    }
  }

  async function deleteFcmToken(revokeCurrentToken = true) {
    try {
      if (revokeCurrentToken && initialized) {
        await deleteToken(messaging!);
      }
      await deleteFcmTokenMutation({ command: { token: currentToken! } });
      savedFcmToken.value = { userId: "", token: "" };
    } catch (e) {
      Logger.warn(deleteFcmToken.name, e);
    }
  }

  return { deleteFcmToken, init, initialized };
}

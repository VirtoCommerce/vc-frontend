import { useLocalStorage } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import { watch } from "vue";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { Messaging } from "firebase/messaging";

export function useWebPushNotifications() {
  const { isAuthenticated, user } = useUser();
  let currentToken: string | undefined;
  let firebaseApp: ReturnType<typeof initializeApp>;
  let initialized = false;
  let messaging: Messaging | undefined;

  const savedFcmToken = useLocalStorage<{ userId: string; token: string }>("fcmToken", { userId: "", token: "" });

  // TODO: Replace with config from module settings
  const firebaseConfig = {
    apiKey: "AIzaSyAh1GH8SFIx4ULiaZUNZRnxNNM2jFLGdaE",
    authDomain: "test-97e05.firebaseapp.com",
    projectId: "test-97e05",
    storageBucket: "test-97e05.appspot.com",
    messagingSenderId: "518395609520",
    appId: "1:518395609520:web:53952423cba605aa771675",
  };
  // TODO: Replace with key from module settings

  // TODO: Probably can be removed is we use soft ask
  function watchIsAuthenticated() {
    watch(
      isAuthenticated,
      (value) => {
        if (value) {
          void init();
        }
      },
      { once: true },
    );
  }

  async function init() {
    const vapidKey = "BE1iGYmRsbdI1FB-qTiIUvGrWvC91GCfnXSHtfzcPLgXfQ28fbpKFlD8YlbI7w-aHVepW3Ih17oRB53ceYNaM6k";
    if (initialized) {
      await getFcmToken(messaging!, vapidKey);
    }
    if (isAuthenticated.value === false) {
      // TODO: Probably can be removed is we use soft ask
      watchIsAuthenticated();
      return;
    }

    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);

    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(
      "/firebase-cloud-messaging-push-scope",
    );
    serviceWorkerRegistration?.active?.postMessage({ type: "initialize", config: firebaseConfig });

    currentToken = await getFcmToken(messaging, vapidKey);
    console.log("currentToken", currentToken);

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        body: payload?.notification?.body ?? "",
        icon: "/static/icons/favicon.svg",
      });
    });
    initialized = true;
  }

  async function getFcmToken(messagingInstance: Messaging, vapidKey: string) {
    try {
      const token = await getToken(messagingInstance, {
        vapidKey,
      });
      if (token) {
        void updateFcmToken(token);
        return token;
      }
      void Notification.requestPermission();
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
      await deleteFcmToken(savedFcmToken.value.token);
    }
    addFcmToken(token, userId);
  }

  function addFcmToken(token: string, userId: string) {
    // TODO: Send token to server
    console.log("addFcmToken", token);
    savedFcmToken.value = { userId, token };
  }

  async function deleteFcmToken(token: string = currentToken!) {
    await deleteToken(messaging!);
    savedFcmToken.value = { userId: "", token: "" };
    // TODO: Delete token from server
    console.log("deleteFcmToken", token);
  }

  return { init, deleteFcmToken };
}

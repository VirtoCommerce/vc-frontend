import { useLocalStorage } from "@vueuse/core";
import { initializeApp } from "firebase/app";
import { isSupported, getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
// import { useAddFcmToken } from "@/core/api/graphql/push-messages/mutations/addFcmToken";
// import { useDeleteFcmToken } from "@/core/api/graphql/push-messages/mutations/deleteFcmToken";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { Messaging } from "firebase/messaging";

let initialized = false;
let messaging: Messaging | undefined;
let currentToken: string | undefined;
let firebaseApp: ReturnType<typeof initializeApp>;

export function useWebPushNotifications() {
  const { isAuthenticated, user } = useUser();
  // const { mutate: addFcmTokenMutation } = useAddFcmToken();
  // const { mutate: deleteFcmTokenMutation } = useDeleteFcmToken();

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

  async function init() {
    if (!(await isSupported())) {
      return;
    }
    const vapidKey = "BE1iGYmRsbdI1FB-qTiIUvGrWvC91GCfnXSHtfzcPLgXfQ28fbpKFlD8YlbI7w-aHVepW3Ih17oRB53ceYNaM6k";
    if (initialized) {
      await getFcmToken(messaging!, vapidKey);
    }
    if (isAuthenticated.value === false) {
      return;
    }

    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);

    const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration(
      "/firebase-cloud-messaging-push-scope",
    );
    serviceWorkerRegistration?.active?.postMessage({ type: "initialize", config: firebaseConfig });
    initialized = true;

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        body: payload?.notification?.body ?? "",
        icon: "/static/icons/favicon.svg",
      });
    });

    currentToken = await getFcmToken(messaging, vapidKey);
    console.log("currentToken", currentToken);
  }

  async function getFcmToken(messagingInstance: Messaging, vapidKey: string) {
    try {
      const token = await getToken(messagingInstance, {
        vapidKey,
      });
      if (token) {
        await updateFcmToken(token);
        return token;
      }
      void Notification.requestPermission();
      // TODO: Logic when permission is not granted check is there is a token for current user, then delete it
    } catch (e) {
      Logger.warn(getFcmToken.name, e);
    }
  }

  async function updateFcmToken(token: string) {
    const userId = user.value?.id;
    const identicalUsers = savedFcmToken.value.userId === userId;
    const identicalUserAndToken = identicalUsers && savedFcmToken.value.token === token;
    console.log({
      userId,
      token,
      savedFcmTokenUserId: savedFcmToken.value.userId,
      savedFcmTokenToken: savedFcmToken.value.token,
      identicalUsers,
      identicalUserAndToken,
    });
    if (!userId || identicalUserAndToken || !isAuthenticated.value) {
      return;
    }
    if (identicalUsers) {
      await deleteFcmToken(savedFcmToken.value.token);
    }
    void addFcmToken(token, userId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async function addFcmToken(token: string, userId: string) {
    // await addFcmTokenMutation({ command: { token } });
    console.log("addFcmToken", token);
    savedFcmToken.value = { userId, token };
  }

  async function deleteFcmToken(token: string = currentToken!) {
    // await deleteFcmTokenMutation({ command: { token } });
    await deleteToken(messaging!);
    savedFcmToken.value = { userId: "", token: "" };
    console.log("deleteFcmToken", token);
  }

  return { init, deleteFcmToken };
}

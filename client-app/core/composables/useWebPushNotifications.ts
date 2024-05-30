import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

async function getFcmToken(
  messaging: Messaging,
  vapidKey: string,
  serviceWorkerRegistration: ServiceWorkerRegistration,
) {
  const currentToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });
  if (currentToken) {
    return currentToken;
  } else {
    await requestPermission();
  }
}

async function requestPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  }
}

export function useWebPushNotifications() {
  const firebaseConfig = {
    apiKey: "AIzaSyAh1GH8SFIx4ULiaZUNZRnxNNM2jFLGdaE",
    authDomain: "test-97e05.firebaseapp.com",
    projectId: "test-97e05",
    storageBucket: "test-97e05.appspot.com",
    messagingSenderId: "518395609520",
    appId: "1:518395609520:web:53952423cba605aa771675",
  };

  const vapidKey = "BE1iGYmRsbdI1FB-qTiIUvGrWvC91GCfnXSHtfzcPLgXfQ28fbpKFlD8YlbI7w-aHVepW3Ih17oRB53ceYNaM6k";

  async function init() {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging.sw.js", {
      type: "module",
    });
    await navigator.serviceWorker.ready;
    serviceWorkerRegistration?.active?.postMessage({ type: "initialize", config: firebaseConfig });

    const currentToken = getFcmToken(messaging, vapidKey, serviceWorkerRegistration);
    console.log("currentToken", await currentToken);

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        body: payload?.notification?.body ?? "",
        icon: "/static/icons/favicon.svg",
      });
    });
  }

  return { init };
}

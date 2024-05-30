import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAh1GH8SFIx4ULiaZUNZRnxNNM2jFLGdaE",
  authDomain: "test-97e05.firebaseapp.com",
  projectId: "test-97e05",
  storageBucket: "test-97e05.appspot.com",
  messagingSenderId: "518395609520",
  appId: "1:518395609520:web:53952423cba605aa771675",
};

export function useWebPushNotifications() {
  async function init() {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const registration = await navigator.serviceWorker.register("/firebase-messaging.sw.js", { type: "module" });
    await navigator.serviceWorker.ready;
    registration?.active?.postMessage({ type: "initialize", config: firebaseConfig });

    getToken(messaging, {
      vapidKey: "BE1iGYmRsbdI1FB-qTiIUvGrWvC91GCfnXSHtfzcPLgXfQ28fbpKFlD8YlbI7w-aHVepW3Ih17oRB53ceYNaM6k",
      serviceWorkerRegistration: registration,
    })
      .then((currentToken) => {
        console.log("currentToken", currentToken);
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          // ...
        } else {
          requestPermission();
        }
      })
      .catch(() => {});

    onMessage(messaging, (payload) => {
      new Notification(payload?.notification?.title ?? "", {
        body: payload?.notification?.body ?? "",
        icon: "/static/icons/favicon.svg",
      });
    });
  }

  function requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  }

  return { init };
}

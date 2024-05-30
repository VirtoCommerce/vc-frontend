import { initializeApp } from "../../node_modules/firebase/app";
import { getMessaging, onBackgroundMessage } from "../../node_modules/firebase/messaging/sw";

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config } = event.data;
    initialize(config);
  }
});

function initialize(config) {
  const app = initializeApp(config);
  getMessaging(app);

  onBackgroundMessage(function (payload) {
    const notificationTitle = payload?.notification?.title ?? "";
    const notificationOptions = {
      body: payload?.notification?.body ?? "",
      icon: "/static/icons/favicon.svg",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

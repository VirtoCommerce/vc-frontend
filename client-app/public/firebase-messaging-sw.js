/* eslint-disable no-undef */

// TODO: Update the version number as needed
// TODO: Refactor for using esm imports when firefox supports it https://caniuse.com/mdn-api_serviceworker_ecmascript_modules
const VERSION = "10.12.2";
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`);
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`);

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config, icon } = event.data;
    initialize(config, icon);
  }
});

// TODO: Remove handler when the link will be provided by backend https://firebase.google.com/docs/cloud-messaging/js/send-multiple#setting_notification_options_in_the_send_request
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(self.location.origin));
});

async function initialize(config, icon) {
  const app = firebase.initializeApp(config);
  const messaging = await firebase.messaging(app);

  messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload?.notification?.title ?? "";
    const notificationOptions = {
      badge: icon,
      body: payload?.notification?.body?.replace(/(<([^>]+)>)/gi, "") ?? "",
      icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

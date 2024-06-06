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

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification?.data?.url || self.location.origin));
});

async function initialize(config, icon) {
  const app = firebase.initializeApp(config);
  const messaging = await firebase.messaging(app);

  messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload?.data?.title ?? "";
    const notificationOptions = {
      data: payload?.data,
      badge: payload?.data?.icon || icon,
      body: payload?.data?.body?.replace(/(<([^>]+)>)/gi, "")?.trim() ?? "",
      icon: payload?.data?.icon || icon,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

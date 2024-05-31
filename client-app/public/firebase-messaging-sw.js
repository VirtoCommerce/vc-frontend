/* eslint-disable no-undef */

// TODO: Update the version number as needed
// TODO: Refactor for using esm imports when firefox supports it https://caniuse.com/mdn-api_serviceworker_ecmascript_modules
const VERSION = "10.12.2";
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`);
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`);

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config } = event.data;
    initialize(config);
  }
});

function initialize(config) {
  const app = firebase.initializeApp(config);
  const messaging = firebase.messaging(app);

  messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload?.notification?.title ?? "";
    const notificationOptions = {
      body: payload?.notification?.body ?? "",
      icon: "/static/icons/favicon.svg",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

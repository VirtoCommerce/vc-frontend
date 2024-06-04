/* eslint-disable no-undef */

// TODO: Update the version number as needed
// TODO: Refactor for using esm imports when firefox supports it https://caniuse.com/mdn-api_serviceworker_ecmascript_modules
const VERSION = "10.12.2";
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`);
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`);

console.log("register");

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
  // const clients = await self.clients.matchAll();
  // clients.forEach((client) => {
  //   client.postMessage({ type: "activate" });
  // });
});

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config } = event.data;
    initialize(config);
  }
});

async function initialize(config) {
  const app = firebase.initializeApp(config);
  const messaging = await firebase.messaging(app);

  messaging.onBackgroundMessage(function (payload) {
    console.log("background message received", payload);
    const notificationTitle = payload?.notification?.title ?? "";
    const notificationOptions = {
      body: payload?.notification?.body ?? "",
      icon: "/static/icons/favicon.svg",
      tag: payload.messageId,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

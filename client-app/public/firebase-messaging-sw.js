/* eslint-disable no-undef */

// TODO: Update the version number as needed
// TODO: Refactor for using esm imports when firefox supports it https://caniuse.com/mdn-api_serviceworker_ecmascript_modules
const VERSION = "10.12.2";
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`);
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`);

const HTML_TAG_REGEX = /(<([^>]+)>)/gi;

let icon;

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config, icon: iconUrl } = event.data;
    icon = iconUrl;
    initialize(config);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification?.data?.url || self.location.origin));
});

self.addEventListener("push", function (event) {
  const { data } = event.data.json();
  event.waitUntil(
    registration.pushManager.getSubscription().then(function () {
      return self.registration.showNotification(data?.title ?? "", {
        data: data.data,
        badge: data?.icon || icon,
        body: data?.body?.replace(HTML_TAG_REGEX, "")?.trim() ?? "",
        icon: data?.icon || icon,
      });
    }),
  );
});

async function initialize(config) {
  const app = firebase.initializeApp(config);
  await firebase.messaging(app);
}

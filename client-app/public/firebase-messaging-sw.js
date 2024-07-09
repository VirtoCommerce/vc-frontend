/* eslint-disable no-undef */

// TODO: Update the version number as needed
// TODO: Refactor for using esm imports when firefox supports it https://caniuse.com/mdn-api_serviceworker_ecmascript_modules
const VERSION = "10.12.2";
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`);
importScripts(`//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`);

const HTML_TAG_REGEX = /(<([^>]+)>)/gi;
const DB_NAME = "fcm-auxiliary-database";
const DB_STORE_OBJECT = "data";
const DB_DEFAULT_ICON_ID = "defaultIcon";

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config, icon: iconUrl } = event.data;
    storeDefaultIcon(iconUrl);
    initialize(config);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.openWindow(`/push-message/${event.notification?.data?.messageId}/?redirect=${url}`));
});

self.addEventListener("push", function (event) {
  const { data } = event.data.json();
  event.waitUntil(
    registration.pushManager.getSubscription().then(async () => {
      const defaultIcon = await getDefaultIcon();
      return self.registration.showNotification(data?.title ?? "", {
        data: { messageId: data.messageId, url: data.url },
        badge: data?.icon || defaultIcon,
        body: data?.body?.replace(HTML_TAG_REGEX, "")?.trim() ?? "",
        icon: data?.icon || defaultIcon,
      });
    }),
  );
});

async function initialize(config) {
  const app = firebase.initializeApp(config);
  await firebase.messaging(app);
}

// needs to persist the default icon url in indexedDB, since it's getting lost when the service worker is restarted
function storeDefaultIcon(iconUrl) {
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore("data", { keyPath: "id" });
    objectStore.put({ id: DB_DEFAULT_ICON_ID, url: iconUrl });
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction([DB_STORE_OBJECT], "readwrite");
    const objectStore = transaction.objectStore(DB_STORE_OBJECT);
    objectStore.put({ id: DB_DEFAULT_ICON_ID, url: iconUrl });
  };
}

async function getDefaultIcon() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([DB_STORE_OBJECT], "readonly");
      const objectStore = transaction.objectStore(DB_STORE_OBJECT);
      const getRequest = objectStore.get(DB_DEFAULT_ICON_ID);

      getRequest.onsuccess = function (e) {
        resolve(e.target.result ? e.target.result.url : null);
      };

      getRequest.onerror = function () {
        reject(null);
      };
    };

    request.onerror = function () {
      reject(null);
    };
  });
}

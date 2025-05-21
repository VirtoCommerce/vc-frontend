/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-undef */

// NOTE: When updating the service worker, make sure to update the version in the service worker module constants "client-app/modules/push-messages/constants/index.ts"

const VERSION = "11.0.1";
importScripts(
  `//www.gstatic.com/firebasejs/${VERSION}/firebase-app-compat.js`,
  `//www.gstatic.com/firebasejs/${VERSION}/firebase-messaging-compat.js`,
);

const DEFAULT_RETURN_URL = "/account/notifications";
const DB_NAME = "fcm-auxiliary-database";
const DB_STORE_OBJECT = "data";
const DB_DEFAULT_ICON_ID = "defaultIcon";

self.addEventListener("message", (event) => {
  if (event.data.type === "initialize") {
    const { config } = event.data;
    // eslint-disable-next-line no-console
    initialize(config).catch((e) => console.error(e));
  }
});

self.addEventListener("message", (event) => {
  if (event.data.type === "update-icon") {
    const { icon } = event.data;
    storeDefaultIcon(icon);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification?.data?.url || DEFAULT_RETURN_URL;
  event.waitUntil(self.clients.openWindow(`/push-message/${event.notification?.data?.messageId}/?returnUrl=${url}`));
});

self.addEventListener("push", function (event) {
  const { data } = event.data.json();
  event.waitUntil(
    registration.pushManager.getSubscription().then(async () => {
      const defaultIcon = await getDefaultIcon();
      return self.registration.showNotification(data?.title ?? "", {
        data: { messageId: data.messageId, url: data.url },
        badge: data?.icon || defaultIcon,
        body: htmlToText(data?.body) ?? "",
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

function htmlToText(html) {
  // Function to handle links
  function handleLinks(match, p1, p2) {
    return `[${p2}](${p1})`;
  }

  // Function to handle unordered lists
  function handleUnorderedList(match, p1) {
    return (
      "\n" +
      p1
        .split("</li>")
        .map((item) => {
          return item.replace(/<li[^>]*>/g, "• ").trim();
        })
        .join("\n")
    );
  }

  // Function to handle ordered lists
  function handleOrderedList(match, p1) {
    let index = 1;
    return (
      "\n" +
      p1
        .split("</li>")
        .map((item) => {
          return item.replace(/<li[^>]*>/g, `${index++}. `).trim();
        })
        .join("\n")
    );
  }

  // Function to handle blockquotes
  function handleBlockquotes(match, p1) {
    return "\n“" + p1.trim().replace(/\n/g, "\n ") + "”\n";
  }

  // Function to handle paragraphs
  function handleParagraphs(match, p1) {
    return "\n" + p1.trim() + "\n";
  }

  // Replace links
  html = html.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, handleLinks);

  // Replace unordered lists
  html = html.replace(/<ul[^>]*>(.*?)<\/ul>/gs, handleUnorderedList);

  // Replace ordered lists
  html = html.replace(/<ol[^>]*>(.*?)<\/ol>/gs, handleOrderedList);

  // Replace blockquotes
  html = html.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gs, handleBlockquotes);

  // Replace paragraphs
  html = html.replace(/<p[^>]*>(.*?)<\/p>/gs, handleParagraphs);

  // Remove remaining HTML tags
  html = html.replace(/<\/?(\w+)(?:\s+[^>]+)?\s*>/g, "");

  return html.trim();
}

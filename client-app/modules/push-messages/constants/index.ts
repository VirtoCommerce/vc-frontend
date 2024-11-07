export const PUSH_MESSAGES_MODULE_ENABLED_KEY = "PushMessages.Enable";
export const PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY = "PushMessages.FCM.Enable";

export const SERVICE_WORKER_VERSION = "1.0.0"; // Have to be updated on every change in the service worker to avoid caching issues
export const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";
export const SERVICE_WORKER_PATH = "/fcm-service-worker.js";
export const DEFAULT_ICON_URL = "/static/icons/favicon-32x32.png";
export const PREFERRED_ICON_PROPERTIES = { type: "image/png", sizes: "32x32" };
export const SETTINGS_MAPPING = {
  "PushMessages.FcmReceiverOptions.ApiKey": "apiKey",
  "PushMessages.FcmReceiverOptions.AuthDomain": "authDomain",
  "PushMessages.FcmReceiverOptions.ProjectId": "projectId",
  "PushMessages.FcmReceiverOptions.StorageBucket": "storageBucket",
  "PushMessages.FcmReceiverOptions.MessagingSenderId": "messagingSenderId",
  "PushMessages.FcmReceiverOptions.AppId": "appId",
  "PushMessages.FcmReceiverOptions.VapidKey": "vapidKey",
} as const;

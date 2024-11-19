export const PUSH_MESSAGES_MODULE_ENABLED_KEY = "PushMessages.Enable";
export const PUSH_MESSAGES_MODULE_FCM_ENABLED_KEY = "PushMessages.FCM.Enable";

export const REGISTRATION_SCOPE = "/firebase-cloud-messaging-push-scope";
export const SERVICE_WORKER_PATH = "/fcm-service-worker-v1.js"; // NOTE: When updating the service worker, make sure to update the file name and this constant accordingly - example: fcm-service-worker-v2.js
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

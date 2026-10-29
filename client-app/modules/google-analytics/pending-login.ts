import { createPendingLogin } from "@/core/utilities/analytics/pending-login";
import { sendEvent } from "./utils";

const PENDING_LOGIN_KEY = "vc-google-analytics-pending-login";

export const { deferLogin, sendPendingLogin } = createPendingLogin({
  storageKey: PENDING_LOGIN_KEY,
  send: (method, params) => sendEvent("login", { ...params, method }),
});

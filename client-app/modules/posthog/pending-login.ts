import { createPendingLogin } from "@/core/utilities/analytics/pending-login";
import { capture } from "./client";
import { PENDING_LOGIN_STORAGE_KEY } from "./constants";

export const { deferLogin, sendPendingLogin } = createPendingLogin({
  storageKey: PENDING_LOGIN_STORAGE_KEY,
  send: (method, params) => capture("login", { ...params, method }),
});

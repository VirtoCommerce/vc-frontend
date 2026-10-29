import { createAnalyticsEvents } from "@/core/utilities/analytics/events";
import { DEBUG_PREFIX } from "./constants";
import { deferLogin } from "./pending-login";
import { sendEvent } from "./utils";

export const events = createAnalyticsEvents({
  send: (eventName, params) => sendEvent(eventName, params),
  deferLogin,
  debugPrefix: DEBUG_PREFIX,
});

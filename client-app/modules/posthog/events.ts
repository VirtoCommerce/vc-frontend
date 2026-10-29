import { createAnalyticsEvents } from "@/core/utilities/analytics/events";
import { capture } from "./client";
import { DEBUG_PREFIX } from "./constants";
import { deferLogin } from "./pending-login";

export const events = createAnalyticsEvents({ send: capture, deferLogin, debugPrefix: DEBUG_PREFIX });

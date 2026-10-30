import { Logger } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import type { PostHog } from "posthog-js";

type PendingCaptureType = [eventName: string, properties: Record<string, unknown> | undefined];

/** Enough for a page's worth of early events; past it the oldest go, so a failed SDK load cannot grow memory. */
const PENDING_CAPTURES_LIMIT = 50;

let client: PostHog | undefined;
let isUnavailable = false;
let pendingCaptures: PendingCaptureType[] = [];

export function setClient(instance: PostHog | undefined): void {
  client = instance;
  isUnavailable = false;
  if (!instance) {
    pendingCaptures = [];
  }
}

/** The SDK will not come (its chunk failed to load): the tracker stays on the bus, its captures are dropped. */
export function markUnavailable(): void {
  isUnavailable = true;
  pendingCaptures = [];
}

export function getClient(): PostHog | undefined {
  return client;
}

/**
 * Before the SDK is up the event is kept, not dropped: the tracker is registered as soon as the module settings
 * allow it, so events of the first render (a form opened on a direct page load) reach PostHog once `init` is done.
 */
export function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (client) {
    client.capture(eventName, properties);
    return;
  }

  if (isUnavailable) {
    return;
  }

  Logger.debug(DEBUG_PREFIX, "queued until the SDK is ready", eventName, properties);
  pendingCaptures.push([eventName, properties]);
  if (pendingCaptures.length > PENDING_CAPTURES_LIMIT) {
    pendingCaptures.shift();
  }
}

/** Called once the client is set and the identity applied, so the kept events go out under the right person. */
export function flushPendingCaptures(): void {
  const captures = pendingCaptures;
  pendingCaptures = [];
  captures.forEach(([eventName, properties]) => capture(eventName, properties));
}

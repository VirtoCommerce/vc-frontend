import { Logger } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import type { PostHog } from "posthog-js";

let client: PostHog | undefined;

export function setClient(instance: PostHog | undefined): void {
  client = instance;
}

export function getClient(): PostHog | undefined {
  return client;
}

export function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (client) {
    client.capture(eventName, properties);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, properties);
  }
}

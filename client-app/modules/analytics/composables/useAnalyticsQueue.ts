import { createGlobalState } from "@vueuse/core";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { globals } from "@/core/globals";
import { getCustomerIdentity } from "@/core/utilities/analytics/identity";
import { Logger } from "@/core/utilities/logger";
import { useUser } from "@/shared/account/composables/useUser";
import { pushAnalyticsEvents } from "../api/graphql/mutations/pushAnalyticsEvents";
import {
  COLLECT_ANONYMOUS_KEY,
  COLLECTED_EVENTS,
  DEBUG_PREFIX,
  FLUSH_DELAY_MS,
  MAX_BATCH_SIZE,
  MAX_PROPERTIES_LENGTH,
  MAX_SEND_ATTEMPTS,
  MODULE_ID,
} from "../constants";
import { getSession } from "../session";
import { createId } from "../utils";
import type { InputAnalyticsEvent } from "../api/graphql/types";
import type { CaptureOptionsType } from "../types";

type QueuedEventType = { event: InputAnalyticsEvent; attempts: number };

function _useAnalyticsQueue() {
  const { isEnabled } = useModuleSettings(MODULE_ID);

  let queue: QueuedEventType[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let resolvePagePath = (): string => location.pathname;

  /** How the current page's path is read; the module passes one that hides what a URL must not leak. */
  function setPagePathResolver(resolver: () => string): void {
    resolvePagePath = resolver;
  }

  /**
   * The backend drops an event whose body is over its limit, so a long one goes without its item list: the totals
   * of a three-hundred-line cart addition are worth more than nothing.
   */
  function serializeProperties(properties: Record<string, unknown> = {}): string | undefined {
    const json = JSON.stringify(properties);

    if (json.length <= MAX_PROPERTIES_LENGTH) {
      return json;
    }

    const shortened = JSON.stringify({ ...properties, items: undefined, visible_items: undefined });

    return shortened.length <= MAX_PROPERTIES_LENGTH ? shortened : undefined;
  }

  /**
   * The identity is read now, not when the batch leaves: the backend compares it with the token of the request and
   * drops an event whose session has changed in between, instead of filing it under the new one.
   */
  function capture(eventName: string, properties?: Record<string, unknown>, options?: CaptureOptionsType): void {
    if (!COLLECTED_EVENTS.has(eventName)) {
      return;
    }

    const identity = getCustomerIdentity(useUser());

    if (!identity && !isEnabled(COLLECT_ANONYMOUS_KEY)) {
      return;
    }

    const serializedProperties = serializeProperties(properties);

    if (serializedProperties === undefined) {
      return;
    }

    queue.push({
      attempts: 0,
      event: {
        id: createId(),
        name: eventName,
        occurredAt: (options?.occurredAt ?? new Date()).toISOString(),
        userId: identity?.userId ?? "",
        organizationId: identity?.organizationId ?? "",
        properties: serializedProperties,
        context: JSON.stringify({
          ...getSession(resolvePagePath),
          // The session id travels once per request, not in every event.
          id: undefined,
          path: options?.path ?? resolvePagePath(),
          language: navigator.language,
          screen: `${screen.width}x${screen.height}`,
        }),
      },
    });

    if (queue.length >= MAX_BATCH_SIZE) {
      flush();
    } else {
      flushTimer ??= setTimeout(flush, FLUSH_DELAY_MS);
    }
  }

  function flush(): void {
    clearTimeout(flushTimer);
    flushTimer = undefined;

    if (!queue.length) {
      return;
    }

    const batch = queue.slice(0, MAX_BATCH_SIZE);
    queue = queue.slice(MAX_BATCH_SIZE);

    void send(batch);

    if (queue.length) {
      flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
    }
  }

  async function send(batch: QueuedEventType[]): Promise<void> {
    const isAuthenticated = batch.some(({ event }) => event.userId);

    try {
      await pushAnalyticsEvents({
        storeId: globals.storeId,
        sessionId: getSession(resolvePagePath).id,
        anonymousId: isAuthenticated ? undefined : globals.userId,
        events: batch.map(({ event }) => event),
      });
    } catch (e) {
      Logger.debug(DEBUG_PREFIX, "batch not delivered", e);

      // The event ids are kept, so a batch the backend did store before the failure is not stored twice.
      const retried = batch
        .map(({ event, attempts }) => ({ event, attempts: attempts + 1 }))
        .filter(({ attempts }) => attempts < MAX_SEND_ATTEMPTS);

      if (retried.length) {
        queue = [...retried, ...queue];
        flushTimer ??= setTimeout(flush, FLUSH_DELAY_MS);
      }
    }
  }

  return { capture, flush, setPagePathResolver };
}

export const useAnalyticsQueue = createGlobalState(_useAnalyticsQueue);

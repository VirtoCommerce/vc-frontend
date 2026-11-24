import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { PushAnalyticsEventsDocument } from "../../types";
import type { InputPushAnalyticsEvents } from "../../types";

/**
 * A failure is the caller's to log and never the visitor's to see, hence no error toast. `keepalive` lets the request
 * outlive the page, so the events of a tab being closed still arrive.
 */
export async function pushAnalyticsEvents(command: InputPushAnalyticsEvents): Promise<void> {
  await graphqlClient.mutate({
    mutation: PushAnalyticsEventsDocument,
    variables: { command },
    context: { ...SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT, fetchOptions: { keepalive: true } },
  });
}

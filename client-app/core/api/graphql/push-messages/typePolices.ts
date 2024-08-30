import type { FieldPolicy } from "@apollo/client/core";

export const pushMessagesTypePolices = {
  pushMessages: {
    keyArgs: (args) =>
      args?.after
        ? ["withHidden", "unreadOnly", "after", "first", "cultureName"]
        : ["withHidden", "unreadOnly", "after", "first"],
    merge(existing, incoming) {
      return { ...existing, ...incoming };
    },
  } as FieldPolicy,
};
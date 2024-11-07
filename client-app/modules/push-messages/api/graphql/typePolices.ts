import type { FieldPolicy } from "@apollo/client/core";

export const pushMessagesTypePolices = {
  Query: {
    fields: {
      pushMessages: {
        keyArgs: (args) =>
          args?.after
            ? ["withHidden", "unreadOnly", "after", "first", "cultureName"]
            : ["withHidden", "unreadOnly", "after", "first"],
        merge(existing: object, incoming: object) {
          return { ...existing, ...incoming };
        },
      } as FieldPolicy,
    },
  },
};

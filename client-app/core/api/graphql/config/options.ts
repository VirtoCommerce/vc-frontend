import type { ApolloClientOptions, NormalizedCacheObject } from "@apollo/client/core";

export const options: Partial<ApolloClientOptions<NormalizedCacheObject>> = {
  clientAwareness: {
    name: "x-api-graphql-client",
  },

  // Off under vitest: its dev-only hint arms a 10 s timer per client that can fire after a spec's jsdom is gone.
  devtools: {
    enabled: import.meta.env.MODE !== "test",
  },
  assumeImmutableResults: true,
};

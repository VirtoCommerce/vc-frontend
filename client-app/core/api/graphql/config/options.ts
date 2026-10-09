import type { ApolloClientOptions, NormalizedCacheObject } from "@apollo/client/core";

export const options: Partial<ApolloClientOptions<NormalizedCacheObject>> = {
  clientAwareness: {
    name: "x-api-graphql-client",
  },

  devtools: {
    enabled: true,
  },
  assumeImmutableResults: true,
};

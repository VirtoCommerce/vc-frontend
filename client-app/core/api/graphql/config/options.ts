import type { ApolloClientOptions, NormalizedCacheObject } from "@apollo/client/core";

export const options: Partial<ApolloClientOptions<NormalizedCacheObject>> = {
  name: "x-api-graphql-client",

  connectToDevTools: true,
  assumeImmutableResults: true,
};

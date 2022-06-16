// Temporary solution before Nuxt3 migration to simplify code merging.
import client from "./xapi/graphql/graphql-client";

declare global {
  export function useNuxtApp(): {
    $graphqlClient: typeof client;
  };
}

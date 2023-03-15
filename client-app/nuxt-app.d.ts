// Temporary solution before Nuxt3 migration to simplify code merging.
import type { graphqlClient } from "@/xapi";

declare global {
  export function useNuxtApp(): {
    $graphqlClient: typeof graphqlClient;
  };
}

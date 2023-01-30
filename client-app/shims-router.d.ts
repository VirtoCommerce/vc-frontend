/**
 * https://router.vuejs.org/guide/advanced/meta.html#typescript
 */
export {};

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    layout?: "Main" | "Secure";
    requiresAuth?: boolean;
    requiresOrganization?: boolean;
    hideNavigation?: boolean;
  }
}

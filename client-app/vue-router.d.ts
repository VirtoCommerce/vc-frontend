/* eslint-disable @typescript-eslint/naming-convention */

/**
 * https://router.vuejs.org/guide/advanced/meta.html#typescript
 */
export {};

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** The type of layout used for the route. */
    layout?: "Main" | "Secure";

    /**
     * Allows anonymous access when the "Allow anonymous users
     * to visit the store" setting in the admin panel is disabled.
     */
    public?: boolean;

    /** The route requires authorization. */
    requiresAuth?: boolean;

    /** The route requires the user to be a member of the Organization. */
    requiresOrganization?: boolean;

    /** Hides the left sidebar of the route component. */
    hideLeftSidebar?: boolean;

    /** Hides the right sidebar of the route component. */
    hideRightSidebar?: boolean;

    /** Whether we got to the route with browser back button. */
    isBack?: boolean;
  }
}

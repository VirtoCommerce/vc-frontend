import { useUser } from "@/shared/account/composables/useUser";
import { StorefrontPermissions, XApiPermissions } from "../enums";
import type { App, Plugin } from "vue";

export const permissionsPlugin: Plugin = {
  install: (app: App) => {
    const { checkPermissions } = useUser();

    /**
     * Checking user permissions in component template
     * @example:
     *  <button v-if="$can('storefront:user:create', 'storefront:user:edit')">Add user</button>
     */
    app.config.globalProperties.$can = checkPermissions;

    /**
     * Inject storefront permissions to App instance
     * @example:
     *  <button :disabled="!$can($permissions.storefront.CanCreateUsers, $permissions.xApi.CanEditUsers)">Add user</button>
     */
    app.config.globalProperties.$permissions = {
      xApi: XApiPermissions,
      storefront: StorefrontPermissions,
    };
  },
};

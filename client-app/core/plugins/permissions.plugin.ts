import { App } from "vue";
import { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import { useUser } from "@/shared/account";

export default {
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

import { App } from "vue";
import { StorefrontPermissions } from "@/core/constants";
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
     *  <button :disabled="!$can($permissions.CanCreateUsers, $permissions.CanEditUsers)">Add user</button>
     */
    app.config.globalProperties.$permissions = StorefrontPermissions;
  },
};

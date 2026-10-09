import { useUser } from "@/shared/account";
import { PlatformPermissions, XApiPermissions } from "../enums";
import type { App, Plugin } from "vue";

export const permissionsPlugin: Plugin = {
  install: (app: App) => {
    const { checkPermissions } = useUser();

    /**
     * Checking user permissions in component template
     * @example:
     *  <button v-if="$can($permissions.xApi.CanInviteUsers)">Invite user</button>
     */
    app.config.globalProperties.$can = checkPermissions;

    /**
     * Inject permissions enums to App instance
     * @example:
     *  <button :disabled="!$can($permissions.xApi.CanEditOrganization)">Edit</button>
     */
    app.config.globalProperties.$permissions = {
      xApi: XApiPermissions,
      platform: PlatformPermissions,
    };
  },
};

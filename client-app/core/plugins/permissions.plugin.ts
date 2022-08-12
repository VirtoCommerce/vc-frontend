import { App, DirectiveBinding } from "vue";
import _ from "lodash";
import StorefrontPermissions from "@/core/permissions.enum";
import { useUser } from "@/shared/account";

export default {
  install: (app: App) => {
    const { checkPermissions } = useUser();

    /**
     * Checking user permissions in component template
     * @example:
     *  <button :disabled="!$can('storefront:user:create', 'storefront:user:edit')">Add user</button>
     */
    app.config.globalProperties.$can = checkPermissions;

    /**
     * Inject storefront permissions to App instance
     * @example:
     *  <button :disabled="!$can($permissions.CanCreateUsers, $permissions.CanEditUsers)">Add user</button>
     */
    app.config.globalProperties.$permissions = StorefrontPermissions;

    /**
     * Directive for hide html element
     * @example:
     *  <a v-can="'storefront:orders:view'">orders</a>
     *  <a v-can="$permissions.CanViewOrders">orders</a>
     *  <a v-can="[$permissions.CanViewOrders, $permissions.CanViewUsers]">orders</a>
     */
    app.directive(
      "can",
      (
        element: HTMLElement & { __hiddenElement?: Comment }, //
        binding: DirectiveBinding<string | string[]>
      ) => {
        let permissions: string | string[] = binding.value;

        if (_.isNil(permissions)) {
          return;
        }

        if (!_.isArray(permissions)) {
          permissions = [permissions];
        }

        const access: boolean = checkPermissions(...permissions);
        let hiddenElement = element.__hiddenElement;

        if (access) {
          hiddenElement?.parentNode?.replaceChild(element, hiddenElement);
          delete element.__hiddenElement;
        } else if (!hiddenElement) {
          hiddenElement = document.createComment(`v-can`);

          element.parentNode?.replaceChild(hiddenElement, element);
          element.__hiddenElement = hiddenElement;
        }
      }
    );
  },
};

import _Vue from "vue";
import { Store } from "vuex";
import { VNode } from "vue/types/umd";
import { IUser } from "core/api/api-clients";
import StorefrontPermissions from "libs/authorization/constants/permissions";
import { commentNode } from "../../../core/utilities/comment-node";
import profileModule from "../store/profile"

interface AuthorizationPluginOptions<S> {
  store: Store<S>;
  vuexNamespase?: string;
}

// export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
export function AuthorizationPlugin<S>(Vue: typeof _Vue, options?: AuthorizationPluginOptions<S>): void {

  // eslint-disable-next-line
  const store = options!.store;
  // eslint-disable-next-line
  const namespace = options!.vuexNamespase ? options!.vuexNamespase : "profileModule";
  store.registerModule(namespace, profileModule);

  /**
   * Inject all storefront permissions to Vue instance
   */
  Vue.prototype.$permissions = StorefrontPermissions;

  function checkUserPermissions(...permissions: string[]): boolean {
    const user = store.getters[`${namespace}/profile`] as IUser;
    let result = !!user.isAdministrator;
    if (!!user.permissions && user.permissions.length) {
      // eslint-disable-next-line
      result = permissions.every(p => user.permissions!.indexOf(p) > -1);
    }
    return result;
  }

  /**
   * Check permissions of user within Vue global object
   *  Component code:  Vue.$can('storefront:user:create', 'storefront:user:edit')
   */
  Vue.$can = checkUserPermissions;

  /**
   * Check permissions of user within Vue instance
   *  Component code:  this.$can(profile, 'storefront:user:create', 'storefront:user:edit')
   *  Template: <b-button v-if="$can('storefront:user:create', 'storefront:user:edit')">Add user</b-button>
   */
  Vue.prototype.$can = checkUserPermissions;

  /**
   * Directive for hide/disable html element.
   * Usage: <a v-can.disable="storefront:orders:view">orders</a>
   * modifiers: hide - hide element; disable - disable element.
   * default behavior is "Hide"
   */
  Vue.directive('can', (el, binding, vnode: VNode) => {
    const behavior = binding.modifiers.disable ? 'disable' : 'hide'
    let permissions = binding.value;
    if (!(permissions instanceof Array)) {
      permissions = [permissions];
    }
    // const profile = binding.value.user;
    const authResult = Vue.$can(...(permissions as Array<string>));
    if (!authResult) {
      if (behavior === 'hide') {
        commentNode(el, vnode)
      } else if (behavior === 'disable') {
        const inputEl = el as HTMLInputElement;
        if (inputEl) {
          inputEl.disabled = true
        }
      }
    }
  });

}





import { createGlobalState } from "@vueuse/core";
import { computed, shallowRef, toValue } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import type { Component, MaybeRefOrGetter } from "vue";

const MODAL_KEY = "shared.wishlists.add_or_update_wishlist_modal";

/**
 * One option of the list's "Sharing options" select, plus everything the rest of the wishlists domain needs to know
 * about that option. Modules contribute their own scopes through `registerSharingScope`, which keeps the scope value
 * — and any capability that only makes sense for it — on the provider's side of the boundary.
 */
export interface IWishlistSharingScopeType {
  /** The backend scope value. Owned by whoever contributes the scope; core never spells a contributed one out. */
  scope: string;
  /** i18n key of the option label. A module points this at its own locale file. */
  labelKey: string;
  /** i18n key of the status line shown to the list owner. Falls back to the generic "Shared". */
  statusKey?: string;
  /** Whether the list is reachable by its sharing link, so the owner can copy it. */
  supportsLink?: boolean;
  /** Whether someone viewing the shared list may add its items to their own cart. */
  shoppable?: boolean;
  /** Gate for offering the scope, e.g. a permission the provider owns. Defaults to available. */
  isAvailable?: MaybeRefOrGetter<boolean>;
  /** Controls rendered in the list settings modal while this scope is selected. */
  element?: Component;
}

/** Context handed to a scope's `onSaved` once the list itself is persisted. */
export type WishlistSharingScopeSavedContextType = {
  listName: string;
  sharingLink: string;
};

/**
 * The contract a scope's `element` exposes (via `defineExpose`) so the modal can fold per-scope input into its single
 * save. It has to come from the rendered instance rather than the registration object, because the registry is a
 * global populated at module init while the state these depend on (a selected target, a message) is per-open.
 */
export interface IWishlistSharingScopeControlsType {
  /** Blocks Save while the scope's own input is incomplete. */
  canSave?: boolean;
  /** True when the scope's own state changed, so Save stays enabled even if the core form is untouched. */
  dirty?: boolean;
  /** Contribution to the create/change command. */
  payload?: { sharedWithId?: string };
  /** Runs after a successful save. Must handle its own failures — the list is already persisted by then. */
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}

// Scopes core owns outright. `shoppable` stays off for them: making an existing link- or organization-shared list
// suddenly add-to-cart-able is a product decision, not a side effect of moving the Customer scope out of core.
const CORE_SHARING_SCOPES: IWishlistSharingScopeType[] = [
  {
    scope: WishlistScopeType.Private,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.Private}`,
  },
  {
    scope: WishlistScopeType.AnyoneAnonymous,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.AnyoneAnonymous}`,
    supportsLink: true,
  },
  {
    scope: WishlistScopeType.Organization,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.Organization}`,
    supportsLink: true,
  },
];

function _useWishlistSharingScopes() {
  const contributed = shallowRef<IWishlistSharingScopeType[]>([]);

  function registerSharingScope(scope: IWishlistSharingScopeType): void {
    if (contributed.value.some((registered) => registered.scope === scope.scope)) {
      return;
    }

    // Replace rather than push: a shallowRef only tracks assignment to `.value`.
    contributed.value = [...contributed.value, scope];
  }

  const sharingScopes = computed<IWishlistSharingScopeType[]>(() => [...CORE_SHARING_SCOPES, ...contributed.value]);

  /** Resolves a persisted scope value even when it is currently unavailable, so a saved list still reads correctly. */
  function getSharingScope(scope?: string | null): IWishlistSharingScopeType | undefined {
    return scope ? sharingScopes.value.find((candidate) => candidate.scope === scope) : undefined;
  }

  function isSharingScopeAvailable(scope: IWishlistSharingScopeType): boolean {
    return toValue(scope.isAvailable ?? true);
  }

  return { sharingScopes, registerSharingScope, getSharingScope, isSharingScopeAvailable };
}

export const useWishlistSharingScopes = createGlobalState(_useWishlistSharingScopes);

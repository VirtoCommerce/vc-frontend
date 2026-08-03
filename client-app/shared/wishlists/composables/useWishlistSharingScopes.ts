import { createGlobalState } from "@vueuse/core";
import { computed, shallowRef, toValue } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import type { Component, MaybeRefOrGetter } from "vue";

const MODAL_KEY = "shared.wishlists.add_or_update_wishlist_modal";

/** An option of the list's "Sharing options" select. Modules contribute their own through `registerSharingScope`. */
export interface IWishlistSharingScopeType {
  scope: string;
  labelKey: string;
  /** Status line for the list owner; falls back to the generic "Shared". */
  statusKey?: string;
  supportsLink?: boolean;
  shoppable?: boolean;
  /** Defaults to available. */
  isAvailable?: MaybeRefOrGetter<boolean>;
  element?: Component;
}

export type WishlistSharingScopeSavedContextType = {
  listName: string;
  sharingLink: string;
};

/**
 * What a scope's `element` exposes so the modal can fold per-scope input into its single save. Comes from the rendered
 * instance rather than the registration object: the registry is a global filled at module init, while the state these
 * depend on is per-open.
 */
export interface IWishlistSharingScopeControlsType {
  canSave?: boolean;
  /** The core form cannot see per-scope input, so a scope reports its own changes. */
  dirty?: boolean;
  payload?: { sharedWithId?: string };
  /** Must handle its own failures — the list is already persisted by then. */
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}

// `shoppable` stays off for core's own scopes: opening up existing link- and organization-shared lists is a product
// decision, not a side effect of moving the Customer scope out of core.
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

  /** Resolves a scope even when it is currently unavailable, so a saved list still reads correctly. */
  function getSharingScope(scope?: string | null): IWishlistSharingScopeType | undefined {
    return scope ? sharingScopes.value.find((candidate) => candidate.scope === scope) : undefined;
  }

  function isSharingScopeAvailable(scope: IWishlistSharingScopeType): boolean {
    return toValue(scope.isAvailable ?? true);
  }

  return { sharingScopes, registerSharingScope, getSharingScope, isSharingScopeAvailable };
}

export const useWishlistSharingScopes = createGlobalState(_useWishlistSharingScopes);

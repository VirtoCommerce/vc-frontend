import { createGlobalState } from "@vueuse/core";
import { computed, shallowRef, toValue } from "vue";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { Logger } from "@/core/utilities";
import type { ChangeWishlistPayloadType } from "@/core/types";
import type { Component, MaybeRef, MaybeRefOrGetter } from "vue";

const MODAL_KEY = "shared.wishlists.add_or_update_wishlist_modal";
export const UNORDERED_SCOPE_POSITION = Number.MAX_SAFE_INTEGER;

/** An option of the list's "Sharing options" select. Modules contribute their own through `registerSharingScope`. */
export interface IWishlistSharingScopeType {
  scope: string;
  labelKey: string;
  /** Status line for the list owner; falls back to the generic "Shared". */
  statusKey?: string;
  /** Glyph shown on the scope's tab in the share dialog. */
  icon?: string;
  /** Position among the tabs, ascending; scopes that declare none come last. */
  order?: number;
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

/** What a scope may contribute to the list's write command, mirroring the fields of `changeWishlist`. */
export type WishlistSharingScopePayloadType = Pick<
  ChangeWishlistPayloadType,
  "sharedWithId" | "addSharedWithIds" | "removeSharedWithIds" | "message"
>;

/**
 * What a scope's `element` passes to `defineExpose`. Typing the raw side is what makes the contract checkable at the
 * contributor's end; the modal reads it through Vue's expose proxy, which unwraps every ref.
 */
export interface IWishlistSharingScopeExposeType {
  canSave?: MaybeRef<boolean>;
  dirty?: MaybeRef<boolean>;
  payload?: MaybeRef<WishlistSharingScopePayloadType>;
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}

/**
 * The same contract as the modal sees it, with the refs already unwrapped. Comes from the rendered instance rather
 * than the registration object: the registry is a global filled at module init, while the state these depend on is
 * per-open.
 */
export interface IWishlistSharingScopeControlsType {
  canSave?: boolean;
  /** The core form cannot see per-scope input, so a scope reports its own changes. */
  dirty?: boolean;
  payload?: WishlistSharingScopePayloadType;
  /** Must handle its own failures — the list is already persisted by then. */
  onSaved?: (context: WishlistSharingScopeSavedContextType) => Promise<void> | void;
}

// `shoppable` stays off for core's own scopes: opening up existing link- and organization-shared lists is a product
// decision, not a side effect of moving the Customer scope out of core.
const CORE_SHARING_SCOPES: IWishlistSharingScopeType[] = [
  {
    scope: WishlistScopeType.Private,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.Private}`,
    icon: "hat-glasses",
    order: 10,
  },
  {
    scope: WishlistScopeType.AnyoneAnonymous,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.AnyoneAnonymous}`,
    icon: "link",
    order: 40,
    supportsLink: true,
  },
  {
    scope: WishlistScopeType.Organization,
    labelKey: `${MODAL_KEY}.sharing_scope.${WishlistScopeType.Organization}`,
    icon: "briefcase-business",
    order: 20,
    supportsLink: true,
  },
];

function _useWishlistSharingScopes() {
  const contributed = shallowRef<IWishlistSharingScopeType[]>([]);

  function registerSharingScope(scope: IWishlistSharingScopeType): void {
    // Core's own scopes count as taken too: a duplicate value would render two tabs sharing one radio group, and
    // `getSharingScope` would resolve whichever sorted first.
    const isTaken =
      CORE_SHARING_SCOPES.some((registered) => registered.scope === scope.scope) ||
      contributed.value.some((registered) => registered.scope === scope.scope);

    if (isTaken) {
      Logger.warn(`useWishlistSharingScopes: the sharing scope "${scope.scope}" is already registered; ignoring.`);

      return;
    }

    // Replace rather than push: a shallowRef only tracks assignment to `.value`.
    contributed.value = [...contributed.value, scope];
  }

  const sharingScopes = computed<IWishlistSharingScopeType[]>(() =>
    [...CORE_SHARING_SCOPES, ...contributed.value].sort(
      (a, b) => (a.order ?? UNORDERED_SCOPE_POSITION) - (b.order ?? UNORDERED_SCOPE_POSITION),
    ),
  );

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

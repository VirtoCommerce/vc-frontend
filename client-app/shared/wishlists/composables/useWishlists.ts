import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@core/utilities";
import { InputAddWishlistItemType, InputRemoveWishlistItemType, WishlistType } from "@core/api/graphql/types";
import { addWishlist, addWishlistItem, getWishlists, removeWishlistItem } from "@core/api/graphql/wishlists";
import { sortAscending } from "@core/constants";

export default function useWishlists() {
  const loading = ref(true);
  const lists = shallowRef<WishlistType[]>([]);

  async function createWishlist(name: string) {
    loading.value = true;

    try {
      await addWishlist(name);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${createWishlist.name}`, e);
      throw e;
    }

    await fetchWishlists();
  }

  async function fetchWishlists() {
    loading.value = true;

    try {
      const { items = [] } = await getWishlists({ itemsPerPage: 9999, sort: `name:${sortAscending}` });

      lists.value = items;

      if (!items.length) {
        // create default list
        await createWishlist("My wish list");
      }
    } catch (e) {
      Logger.error(`${useWishlists.name}.${fetchWishlists.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addItemsToWishlists(payloads: InputAddWishlistItemType[]) {
    loading.value = true;

    // TODO: Use single query
    for (const payload of payloads) {
      try {
        await addWishlistItem(payload);
      } catch (e) {
        Logger.error(`${useWishlists.name}.${addItemsToWishlists.name}`, e);
        throw e;
      }
    }

    await fetchWishlists();
  }

  async function removeItemsFromWishlists(payloads: InputRemoveWishlistItemType[]) {
    loading.value = true;

    // TODO: Use single query
    for (const payload of payloads) {
      try {
        await removeWishlistItem(payload);
      } catch (e) {
        Logger.error(`${useWishlists.name}.${removeItemsFromWishlists.name}`, e);
        throw e;
      }
    }

    await fetchWishlists();
  }

  return {
    fetchWishlists,
    createWishlist,
    addItemsToWishlists,
    removeItemsFromWishlists,
    loading: readonly(loading),
    lists: computed(() => lists.value),
  };
}

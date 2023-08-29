import { computed, readonly, ref, shallowRef } from "vue";
import {
  addWishlist,
  addWishlistBulkItem,
  deleteWishlist,
  deleteWishlistItem,
  getWishList,
  getWishlists,
  updateWishlistItems,
  renameWishlist as _renameWishlist,
} from "@/core/api/graphql/account";
import { SortDirection } from "@/core/enums";
import { Logger, asyncForEach } from "@/core/utilities";
import type {
  InputAddWishlistBulkItemType,
  InputRemoveWishlistItemType,
  InputRenameWishlistType,
  InputUpdateWishlistItemsType,
  WishlistType,
} from "@/core/api/graphql/types";
import type { Ref } from "vue";

const loading = ref(true);
const lists = shallowRef<WishlistType[]>([]);
const list: Ref<WishlistType | undefined> = ref();

const DEFAULT_WISHLIST_NAME = "My wish list";

export function useWishlists(options: { autoRefetch: boolean } = { autoRefetch: true }) {
  async function createWishlist(name: string): Promise<string | undefined> {
    let newList: WishlistType;
    loading.value = true;

    try {
      newList = await addWishlist(name);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${createWishlist.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }

    return newList.id;
  }

  async function fetchWishlists() {
    loading.value = true;

    try {
      const searchParams = { itemsPerPage: 9999, sort: `name:${SortDirection.Ascending}` };

      lists.value = (await getWishlists(searchParams)).items || [];

      if (!lists.value.length) {
        // create default list
        await createWishlist(DEFAULT_WISHLIST_NAME);
        lists.value = (await getWishlists(searchParams)).items || [];
      }
    } catch (e) {
      Logger.error(`${useWishlists.name}.${fetchWishlists.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWishList(listId: string) {
    loading.value = true;

    try {
      list.value = await getWishList(listId);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${fetchWishList.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function renameWishlist(payload: InputRenameWishlistType) {
    loading.value = true;

    try {
      await _renameWishlist(payload);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${renameWishlist.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }

    if (list.value) {
      await fetchWishList(list.value.id!);
    }
  }

  async function removeWishlist(listId: string): Promise<boolean> {
    let result = false;

    loading.value = true;

    try {
      result = await deleteWishlist(listId);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${removeWishlist.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }

    return result;
  }

  async function addItemsToWishlists(payloads: InputAddWishlistBulkItemType) {
    loading.value = true;

    try {
      await addWishlistBulkItem(payloads);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${addItemsToWishlists.name}`, e);
      throw e;
    }

    loading.value = false;
  }

  async function removeItemsFromWishlists(payload: InputRemoveWishlistItemType[]) {
    loading.value = true;

    // TODO: Use single query
    await asyncForEach(payload, async (item) => {
      try {
        await deleteWishlistItem(item);
      } catch (e) {
        Logger.error(`${useWishlists.name}.${removeItemsFromWishlists.name}`, e);
        throw e;
      }
    });

    loading.value = false;
  }

  async function updateItemsInWishlist(payload: InputUpdateWishlistItemsType): Promise<void> {
    loading.value = true;

    try {
      await updateWishlistItems(payload);
      await fetchWishList(payload.listId);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${updateItemsInWishlist.name}`, e);
    } finally {
      loading.value = false;
    }
  }

  function clearList() {
    list.value = undefined;
  }

  return {
    fetchWishlists,
    fetchWishList,
    createWishlist,
    renameWishlist,
    removeWishlist,
    addItemsToWishlists,
    updateItemsInWishlist,
    removeItemsFromWishlists,
    clearList,
    loading: readonly(loading),
    lists: computed(() => lists.value),
    list: computed(() => list.value),
  };
}

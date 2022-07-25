import { computed, readonly, Ref, ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import {
  InputAddWishlistItemType,
  InputRemoveWishlistItemType,
  InputRenameWishlistType,
  WishlistType,
} from "@/xapi/types";
import {
  addWishlist,
  addWishlistItem,
  getWishlists,
  deleteWishlist,
  deleteWishlistItem,
  renameWishlist as _renameWishlist,
  getWishList,
} from "@/xapi/graphql/account";
import { SORT_ASCENDING } from "@/core/constants";

const loading = ref(true);
const lists = shallowRef<WishlistType[]>([]);
const list: Ref<WishlistType | null> = ref(null);

export default function useWishlists(options: { autoRefetch: boolean } = { autoRefetch: true }) {
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

  async function createWishlistAndAddProduct(name: string, productId: string) {
    loading.value = true;

    try {
      const newList = await addWishlist(name);
      if (!newList.id) {
        console.error(`${useWishlists.name}.${createWishlistAndAddProduct.name}`, 'newList.id error');
      } else {
        await addItemsToWishlists([{ listId: newList.id, productId }]);
      }
    } catch (e) {
      Logger.error(`${useWishlists.name}.${createWishlistAndAddProduct.name}`, e);
      throw e;
    }
  }

  async function fetchWishlists() {
    loading.value = true;

    try {
      const { items = [] } = await getWishlists({ itemsPerPage: 9999, sort: `name:${SORT_ASCENDING}` });

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

    if (options.autoRefetch) {
      await fetchWishlists();
    }
  }

  async function removeItemsFromWishlists(payloads: InputRemoveWishlistItemType[]) {
    loading.value = true;

    // TODO: Use single query
    for (const payload of payloads) {
      try {
        await deleteWishlistItem(payload);
      } catch (e) {
        Logger.error(`${useWishlists.name}.${removeItemsFromWishlists.name}`, e);
        throw e;
      }
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }
  }

  function clearList() {
    list.value = null;
  }

  return {
    fetchWishlists,
    fetchWishList,
    createWishlist,
    createWishlistAndAddProduct,
    renameWishlist,
    removeWishlist,
    addItemsToWishlists,
    removeItemsFromWishlists,
    clearList,
    loading: readonly(loading),
    lists: computed(() => lists.value),
    list: computed(() => list.value),
  };
}

import { computed, readonly, ref, shallowRef } from "vue";
import {
  addWishlist,
  addWishlistBulkItem,
  changeWishlist,
  deleteWishlist,
  deleteWishlistItem,
  getWishList,
  getWishlists,
  updateWishlistItems,
} from "@/core/api/graphql/account";
import { SortDirection } from "@/core/enums";
import { Logger, asyncForEach } from "@/core/utilities";
import type {
  InputAddWishlistBulkItemType,
  InputRemoveWishlistItemType,
  InputUpdateWishlistItemsType,
  WishlistType,
} from "@/core/api/graphql/types";
import type { ChangeWishlistPayloadType, CreateWishlistPayloadType } from "@/core/types";
import type { Ref } from "vue";

const loading = ref(true);
const lists = shallowRef<WishlistType[]>([]);
const list: Ref<WishlistType | undefined> = ref();

export function useWishlists(options: { autoRefetch: boolean } = { autoRefetch: true }) {
  async function createWishlist(payload: CreateWishlistPayloadType): Promise<string | undefined> {
    let newList: WishlistType;
    loading.value = true;

    try {
      newList = await addWishlist(payload);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${createWishlist.name}`, e);
      throw e;
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }

    return newList.id;
  }

  async function updateWishlist(payload: ChangeWishlistPayloadType): Promise<void> {
    loading.value = true;

    try {
      list.value = await changeWishlist(payload);
    } catch (e) {
      Logger.error(`${useWishlists.name}.${updateWishlist.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    if (options.autoRefetch) {
      await fetchWishlists();
    }
  }

  async function fetchWishlists(): Promise<void> {
    loading.value = true;

    try {
      const searchParams = { itemsPerPage: 9999, sort: `name:${SortDirection.Ascending}` };

      lists.value = (await getWishlists(searchParams)).items || [];
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

  return {
    fetchWishlists,
    fetchWishList,
    createWishlist,
    removeWishlist,
    addItemsToWishlists,
    updateWishlist,
    updateItemsInWishlist,
    removeItemsFromWishlists,
    loading: readonly(loading),
    lists: computed(() => lists.value),
    list: computed(() => list.value),
  };
}

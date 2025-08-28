import { ref } from "vue";
import { moveFromSavedForLater as moveFromSavedForLaterMutate } from "@/core/api/graphql/cart/mutations/moveFromSavedForLater";
import { moveToSavedForLater as moveToSavedForLaterMutate } from "@/core/api/graphql/cart/mutations/moveToSavedForLater";
import { getSavedForLater as getSavedForLaterQuery } from "@/core/api/graphql/cart/queries/getSavedForLater";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";

export function useSavedForLater() {
  const savedForLaterList = ref<SavedForLaterListFragment>();

  async function moveToSavedForLater(cartId: string, itemIds: string[]) {
    const moveResult = await moveToSavedForLaterMutate(cartId, itemIds);
    savedForLaterList.value = moveResult?.list;
  }

  async function moveFromSavedForLater(cartId: string, itemIds: string[]) {
    const moveResult = await moveFromSavedForLaterMutate(cartId, itemIds);
    savedForLaterList.value = moveResult?.list;
  }

  async function getSavedForLater() {
    savedForLaterList.value = await getSavedForLaterQuery();
  }

  return {
    savedForLaterList,

    moveToSavedForLater,
    moveFromSavedForLater,
    getSavedForLater,
  };
}

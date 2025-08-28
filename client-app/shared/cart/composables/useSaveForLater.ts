import { useMutation } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { ref, computed } from "vue";
import { getSavedForLater as getSavedForLaterQuery } from "@/core/api/graphql/cart/queries/getSavedForLater";
import {
  MoveToSavedForLaterDocument,
  MoveFromSavedForLaterDocument
  
} from "@/core/api/graphql/types";
import { useMutationBatcher } from "@/core/composables/useMutationBatcher";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type {SavedForLaterListFragment} from "@/core/api/graphql/types";

function _useSavedForLater() {
  const { storeId, currencyCode, cultureName, userId } = globals;

  const savedForLaterList = ref<SavedForLaterListFragment>();

  const { mutate: _moveToSavedForLater, loading: _moveToSavedForLaterLoading } =
    useMutation(MoveToSavedForLaterDocument);

  const {
    add: _moveToSavedForLaterBatched,
    overflowed: moveToSavedForLaterOverflowed,
    loading: _moveToSavedForLaterBatchedLoading,
  } = useMutationBatcher(_moveToSavedForLater);

  async function moveToSavedForLater(cartId: string, itemIds: string[]) {
    try {
      const moveResult = await _moveToSavedForLaterBatched({
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          cartId,
          lineItemIds: itemIds,
        },
      });

      savedForLaterList.value = moveResult?.data?.moveToSavedForLater?.list;
    } catch (err) {
      Logger.error(err as string);
    }
  }

  const { mutate: _moveFromSavedForLater, loading: _moveFromSavedForLaterLoading } =
    useMutation(MoveFromSavedForLaterDocument);

  const {
    add: _moveFromSavedForLaterBatched,
    overflowed: moveFromSavedForLaterOverflowed,
    loading: _moveFromSavedForLaterBatchedLoading,
  } = useMutationBatcher(_moveFromSavedForLater);

  async function moveFromSavedForLater(cartId: string, itemIds: string[]) {
    try {
      const moveResult = await _moveFromSavedForLaterBatched({
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          cartId,
          lineItemIds: itemIds,
        },
      });

      savedForLaterList.value = moveResult?.data?.moveFromSavedForLater?.list;
    } catch (err) {
      Logger.error(err as string);
    }
  }

  async function getSavedForLater() {
    savedForLaterList.value = await getSavedForLaterQuery();
  }

  return {
    savedForLaterList,

    moveToSavedForLater,
    moveToSavedForLaterOverflowed,
    moveFromSavedForLater,
    moveFromSavedForLaterOverflowed,
    getSavedForLater,

    loading: computed(
      () =>
        _moveToSavedForLaterLoading.value ||
        _moveToSavedForLaterBatchedLoading.value ||
        _moveFromSavedForLaterLoading.value ||
        _moveFromSavedForLaterBatchedLoading.value,
    ),
  };
} 

export const useSavedForLater = createSharedComposable(_useSavedForLater);

import { ApolloError } from "@apollo/client/core";
import { useMutation } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { ref, computed } from "vue";
import { AbortReason } from "@/core/api/common/enums";
import { getSavedForLater as getSavedForLaterQuery } from "@/core/api/graphql/cart/queries/getSavedForLater";
import { MoveToSavedForLaterDocument, MoveFromSavedForLaterDocument } from "@/core/api/graphql/types";
import { useMutationBatcher } from "@/core/composables/useMutationBatcher";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useFullCart } from "@/shared/cart";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";

function _useSavedForLater() {
  const { storeId, currencyCode, cultureName, userId } = globals;

  const { cart } = useFullCart();

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
      const moveResult = await _moveToSavedForLaterBatched(
        {
          command: {
            storeId,
            userId,
            cultureName,
            currencyCode,
            cartId,
            lineItemIds: itemIds,
          },
        },
        {
          optimisticResponse: {
            moveToSavedForLater: {
              cart: {
                ...cart.value!,
                items: cart.value!.items.filter((item) => !itemIds.includes(item.id)),
              },
              list: savedForLaterList.value,
            },
          },
        },
      );

      savedForLaterList.value = moveResult?.data?.moveToSavedForLater?.list;
    } catch (err) {
      if (err instanceof ApolloError && err.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(`useSavedForLater.${moveToSavedForLater.name}`, err);
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
      const moveResult = await _moveFromSavedForLaterBatched(
        {
          command: {
            storeId,
            userId,
            cultureName,
            currencyCode,
            cartId,
            lineItemIds: itemIds,
          },
        },
        {
          optimisticResponse: {
            moveFromSavedForLater: {
              cart: cart.value,
              list: {
                ...savedForLaterList.value!,
                items: savedForLaterList.value!.items.filter((item) => !itemIds.includes(item.id)),
              },
            },
          },
        },
      );

      savedForLaterList.value = moveResult?.data?.moveFromSavedForLater?.list;
    } catch (err) {
      if (err instanceof ApolloError && err.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(`useSavedForLater.${moveFromSavedForLater.name}`, err);
    }
  }

  async function getSavedForLater() {
    try {
      savedForLaterList.value = await getSavedForLaterQuery();
    } catch (err) {
      Logger.error(`useSavedForLater.${getSavedForLater.name}`, err);
    }
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

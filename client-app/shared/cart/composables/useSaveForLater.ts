import { ApolloError } from "@apollo/client/core";
import { useMutation, useLazyQuery } from "@vue/apollo-composable";
import { createSharedComposable } from "@vueuse/core";
import { computed } from "vue";
import { AbortReason } from "@/core/api/common/enums";
import {
  MoveToSavedForLaterDocument,
  MoveFromSavedForLaterDocument,
  GetSavedForLaterDocument,
} from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useFullCart } from "@/shared/cart";

function _useSavedForLater() {
  const { storeId, currencyCode, cultureName, userId } = globals;

  const { cart } = useFullCart();

  const savedForLaterList = computed(() => _savedForLaterQueryResult.value?.getSavedForLater);

  const {
    load: getSavedForLater,
    loading: _getSavedForLaterLoading,
    result: _savedForLaterQueryResult,
  } = useLazyQuery(
    GetSavedForLaterDocument,
    {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-first",
    },
  );

  const { mutate: _moveToSavedForLater, loading: _moveToSavedForLaterLoading } = useMutation(
    MoveToSavedForLaterDocument,
    {
      optimisticResponse(vars, { IGNORE }) {
        const movedItemIds = vars.command?.lineItemIds;

        if (!movedItemIds?.length || !cart.value || !savedForLaterList.value) {
          return IGNORE;
        }

        return {
          moveToSavedForLater: {
            cart: {
              ...cart.value,
              items: cart.value.items.filter((item) => !movedItemIds.includes(item.id)),
            },
            list: savedForLaterList.value,
          },
        };
      },
    },
  );

  async function moveToSavedForLater(cartId: string, itemIds: string[]) {
    try {
      await _moveToSavedForLater({
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          cartId,
          lineItemIds: itemIds,
        },
      });
    } catch (err) {
      if (err instanceof ApolloError && err.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(`useSavedForLater.${moveToSavedForLater.name}`, err);
    }
  }

  const { mutate: _moveFromSavedForLater, loading: _moveFromSavedForLaterLoading } = useMutation(
    MoveFromSavedForLaterDocument,
    {
      optimisticResponse(vars, { IGNORE }) {
        const movedItemIds = vars.command?.lineItemIds;

        if (!movedItemIds?.length || !cart.value || !savedForLaterList.value) {
          return IGNORE;
        }

        return {
          moveFromSavedForLater: {
            cart: cart.value,
            list: {
              ...savedForLaterList.value,
              items: savedForLaterList.value.items.filter((item) => !movedItemIds.includes(item.id)),
            },
          },
        };
      },
    },
  );

  async function moveFromSavedForLater(cartId: string, itemIds: string[]) {
    try {
      await _moveFromSavedForLater({
        command: {
          storeId,
          userId,
          cultureName,
          currencyCode,
          cartId,
          lineItemIds: itemIds,
        },
      });
    } catch (err) {
      if (err instanceof ApolloError && err.networkError?.toString() === (AbortReason.Explicit as string)) {
        return;
      }
      Logger.error(`useSavedForLater.${moveFromSavedForLater.name}`, err);
    }
  }

  return {
    savedForLaterList,

    moveToSavedForLater,
    moveFromSavedForLater,
    getSavedForLater,

    loading: computed(
      () => _getSavedForLaterLoading.value || _moveToSavedForLaterLoading.value || _moveFromSavedForLaterLoading.value,
    ),
  };
}

export const useSavedForLater = createSharedComposable(_useSavedForLater);

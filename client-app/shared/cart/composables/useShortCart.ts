import { createSharedComposable } from "@vueuse/core";
import { sumBy } from "lodash";
import { computed } from "vue";
import {
  useGetShortCartQuery,
  useAddItemToCartMutation,
  useAddItemsCartMutation,
  useAddBulkItemsCartMutation,
  useChangeShortCartItemQuantityMutation,
} from "@/core/api/graphql";
import { getLineItemValidationErrorsGroupedBySKU } from "../utils";
import type { InputNewBulkItemType, InputNewCartItemType, ShortCartFragment } from "@/core/api/graphql/types";
import type { OutputBulkItemType } from "@/shared/cart/types";

function _useShortCart() {
  const { result: query, load, refetch, loading: queryLoading } = useGetShortCartQuery();
  const cart = computed(() => query.value?.cart);

  const { mutate: _addToCart, loading: addToCartLoading } = useAddItemToCartMutation();
  async function addToCart(productId: string, quantity: number): Promise<ShortCartFragment | undefined> {
    const result = await _addToCart({ command: { productId, quantity } });
    return result?.data?.addItem;
  }

  const { mutate: _addItemsToCart, loading: addItemsToCartLoading } = useAddItemsCartMutation();
  async function addItemsToCart(items: InputNewCartItemType[]): Promise<ShortCartFragment | undefined> {
    const result = await _addItemsToCart({ command: { cartItems: items } });
    return result?.data?.addItemsCart;
  }

  const { mutate: _addBulkItemsToCart, loading: addBulkItemsToCartLoading } = useAddBulkItemsCartMutation();
  async function addBulkItemsToCart(items: InputNewBulkItemType[]): Promise<OutputBulkItemType[]> {
    const result = await _addBulkItemsToCart({ command: { cartItems: items } });

    const errorsGroupBySKU = getLineItemValidationErrorsGroupedBySKU(result?.data?.addBulkItemsCart?.errors);

    return items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
      productSku,
      quantity,
      errors: errorsGroupBySKU[productSku],
    }));
  }

  const { mutate: _changeItemQuantity, loading: changeItemQuantityLoading } = useChangeShortCartItemQuantityMutation();
  async function changeItemQuantity(lineItemId: string, quantity: number): Promise<ShortCartFragment | undefined> {
    const result = await _changeItemQuantity({ command: { lineItemId, quantity } });
    return result?.data?.changeCartItemQuantity;
  }

  // FIXME: https://virtocommerce.atlassian.net/browse/ST-5474
  // Calculate total price of items in the cart for some set of products
  function getItemsTotal(productIds: string[]): number {
    if (!cart.value?.items?.length) {
      return 0;
    }

    const filteredItems = cart.value.items.filter((item) => productIds.includes(item.productId!));

    return sumBy(filteredItems, (x) => x.extendedPrice?.amount);
  }

  return {
    cart,
    load,
    refetch,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    getItemsTotal,
    loading: computed(
      () =>
        queryLoading.value ||
        addToCartLoading.value ||
        addItemsToCartLoading.value ||
        addBulkItemsToCartLoading.value ||
        changeItemQuantityLoading.value,
    ),
  };
}

export const useShortCart = createSharedComposable(_useShortCart);

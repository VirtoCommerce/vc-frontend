import { createSharedComposable } from "@vueuse/core";
import { sumBy } from "lodash";
import { computed } from "vue";
import { useAddBulkItemsCartMutation } from "@/core/api/graphql/cart/mutations/addBulkItemsCart";
import { useAddItemToCartMutation } from "@/core/api/graphql/cart/mutations/addItemToCart";
import { useAddItemsCartMutation } from "@/core/api/graphql/cart/mutations/addItemsCart";
import { useChangeShortCartItemQuantityMutation } from "@/core/api/graphql/cart/mutations/changeShortCartItemQuantity";
import { useGetShortCartQuery } from "@/core/api/graphql/cart/queries/getShortCart";
import { ValidationErrorObjectType } from "@/core/enums";
import type { ShortCartFragment } from "@/core/api/graphql/cart/fragments/shortCart.generated";
import type { InputNewBulkItemType, InputNewCartItemType } from "@/core/api/graphql/types";
import type { OutputBulkItemType } from "@/shared/cart/types";

function _useSharedShortCart() {
  const { result: query, refetch, loading } = useGetShortCartQuery();
  const cart = computed(() => query.value?.cart);

  return {
    cart,
    refetch,
    loading,
  };
}

const useSharedShortCart = createSharedComposable(_useSharedShortCart);

export function useShortCart() {
  const { cart, refetch, loading } = useSharedShortCart();

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

    const cartFragment = result?.data?.addBulkItemsCart?.cart;

    return items.map<OutputBulkItemType>(({ productSku, quantity }) => ({
      productSku,
      quantity,
      // Workaround as we don't know product IDs on bulk order
      isAddedToCart: cartFragment?.items.some(
        (item) =>
          item.sku === productSku &&
          !cartFragment?.validationErrors.some(
            (error) =>
              error.objectType == ValidationErrorObjectType.CatalogProduct && error.objectId === item.productId,
          ),
      ),
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
    if (!cart.value?.items.length) {
      return 0;
    }

    const filteredItems = cart.value.items.filter((item) => productIds.includes(item.productId));

    return sumBy(filteredItems, (x) => x.extendedPrice.amount);
  }

  return {
    cart,
    refetch,
    addToCart,
    addItemsToCart,
    addBulkItemsToCart,
    changeItemQuantity,
    getItemsTotal,
    loading,
    changing: computed(
      () =>
        addToCartLoading.value ||
        addItemsToCartLoading.value ||
        addBulkItemsToCartLoading.value ||
        changeItemQuantityLoading.value,
    ),
  };
}

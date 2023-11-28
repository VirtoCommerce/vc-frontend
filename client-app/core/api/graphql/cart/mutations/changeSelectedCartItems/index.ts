import { useSelectCartItemsMutation } from "@/core/api/graphql/cart/mutations/selectCartItems";
import { useUnselectCartItemsMutation } from "@/core/api/graphql/cart/mutations/unselectCartItems";
import type { CartType } from "@/core/api/graphql/types";

/** @deprecated Use {@link useChangeSelectedCartItemsMutation} instead. */
export async function changeSelectedCartItems(
  selectedLineItemIds: string[],
  unselectedLineItemIds: string[],
): Promise<CartType> {
  const { mutate: selectCartItems } = useSelectCartItemsMutation();
  const { mutate: unselectCartItemsMutation } = useUnselectCartItemsMutation();
  const withSelected = selectedLineItemIds.length > 0;
  const withUnselected = unselectedLineItemIds.length > 0;
  let cart: CartType;
  if (withSelected) {
    const result = await selectCartItems({
      command: {
        lineItemIds: selectedLineItemIds,
      },
    });
    cart = result!.data!.selectCartItems! as CartType;
  }
  if (withUnselected) {
    const result = await unselectCartItemsMutation({
      command: {
        lineItemIds: unselectedLineItemIds,
      },
    });
    cart = result!.data!.unSelectCartItems! as CartType;
  }
  return cart!;
}

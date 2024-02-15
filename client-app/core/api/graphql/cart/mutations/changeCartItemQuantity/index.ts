import { useChangeFullCartItemQuantityMutation } from "@/core/api/graphql/cart/mutations/changeFullCartItemQuantity";
import { useChangeShortCartItemQuantityMutation } from "@/core/api/graphql/cart/mutations/changeShortCartItemQuantity";
import type { CartType } from "@/core/api/graphql/types";

export type ChangeCartItemQuantityOptionsType = {
  /** @default false */
  reloadFullCart?: boolean;
};

/** @deprecated Use {@link useChangeShortCartItemQuantityMutation} or {@link useChangeFullCartItemQuantityMutation} instead. */
export async function changeCartItemQuantity(
  lineItemId: string,
  quantity: number,
  options: ChangeCartItemQuantityOptionsType = {},
): Promise<CartType> {
  const { mutate } = options.reloadFullCart
    ? useChangeFullCartItemQuantityMutation()
    : useChangeShortCartItemQuantityMutation();
  const result = await mutate({ command: { lineItemId, quantity } });
  return result!.data!.changeCartItemQuantity as CartType;
}

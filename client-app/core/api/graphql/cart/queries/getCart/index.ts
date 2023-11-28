import { useGetFullCartQuery } from "@/core/api/graphql/cart/queries/getFullCart";
import { useGetShortCartQuery } from "@/core/api/graphql/cart/queries/getShortCart";
import type { CartType } from "@/core/api/graphql/types";

export enum GetCartFeldsType {
  Full,
  Short,
}

export type GetCartOptionsType = {
  /** @default GetCartFeldsType.Full */
  fields?: GetCartFeldsType;
};

/** @deprecated Use {@link useGetShortCartQuery} or {@link useGetFullCartQuery} instead. */
export async function getCart(options?: GetCartOptionsType): Promise<CartType> {
  const { load, refetch } = options?.fields == GetCartFeldsType.Short ? useGetShortCartQuery() : useGetFullCartQuery();

  let result: CartType;
  const loaded = await load();
  if (loaded) {
    result = loaded.cart! as CartType;
  } else {
    const refetched = await refetch();
    result = refetched!.data.cart! as CartType;
  }
  return result;
}

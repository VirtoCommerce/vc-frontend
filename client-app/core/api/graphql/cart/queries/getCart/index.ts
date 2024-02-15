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
  if (options?.fields == GetCartFeldsType.Short) {
    return new Promise((resolve, reject) => {
      const query = useGetShortCartQuery();
      query.onResult((result) => resolve(result.data.cart! as CartType));
      query.onError((error) => reject(error));
    });
  } else {
    const { load, refetch } = useGetFullCartQuery();
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
}

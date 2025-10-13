import { getMainDefinition } from "@apollo/client/utilities";
import { generateCacheIdIfNew } from "@/core/api/graphql/utils";
import type { CartType, UpdateShortCartItemQuantityMutationVariables } from "@/core/api/graphql/types";
import type { Operation } from "@apollo/client/core";

export function isMutation(operation: Operation): boolean {
  const def = getMainDefinition(operation.query);
  // Disabled because importing this enums cause issues and graphql package will remove them at v17
  // https://virtocommerce.atlassian.net/browse/VCST-834
  // https://github.com/graphql/graphql-js/pull/3686
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return def.kind === "OperationDefinition" && def.operation === "mutation";
}

export function defaultMergeVariables<TVars extends Record<string, unknown>>(a: TVars, b: TVars): TVars {
  return { ...a, ...b };
}

type ItemResultType = {
  __typename: "LineItemType";
  id: string;
  productId: string;
  quantity: number;
  sku: string;
};

export function handleOptimisticResponseUpdateCartQuantity(
  cart: CartType,
  itemsInput: UpdateShortCartItemQuantityMutationVariables["command"]["items"],
) {
  const updatesByProductId = new Map(itemsInput?.map((item) => [item.productId, item.quantity]) ?? []);
  const baseItemsByProductId = new Map(cart?.items?.map((item) => [item.productId, item]) ?? []);
  const baseItems = cart?.items ?? [];

  // Start from existing items and apply updates
  const itemsResult: ItemResultType[] = baseItems.map((lineItem) => {
    const nextQty = updatesByProductId.get(lineItem.productId);

    return {
      __typename: "LineItemType",
      id: lineItem.id,
      productId: lineItem.productId,
      quantity: nextQty === undefined ? lineItem.quantity : nextQty,
      sku: lineItem.sku ?? "",
    };
  });

  // Add new items for products that were not in the cart
  for (const [productId, qty] of updatesByProductId) {
    if (qty <= 0) {
      continue;
    }
    const exists = baseItemsByProductId.has(productId);

    if (exists) {
      continue;
    }

    const newItem = generateCacheIdIfNew<Omit<ItemResultType, "id" | "__typename">>(
      { productId, quantity: qty, sku: "" },
      "LineItemType",
    ) as ItemResultType;

    itemsResult.push(newItem);
  }

  const itemsQuantity = itemsResult.reduce((acc, li) => acc + (li.quantity ?? 0), 0);

  return {
    updateCartQuantity: {
      __typename: "CartType",
      id: cart.id ?? "",
      itemsQuantity,
      items: itemsResult,
    },
  };
}

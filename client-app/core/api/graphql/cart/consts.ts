import { OperationNames } from "@/core/api/graphql/types";

export const SHORT_CART_MUTATION_NAMES = [
  OperationNames.Mutation.AddBulkItemsCart,
  OperationNames.Mutation.AddItem,
  OperationNames.Mutation.AddItemsCart,
  OperationNames.Mutation.ChangeShortCartItemQuantity,
];

export const FULL_CART_MUTATION_NAMES = [
  OperationNames.Mutation.AddCoupon,
  OperationNames.Mutation.AddGiftItems,
  OperationNames.Mutation.AddOrUpdateCartPayment,
  OperationNames.Mutation.AddOrUpdateCartShipment,
  OperationNames.Mutation.ChangeCartComment,
  OperationNames.Mutation.ChangeFullCartItemQuantity,
  OperationNames.Mutation.ChangePurchaseOrderNumber,
  OperationNames.Mutation.ClearCart,
  OperationNames.Mutation.MergeCart,
  OperationNames.Mutation.RejectGiftItems,
  OperationNames.Mutation.RemoveCartItems,
  OperationNames.Mutation.RemoveCoupon,
  OperationNames.Mutation.RemoveShipment,
  OperationNames.Mutation.SelectCartItems,
  OperationNames.Mutation.UnselectCartItems,
];

export const MUTATIONS_WITH_SIDE_EFFECTS_TO_CART = [
  OperationNames.Mutation.CreateOrderFromCart,
  OperationNames.Mutation.CreateQuoteFromCart,
];

import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddWishlistBulkItemMutationVariables = Types.Exact<{
  command: Types.InputAddWishlistBulkItemType;
}>;


export type AddWishlistBulkItemMutation = { addWishlistBulkItem?: { wishlists?: Array<{ id: string }> } };


export const AddWishlistBulkItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWishlistBulkItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddWishlistBulkItemType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWishlistBulkItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<AddWishlistBulkItemMutation, AddWishlistBulkItemMutationVariables>;
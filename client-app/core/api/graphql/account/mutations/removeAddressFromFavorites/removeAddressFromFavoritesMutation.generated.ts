import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type RemoveAddressFromFavoritesMutationVariables = Types.Exact<{
  command: Types.RemoveAddressFromFavoritesCommandType;
}>;


export type RemoveAddressFromFavoritesMutation = { removeAddressFromFavorites?: boolean };


export const RemoveAddressFromFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAddressFromFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveAddressFromFavoritesCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAddressFromFavorites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<RemoveAddressFromFavoritesMutation, RemoveAddressFromFavoritesMutationVariables>;
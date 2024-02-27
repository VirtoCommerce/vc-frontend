import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddAddressToFavoritesMutationVariables = Types.Exact<{
  command: Types.AddAddressToFavoritesCommandType;
}>;


export type AddAddressToFavoritesMutation = { addAddressToFavorites?: boolean };


export const AddAddressToFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAddressToFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddAddressToFavoritesCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addAddressToFavorites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables>;
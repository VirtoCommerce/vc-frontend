import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetSkyflowCardsQueryVariables = Types.Exact<{
  storeId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetSkyflowCardsQuery = { skyflowCards?: { cards?: Array<{ cardNumber: string, cardExpiration?: string, skyflowId: string }> } };


export const GetSkyflowCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSkyflowCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skyflowCards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cardExpiration"}},{"kind":"Field","name":{"kind":"Name","value":"skyflowId"}}]}}]}}]}}]} as unknown as DocumentNode<GetSkyflowCardsQuery, GetSkyflowCardsQueryVariables>;
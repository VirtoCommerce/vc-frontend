import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SubmitQuoteRequestMutationVariables = Types.Exact<{
  command: Types.SubmitQuoteCommandType;
}>;


export type SubmitQuoteRequestMutation = { submitQuoteRequest?: { id: string } };


export const SubmitQuoteRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitQuoteRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitQuoteCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitQuoteRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SubmitQuoteRequestMutation, SubmitQuoteRequestMutationVariables>;
import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type UpdateQuoteAttachmentsMutationVariables = Types.Exact<{
  command: Types.UpdateQuoteAttachmentsCommandType;
}>;


export type UpdateQuoteAttachmentsMutation = { updateQuoteAttachments?: { id: string } };


export const UpdateQuoteAttachmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuoteAttachments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuoteAttachmentsCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuoteAttachments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateQuoteAttachmentsMutation, UpdateQuoteAttachmentsMutationVariables>;
import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ClearAllPushMessagesMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ClearAllPushMessagesMutation = { clearAllPushMessages?: boolean };


export const ClearAllPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearAllPushMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearAllPushMessages"}}]}}]} as unknown as DocumentNode<ClearAllPushMessagesMutation, ClearAllPushMessagesMutationVariables>;
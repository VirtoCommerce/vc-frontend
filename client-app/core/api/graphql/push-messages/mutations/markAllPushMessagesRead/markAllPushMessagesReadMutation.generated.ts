import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type MarkAllPushMessagesReadMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesReadMutation = { markAllPushMessagesRead?: boolean };


export const MarkAllPushMessagesReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesRead"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesReadMutation, MarkAllPushMessagesReadMutationVariables>;
import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type MarkAllPushMessagesUnreadMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesUnreadMutation = { markAllPushMessagesUnread?: boolean };


export const MarkAllPushMessagesUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesUnread"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesUnread"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesUnreadMutation, MarkAllPushMessagesUnreadMutationVariables>;
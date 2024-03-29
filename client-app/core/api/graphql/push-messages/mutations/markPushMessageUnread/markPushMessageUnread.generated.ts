import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type MarkPushMessageUnreadMutationVariables = Types.Exact<{
  command: Types.InputMarkPushMessageUnreadType;
}>;


export type MarkPushMessageUnreadMutation = { markPushMessageUnread?: boolean };


export const MarkPushMessageUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkPushMessageUnread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMarkPushMessageUnreadType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPushMessageUnread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<MarkPushMessageUnreadMutation, MarkPushMessageUnreadMutationVariables>;
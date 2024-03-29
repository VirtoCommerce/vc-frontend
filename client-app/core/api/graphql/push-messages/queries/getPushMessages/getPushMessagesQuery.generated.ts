import type * as Types from '../../../types/base.generated';

import type { PushMessageFragment } from '../../fragments/pushMessage.generated';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetPushMessagesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetPushMessagesQuery = { pushMessages: { unreadCount: number, items: Array<PushMessageFragment> } };


export const GetPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPushMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<GetPushMessagesQuery, GetPushMessagesQueryVariables>;
import type * as Types from '../../../types/base.generated';

import type { PushMessageFragment } from '../../fragments/pushMessage.generated';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type OnPushMessageCreatedSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type OnPushMessageCreatedSubscription = { pushMessageCreated: PushMessageFragment };


export const OnPushMessageCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnPushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<OnPushMessageCreatedSubscription, OnPushMessageCreatedSubscriptionVariables>;
import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type PushMessageFragment = { id: string, createdDate: any, shortMessage: string, isRead: boolean };

export const PushMessageFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<PushMessageFragment, unknown>;
import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type QuoteAttachmentFragment = { name: string, url: string, contentType?: string, size: number };

export const QuoteAttachmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteAttachment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteAttachmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]} as unknown as DocumentNode<QuoteAttachmentFragment, unknown>;
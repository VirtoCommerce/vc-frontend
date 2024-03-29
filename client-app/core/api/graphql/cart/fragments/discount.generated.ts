import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type DiscountFragment = { description?: string, amount: any, coupon?: string };

export const DiscountFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}}]} as unknown as DocumentNode<DiscountFragment, unknown>;
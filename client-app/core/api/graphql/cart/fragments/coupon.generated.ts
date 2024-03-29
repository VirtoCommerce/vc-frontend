import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CouponFragment = { code?: string, isAppliedSuccessfully: boolean };

export const CouponFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}}]} as unknown as DocumentNode<CouponFragment, unknown>;
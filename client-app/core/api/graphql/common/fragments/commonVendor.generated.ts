import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CommonVendorFragment = { id: string, name: string, rating?: { value: any, reviewCount: number } };

export const CommonVendorFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]} as unknown as DocumentNode<CommonVendorFragment, unknown>;
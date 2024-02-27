import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AvailabilityDataFragment = { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number };

export const AvailabilityDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}}]} as unknown as DocumentNode<AvailabilityDataFragment, unknown>;
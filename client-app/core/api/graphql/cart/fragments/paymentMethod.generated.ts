import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type PaymentMethodFragment = { code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string };

export const PaymentMethodFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}}]} as unknown as DocumentNode<PaymentMethodFragment, unknown>;
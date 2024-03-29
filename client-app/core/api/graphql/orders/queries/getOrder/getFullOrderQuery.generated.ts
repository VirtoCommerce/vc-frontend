import type * as Types from '../../../types/base.generated';

import type { FullOrderFieldsFragment } from '../../../fragments/fullOrderFields.generated';
import type { ShortOrderFieldsFragment } from '../../../fragments/shortOrderFields.generated';
import type { OrderLineItemFieldsFragment } from '../../../fragments/orderLineItemFields.generated';
import type { PropertyFragment } from '../../../catalog/fragments/property.generated';
import type { MoneyFragment } from '../../../common/fragments/money.generated';
import type { CurrencyFragment } from '../../../common/fragments/currency.generated';
import type { OrderAddressFieldsFragment } from '../../../fragments/orderAddressFields.generated';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFullOrderQueryVariables = Types.Exact<{
  id?: Types.InputMaybe<Types.Scalars['String']['input']>;
  number?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cultureName?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetFullOrderQuery = { order?: FullOrderFieldsFragment };


export const GetFullOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFullOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"number"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"number"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]} as unknown as DocumentNode<GetFullOrderQuery, GetFullOrderQueryVariables>;
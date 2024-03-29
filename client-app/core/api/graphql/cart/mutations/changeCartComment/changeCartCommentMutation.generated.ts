import type * as Types from '../../../types/base.generated';

import type { FullCartFragment } from '../../fragments/fullCart.generated';
import type { ShortCartFragment } from '../../fragments/shortCart.generated';
import type { CartIdFragment } from '../../fragments/cartId.generated';
import type { ShortLineItemFragment } from '../../fragments/shortLineItem.generated';
import type { ValidationErrorFragment } from '../../fragments/validationError.generated';
import type { GiftFragment } from '../../fragments/gift.generated';
import type { ShippingMethodFragment } from '../../fragments/shippingMethod.generated';
import type { MoneyFragment } from '../../../common/fragments/money.generated';
import type { CurrencyFragment } from '../../../common/fragments/currency.generated';
import type { PaymentMethodFragment } from '../../fragments/paymentMethod.generated';
import type { FullLineItemFragment } from '../../fragments/fullLineItem.generated';
import type { FullLineItemProductFragment } from '../../fragments/fullLineItemProduct.generated';
import type { PropertyFragment } from '../../../catalog/fragments/property.generated';
import type { AvailabilityDataFragment } from '../../../catalog/fragments/availabilityData.generated';
import type { CommonVendorFragment } from '../../../common/fragments/commonVendor.generated';
import type { CouponFragment } from '../../fragments/coupon.generated';
import type { DiscountFragment } from '../../fragments/discount.generated';
import type { ShipmentFragment } from '../../fragments/shipment.generated';
import type { CartAddressFragment } from '../../fragments/cartAddress.generated';
import type { PaymentFragment } from '../../fragments/payment.generated';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ChangeCartCommentMutationVariables = Types.Exact<{
  command: Types.InputChangeCommentType;
  skipQuery: Types.Scalars['Boolean']['input'];
}>;


export type ChangeCartCommentMutation = { changeComment?: FullCartFragment };


export const ChangeCartCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeCartComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCommentType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<ChangeCartCommentMutation, ChangeCartCommentMutationVariables>;
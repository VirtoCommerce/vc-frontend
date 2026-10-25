// This file is auto-generated. Do not edit manually.

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Decimal: { input: number; output: number; }
};

export type InputAcceptSubscriptionTerms = {
  cartId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  termsHash: Scalars['String']['input'];
  termsVersion: Scalars['String']['input'];
};

export type InputAddSavedPaymentMethod = {
  parameters?: InputMaybe<Array<InputMaybe<InputKeyValueType>>>;
  paymentMethodCode: Scalars['String']['input'];
  setDefault?: InputMaybe<Scalars['Boolean']['input']>;
  storeId: Scalars['String']['input'];
};

export type InputCancelProductSubscription = {
  reason?: InputMaybe<Scalars['String']['input']>;
  subscriptionId: Scalars['String']['input'];
};

export type InputChangeProductSubscription = {
  intervalCount?: InputMaybe<Scalars['Int']['input']>;
  intervalUnit?: InputMaybe<SubscriptionIntervalUnit>;
  nextOrderDate?: InputMaybe<Scalars['DateTime']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  savedPaymentMethodId?: InputMaybe<Scalars['String']['input']>;
  subscriptionId: Scalars['String']['input'];
};

export type InputKeyValueType = {
  /** Dictionary key */
  key: Scalars['String']['input'];
  /** Dictionary value */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type InputPauseProductSubscription = {
  resumeDate?: InputMaybe<Scalars['DateTime']['input']>;
  subscriptionId: Scalars['String']['input'];
};

export type InputProductSubscriptionId = {
  subscriptionId: Scalars['String']['input'];
};

export type InputRemoveCartItemSubscription = {
  cartId: Scalars['String']['input'];
  lineItemId: Scalars['String']['input'];
};

export type InputSavedPaymentMethodId = {
  id: Scalars['String']['input'];
};

export type InputSetCartItemSubscription = {
  cartId: Scalars['String']['input'];
  intervalCount: Scalars['Int']['input'];
  intervalUnit: SubscriptionIntervalUnit;
  lineItemId: Scalars['String']['input'];
  planId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type InputSubscriptionRenewalId = {
  renewalId: Scalars['String']['input'];
};

export type Mutations = {
  acceptSubscriptionRenewal?: Maybe<SubscriptionRenewal>;
  acceptSubscriptionTerms?: Maybe<Scalars['String']['output']>;
  addSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  cancelProductSubscription?: Maybe<ProductSubscription>;
  changeProductSubscription?: Maybe<ProductSubscription>;
  orderProductSubscriptionNow?: Maybe<SubscriptionRenewal>;
  pauseProductSubscription?: Maybe<ProductSubscription>;
  removeCartItemSubscription?: Maybe<Scalars['Boolean']['output']>;
  removeSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  resumeProductSubscription?: Maybe<ProductSubscription>;
  retrySubscriptionRenewalPayment?: Maybe<SubscriptionRenewal>;
  setCartItemSubscription?: Maybe<SubscriptionCartItem>;
  setDefaultSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  skipProductSubscription?: Maybe<ProductSubscription>;
  skipSubscriptionRenewal?: Maybe<SubscriptionRenewal>;
};


export type MutationsAcceptSubscriptionRenewalArgs = {
  command: InputSubscriptionRenewalId;
};


export type MutationsAcceptSubscriptionTermsArgs = {
  command: InputAcceptSubscriptionTerms;
};


export type MutationsAddSavedPaymentMethodArgs = {
  command: InputAddSavedPaymentMethod;
};


export type MutationsCancelProductSubscriptionArgs = {
  command: InputCancelProductSubscription;
};


export type MutationsChangeProductSubscriptionArgs = {
  command: InputChangeProductSubscription;
};


export type MutationsOrderProductSubscriptionNowArgs = {
  command: InputProductSubscriptionId;
};


export type MutationsPauseProductSubscriptionArgs = {
  command: InputPauseProductSubscription;
};


export type MutationsRemoveCartItemSubscriptionArgs = {
  command: InputRemoveCartItemSubscription;
};


export type MutationsRemoveSavedPaymentMethodArgs = {
  command: InputSavedPaymentMethodId;
};


export type MutationsResumeProductSubscriptionArgs = {
  command: InputProductSubscriptionId;
};


export type MutationsRetrySubscriptionRenewalPaymentArgs = {
  command: InputSubscriptionRenewalId;
};


export type MutationsSetCartItemSubscriptionArgs = {
  command: InputSetCartItemSubscription;
};


export type MutationsSetDefaultSavedPaymentMethodArgs = {
  command: InputSavedPaymentMethodId;
};


export type MutationsSkipProductSubscriptionArgs = {
  command: InputProductSubscriptionId;
};


export type MutationsSkipSubscriptionRenewalArgs = {
  command: InputSubscriptionRenewalId;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** A subscribed product delivered on a schedule. */
export type ProductSubscription = {
  /** Frequencies the customer can switch to */
  availableIntervals: Array<SubscriptionInterval>;
  canCancel: Scalars['Boolean']['output'];
  canChange: Scalars['Boolean']['output'];
  canOrderNow: Scalars['Boolean']['output'];
  canPause: Scalars['Boolean']['output'];
  canResume: Scalars['Boolean']['output'];
  canSkip: Scalars['Boolean']['output'];
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  createdDate: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  currentRenewal?: Maybe<SubscriptionRenewal>;
  discountType: SubscriptionDiscountType;
  discountValue: Scalars['Decimal']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  initialOrderId?: Maybe<Scalars['String']['output']>;
  initialOrderNumber?: Maybe<Scalars['String']['output']>;
  intervalCount: Scalars['Int']['output'];
  intervalLabel: Scalars['String']['output'];
  intervalUnit: SubscriptionIntervalUnit;
  lastOrderDate?: Maybe<Scalars['DateTime']['output']>;
  lastOrderId?: Maybe<Scalars['String']['output']>;
  lastOrderNumber?: Maybe<Scalars['String']['output']>;
  nextOrderDate: Scalars['DateTime']['output'];
  number: Scalars['String']['output'];
  ordersCount: Scalars['Int']['output'];
  pausedUntil?: Maybe<Scalars['DateTime']['output']>;
  paymentMethodCode?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  planName?: Maybe<Scalars['String']['output']>;
  productId: Scalars['String']['output'];
  productName?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  /** The product's ordering rules the subscription quantity must follow. */
  quantityRules: SubscriptionQuantityRules;
  referencePrice?: Maybe<Scalars['Decimal']['output']>;
  savedPaymentMethod?: Maybe<SavedPaymentMethod>;
  shippingAddress?: Maybe<SubscriptionAddress>;
  shippingMethodCode?: Maybe<Scalars['String']['output']>;
  shippingMethodOption?: Maybe<Scalars['String']['output']>;
  skipCount: Scalars['Int']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  /** PendingActivation, Active, Paused, PastDue or Cancelled. A string, not an enum: a solution can add its own statuses. */
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  storedPaymentMethodId?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `ProductSubscription`. */
export type ProductSubscriptionConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductSubscriptionEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductSubscription>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `ProductSubscription`. */
export type ProductSubscriptionEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ProductSubscription>;
};

export type Query = {
  cartSubscriptionItems: Array<SubscriptionCartItem>;
  productSubscription?: Maybe<ProductSubscription>;
  productSubscriptions?: Maybe<ProductSubscriptionConnection>;
  savedPaymentMethods: Array<SavedPaymentMethod>;
  subscriptionOffers: Array<SubscriptionOffer>;
  subscriptionRenewal?: Maybe<SubscriptionRenewal>;
  subscriptionRenewals?: Maybe<RenewalConnection>;
  subscriptionTerms?: Maybe<SubscriptionTerms>;
};


export type QueryCartSubscriptionItemsArgs = {
  cartId: Scalars['String']['input'];
};


export type QueryProductSubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type QueryProductSubscriptionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  storeId: Scalars['String']['input'];
};


export type QuerySavedPaymentMethodsArgs = {
  storeId: Scalars['String']['input'];
};


export type QuerySubscriptionOffersArgs = {
  productIds: Array<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};


export type QuerySubscriptionRenewalArgs = {
  id: Scalars['String']['input'];
};


export type QuerySubscriptionRenewalsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  onlyOpen?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  subscriptionId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubscriptionTermsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

/** A connection from an object to a list of objects of type `Renewal`. */
export type RenewalConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<RenewalEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SubscriptionRenewal>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Renewal`. */
export type RenewalEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SubscriptionRenewal>;
};

/** A payment method saved at the payment provider. Never contains the card number or CVV. */
export type SavedPaymentMethod = {
  brand?: Maybe<Scalars['String']['output']>;
  cardholderName?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  expirationMonth?: Maybe<Scalars['Int']['output']>;
  expirationYear?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  isExpired: Scalars['Boolean']['output'];
  last4?: Maybe<Scalars['String']['output']>;
  paymentMethodCode: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type SubscriptionAddress = {
  city?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  countryName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  line1?: Maybe<Scalars['String']['output']>;
  line2?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  regionId?: Maybe<Scalars['String']['output']>;
  regionName?: Maybe<Scalars['String']['output']>;
};

/** The customer's choice to subscribe to a cart line. */
export type SubscriptionCartItem = {
  cartId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  intervalCount: Scalars['Int']['output'];
  intervalLabel: Scalars['String']['output'];
  intervalUnit: SubscriptionIntervalUnit;
  lineItemId: Scalars['String']['output'];
  planId: Scalars['String']['output'];
  productId: Scalars['String']['output'];
};

/** How a subscription plan discounts the price: no discount, a percent, or a fixed amount per item. */
export enum SubscriptionDiscountType {
  FixedAmount = 'FIXED_AMOUNT',
  None = 'NONE',
  Percent = 'PERCENT'
}

/** A delivery frequency offered for a product, e.g. every 2 weeks. */
export type SubscriptionInterval = {
  /** Number of units between deliveries */
  count: Scalars['Int']['output'];
  /** Preselected frequency */
  isDefault: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  unit: SubscriptionIntervalUnit;
};

/** The unit of a delivery frequency: every N days, weeks, months or years. */
export enum SubscriptionIntervalUnit {
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK',
  Year = 'YEAR'
}

/** Subscribe & Save offer for a product. */
export type SubscriptionOffer = {
  description?: Maybe<Scalars['String']['output']>;
  discountType: SubscriptionDiscountType;
  discountValue: Scalars['Decimal']['output'];
  intervals: Array<SubscriptionInterval>;
  planId: Scalars['String']['output'];
  planName: Scalars['String']['output'];
  productId: Scalars['String']['output'];
};

export type SubscriptionQuantityRules = {
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  minQuantity: Scalars['Int']['output'];
  /** The quantity must be a multiple of this. */
  packSize: Scalars['Int']['output'];
};

/** One upcoming or past delivery of one or more subscriptions. */
export type SubscriptionRenewal = {
  attemptCount: Scalars['Int']['output'];
  canAcceptReview: Scalars['Boolean']['output'];
  canRetryPayment: Scalars['Boolean']['output'];
  canSkip: Scalars['Boolean']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  cutoffDate: Scalars['DateTime']['output'];
  discountTotal: Scalars['Decimal']['output'];
  /** Customer-visible history */
  events: Array<SubscriptionRenewalEvent>;
  id: Scalars['String']['output'];
  isManual: Scalars['Boolean']['output'];
  items: Array<SubscriptionRenewalItem>;
  lastErrorMessage?: Maybe<Scalars['String']['output']>;
  nextAttemptDate?: Maybe<Scalars['DateTime']['output']>;
  notifiedTotal?: Maybe<Scalars['Decimal']['output']>;
  number: Scalars['String']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  orderTotal?: Maybe<Scalars['Decimal']['output']>;
  previewTotal: Scalars['Decimal']['output'];
  requiresPaymentAction: Scalars['Boolean']['output'];
  reviewReason?: Maybe<Scalars['String']['output']>;
  scheduledDate: Scalars['DateTime']['output'];
  shippingTotal: Scalars['Decimal']['output'];
  /** Scheduled, Notified, ReviewRequired, Ordered, PaymentActionRequired, RetryScheduled, Authorized, Completed, Failed, Skipped, Cancelled */
  state: Scalars['String']['output'];
  /** The saved card this delivery is charged to */
  storedPaymentMethodId?: Maybe<Scalars['String']['output']>;
  taxTotal: Scalars['Decimal']['output'];
};

export type SubscriptionRenewalEvent = {
  eventDate: Scalars['DateTime']['output'];
  eventType?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
};

export type SubscriptionRenewalItem = {
  discountAmount: Scalars['Decimal']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isAvailable: Scalars['Boolean']['output'];
  isExcluded: Scalars['Boolean']['output'];
  listPrice: Scalars['Decimal']['output'];
  message?: Maybe<Scalars['String']['output']>;
  productId: Scalars['String']['output'];
  productName?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  subscriptionId: Scalars['String']['output'];
  total: Scalars['Decimal']['output'];
};

/** Auto-renewal terms shown before the payment fields at checkout. */
export type SubscriptionTerms = {
  hash: Scalars['String']['output'];
  text: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type ProductSubscriptionFieldsFragment = { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } };

export type RenewalFieldsFragment = { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> };

export type SavedPaymentMethodFieldsFragment = { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any };

export type SubscriptionCartItemFieldsFragment = { id: string, cartId: string, lineItemId: string, productId: string, planId: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string };

export type SubscriptionIntervalFieldsFragment = { unit: SubscriptionIntervalUnit, count: number, isDefault: boolean, label: string };

export type AcceptSubscriptionRenewalMutationVariables = Exact<{
  command: InputSubscriptionRenewalId;
}>;


export type AcceptSubscriptionRenewalMutation = { acceptSubscriptionRenewal?: { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> } };

export type AcceptSubscriptionTermsMutationVariables = Exact<{
  command: InputAcceptSubscriptionTerms;
}>;


export type AcceptSubscriptionTermsMutation = { acceptSubscriptionTerms?: string };

export type AddSavedPaymentMethodMutationVariables = Exact<{
  command: InputAddSavedPaymentMethod;
}>;


export type AddSavedPaymentMethodMutation = { addSavedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } };

export type CancelProductSubscriptionMutationVariables = Exact<{
  command: InputCancelProductSubscription;
}>;


export type CancelProductSubscriptionMutation = { cancelProductSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type ChangeProductSubscriptionMutationVariables = Exact<{
  command: InputChangeProductSubscription;
}>;


export type ChangeProductSubscriptionMutation = { changeProductSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type OrderProductSubscriptionNowMutationVariables = Exact<{
  command: InputProductSubscriptionId;
}>;


export type OrderProductSubscriptionNowMutation = { orderProductSubscriptionNow?: { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> } };

export type PauseProductSubscriptionMutationVariables = Exact<{
  command: InputPauseProductSubscription;
}>;


export type PauseProductSubscriptionMutation = { pauseProductSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type RemoveCartItemSubscriptionMutationVariables = Exact<{
  command: InputRemoveCartItemSubscription;
}>;


export type RemoveCartItemSubscriptionMutation = { removeCartItemSubscription?: boolean };

export type RemoveSavedPaymentMethodMutationVariables = Exact<{
  command: InputSavedPaymentMethodId;
}>;


export type RemoveSavedPaymentMethodMutation = { removeSavedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } };

export type ResumeProductSubscriptionMutationVariables = Exact<{
  command: InputProductSubscriptionId;
}>;


export type ResumeProductSubscriptionMutation = { resumeProductSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type RetrySubscriptionRenewalPaymentMutationVariables = Exact<{
  command: InputSubscriptionRenewalId;
}>;


export type RetrySubscriptionRenewalPaymentMutation = { retrySubscriptionRenewalPayment?: { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> } };

export type SetCartItemSubscriptionMutationVariables = Exact<{
  command: InputSetCartItemSubscription;
}>;


export type SetCartItemSubscriptionMutation = { setCartItemSubscription?: { id: string, cartId: string, lineItemId: string, productId: string, planId: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string } };

export type SetDefaultSavedPaymentMethodMutationVariables = Exact<{
  command: InputSavedPaymentMethodId;
}>;


export type SetDefaultSavedPaymentMethodMutation = { setDefaultSavedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } };

export type SkipProductSubscriptionMutationVariables = Exact<{
  command: InputProductSubscriptionId;
}>;


export type SkipProductSubscriptionMutation = { skipProductSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type SkipSubscriptionRenewalMutationVariables = Exact<{
  command: InputSubscriptionRenewalId;
}>;


export type SkipSubscriptionRenewalMutation = { skipSubscriptionRenewal?: { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> } };

export type GetCartSubscriptionItemsQueryVariables = Exact<{
  cartId: Scalars['String']['input'];
}>;


export type GetCartSubscriptionItemsQuery = { cartSubscriptionItems: Array<{ id: string, cartId: string, lineItemId: string, productId: string, planId: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string }> };

export type GetProductSubscriptionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetProductSubscriptionQuery = { productSubscription?: { id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, availableIntervals: Array<{ unit: SubscriptionIntervalUnit, count: number, isDefault: boolean, label: string }>, currentRenewal?: { id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> }, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } } };

export type GetProductSubscriptionsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetProductSubscriptionsQuery = { productSubscriptions?: { totalCount?: number, items?: Array<{ id: string, number: string, status: string, storeId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, planId?: string, planName?: string, intervalUnit: SubscriptionIntervalUnit, intervalCount: number, intervalLabel: string, discountType: SubscriptionDiscountType, discountValue: number, startDate: any, nextOrderDate: any, pausedUntil?: any, skipCount: number, cancelledDate?: any, cancelReason?: string, currency?: string, storedPaymentMethodId?: string, lastOrderId?: string, lastOrderNumber?: string, lastOrderDate?: any, initialOrderId?: string, initialOrderNumber?: string, ordersCount: number, referencePrice?: number, createdDate: any, canSkip: boolean, canPause: boolean, canResume: boolean, canCancel: boolean, canOrderNow: boolean, canChange: boolean, quantityRules: { packSize: number, minQuantity: number, maxQuantity?: number }, shippingAddress?: { firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, postalCode?: string, regionName?: string, countryCode?: string }, savedPaymentMethod?: { id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any } }> } };

export type GetSavedPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
}>;


export type GetSavedPaymentMethodsQuery = { savedPaymentMethods: Array<{ id: string, paymentMethodCode: string, brand?: string, last4?: string, expirationMonth?: number, expirationYear?: number, cardholderName?: string, status: string, isDefault: boolean, isExpired: boolean, createdDate: any }> };

export type GetSubscriptionOffersQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  productIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetSubscriptionOffersQuery = { subscriptionOffers: Array<{ productId: string, planId: string, planName: string, description?: string, discountType: SubscriptionDiscountType, discountValue: number, intervals: Array<{ unit: SubscriptionIntervalUnit, count: number, isDefault: boolean, label: string }> }> };

export type GetSubscriptionRenewalsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  onlyOpen?: InputMaybe<Scalars['Boolean']['input']>;
  subscriptionId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSubscriptionRenewalsQuery = { subscriptionRenewals?: { totalCount?: number, items?: Array<{ id: string, number: string, state: string, scheduledDate: any, cutoffDate: any, isManual: boolean, currency?: string, previewTotal: number, notifiedTotal?: number, orderTotal?: number, discountTotal: number, shippingTotal: number, taxTotal: number, orderId?: string, storedPaymentMethodId?: string, orderNumber?: string, attemptCount: number, nextAttemptDate?: any, lastErrorMessage?: string, reviewReason?: string, canSkip: boolean, canAcceptReview: boolean, canRetryPayment: boolean, requiresPaymentAction: boolean, items: Array<{ subscriptionId: string, productId: string, sku?: string, productName?: string, imageUrl?: string, quantity: number, listPrice: number, discountAmount: number, total: number, isAvailable: boolean, isExcluded: boolean, message?: string }> }> } };

export type GetSubscriptionTermsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSubscriptionTermsQuery = { subscriptionTerms?: { version: string, text: string, hash: string } };

export const SavedPaymentMethodFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<SavedPaymentMethodFieldsFragment, unknown>;
export const ProductSubscriptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<ProductSubscriptionFieldsFragment, unknown>;
export const RenewalFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RenewalFieldsFragment, unknown>;
export const SubscriptionCartItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionCartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionCartItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}}]}}]} as unknown as DocumentNode<SubscriptionCartItemFieldsFragment, unknown>;
export const SubscriptionIntervalFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionIntervalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionInterval"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<SubscriptionIntervalFieldsFragment, unknown>;
export const AcceptSubscriptionRenewalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptSubscriptionRenewal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSubscriptionRenewalId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptSubscriptionRenewal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<AcceptSubscriptionRenewalMutation, AcceptSubscriptionRenewalMutationVariables>;
export const AcceptSubscriptionTermsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptSubscriptionTerms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAcceptSubscriptionTerms"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptSubscriptionTerms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<AcceptSubscriptionTermsMutation, AcceptSubscriptionTermsMutationVariables>;
export const AddSavedPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddSavedPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddSavedPaymentMethod"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addSavedPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<AddSavedPaymentMethodMutation, AddSavedPaymentMethodMutationVariables>;
export const CancelProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCancelProductSubscription"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelProductSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<CancelProductSubscriptionMutation, CancelProductSubscriptionMutationVariables>;
export const ChangeProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeProductSubscription"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeProductSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<ChangeProductSubscriptionMutation, ChangeProductSubscriptionMutationVariables>;
export const OrderProductSubscriptionNowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrderProductSubscriptionNow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputProductSubscriptionId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderProductSubscriptionNow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<OrderProductSubscriptionNowMutation, OrderProductSubscriptionNowMutationVariables>;
export const PauseProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PauseProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputPauseProductSubscription"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pauseProductSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<PauseProductSubscriptionMutation, PauseProductSubscriptionMutationVariables>;
export const RemoveCartItemSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCartItemSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveCartItemSubscription"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCartItemSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<RemoveCartItemSubscriptionMutation, RemoveCartItemSubscriptionMutationVariables>;
export const RemoveSavedPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveSavedPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSavedPaymentMethodId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeSavedPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<RemoveSavedPaymentMethodMutation, RemoveSavedPaymentMethodMutationVariables>;
export const ResumeProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputProductSubscriptionId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeProductSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<ResumeProductSubscriptionMutation, ResumeProductSubscriptionMutationVariables>;
export const RetrySubscriptionRenewalPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetrySubscriptionRenewalPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSubscriptionRenewalId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retrySubscriptionRenewalPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RetrySubscriptionRenewalPaymentMutation, RetrySubscriptionRenewalPaymentMutationVariables>;
export const SetCartItemSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCartItemSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSetCartItemSubscription"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCartItemSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionCartItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionCartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionCartItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}}]}}]} as unknown as DocumentNode<SetCartItemSubscriptionMutation, SetCartItemSubscriptionMutationVariables>;
export const SetDefaultSavedPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDefaultSavedPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSavedPaymentMethodId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDefaultSavedPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<SetDefaultSavedPaymentMethodMutation, SetDefaultSavedPaymentMethodMutationVariables>;
export const SkipProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SkipProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputProductSubscriptionId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skipProductSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<SkipProductSubscriptionMutation, SkipProductSubscriptionMutationVariables>;
export const SkipSubscriptionRenewalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SkipSubscriptionRenewal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSubscriptionRenewalId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skipSubscriptionRenewal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SkipSubscriptionRenewalMutation, SkipSubscriptionRenewalMutationVariables>;
export const GetCartSubscriptionItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCartSubscriptionItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartSubscriptionItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionCartItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionCartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionCartItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}}]}}]} as unknown as DocumentNode<GetCartSubscriptionItemsQuery, GetCartSubscriptionItemsQueryVariables>;
export const GetProductSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProductSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}},{"kind":"Field","name":{"kind":"Name","value":"availableIntervals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionIntervalFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentRenewal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionIntervalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionInterval"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<GetProductSubscriptionQuery, GetProductSubscriptionQueryVariables>;
export const GetProductSubscriptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProductSubscriptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSubscriptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"productSubscriptionFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"productSubscriptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSubscription"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"packSize"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"intervalUnit"}},{"kind":"Field","name":{"kind":"Name","value":"intervalCount"}},{"kind":"Field","name":{"kind":"Name","value":"intervalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"nextOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"pausedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"skipCount"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"lastOrderDate"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"initialOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"ordersCount"}},{"kind":"Field","name":{"kind":"Name","value":"referencePrice"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canPause"}},{"kind":"Field","name":{"kind":"Name","value":"canResume"}},{"kind":"Field","name":{"kind":"Name","value":"canCancel"}},{"kind":"Field","name":{"kind":"Name","value":"canOrderNow"}},{"kind":"Field","name":{"kind":"Name","value":"canChange"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}}]} as unknown as DocumentNode<GetProductSubscriptionsQuery, GetProductSubscriptionsQueryVariables>;
export const GetSavedPaymentMethodsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSavedPaymentMethods"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"savedPaymentMethods"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"savedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"savedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"last4"}},{"kind":"Field","name":{"kind":"Name","value":"expirationMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expirationYear"}},{"kind":"Field","name":{"kind":"Name","value":"cardholderName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isExpired"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]} as unknown as DocumentNode<GetSavedPaymentMethodsQuery, GetSavedPaymentMethodsQueryVariables>;
export const GetSubscriptionOffersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubscriptionOffers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionOffers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"productIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"planId"}},{"kind":"Field","name":{"kind":"Name","value":"planName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"intervals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"subscriptionIntervalFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"subscriptionIntervalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionInterval"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetSubscriptionOffersQuery, GetSubscriptionOffersQueryVariables>;
export const GetSubscriptionRenewalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubscriptionRenewals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"onlyOpen"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionRenewals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"onlyOpen"},"value":{"kind":"Variable","name":{"kind":"Name","value":"onlyOpen"}}},{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"renewalFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"renewalFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubscriptionRenewal"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cutoffDate"}},{"kind":"Field","name":{"kind":"Name","value":"isManual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"previewTotal"}},{"kind":"Field","name":{"kind":"Name","value":"notifiedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderTotal"}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"storedPaymentMethodId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"nextAttemptDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastErrorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"reviewReason"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"canAcceptReview"}},{"kind":"Field","name":{"kind":"Name","value":"canRetryPayment"}},{"kind":"Field","name":{"kind":"Name","value":"requiresPaymentAction"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isExcluded"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<GetSubscriptionRenewalsQuery, GetSubscriptionRenewalsQueryVariables>;
export const GetSubscriptionTermsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubscriptionTerms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptionTerms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]} as unknown as DocumentNode<GetSubscriptionTermsQuery, GetSubscriptionTermsQueryVariables>;
export const OperationNames = {
  Query: {
    GetCartSubscriptionItems: 'GetCartSubscriptionItems',
    GetProductSubscription: 'GetProductSubscription',
    GetProductSubscriptions: 'GetProductSubscriptions',
    GetSavedPaymentMethods: 'GetSavedPaymentMethods',
    GetSubscriptionOffers: 'GetSubscriptionOffers',
    GetSubscriptionRenewals: 'GetSubscriptionRenewals',
    GetSubscriptionTerms: 'GetSubscriptionTerms'
  },
  Mutation: {
    AcceptSubscriptionRenewal: 'AcceptSubscriptionRenewal',
    AcceptSubscriptionTerms: 'AcceptSubscriptionTerms',
    AddSavedPaymentMethod: 'AddSavedPaymentMethod',
    CancelProductSubscription: 'CancelProductSubscription',
    ChangeProductSubscription: 'ChangeProductSubscription',
    OrderProductSubscriptionNow: 'OrderProductSubscriptionNow',
    PauseProductSubscription: 'PauseProductSubscription',
    RemoveCartItemSubscription: 'RemoveCartItemSubscription',
    RemoveSavedPaymentMethod: 'RemoveSavedPaymentMethod',
    ResumeProductSubscription: 'ResumeProductSubscription',
    RetrySubscriptionRenewalPayment: 'RetrySubscriptionRenewalPayment',
    SetCartItemSubscription: 'SetCartItemSubscription',
    SetDefaultSavedPaymentMethod: 'SetDefaultSavedPaymentMethod',
    SkipProductSubscription: 'SkipProductSubscription',
    SkipSubscriptionRenewal: 'SkipSubscriptionRenewal'
  },
  Fragment: {
    productSubscriptionFields: 'productSubscriptionFields',
    renewalFields: 'renewalFields',
    savedPaymentMethodFields: 'savedPaymentMethodFields',
    subscriptionCartItemFields: 'subscriptionCartItemFields',
    subscriptionIntervalFields: 'subscriptionIntervalFields'
  }
}
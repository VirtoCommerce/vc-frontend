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
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  DynamicPropertyValue: { input: any; output: any; }
  Long: { input: number; output: number; }
  ModuleSettingValue: { input: any; output: any; }
  OptionalDecimal: { input: any; output: any; }
  OptionalNullableDecimal: { input: any; output: any; }
  OptionalString: { input: string | undefined; output: string | undefined; }
  PropertyValue: { input: any; output: any; }
  Seconds: { input: any; output: any; }
};

export type AccountCreationResultType = {
  /** The errors that occurred during the operation. */
  errors?: Maybe<Array<Maybe<RegistrationErrorType>>>;
  requireEmailVerification: Scalars['Boolean']['output'];
  succeeded: Scalars['Boolean']['output'];
};

export type AddAddressToFavoritesCommandType = {
  addressId: Scalars['String']['input'];
};

export type AddQuoteAttachmentsCommandType = {
  quoteId: Scalars['String']['input'];
  urls: Array<InputMaybe<Scalars['String']['input']>>;
};

export type Asset = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']['output']>;
  /** Group of the asset. */
  group?: Maybe<Scalars['String']['output']>;
  /** The unique ID of the asset. */
  id: Scalars['String']['output'];
  /** MimeType of the asset. */
  mimeType?: Maybe<Scalars['String']['output']>;
  /** The name of the asset. */
  name?: Maybe<Scalars['String']['output']>;
  /** RelativeUrl of the asset. */
  relativeUrl?: Maybe<Scalars['String']['output']>;
  /** Size of the asset. */
  size: Scalars['Long']['output'];
  /** Type id of the asset. */
  typeId: Scalars['String']['output'];
  /** Url of the asset. */
  url: Scalars['String']['output'];
};

export type AuthorizePaymentResultType = {
  errorMessage?: Maybe<Scalars['String']['output']>;
  isSuccess: Scalars['Boolean']['output'];
};

export type AvailabilityData = {
  /** Available quantity */
  availableQuantity: Scalars['Long']['output'];
  /** Inventories */
  inventories: Array<InventoryInfo>;
  /** Is active */
  isActive: Scalars['Boolean']['output'];
  /** Is available */
  isAvailable: Scalars['Boolean']['output'];
  /** Is buyable */
  isBuyable: Scalars['Boolean']['output'];
  /** Is estimated */
  isEstimated: Scalars['Boolean']['output'];
  /** Is in stock */
  isInStock: Scalars['Boolean']['output'];
  /** Is track inventory */
  isTrackInventory: Scalars['Boolean']['output'];
};

export type Breadcrumb = {
  /** Id of item the breadcrumb calculated for */
  itemId: Scalars['String']['output'];
  /** Semantic URL keyword */
  semanticUrl?: Maybe<Scalars['String']['output']>;
  /** Full path from catalog */
  seoPath?: Maybe<Scalars['String']['output']>;
  /** Name of current breadcrumb */
  title: Scalars['String']['output'];
  /** Catalog, category or product */
  typeName: Scalars['String']['output'];
};

export type BulkCartType = {
  /** Cart */
  cart?: Maybe<CartType>;
  /** A set of errors in case the Skus are invalid */
  errors?: Maybe<Array<Maybe<ValidationErrorType>>>;
};

export type BulkWishlistType = {
  /** Wishlists */
  wishlists?: Maybe<Array<Maybe<WishlistType>>>;
};

export type CancelQuoteCommandType = {
  comment: Scalars['String']['input'];
  quoteId: Scalars['String']['input'];
};

export type CartAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars['Int']['output']>;
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']['output']>;
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Email */
  email?: Maybe<Scalars['String']['output']>;
  /** First name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Id */
  id?: Maybe<Scalars['String']['output']>;
  /** Id */
  key?: Maybe<Scalars['String']['output']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code */
  postalCode: Scalars['String']['output'];
  /** Region id */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']['output']>;
  /** Zip */
  zip?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `Cart`. */
export type CartConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CartEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CartType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Cart`. */
export type CartEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<CartType>;
};

export type CartShipmentItemType = {
  lineItem?: Maybe<LineItemType>;
  /** Quantity */
  quantity: Scalars['Int']['output'];
};

export type CartType = {
  /** Addresses */
  addresses: Array<CartAddressType>;
  /** Available Gifts */
  availableGifts: Array<GiftItemType>;
  /** Available payment methods */
  availablePaymentMethods: Array<PaymentMethodType>;
  availableShippingMethods: Array<ShippingMethodType>;
  /** Shopping cart channel ID */
  channelId?: Maybe<Scalars['String']['output']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']['output']>;
  /** Coupons */
  coupons: Array<CouponType>;
  /** Currency */
  currency: CurrencyType;
  /** Shopping cart user ID */
  customerId: Scalars['String']['output'];
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']['output']>;
  /** Total discount */
  discountTotal: MoneyType;
  /** Total discount with tax */
  discountTotalWithTax: MoneyType;
  /** Discounts */
  discounts: Array<DiscountType>;
  /** Cart dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  /** Total extended price */
  extendedPriceTotal: MoneyType;
  /** Total extended price with tax */
  extendedPriceTotalWithTax: MoneyType;
  /** Shopping cart fee */
  fee: MoneyType;
  /** Total fee */
  feeTotal: MoneyType;
  /** Total fee with tax */
  feeTotalWithTax: MoneyType;
  /** Shopping cart fee with tax */
  feeWithTax: MoneyType;
  /** Gifts */
  gifts: Array<GiftItemType>;
  /** Total handling */
  handlingTotal: MoneyType;
  /** Total handling with tax */
  handlingTotalWithTax: MoneyType;
  /** Has physical products */
  hasPhysicalProducts?: Maybe<Scalars['Boolean']['output']>;
  /** Shopping cart ID */
  id: Scalars['String']['output'];
  /** Displays whether the shopping cart is anonymous */
  isAnonymous: Scalars['Boolean']['output'];
  /** Displays whether the shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Shows whether the cart is valid
   * @deprecated Deprecated, because of useless (no need to know validation state without details). Use validationErrors field.
   */
  isValid: Scalars['Boolean']['output'];
  /** Items */
  items: Array<LineItemType>;
  /** Item count */
  itemsCount: Scalars['Int']['output'];
  /** Quantity of items */
  itemsQuantity: Scalars['Int']['output'];
  /** Shopping cart name */
  name: Scalars['String']['output'];
  /** Shopping cart organization ID */
  organizationId?: Maybe<Scalars['String']['output']>;
  /** Shopping cart organization name */
  organizationName?: Maybe<Scalars['String']['output']>;
  /** Payment price */
  paymentPrice: MoneyType;
  /** Payment price with tax */
  paymentPriceWithTax: MoneyType;
  /** Total payment */
  paymentTotal: MoneyType;
  /** Total payment with tax */
  paymentTotalWithTax: MoneyType;
  /** Payments */
  payments: Array<PaymentType>;
  /** Purchase order number */
  purchaseOrderNumber?: Maybe<Scalars['String']['output']>;
  /** Shipments */
  shipments: Array<ShipmentType>;
  /** Shipping price */
  shippingPrice: MoneyType;
  /** Shipping price with tax */
  shippingPriceWithTax: MoneyType;
  /** Total shipping */
  shippingTotal: MoneyType;
  /** Total shipping with tax */
  shippingTotalWithTax: MoneyType;
  /** Shopping cart status */
  status?: Maybe<Scalars['String']['output']>;
  /** Shopping cart store ID */
  storeId: Scalars['String']['output'];
  /** Shopping cart subtotal */
  subTotal: MoneyType;
  /** Subtotal discount */
  subTotalDiscount: MoneyType;
  /** Subtotal discount with tax */
  subTotalDiscountWithTax: MoneyType;
  /** Subtotal with tax */
  subTotalWithTax: MoneyType;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Tax percentage */
  taxPercentRate: Scalars['Decimal']['output'];
  /** Total tax */
  taxTotal: MoneyType;
  /** Shipping tax type */
  taxType: Scalars['String']['output'];
  /** Shopping cart total */
  total: MoneyType;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']['output']>;
  /** A set of errors in case the cart is invalid */
  validationErrors: Array<ValidationErrorType>;
  /** Shopping cart volumetric weight value */
  volumetricWeight?: Maybe<Scalars['Decimal']['output']>;
  /** A set of temporary warnings for a cart user */
  warnings: Array<ValidationErrorType>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars['Decimal']['output']>;
  /** Shopping cart weight unit value */
  weightUnit?: Maybe<Scalars['String']['output']>;
};


export type CartTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type CartTypeIsValidArgs = {
  ruleSet?: InputMaybe<Scalars['String']['input']>;
};


export type CartTypeValidationErrorsArgs = {
  ruleSet?: InputMaybe<Scalars['String']['input']>;
};

export type CatalogDiscountType = {
  /** Discount amount */
  amount: Scalars['Decimal']['output'];
  /** Discount amount with tax */
  amountWithTax: Scalars['Decimal']['output'];
  /** Coupon */
  coupon?: Maybe<Scalars['String']['output']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']['output']>;
  /** Discount amount in the specified currency */
  moneyAmount: MoneyType;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax: MoneyType;
  promotion?: Maybe<Promotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']['output']>;
};

export type Category = {
  /** Breadcrumbs */
  breadcrumbs: Array<Breadcrumb>;
  childCategories: Array<Category>;
  /** SKU of category. */
  code: Scalars['String']['output'];
  description?: Maybe<CategoryDescriptionType>;
  descriptions: Array<CategoryDescriptionType>;
  /** Have a parent */
  hasParent: Scalars['Boolean']['output'];
  /** Id of category. */
  id: Scalars['String']['output'];
  /** Images */
  images: Array<ImageType>;
  /** The category image. */
  imgSrc?: Maybe<Scalars['String']['output']>;
  /** Level in hierarchy */
  level: Scalars['Int']['output'];
  /** Name of category. */
  name: Scalars['String']['output'];
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']['output']>;
  /** Outlines */
  outlines: Array<OutlineType>;
  parent?: Maybe<Category>;
  /** Category path in to the requested catalog  (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: Maybe<Scalars['String']['output']>;
  /** The category priority. */
  priority: Scalars['Int']['output'];
  properties: Array<Property>;
  /** Request related SEO info */
  seoInfo: SeoInfo;
  /** Request related slug for category */
  slug?: Maybe<Scalars['String']['output']>;
};


export type CategoryDescriptionArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};


export type CategoryDescriptionsArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};


export type CategoryPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** A connection from an object to a list of objects of type `Category`. */
export type CategoryConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CategoryEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Category>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CategoryDescriptionType = {
  /** Description text. */
  content?: Maybe<Scalars['String']['output']>;
  /** Description type. */
  descriptionType?: Maybe<Scalars['String']['output']>;
  /** Description ID. */
  id: Scalars['String']['output'];
  /** Description language code. */
  languageCode?: Maybe<Scalars['String']['output']>;
};

/** An edge in a connection from an object to another object of type `Category`. */
export type CategoryEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<Category>;
};

export type ChangeQuoteCommentCommandType = {
  comment: Scalars['String']['input'];
  quoteId: Scalars['String']['input'];
};

export type ChangeQuoteItemQuantityCommandType = {
  lineItemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  quoteId: Scalars['String']['input'];
};

export type ChildCategoriesQueryResponseType = {
  childCategories?: Maybe<Array<Maybe<Category>>>;
};

export type CommonVendor = {
  /** Vendor ID */
  id: Scalars['String']['output'];
  /** Vendor name */
  name: Scalars['String']['output'];
  /** Vendor rating */
  rating?: Maybe<Rating>;
};

export type ConfirmTaskCommandType = {
  id: Scalars['String']['input'];
};

/** A connection from an object to a list of objects of type `Contact`. */
export type ContactConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ContactEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ContactType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Contact`. */
export type ContactEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ContactType>;
};

export type ContactType = {
  about: Scalars['String']['output'];
  addresses?: Maybe<MemberAddressConnection>;
  birthDate?: Maybe<Scalars['Date']['output']>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  /** Emails */
  emails: Array<Maybe<Scalars['String']['output']>>;
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  groups: Array<Maybe<Scalars['String']['output']>>;
  id: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  /** Member type */
  memberType: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  organizations?: Maybe<OrganizationConnection>;
  organizationsIds: Array<Maybe<Scalars['String']['output']>>;
  /** Outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phones */
  phones: Array<Maybe<Scalars['String']['output']>>;
  securityAccounts?: Maybe<Array<Maybe<UserType>>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** SEO object type */
  seoObjectType: Scalars['String']['output'];
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
};


export type ContactTypeAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ContactTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type ContactTypeOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ContactTypeSeoInfoArgs = {
  cultureName: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

/** A connection from an object to a list of objects of type `Contract`. */
export type ContractConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ContractEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ContractType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Contract`. */
export type ContractEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ContractType>;
};

export type ContractType = {
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** Contract dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
  vendorId?: Maybe<Scalars['String']['output']>;
};


export type ContractTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type CountryRegionType = {
  /** Code of country region. For example 'AL'. */
  id: Scalars['String']['output'];
  /** Name of country region. For example 'Alabama'. */
  name: Scalars['String']['output'];
};

export type CountryType = {
  /** Code of country. For example 'USA'. */
  id: Scalars['String']['output'];
  /** Name of country. For example 'United States of America'. */
  name: Scalars['String']['output'];
  regions: Array<CountryRegionType>;
};

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars['String']['output']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully: Scalars['Boolean']['output'];
};

export type CreateCustomerReviewCommandType = {
  entityId: Scalars['String']['input'];
  entityName: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  rating: Scalars['Int']['input'];
  review: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  title: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};

export type CreateQuoteCommandType = {
  cultureName: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type CreateQuoteFromCartCommandType = {
  cartId: Scalars['String']['input'];
  comment: Scalars['String']['input'];
};

export type CurrencyType = {
  /** Currency code may be used ISO 4217 */
  code: Scalars['String']['output'];
  /** Currency English name */
  cultureName: Scalars['String']['output'];
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars['String']['output']>;
  /** Currency English name */
  englishName: Scalars['String']['output'];
  /** Exchange rate */
  exchangeRate: Scalars['Decimal']['output'];
  /** Symbol */
  symbol: Scalars['String']['output'];
};

export type CustomIdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorInfoType>>>;
  succeeded: Scalars['Boolean']['output'];
};

/** A connection from an object to a list of objects of type `CustomerOrder`. */
export type CustomerOrderConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CustomerOrderEdge>>>;
  /** Filter facets */
  filter_facets: Array<FilterFacet>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CustomerOrderType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Range facets */
  range_facets: Array<RangeFacet>;
  /** Term facets */
  term_facets: Array<TermFacet>;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `CustomerOrder`. */
export type CustomerOrderEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<CustomerOrderType>;
};

export type CustomerOrderType = {
  addresses: Array<OrderAddressType>;
  /** Available payment methods */
  availablePaymentMethods: Array<OrderPaymentMethodType>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  coupons: Array<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  currency: CurrencyType;
  customerId: Scalars['String']['output'];
  customerName?: Maybe<Scalars['String']['output']>;
  discountAmount: MoneyType;
  discountTotal: MoneyType;
  discountTotalWithTax: MoneyType;
  discounts: Array<OrderDiscountType>;
  /** Customer order dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  employeeId?: Maybe<Scalars['String']['output']>;
  employeeName?: Maybe<Scalars['String']['output']>;
  fee: MoneyType;
  feeTotal: MoneyType;
  feeTotalWithTax: MoneyType;
  feeWithTax: MoneyType;
  id: Scalars['String']['output'];
  inPayments: Array<PaymentInType>;
  isApproved: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  isPrototype: Scalars['Boolean']['output'];
  items: Array<OrderLineItemType>;
  languageCode?: Maybe<Scalars['String']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  number: Scalars['String']['output'];
  objectType: Scalars['String']['output'];
  operationType: Scalars['String']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  parentOperationId?: Maybe<Scalars['String']['output']>;
  paymentDiscountTotal: MoneyType;
  paymentDiscountTotalWithTax: MoneyType;
  paymentSubTotal: MoneyType;
  paymentSubTotalWithTax: MoneyType;
  paymentTaxTotal: MoneyType;
  paymentTotal: MoneyType;
  paymentTotalWithTax: MoneyType;
  purchaseOrderNumber?: Maybe<Scalars['String']['output']>;
  shipments: Array<OrderShipmentType>;
  shippingDiscountTotal: MoneyType;
  shippingDiscountTotalWithTax: MoneyType;
  shippingSubTotal: MoneyType;
  shippingSubTotalWithTax: MoneyType;
  shippingTaxTotal: MoneyType;
  shippingTotal: MoneyType;
  shippingTotalWithTax: MoneyType;
  shoppingCartId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
  storeId: Scalars['String']['output'];
  storeName?: Maybe<Scalars['String']['output']>;
  subTotal: MoneyType;
  subTotalDiscount: MoneyType;
  subTotalDiscountWithTax: MoneyType;
  subTotalTaxTotal: MoneyType;
  subTotalWithTax: MoneyType;
  subscriptionId?: Maybe<Scalars['String']['output']>;
  subscriptionNumber?: Maybe<Scalars['String']['output']>;
  taxDetails: Array<OrderTaxDetailType>;
  taxPercentRate: Scalars['Decimal']['output'];
  taxTotal: MoneyType;
  taxType?: Maybe<Scalars['String']['output']>;
  total: MoneyType;
};


export type CustomerOrderTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type CustomerOrderTypeInPaymentsArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerReview = {
  createdDate: Scalars['DateTime']['output'];
  entityId: Scalars['String']['output'];
  entityName: Scalars['String']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  rating: Scalars['Int']['output'];
  review: Scalars['String']['output'];
  reviewStatus?: Maybe<CustomerReviewStatus>;
  storeId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userName: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `CustomerReview`. */
export type CustomerReviewConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CustomerReviewEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CustomerReview>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `CustomerReview`. */
export type CustomerReviewEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<CustomerReview>;
};

export enum CustomerReviewStatus {
  Approved = 'APPROVED',
  New = 'NEW',
  Rejected = 'REJECTED'
}

export type DeleteFileCommandType = {
  id: Scalars['String']['input'];
};

export type DeleteQuoteAttachmentsCommandType = {
  quoteId: Scalars['String']['input'];
  urls: Array<InputMaybe<Scalars['String']['input']>>;
};

export type DeleteSkyflowCardCommandType = {
  /** Skyflow card id */
  skyflowId: Scalars['String']['input'];
  /** Store id */
  storeId: Scalars['String']['input'];
};

export type DescriptionType = {
  /** Description text. */
  content?: Maybe<Scalars['String']['output']>;
  /** Description ID. */
  id: Scalars['String']['output'];
  /** Description language code. */
  languageCode?: Maybe<Scalars['String']['output']>;
  /** Description type. */
  reviewType?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `DictionaryItem`. */
export type DictionaryItemConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<DictionaryItemEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<DictionaryItemType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `DictionaryItem`. */
export type DictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<DictionaryItemType>;
};

export type DictionaryItemType = {
  /** Id */
  id: Scalars['String']['output'];
  /** Localized dictionary item value */
  label?: Maybe<Scalars['String']['output']>;
  /** Name */
  name: Scalars['String']['output'];
};

export type DiscountType = {
  /** Discount amount */
  amount: Scalars['Decimal']['output'];
  /** Discount amount with tax */
  amountWithTax: Scalars['Decimal']['output'];
  /** Coupon */
  coupon?: Maybe<Scalars['String']['output']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']['output']>;
  /** Discount amount in the specified currency */
  moneyAmount: MoneyType;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax: MoneyType;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']['output']>;
};

export type DynamicContentItemType = {
  contentType: Scalars['String']['output'];
  description: Scalars['String']['output'];
  /** Dynamic content dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
};


export type DynamicContentItemTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

/** A connection from an object to a list of objects of type `DynamicProperty`. */
export type DynamicPropertyConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<DynamicPropertyEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<DynamicPropertyType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `DynamicProperty`. */
export type DynamicPropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<DynamicPropertyType>;
};

export type DynamicPropertyType = {
  dictionaryItems?: Maybe<DictionaryItemConnection>;
  /** The order for the dynamic property to display */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Value type */
  dynamicPropertyValueType: DynamicPropertyValueTypes;
  /** Id */
  id: Scalars['String']['output'];
  /** Is dynamic property value an array */
  isArray: Scalars['Boolean']['output'];
  /** Is dynamic property value a dictionary */
  isDictionary: Scalars['Boolean']['output'];
  /** Is dynamic property value multilingual */
  isMultilingual: Scalars['Boolean']['output'];
  /** Is dynamic property value required */
  isRequired: Scalars['Boolean']['output'];
  /** Localized property name */
  label?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** Object type */
  objectType: Scalars['String']['output'];
  /**
   * Value type
   * @deprecated Use dynamicPropertyValueType instead
   */
  valueType: Scalars['String']['output'];
};


export type DynamicPropertyTypeDictionaryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type DynamicPropertyValueType = {
  /** Associated dictionary item */
  dictionaryItem?: Maybe<DictionaryItemType>;
  /** Associated dynamic property */
  dynamicProperty?: Maybe<DynamicPropertyType>;
  /** Value type */
  dynamicPropertyValueType: DynamicPropertyValueTypes;
  /** Property name */
  name?: Maybe<Scalars['String']['output']>;
  /** Property value */
  value?: Maybe<Scalars['DynamicPropertyValue']['output']>;
  /** Value type */
  valueType: Scalars['String']['output'];
};

/** Dynamic property value type */
export enum DynamicPropertyValueTypes {
  Boolean = 'BOOLEAN',
  DateTime = 'DATE_TIME',
  Decimal = 'DECIMAL',
  Html = 'HTML',
  Image = 'IMAGE',
  Integer = 'INTEGER',
  LongText = 'LONG_TEXT',
  ShortText = 'SHORT_TEXT',
  Undefined = 'UNDEFINED'
}

export type ErrorParameterType = {
  /** key */
  key: Scalars['String']['output'];
  /** Value */
  value: Scalars['String']['output'];
};

export type EvaluateDynamicContentResultType = {
  items?: Maybe<Array<Maybe<DynamicContentItemType>>>;
  totalCount: Scalars['Int']['output'];
};

export type Facet = {
  /** Three facet types: Terms, Range, and Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
};

export type FacetRangeType = {
  /** Amount of products for which the values in a field fall into the specified range */
  count: Scalars['Long']['output'];
  /** The range’s lower endpoint in number format, 0 represents infinity */
  from: Scalars['Long']['output'];
  /** The range’s lower endpoint in string format, empty string represents infinity */
  fromStr?: Maybe<Scalars['String']['output']>;
  /** The flag indicates that From exclusive */
  includeFrom: Scalars['Boolean']['output'];
  /** The flag indicates that To exclusive */
  includeTo: Scalars['Boolean']['output'];
  /** is selected state */
  isSelected: Scalars['Boolean']['output'];
  /** Localization label */
  label: Scalars['String']['output'];
  /** Maximum value among all values contained within the range */
  max: Scalars['Long']['output'];
  /** Minimum value among all values contained within the range */
  min: Scalars['Long']['output'];
  /** The range’s upper endpoint in number format, 0 represents infinity */
  to: Scalars['Long']['output'];
  /** The range’s upper endpoint in string format, empty string represents infinity */
  toStr?: Maybe<Scalars['String']['output']>;
  /** Sum of all values contained in the range */
  total: Scalars['Long']['output'];
};

export type FacetTermType = {
  /** count */
  count: Scalars['Long']['output'];
  /** is selected state */
  isSelected: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  /** term */
  term: Scalars['String']['output'];
};

export enum FacetTypes {
  Filter = 'FILTER',
  Range = 'RANGE',
  Terms = 'TERMS'
}

export type FileUploadScopeOptionsType = {
  allowedExtensions: Array<Maybe<Scalars['String']['output']>>;
  maxFileSize: Scalars['Long']['output'];
  scope: Scalars['String']['output'];
};

export type FilterFacet = Facet & {
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int']['output'];
  /** The three types of facets. Terms, Range, Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
};

export type FulfillmentCenterAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars['Int']['output']>;
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']['output']>;
  /** Email */
  email?: Maybe<Scalars['String']['output']>;
  /** First name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Id */
  id?: Maybe<Scalars['String']['output']>;
  /** Id */
  key?: Maybe<Scalars['String']['output']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code */
  postalCode: Scalars['String']['output'];
  /** Region id */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']['output']>;
  /** Zip */
  zip?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `FulfillmentCenter`. */
export type FulfillmentCenterConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<FulfillmentCenterEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<FulfillmentCenterType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `FulfillmentCenter`. */
export type FulfillmentCenterEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<FulfillmentCenterType>;
};

export type FulfillmentCenterType = {
  /** Fulfillment Center address. */
  address?: Maybe<FulfillmentCenterAddressType>;
  /** Fulfillment Center descripion. */
  description?: Maybe<Scalars['String']['output']>;
  /** Fulfillment Center geo location. */
  geoLocation?: Maybe<Scalars['String']['output']>;
  /** Fulfillment Center ID. */
  id: Scalars['String']['output'];
  /** Fulfillment Center name. */
  name?: Maybe<Scalars['String']['output']>;
  /** Nearest Fulfillment Centers */
  nearest?: Maybe<Array<Maybe<FulfillmentCenterType>>>;
  /** Fulfillment Center outerId. */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Fulfillment Center short description. */
  shortDescription?: Maybe<Scalars['String']['output']>;
};


export type FulfillmentCenterTypeNearestArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type GiftItemType = {
  /** Product category ID */
  categoryId?: Maybe<Scalars['String']['output']>;
  /** Artificial ID for this value object */
  id: Scalars['String']['output'];
  /** Value of reward image absolute URL */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Line item ID in case there is a gift in the cart. If there is no gift, it stays null */
  lineItemId?: Maybe<Scalars['String']['output']>;
  /** Measurement unit */
  measureUnit?: Maybe<Scalars['String']['output']>;
  /** Name of the reward */
  name: Scalars['String']['output'];
  product?: Maybe<Product>;
  /** Product ID */
  productId?: Maybe<Scalars['String']['output']>;
  /** Promotion ID */
  promotionId: Scalars['String']['output'];
  /** Number of gifts in the reward */
  quantity: Scalars['Int']['output'];
};

export type GraphQlSettingsType = {
  /** Keep-alive message interval for GraphQL subscription */
  keepAliveInterval: Scalars['Seconds']['output'];
};

export type IdentityErrorInfoType = {
  /** Error code */
  code: Scalars['String']['output'];
  /** Error description */
  description?: Maybe<Scalars['String']['output']>;
  /** Error parameter */
  parameter?: Maybe<Scalars['String']['output']>;
};

export type IdentityErrorType = {
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
};

export type IdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorType>>>;
  succeeded: Scalars['Boolean']['output'];
};

export type ImageType = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']['output']>;
  /** Image group */
  group?: Maybe<Scalars['String']['output']>;
  /** Image ID */
  id: Scalars['String']['output'];
  /** Image name */
  name?: Maybe<Scalars['String']['output']>;
  /** Image relative URL */
  relativeUrl?: Maybe<Scalars['String']['output']>;
  /** Sort order */
  sortOrder: Scalars['Int']['output'];
  /** Image URL */
  url: Scalars['String']['output'];
};

export type InitializePaymentResultType = {
  actionHtmlForm?: Maybe<Scalars['String']['output']>;
  actionRedirectUrl?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  isSuccess: Scalars['Boolean']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  paymentActionType?: Maybe<Scalars['String']['output']>;
  paymentId?: Maybe<Scalars['String']['output']>;
  paymentMethodCode?: Maybe<Scalars['String']['output']>;
  publicParameters?: Maybe<Array<Maybe<KeyValueType>>>;
  storeId?: Maybe<Scalars['String']['output']>;
};

export type InputAddBulkItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  /** Bulk cart items */
  cartItems: Array<InputMaybe<InputNewBulkItemType>>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddCouponType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Coupon code */
  couponCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddGiftItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** IDs of gift rewards to add to the cart */
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Comment */
  comment?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Price */
  price?: InputMaybe<Scalars['Decimal']['input']>;
  /** Product ID */
  productId: Scalars['String']['input'];
  /** Quantity */
  quantity: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  /** Cart items */
  cartItems: Array<InputMaybe<InputNewCartItemType>>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddOrUpdateCartAddressType = {
  /** Address */
  address: InputAddressType;
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddOrUpdateCartPaymentType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Payment */
  payment: InputPaymentType;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddOrUpdateCartShipmentType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Shipment */
  shipment: InputShipmentType;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddOrUpdateOrderPaymentType = {
  /** Order ID */
  orderId: Scalars['String']['input'];
  /** Payment */
  payment: InputOrderPaymentType;
};

export type InputAddWishlistBulkItemType = {
  /** Wish list ids */
  listIds: Array<InputMaybe<Scalars['String']['input']>>;
  /** Product id to add */
  productId: Scalars['String']['input'];
  /** Product quantity to add */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputAddWishlistItemType = {
  /** Wish list id */
  listId: Scalars['String']['input'];
  /** Product id to add */
  productId: Scalars['String']['input'];
  /** Product quantity to add */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputAddWishlistItemsType = {
  listId: Scalars['String']['input'];
  /** List items */
  listItems: Array<InputNewWishlistItemType>;
};

export type InputAddressType = {
  addressType?: InputMaybe<Scalars['Int']['input']>;
  /** City */
  city?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Country code */
  countryCode?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Country */
  countryName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Description */
  description?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Email */
  email?: InputMaybe<Scalars['OptionalString']['input']>;
  /** First name */
  firstName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** ID */
  id?: InputMaybe<Scalars['String']['input']>;
  /** ID */
  key?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Line1 */
  line1?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Line2 */
  line2?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Middle name */
  middleName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Name */
  name?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Company name */
  organization?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Outer ID */
  outerId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Phone */
  phone?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Region ID */
  regionId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Region */
  regionName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Zip */
  zip?: InputMaybe<Scalars['OptionalString']['input']>;
};

export type InputApplicationUserLoginType = {
  loginProvider: Scalars['String']['input'];
  providerKey: Scalars['String']['input'];
};

export type InputAssignPermissionScopeType = {
  scope: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type InputAssignPermissionType = {
  assignedScopes?: InputMaybe<Array<InputMaybe<InputAssignPermissionScopeType>>>;
  name: Scalars['String']['input'];
};

export type InputAssignRoleType = {
  concurrencyStamp?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  permissions: Array<InputMaybe<InputAssignPermissionType>>;
};

export type InputAuthorizePaymentType = {
  /** Order Id */
  orderId?: InputMaybe<Scalars['String']['input']>;
  /** Input parameters */
  parameters?: InputMaybe<Array<InputMaybe<InputKeyValueType>>>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
};

export type InputChangeAllCartItemsSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartItemCommentType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Comment */
  comment: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartItemPriceType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** Price */
  price: Scalars['Decimal']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartItemQuantityType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** Quantity */
  quantity: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartItemSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** Is item selected for checkout */
  selectedForCheckout: Scalars['Boolean']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartItemsSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** List of line item Ids */
  lineItemIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCommentType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Comment */
  comment?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeOrderStatusType = {
  /** Order ID */
  orderId: Scalars['String']['input'];
  /** Order status */
  status: Scalars['String']['input'];
};

export type InputChangeOrganizationContactRoleType = {
  /** Role IDs or names to be assigned to the user */
  roleIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** User identifier to be changed */
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type InputChangePasswordType = {
  /** New password according with system security policy */
  newPassword: Scalars['String']['input'];
  /** Old user password */
  oldPassword: Scalars['String']['input'];
  /** User identifier */
  userId: Scalars['String']['input'];
};

export type InputChangePurchaseOrderNumber = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Purchase Order Number */
  purchaseOrderNumber?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeWishlistType = {
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** List description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** List ID */
  listId: Scalars['String']['input'];
  /** New List name */
  listName?: InputMaybe<Scalars['String']['input']>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars['String']['input']>;
};

export type InputClearCartType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputClearPaymentsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputClearShipmentsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputCloneWishlistType = {
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** List description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Source List ID */
  listId: Scalars['String']['input'];
  /** List name */
  listName?: InputMaybe<Scalars['String']['input']>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Store ID */
  storeId: Scalars['String']['input'];
  /** Owner ID */
  userId: Scalars['String']['input'];
};

export type InputConfirmEmailType = {
  /** Confirm email token */
  token: Scalars['String']['input'];
  /** User identifier */
  userId: Scalars['String']['input'];
};

export type InputCreateApplicationUserType = {
  /** Username of the creator */
  createdBy?: InputMaybe<Scalars['String']['input']>;
  /** Date of user creation */
  createdDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** User Email */
  email: Scalars['String']['input'];
  /** User ID */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Can user be locked out */
  lockoutEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** End date of lockout */
  lockoutEnd?: InputMaybe<Scalars['DateTime']['input']>;
  /** External logins */
  logins?: InputMaybe<Array<InputMaybe<InputApplicationUserLoginType>>>;
  /** Id of the associated Member */
  memberId?: InputMaybe<Scalars['String']['input']>;
  /** User password (nullable, for external logins) */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Password expiration date */
  passwordExpired?: InputMaybe<Scalars['Boolean']['input']>;
  /** User phone number */
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: InputMaybe<Scalars['Boolean']['input']>;
  /** User photo URL */
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  /** List of user roles */
  roles?: InputMaybe<Array<InputMaybe<InputAssignRoleType>>>;
  /** Associated Store Id */
  storeId?: InputMaybe<Scalars['String']['input']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** User name */
  userName: Scalars['String']['input'];
  /** User type (Manager, Customer) */
  userType: Scalars['String']['input'];
};

export type InputCreateContactType = {
  about?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  defaultLanguage?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  firstName: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  memberType?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  salutation?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type InputCreateOrderFromCartType = {
  /** Cart ID */
  cartId?: InputMaybe<Scalars['String']['input']>;
};

export type InputCreateOrganizationType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  memberType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type InputCreateUserType = {
  /** Application user to create */
  applicationUser: InputCreateApplicationUserType;
};

export type InputCreateWishlistType = {
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** List description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** List name */
  listName?: InputMaybe<Scalars['String']['input']>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Store ID */
  storeId: Scalars['String']['input'];
  /** Owner ID */
  userId: Scalars['String']['input'];
};

export type InputDeleteContactType = {
  contactId: Scalars['String']['input'];
};

export type InputDeleteMemberAddressType = {
  addresses: Array<InputMaybe<InputMemberAddressType>>;
  memberId: Scalars['String']['input'];
};

export type InputDeleteUserType = {
  userNames: Array<InputMaybe<Scalars['String']['input']>>;
};

export type InputDynamicPropertyValueType = {
  /** Culture name ("en-US") for multilingual property */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Language ("en-US") for multilingual property */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** Dynamic property name */
  name: Scalars['String']['input'];
  /** Dynamic property value. ID must be passed for dictionary item */
  value?: InputMaybe<Scalars['DynamicPropertyValue']['input']>;
};

export type InputInitializePaymentType = {
  /** Order Id */
  orderId?: InputMaybe<Scalars['String']['input']>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
};

export type InputInviteUserType = {
  /** Customer order Id to be associated with this user. */
  customerOrderId?: InputMaybe<Scalars['String']['input']>;
  /** Emails which will receive invites */
  emails: Array<Scalars['String']['input']>;
  /** Optional message to include into email with instructions which invites persons will see */
  message?: InputMaybe<Scalars['String']['input']>;
  /** ID of organization where contact will be added for user */
  organizationId?: InputMaybe<Scalars['String']['input']>;
  /** Role IDs or names to be assigned to the invited user */
  roleIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** ID of store which will send invites */
  storeId: Scalars['String']['input'];
  /** Optional URL suffix: you may provide here relative URL to your page which handle registration by invite */
  urlSuffix?: InputMaybe<Scalars['String']['input']>;
};

export type InputKeyValueType = {
  /** Dictionary key */
  key: Scalars['String']['input'];
  /** Dictionary value */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type InputLockUnlockOrganizationContactType = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type InputMarkPushMessageReadType = {
  messageId: Scalars['String']['input'];
};

export type InputMarkPushMessageUnreadType = {
  messageId: Scalars['String']['input'];
};

export type InputMemberAddressType = {
  addressType?: InputMaybe<Scalars['Int']['input']>;
  /** City */
  city: Scalars['String']['input'];
  /** Country code */
  countryCode: Scalars['String']['input'];
  /** Country name */
  countryName?: InputMaybe<Scalars['String']['input']>;
  /** Description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** First name */
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  /** key */
  key?: InputMaybe<Scalars['String']['input']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Line1 */
  line1: Scalars['String']['input'];
  /** Line2 */
  line2?: InputMaybe<Scalars['String']['input']>;
  /** Middle name */
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Company name */
  organization?: InputMaybe<Scalars['String']['input']>;
  /** Outer id */
  outerId?: InputMaybe<Scalars['String']['input']>;
  /** Phone */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code */
  postalCode: Scalars['String']['input'];
  /** Region id */
  regionId?: InputMaybe<Scalars['String']['input']>;
  /** Region name */
  regionName?: InputMaybe<Scalars['String']['input']>;
  /** Zip */
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type InputMergeCartType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Delete second cart after merge */
  deleteAfterMerge?: InputMaybe<Scalars['Boolean']['input']>;
  /** Second cart Id */
  secondCartId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputMoveWishlistItemType = {
  /** Destination List ID */
  destinationListId: Scalars['String']['input'];
  /** Line item ID to move */
  lineItemId: Scalars['String']['input'];
  /** Source List ID */
  listId: Scalars['String']['input'];
};

export type InputNewBulkItemType = {
  /** Product SKU */
  productSku: Scalars['String']['input'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputNewCartItemType = {
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Product Id */
  productId: Scalars['String']['input'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputNewWishlistItemType = {
  /** Product Id */
  productId: Scalars['String']['input'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputOrderAddressType = {
  addressType?: InputMaybe<Scalars['Int']['input']>;
  /** City */
  city?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Country code */
  countryCode?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Country name */
  countryName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Email */
  email?: InputMaybe<Scalars['OptionalString']['input']>;
  /** First name */
  firstName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** ID */
  id?: InputMaybe<Scalars['String']['input']>;
  /** Id */
  key?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Line1 */
  line1?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Line2 */
  line2?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Middle name */
  middleName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Name */
  name?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Company name */
  organization?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Outer id */
  outerId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Phone */
  phone?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Region id */
  regionId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Region name */
  regionName?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Zip */
  zip?: InputMaybe<Scalars['OptionalString']['input']>;
};

export type InputOrderBankCardInfoType = {
  bankCardCVV2: Scalars['String']['input'];
  bankCardMonth: Scalars['Int']['input'];
  bankCardNumber: Scalars['String']['input'];
  bankCardType: Scalars['String']['input'];
  bankCardYear: Scalars['Int']['input'];
  cardholderName: Scalars['String']['input'];
};

export type InputOrderPaymentType = {
  amount?: InputMaybe<Scalars['OptionalDecimal']['input']>;
  billingAddress?: InputMaybe<InputOrderAddressType>;
  /** Text comment */
  comment?: InputMaybe<Scalars['OptionalString']['input']>;
  currency?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Payment ID */
  id?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Payment outer ID value */
  outerId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Payment gateway code value */
  paymentGatewayCode?: InputMaybe<Scalars['OptionalString']['input']>;
  price?: InputMaybe<Scalars['OptionalDecimal']['input']>;
  /** Payment vendor ID value */
  vendorId?: InputMaybe<Scalars['OptionalString']['input']>;
};

export type InputPaymentType = {
  amount?: InputMaybe<Scalars['OptionalDecimal']['input']>;
  billingAddress?: InputMaybe<InputAddressType>;
  /** Text comment */
  comment?: InputMaybe<Scalars['OptionalString']['input']>;
  currency?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Payment ID */
  id?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Payment outer ID value */
  outerId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Payment gateway code value */
  paymentGatewayCode?: InputMaybe<Scalars['OptionalString']['input']>;
  price?: InputMaybe<Scalars['OptionalDecimal']['input']>;
  purpose?: InputMaybe<Scalars['OptionalString']['input']>;
  vendorId?: InputMaybe<Scalars['OptionalString']['input']>;
};

export type InputPersonalDataType = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type InputProcessOrderPaymentType = {
  /** Credit card details */
  bankCardInfo?: InputMaybe<InputOrderBankCardInfoType>;
  /** Order ID */
  orderId: Scalars['String']['input'];
  /** Payment ID */
  paymentId: Scalars['String']['input'];
};

export type InputQuoteAddressType = {
  addressType?: InputMaybe<Scalars['Int']['input']>;
  city: Scalars['String']['input'];
  countryCode?: InputMaybe<Scalars['String']['input']>;
  countryName: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  line1?: InputMaybe<Scalars['String']['input']>;
  line2?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Company name */
  organization?: InputMaybe<Scalars['String']['input']>;
  outerId?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  regionId?: InputMaybe<Scalars['String']['input']>;
  regionName?: InputMaybe<Scalars['String']['input']>;
};

export type InputRegisterAccountType = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type InputRegisterByInvitationType = {
  /** Customer order Id to be associated with this user. */
  customerOrderId?: InputMaybe<Scalars['String']['input']>;
  /** First name of person */
  firstName: Scalars['String']['input'];
  /** Last name of person */
  lastName: Scalars['String']['input'];
  /** Password */
  password: Scalars['String']['input'];
  /** Phone */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Invitation token */
  token: Scalars['String']['input'];
  /** ID of use created for invited email */
  userId: Scalars['String']['input'];
  /** Username */
  username: Scalars['String']['input'];
};

export type InputRegisterContactType = {
  about?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<InputMemberAddressType>;
  birthdate?: InputMaybe<Scalars['Date']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type InputRegisterOrganizationType = {
  address?: InputMaybe<InputMemberAddressType>;
  description?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  name: Scalars['String']['input'];
};

export type InputRejectGiftItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Ids of gift lineItems to reject from cart */
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveCartAddressType = {
  /** Address Id */
  addressId: Scalars['String']['input'];
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveCartType = {
  /** Cart Id */
  cartId: Scalars['String']['input'];
  /** User Id */
  userId: Scalars['String']['input'];
};

export type InputRemoveCouponType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Coupon code */
  couponCode?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Array of line item Id */
  lineItemIds: Array<InputMaybe<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveMemberFromOrganizationType = {
  contactId?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type InputRemoveShipmentType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Shipment Id */
  shipmentId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveWishlistItemType = {
  /** Line item ID to remove */
  lineItemId?: InputMaybe<Scalars['String']['input']>;
  /** List ID */
  listId: Scalars['String']['input'];
  /** Line item product ID to remove */
  productId?: InputMaybe<Scalars['String']['input']>;
};

export type InputRemoveWishlistItemsType = {
  /** Line item IDs to remove */
  lineItemIds: Array<Scalars['String']['input']>;
  /** List ID */
  listId: Scalars['String']['input'];
};

export type InputRemoveWishlistType = {
  /** List ID */
  listId: Scalars['String']['input'];
};

export type InputRenameWishlistType = {
  /** List ID */
  listId: Scalars['String']['input'];
  /** New List name */
  listName?: InputMaybe<Scalars['String']['input']>;
};

export type InputRequestRegistrationType = {
  /** Creating contact's account */
  account: InputRegisterAccountType;
  /** Creating contact */
  contact: InputRegisterContactType;
  /** Notification language code */
  languageCode?: InputMaybe<Scalars['String']['input']>;
  /** company type */
  organization?: InputMaybe<InputRegisterOrganizationType>;
  /** Store ID */
  storeId: Scalars['String']['input'];
};

export type InputResetPasswordByTokenType = {
  /** New password according with system security policy */
  newPassword: Scalars['String']['input'];
  /** User password reset token */
  token: Scalars['String']['input'];
  /** User identifier */
  userId: Scalars['String']['input'];
};

export type InputSendVerifyEmailType = {
  email?: InputMaybe<Scalars['String']['input']>;
  /** Notification language code */
  languageCode?: InputMaybe<Scalars['String']['input']>;
  /** Store ID */
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type InputShipmentType = {
  /** Text comment */
  comment?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Currency value */
  currency?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Delivery address */
  deliveryAddress?: InputMaybe<InputAddressType>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Fulfillment center iD */
  fulfillmentCenterId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Height value */
  height?: InputMaybe<Scalars['OptionalNullableDecimal']['input']>;
  /** Shipment ID */
  id?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Length value */
  length?: InputMaybe<Scalars['OptionalNullableDecimal']['input']>;
  /** Measurement unit value */
  measureUnit?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Price value */
  price?: InputMaybe<Scalars['OptionalDecimal']['input']>;
  /** Shipping method code */
  shipmentMethodCode?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Shipping method option */
  shipmentMethodOption?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Vendor ID */
  vendorId?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Volumetric weight value */
  volumetricWeight?: InputMaybe<Scalars['OptionalNullableDecimal']['input']>;
  /** Weight value */
  weight?: InputMaybe<Scalars['OptionalNullableDecimal']['input']>;
  /** Weight unit value */
  weightUnit?: InputMaybe<Scalars['OptionalString']['input']>;
  /** Width value */
  width?: InputMaybe<Scalars['OptionalNullableDecimal']['input']>;
};

export type InputUpdateApplicationUserType = {
  /** Failed login attempts for the current user */
  accessFailedCount?: InputMaybe<Scalars['Int']['input']>;
  /** User Email */
  email: Scalars['String']['input'];
  /** User ID */
  id: Scalars['String']['input'];
  /** Can user be locked out */
  lockoutEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** End date of lockout */
  lockoutEnd?: InputMaybe<Scalars['DateTime']['input']>;
  /** Id of the associated Memeber */
  memberId?: InputMaybe<Scalars['String']['input']>;
  /** Password Hash */
  passwordHash?: InputMaybe<Scalars['String']['input']>;
  /** User phone number */
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: InputMaybe<Scalars['Boolean']['input']>;
  /** User photo URL */
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  /** List of user roles */
  roles?: InputMaybe<Array<InputMaybe<InputAssignRoleType>>>;
  /** SecurityStamp */
  securityStamp: Scalars['String']['input'];
  /** Associated Store Id */
  storeId?: InputMaybe<Scalars['String']['input']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** User name */
  userName: Scalars['String']['input'];
  /** User type (Manager, Customer) */
  userType: Scalars['String']['input'];
};

export type InputUpdateCartDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateCartItemDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateCartPaymentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateCartShipmentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Shipment Id */
  shipmentId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateContactType = {
  about?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  defaultLanguage?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  firstName: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  memberType?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  salutation?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateMemberAddressType = {
  addresses: Array<InputMaybe<InputMemberAddressType>>;
  memberId: Scalars['String']['input'];
};

export type InputUpdateMemberDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  memberId: Scalars['String']['input'];
};

export type InputUpdateOrderDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateOrderItemDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  lineItemId?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateOrderPaymentDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  paymentId?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateOrderShipmentDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  shipmentId?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateOrganizationType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id: Scalars['String']['input'];
  memberType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type InputUpdatePersonalDataType = {
  personalData: InputPersonalDataType;
};

export type InputUpdateRoleInnerType = {
  /** Concurrency Stamp */
  concurrencyStamp?: InputMaybe<Scalars['String']['input']>;
  /** Role description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Role ID */
  id: Scalars['String']['input'];
  /** Role name */
  name: Scalars['String']['input'];
  /** List of Role permissions */
  permissions: Array<InputMaybe<InputAssignPermissionType>>;
};

export type InputUpdateRoleType = {
  /** Role to update */
  role: InputUpdateRoleInnerType;
};

export type InputUpdateUserType = {
  /** Application user to update */
  applicationUser: InputUpdateApplicationUserType;
};

export type InputUpdateWishlistItemsType = {
  /** Bulk wishlist items */
  items: Array<InputMaybe<InputUpdateWishlistLineItemType>>;
  /** Wish list id */
  listId: Scalars['String']['input'];
};

export type InputUpdateWishlistLineItemType = {
  /** Line Item Id to update */
  lineItemId: Scalars['String']['input'];
  /** Product quantity to add */
  quantity: Scalars['Int']['input'];
};

export type InputValidateCouponType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Coupon */
  coupon: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InventoryInfo = {
  /** Allow backorder */
  allowBackorder: Scalars['Boolean']['output'];
  /** Allow preorder */
  allowPreorder: Scalars['Boolean']['output'];
  /** Backorder availability date */
  backorderAvailabilityDate?: Maybe<Scalars['DateTime']['output']>;
  fulfillmentCenterId: Scalars['String']['output'];
  fulfillmentCenterName: Scalars['String']['output'];
  /** Inventory in stock quantity */
  inStockQuantity: Scalars['Long']['output'];
  /** Preorder availability date */
  preorderAvailabilityDate?: Maybe<Scalars['DateTime']['output']>;
  /** Inventory reserved quantity */
  reservedQuantity: Scalars['Long']['output'];
};

export type KeyValueType = {
  /** Dictionary key */
  key: Scalars['String']['output'];
  /** Dictionary value */
  value?: Maybe<Scalars['String']['output']>;
};

export type LanguageType = {
  /** Culture name format (e.g. en-US) */
  cultureName: Scalars['String']['output'];
  /** Is invariant */
  isInvariant: Scalars['Boolean']['output'];
  /** Native name */
  nativeName: Scalars['String']['output'];
  /** ISO 639-2 three-letter code for the language. */
  threeLetterLanguageName: Scalars['String']['output'];
  /** Three-letter code defined in ISO 3166 for the country/region. */
  threeLetterRegionName: Scalars['String']['output'];
  /** ISO 639-1 two-letter code for the language. */
  twoLetterLanguageName: Scalars['String']['output'];
  /** Two-letter code defined in ISO 3166 for the country/region. */
  twoLetterRegionName: Scalars['String']['output'];
};

export type LineItemType = {
  /** Catalog ID value */
  catalogId: Scalars['String']['output'];
  /** Category ID value */
  categoryId?: Maybe<Scalars['String']['output']>;
  /** Line item create date */
  createdDate: Scalars['DateTime']['output'];
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  /** Total discount */
  discountTotal: MoneyType;
  /** Total discount with tax */
  discountTotalWithTax: MoneyType;
  /** Discounts */
  discounts: Array<DiscountType>;
  /** Cart line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Extended price */
  extendedPrice: MoneyType;
  /** Extended price with tax */
  extendedPriceWithTax: MoneyType;
  /** Line item fulfillment center ID value */
  fulfillmentCenterId?: Maybe<Scalars['String']['output']>;
  /** Line item fulfillment center name value */
  fulfillmentCenterName?: Maybe<Scalars['String']['output']>;
  /** Height value */
  height?: Maybe<Scalars['Decimal']['output']>;
  /** Line item ID */
  id: Scalars['String']['output'];
  /** Value of line item image absolute URL */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** In stock quantity */
  inStockQuantity: Scalars['Int']['output'];
  /** flag of line item is a gift */
  isGift: Scalars['Boolean']['output'];
  /** Shows whether this is read-only */
  isReadOnly: Scalars['Boolean']['output'];
  /** Shows whether the line item is recurring */
  isReccuring: Scalars['Boolean']['output'];
  /** Shows whether this is valid */
  isValid: Scalars['Boolean']['output'];
  /** Culture name in the ISO 3166-1 alpha-3 format */
  languageCode?: Maybe<Scalars['String']['output']>;
  /** Length value */
  length?: Maybe<Scalars['Decimal']['output']>;
  /** List price */
  listPrice: MoneyType;
  /** List price with tax */
  listPriceWithTax: MoneyType;
  /** Measurement unit value */
  measureUnit?: Maybe<Scalars['String']['output']>;
  /** Line item name value */
  name: Scalars['String']['output'];
  /** Line item comment */
  note?: Maybe<Scalars['String']['output']>;
  /** Line item quantity value */
  objectType: Scalars['String']['output'];
  /** Placed price */
  placedPrice: MoneyType;
  /** Placed price with tax */
  placedPriceWithTax: MoneyType;
  product?: Maybe<Product>;
  /** Product ID value */
  productId: Scalars['String']['output'];
  /** Product outer Id */
  productOuterId?: Maybe<Scalars['String']['output']>;
  /** Product type: Physical, Digital, or Subscription */
  productType?: Maybe<Scalars['String']['output']>;
  /** Line item quantity value */
  quantity: Scalars['Int']['output'];
  /** Requirement for line item shipping */
  requiredShipping: Scalars['Boolean']['output'];
  /** Sale price */
  salePrice: MoneyType;
  /** Sale price with tax */
  salePriceWithTax: MoneyType;
  /** Shows whether the line item is selected for buying */
  selectedForCheckout: Scalars['Boolean']['output'];
  /** Line item shipping method code value */
  shipmentMethodCode?: Maybe<Scalars['String']['output']>;
  /** Product SKU value */
  sku: Scalars['String']['output'];
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Total shipping tax amount value */
  taxPercentRate: Scalars['Decimal']['output'];
  /** Tax total */
  taxTotal: MoneyType;
  /** Shipping tax type value */
  taxType?: Maybe<Scalars['String']['output']>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars['String']['output']>;
  /** Validation errors */
  validationErrors: Array<ValidationErrorType>;
  vendor?: Maybe<CommonVendor>;
  /** Volumetric weight value */
  volumetricWeight?: Maybe<Scalars['Decimal']['output']>;
  /** Warehouse location */
  warehouseLocation?: Maybe<Scalars['String']['output']>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars['Decimal']['output']>;
  /** Weight unit value */
  weightUnit?: Maybe<Scalars['String']['output']>;
  /** Width value */
  width?: Maybe<Scalars['Decimal']['output']>;
};


export type LineItemTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type LocalizedSettingResponseType = {
  items?: Maybe<Array<Maybe<KeyValueType>>>;
};

/** A connection from an object to a list of objects of type `MemberAddress`. */
export type MemberAddressConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<MemberAddressEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<MemberAddressType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `MemberAddress`. */
export type MemberAddressEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<MemberAddressType>;
};

export type MemberAddressType = {
  addressType?: Maybe<Scalars['Int']['output']>;
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']['output']>;
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Email */
  email?: Maybe<Scalars['String']['output']>;
  /** First name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Id */
  id?: Maybe<Scalars['String']['output']>;
  /** Is default address or not */
  isDefault: Scalars['Boolean']['output'];
  /** Is favorite address or not */
  isFavorite: Scalars['Boolean']['output'];
  /** Id */
  key?: Maybe<Scalars['String']['output']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code */
  postalCode: Scalars['String']['output'];
  /** Region id */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']['output']>;
  /** Zip */
  zip?: Maybe<Scalars['String']['output']>;
};

export type MemberType = {
  addresses?: Maybe<MemberAddressConnection>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  /** Emails */
  emails: Array<Maybe<Scalars['String']['output']>>;
  groups: Array<Maybe<Scalars['String']['output']>>;
  id: Scalars['String']['output'];
  /** Member type */
  memberType: Scalars['String']['output'];
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phones */
  phones: Array<Maybe<Scalars['String']['output']>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** SEO object type */
  seoObjectType: Scalars['String']['output'];
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
};


export type MemberTypeAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type MemberTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type MemberTypeSeoInfoArgs = {
  cultureName: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MenuLinkListType = {
  items: Array<MenuLinkType>;
  /** Menu name */
  name: Scalars['String']['output'];
  /** Menu outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
};

export type MenuLinkType = {
  /** Menu item object ID */
  associatedObjectId?: Maybe<Scalars['String']['output']>;
  /** Menu item object name */
  associatedObjectName?: Maybe<Scalars['String']['output']>;
  /** Menu item type name */
  associatedObjectType?: Maybe<Scalars['String']['output']>;
  childItems: Array<MenuLinkType>;
  /** Menu item outerID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Menu item priority */
  priority: Scalars['Int']['output'];
  /** Menu item title */
  title: Scalars['String']['output'];
  /** Menu item url */
  url: Scalars['String']['output'];
};

export type ModuleSettingType = {
  name: Scalars['String']['output'];
  value?: Maybe<Scalars['ModuleSettingValue']['output']>;
};

export type ModuleSettingsType = {
  moduleId: Scalars['String']['output'];
  settings: Array<ModuleSettingType>;
};

export type MoneyType = {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars['Decimal']['output'];
  /** Currency type */
  currency: CurrencyType;
  /** Number of decimal digits for the associated currency. */
  decimalDigits: Scalars['Int']['output'];
  /** Formatted amount. */
  formattedAmount: Scalars['String']['output'];
  /** Formatted amount without currency. */
  formattedAmountWithoutCurrency: Scalars['String']['output'];
  /** Formatted amount without point. */
  formattedAmountWithoutPoint: Scalars['String']['output'];
  /** Formatted amount without point and currency. */
  formattedAmountWithoutPointAndCurrency: Scalars['String']['output'];
};

export type Mutations = {
  addAddressToFavorites?: Maybe<Scalars['Boolean']['output']>;
  addBulkItemsCart?: Maybe<BulkCartType>;
  addCartAddress?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  addGiftItems?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  addOrUpdateOrderPayment?: Maybe<CustomerOrderType>;
  addQuoteAttachments?: Maybe<QuoteType>;
  addWishlistBulkItem?: Maybe<BulkWishlistType>;
  addWishlistItem?: Maybe<WishlistType>;
  addWishlistItems?: Maybe<WishlistType>;
  authorizePayment?: Maybe<AuthorizePaymentResultType>;
  cancelQuoteRequest?: Maybe<QuoteType>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeCartItemSelected?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']['output']>;
  changeOrganizationContactRole?: Maybe<CustomIdentityResultType>;
  changePassword?: Maybe<CustomIdentityResultType>;
  changePurchaseOrderNumber?: Maybe<CartType>;
  changeQuoteComment?: Maybe<QuoteType>;
  changeQuoteItemQuantity?: Maybe<QuoteType>;
  changeWishlist?: Maybe<WishlistType>;
  clearAllPushMessages?: Maybe<Scalars['Boolean']['output']>;
  clearCart?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  clearShipments?: Maybe<CartType>;
  cloneWishlist?: Maybe<WishlistType>;
  confirmEmail?: Maybe<CustomIdentityResultType>;
  confirmTask?: Maybe<WorkTaskType>;
  createContact?: Maybe<ContactType>;
  createCustomerReview?: Maybe<CustomerReview>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  createOrganization?: Maybe<Organization>;
  createQuote?: Maybe<QuoteType>;
  createQuoteFromCart?: Maybe<QuoteType>;
  createUser?: Maybe<IdentityResultType>;
  createWishlist?: Maybe<WishlistType>;
  deleteContact?: Maybe<Scalars['Boolean']['output']>;
  deleteFile?: Maybe<Scalars['Boolean']['output']>;
  deleteMemberAddresses?: Maybe<MemberType>;
  deleteQuoteAttachments?: Maybe<QuoteType>;
  deleteSkyflowCard?: Maybe<Scalars['Boolean']['output']>;
  deleteUsers?: Maybe<IdentityResultType>;
  initializePayment?: Maybe<InitializePaymentResultType>;
  inviteUser?: Maybe<CustomIdentityResultType>;
  lockOrganizationContact?: Maybe<ContactType>;
  markAllPushMessagesRead?: Maybe<Scalars['Boolean']['output']>;
  markAllPushMessagesUnread?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageRead?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageUnread?: Maybe<Scalars['Boolean']['output']>;
  mergeCart?: Maybe<CartType>;
  moveWishlistItem?: Maybe<WishlistType>;
  /** @deprecated Obsolete. Use 'initializePayment' mutation */
  processOrderPayment?: Maybe<ProcessPaymentRequestResultType>;
  refreshCart?: Maybe<CartType>;
  registerByInvitation?: Maybe<CustomIdentityResultType>;
  rejectGiftItems?: Maybe<CartType>;
  rejectTask?: Maybe<WorkTaskType>;
  removeAddressFromFavorites?: Maybe<Scalars['Boolean']['output']>;
  removeCart?: Maybe<Scalars['Boolean']['output']>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCartItems?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeMemberFromOrganization?: Maybe<ContactType>;
  removeQuoteItem?: Maybe<QuoteType>;
  removeShipment?: Maybe<CartType>;
  removeWishlist?: Maybe<Scalars['Boolean']['output']>;
  removeWishlistItem?: Maybe<WishlistType>;
  removeWishlistItems?: Maybe<WishlistType>;
  /** @deprecated Obsolete. Use 'changeWishlist' instead. */
  renameWishlist?: Maybe<WishlistType>;
  requestRegistration?: Maybe<RequestRegistrationType>;
  resetPasswordByToken?: Maybe<CustomIdentityResultType>;
  selectAllCartItems?: Maybe<CartType>;
  selectCartItems?: Maybe<CartType>;
  sendVerifyEmail?: Maybe<Scalars['Boolean']['output']>;
  submitQuoteRequest?: Maybe<QuoteType>;
  unSelectAllCartItems?: Maybe<CartType>;
  unSelectCartItems?: Maybe<CartType>;
  unlockOrganizationContact?: Maybe<ContactType>;
  updateCartDynamicProperties?: Maybe<CartType>;
  updateCartItemDynamicProperties?: Maybe<CartType>;
  updateCartPaymentDynamicProperties?: Maybe<CartType>;
  updateCartShipmentDynamicProperties?: Maybe<CartType>;
  updateContact?: Maybe<ContactType>;
  updateMemberAddresses?: Maybe<MemberType>;
  updateMemberDynamicProperties?: Maybe<MemberType>;
  updateOrderDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderItemDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderPaymentDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderShipmentDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrganization?: Maybe<Organization>;
  updatePersonalData?: Maybe<IdentityResultType>;
  updateQuoteAddresses?: Maybe<QuoteType>;
  updateQuoteAttachments?: Maybe<QuoteType>;
  updateRole?: Maybe<IdentityResultType>;
  updateUser?: Maybe<IdentityResultType>;
  updateWishListItems?: Maybe<WishlistType>;
  /** @deprecated Use 'validateCoupon' query instead. */
  validateCoupon?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationsAddAddressToFavoritesArgs = {
  command: AddAddressToFavoritesCommandType;
};


export type MutationsAddBulkItemsCartArgs = {
  command: InputAddBulkItemsType;
};


export type MutationsAddCartAddressArgs = {
  command: InputAddOrUpdateCartAddressType;
};


export type MutationsAddCouponArgs = {
  command: InputAddCouponType;
};


export type MutationsAddGiftItemsArgs = {
  command: InputAddGiftItemsType;
};


export type MutationsAddItemArgs = {
  command: InputAddItemType;
};


export type MutationsAddItemsCartArgs = {
  command: InputAddItemsType;
};


export type MutationsAddOrUpdateCartAddressArgs = {
  command: InputAddOrUpdateCartAddressType;
};


export type MutationsAddOrUpdateCartPaymentArgs = {
  command: InputAddOrUpdateCartPaymentType;
};


export type MutationsAddOrUpdateCartShipmentArgs = {
  command: InputAddOrUpdateCartShipmentType;
};


export type MutationsAddOrUpdateOrderPaymentArgs = {
  command: InputAddOrUpdateOrderPaymentType;
};


export type MutationsAddQuoteAttachmentsArgs = {
  command: AddQuoteAttachmentsCommandType;
};


export type MutationsAddWishlistBulkItemArgs = {
  command: InputAddWishlistBulkItemType;
};


export type MutationsAddWishlistItemArgs = {
  command: InputAddWishlistItemType;
};


export type MutationsAddWishlistItemsArgs = {
  command: InputAddWishlistItemsType;
};


export type MutationsAuthorizePaymentArgs = {
  command: InputAuthorizePaymentType;
};


export type MutationsCancelQuoteRequestArgs = {
  command: CancelQuoteCommandType;
};


export type MutationsChangeCartItemCommentArgs = {
  command?: InputMaybe<InputChangeCartItemCommentType>;
};


export type MutationsChangeCartItemPriceArgs = {
  command: InputChangeCartItemPriceType;
};


export type MutationsChangeCartItemQuantityArgs = {
  command: InputChangeCartItemQuantityType;
};


export type MutationsChangeCartItemSelectedArgs = {
  command?: InputMaybe<InputChangeCartItemSelectedType>;
};


export type MutationsChangeCommentArgs = {
  command?: InputMaybe<InputChangeCommentType>;
};


export type MutationsChangeOrderStatusArgs = {
  command: InputChangeOrderStatusType;
};


export type MutationsChangeOrganizationContactRoleArgs = {
  command: InputChangeOrganizationContactRoleType;
};


export type MutationsChangePasswordArgs = {
  command?: InputMaybe<InputChangePasswordType>;
};


export type MutationsChangePurchaseOrderNumberArgs = {
  command?: InputMaybe<InputChangePurchaseOrderNumber>;
};


export type MutationsChangeQuoteCommentArgs = {
  command: ChangeQuoteCommentCommandType;
};


export type MutationsChangeQuoteItemQuantityArgs = {
  command: ChangeQuoteItemQuantityCommandType;
};


export type MutationsChangeWishlistArgs = {
  command: InputChangeWishlistType;
};


export type MutationsClearCartArgs = {
  command: InputClearCartType;
};


export type MutationsClearPaymentsArgs = {
  command: InputClearPaymentsType;
};


export type MutationsClearShipmentsArgs = {
  command: InputClearShipmentsType;
};


export type MutationsCloneWishlistArgs = {
  command: InputCloneWishlistType;
};


export type MutationsConfirmEmailArgs = {
  command: InputConfirmEmailType;
};


export type MutationsConfirmTaskArgs = {
  command: ConfirmTaskCommandType;
};


export type MutationsCreateContactArgs = {
  command: InputCreateContactType;
};


export type MutationsCreateCustomerReviewArgs = {
  command: CreateCustomerReviewCommandType;
};


export type MutationsCreateOrderFromCartArgs = {
  command: InputCreateOrderFromCartType;
};


export type MutationsCreateOrganizationArgs = {
  command: InputCreateOrganizationType;
};


export type MutationsCreateQuoteArgs = {
  command: CreateQuoteCommandType;
};


export type MutationsCreateQuoteFromCartArgs = {
  command: CreateQuoteFromCartCommandType;
};


export type MutationsCreateUserArgs = {
  command: InputCreateUserType;
};


export type MutationsCreateWishlistArgs = {
  command: InputCreateWishlistType;
};


export type MutationsDeleteContactArgs = {
  command: InputDeleteContactType;
};


export type MutationsDeleteFileArgs = {
  command: DeleteFileCommandType;
};


export type MutationsDeleteMemberAddressesArgs = {
  command: InputDeleteMemberAddressType;
};


export type MutationsDeleteQuoteAttachmentsArgs = {
  command: DeleteQuoteAttachmentsCommandType;
};


export type MutationsDeleteSkyflowCardArgs = {
  command: DeleteSkyflowCardCommandType;
};


export type MutationsDeleteUsersArgs = {
  command: InputDeleteUserType;
};


export type MutationsInitializePaymentArgs = {
  command: InputInitializePaymentType;
};


export type MutationsInviteUserArgs = {
  command: InputInviteUserType;
};


export type MutationsLockOrganizationContactArgs = {
  command: InputLockUnlockOrganizationContactType;
};


export type MutationsMarkPushMessageReadArgs = {
  command: InputMarkPushMessageReadType;
};


export type MutationsMarkPushMessageUnreadArgs = {
  command: InputMarkPushMessageUnreadType;
};


export type MutationsMergeCartArgs = {
  command: InputMergeCartType;
};


export type MutationsMoveWishlistItemArgs = {
  command: InputMoveWishlistItemType;
};


export type MutationsProcessOrderPaymentArgs = {
  command: InputProcessOrderPaymentType;
};


export type MutationsRefreshCartArgs = {
  command: RefreshCartType;
};


export type MutationsRegisterByInvitationArgs = {
  command: InputRegisterByInvitationType;
};


export type MutationsRejectGiftItemsArgs = {
  command: InputRejectGiftItemsType;
};


export type MutationsRejectTaskArgs = {
  command: RejectTaskCommandType;
};


export type MutationsRemoveAddressFromFavoritesArgs = {
  command: RemoveAddressFromFavoritesCommandType;
};


export type MutationsRemoveCartArgs = {
  command: InputRemoveCartType;
};


export type MutationsRemoveCartAddressArgs = {
  command: InputRemoveCartAddressType;
};


export type MutationsRemoveCartItemArgs = {
  command: InputRemoveItemType;
};


export type MutationsRemoveCartItemsArgs = {
  command: InputRemoveItemsType;
};


export type MutationsRemoveCouponArgs = {
  command: InputRemoveCouponType;
};


export type MutationsRemoveMemberFromOrganizationArgs = {
  command: InputRemoveMemberFromOrganizationType;
};


export type MutationsRemoveQuoteItemArgs = {
  command: RemoveQuoteItemCommandType;
};


export type MutationsRemoveShipmentArgs = {
  command: InputRemoveShipmentType;
};


export type MutationsRemoveWishlistArgs = {
  command: InputRemoveWishlistType;
};


export type MutationsRemoveWishlistItemArgs = {
  command: InputRemoveWishlistItemType;
};


export type MutationsRemoveWishlistItemsArgs = {
  command: InputRemoveWishlistItemsType;
};


export type MutationsRenameWishlistArgs = {
  command: InputRenameWishlistType;
};


export type MutationsRequestRegistrationArgs = {
  command: InputRequestRegistrationType;
};


export type MutationsResetPasswordByTokenArgs = {
  command?: InputMaybe<InputResetPasswordByTokenType>;
};


export type MutationsSelectAllCartItemsArgs = {
  command?: InputMaybe<InputChangeAllCartItemsSelectedType>;
};


export type MutationsSelectCartItemsArgs = {
  command?: InputMaybe<InputChangeCartItemsSelectedType>;
};


export type MutationsSendVerifyEmailArgs = {
  command?: InputMaybe<InputSendVerifyEmailType>;
};


export type MutationsSubmitQuoteRequestArgs = {
  command: SubmitQuoteCommandType;
};


export type MutationsUnSelectAllCartItemsArgs = {
  command?: InputMaybe<InputChangeAllCartItemsSelectedType>;
};


export type MutationsUnSelectCartItemsArgs = {
  command?: InputMaybe<InputChangeCartItemsSelectedType>;
};


export type MutationsUnlockOrganizationContactArgs = {
  command: InputLockUnlockOrganizationContactType;
};


export type MutationsUpdateCartDynamicPropertiesArgs = {
  command: InputUpdateCartDynamicPropertiesType;
};


export type MutationsUpdateCartItemDynamicPropertiesArgs = {
  command: InputUpdateCartItemDynamicPropertiesType;
};


export type MutationsUpdateCartPaymentDynamicPropertiesArgs = {
  command: InputUpdateCartPaymentDynamicPropertiesType;
};


export type MutationsUpdateCartShipmentDynamicPropertiesArgs = {
  command: InputUpdateCartShipmentDynamicPropertiesType;
};


export type MutationsUpdateContactArgs = {
  command: InputUpdateContactType;
};


export type MutationsUpdateMemberAddressesArgs = {
  command: InputUpdateMemberAddressType;
};


export type MutationsUpdateMemberDynamicPropertiesArgs = {
  command: InputUpdateMemberDynamicPropertiesType;
};


export type MutationsUpdateOrderDynamicPropertiesArgs = {
  command: InputUpdateOrderDynamicPropertiesType;
};


export type MutationsUpdateOrderItemDynamicPropertiesArgs = {
  command: InputUpdateOrderItemDynamicPropertiesType;
};


export type MutationsUpdateOrderPaymentDynamicPropertiesArgs = {
  command: InputUpdateOrderPaymentDynamicPropertiesType;
};


export type MutationsUpdateOrderShipmentDynamicPropertiesArgs = {
  command: InputUpdateOrderShipmentDynamicPropertiesType;
};


export type MutationsUpdateOrganizationArgs = {
  command: InputUpdateOrganizationType;
};


export type MutationsUpdatePersonalDataArgs = {
  command: InputUpdatePersonalDataType;
};


export type MutationsUpdateQuoteAddressesArgs = {
  command: UpdateQuoteAddressesCommandType;
};


export type MutationsUpdateQuoteAttachmentsArgs = {
  command: UpdateQuoteAttachmentsCommandType;
};


export type MutationsUpdateRoleArgs = {
  command: InputUpdateRoleType;
};


export type MutationsUpdateUserArgs = {
  command: InputUpdateUserType;
};


export type MutationsUpdateWishListItemsArgs = {
  command: InputUpdateWishlistItemsType;
};


export type MutationsValidateCouponArgs = {
  command: InputValidateCouponType;
};

export type OrderAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars['Int']['output']>;
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']['output']>;
  /** Email */
  email?: Maybe<Scalars['String']['output']>;
  /** First name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Id */
  id?: Maybe<Scalars['String']['output']>;
  /** Id */
  key?: Maybe<Scalars['String']['output']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code */
  postalCode: Scalars['String']['output'];
  /** Region id */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']['output']>;
  /** Zip */
  zip?: Maybe<Scalars['String']['output']>;
};

export type OrderDiscountType = {
  /** Order discount amount */
  amount: MoneyType;
  coupon?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  promotionId?: Maybe<Scalars['String']['output']>;
};

export type OrderLineItemType = {
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  catalogId: Scalars['String']['output'];
  categoryId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  currency: CurrencyType;
  discountAmount: MoneyType;
  discountAmountWithTax: MoneyType;
  discountTotal: MoneyType;
  discountTotalWithTax: MoneyType;
  discounts: Array<OrderDiscountType>;
  /** Customer order Line item dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  extendedPrice: MoneyType;
  extendedPriceWithTax: MoneyType;
  fulfillmentCenterId?: Maybe<Scalars['String']['output']>;
  fulfillmentCenterName?: Maybe<Scalars['String']['output']>;
  fulfillmentLocationCode?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Decimal']['output']>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isCancelled: Scalars['Boolean']['output'];
  isGift?: Maybe<Scalars['Boolean']['output']>;
  length?: Maybe<Scalars['Decimal']['output']>;
  measureUnit?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  objectType: Scalars['String']['output'];
  outerId?: Maybe<Scalars['String']['output']>;
  placedPrice: MoneyType;
  placedPriceWithTax: MoneyType;
  price: MoneyType;
  priceId?: Maybe<Scalars['String']['output']>;
  priceWithTax: MoneyType;
  product?: Maybe<Product>;
  productId: Scalars['String']['output'];
  productOuterId?: Maybe<Scalars['String']['output']>;
  productType?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  reserveQuantity: Scalars['Int']['output'];
  shippingMethodCode?: Maybe<Scalars['String']['output']>;
  sku: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
  taxDetails: Array<OrderTaxDetailType>;
  taxPercentRate: Scalars['Decimal']['output'];
  taxTotal: MoneyType;
  taxType?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<CommonVendor>;
  weight?: Maybe<Scalars['Decimal']['output']>;
  weightUnit?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Decimal']['output']>;
};


export type OrderLineItemTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type OrderPaymentMethodType = {
  code: Scalars['String']['output'];
  currency: CurrencyType;
  description?: Maybe<Scalars['String']['output']>;
  discountAmount: MoneyType;
  discountAmountWithTax: MoneyType;
  isActive: Scalars['Boolean']['output'];
  isAvailableForPartial: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  paymentMethodGroupType: Scalars['Int']['output'];
  paymentMethodType: Scalars['Int']['output'];
  price: MoneyType;
  priceWithTax: MoneyType;
  priority: Scalars['Int']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
  taxDetails?: Maybe<Array<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal']['output'];
  taxTotal: MoneyType;
  taxType?: Maybe<Scalars['String']['output']>;
  total: MoneyType;
  totalWithTax: MoneyType;
  typeName: Scalars['String']['output'];
};

export type OrderShipmentItemType = {
  barCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lineItem?: Maybe<OrderLineItemType>;
  lineItemId?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  status?: Maybe<Scalars['String']['output']>;
};

export type OrderShipmentPackageType = {
  barCode?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Decimal']['output']>;
  id: Scalars['String']['output'];
  items: Array<OrderShipmentItemType>;
  length?: Maybe<Scalars['Decimal']['output']>;
  measureUnit?: Maybe<Scalars['String']['output']>;
  packageType?: Maybe<Scalars['String']['output']>;
  weight?: Maybe<Scalars['Decimal']['output']>;
  weightUnit?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Decimal']['output']>;
};

export type OrderShipmentType = {
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  currency: CurrencyType;
  customerOrderId?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<OrderAddressType>;
  deliveryDate?: Maybe<Scalars['DateTime']['output']>;
  discountAmount: MoneyType;
  discountAmountWithTax: MoneyType;
  discounts: Array<OrderDiscountType>;
  /** Customer order Shipment dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  employeeId?: Maybe<Scalars['String']['output']>;
  employeeName?: Maybe<Scalars['String']['output']>;
  fee: MoneyType;
  feeWithTax: MoneyType;
  fulfillmentCenterId?: Maybe<Scalars['String']['output']>;
  fulfillmentCenterName?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Decimal']['output']>;
  id: Scalars['String']['output'];
  inPayments: Array<PaymentInType>;
  isApproved: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  items: Array<OrderShipmentItemType>;
  length?: Maybe<Scalars['Decimal']['output']>;
  measureUnit?: Maybe<Scalars['String']['output']>;
  number: Scalars['String']['output'];
  objectType: Scalars['String']['output'];
  operationType: Scalars['String']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  packages: Array<OrderShipmentPackageType>;
  parentOperationId?: Maybe<Scalars['String']['output']>;
  price: MoneyType;
  priceWithTax: MoneyType;
  shipmentMethodCode?: Maybe<Scalars['String']['output']>;
  shipmentMethodOption?: Maybe<Scalars['String']['output']>;
  shippingMethod?: Maybe<OrderShippingMethodType>;
  status?: Maybe<Scalars['String']['output']>;
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
  taxDetails: Array<OrderTaxDetailType>;
  taxPercentRate: Scalars['Decimal']['output'];
  taxTotal: MoneyType;
  taxType?: Maybe<Scalars['String']['output']>;
  total: MoneyType;
  totalWithTax: MoneyType;
  trackingNumber?: Maybe<Scalars['String']['output']>;
  trackingUrl?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<CommonVendor>;
  weight?: Maybe<Scalars['Decimal']['output']>;
  weightUnit?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Decimal']['output']>;
};


export type OrderShipmentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type OrderShippingMethodType = {
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
  taxType?: Maybe<Scalars['String']['output']>;
  typeName?: Maybe<Scalars['String']['output']>;
};

export type OrderTaxDetailType = {
  amount: MoneyType;
  name: Scalars['String']['output'];
  rate: MoneyType;
};

/** Organization info */
export type Organization = {
  addresses?: Maybe<MemberAddressConnection>;
  /** Business category */
  businessCategory?: Maybe<Scalars['String']['output']>;
  contacts?: Maybe<ContactConnection>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** Dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  /** Emails */
  emails: Array<Maybe<Scalars['String']['output']>>;
  groups: Array<Maybe<Scalars['String']['output']>>;
  id: Scalars['String']['output'];
  /** Member type */
  memberType: Scalars['String']['output'];
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Owner id */
  ownerId?: Maybe<Scalars['String']['output']>;
  /** Parent id */
  parentId?: Maybe<Scalars['String']['output']>;
  /** Phones */
  phones: Array<Maybe<Scalars['String']['output']>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** SEO object type */
  seoObjectType: Scalars['String']['output'];
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
};


/** Organization info */
export type OrganizationAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


/** Organization info */
export type OrganizationContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


/** Organization info */
export type OrganizationDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


/** Organization info */
export type OrganizationSeoInfoArgs = {
  cultureName: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

/** A connection from an object to a list of objects of type `Organization`. */
export type OrganizationConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<OrganizationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Organization>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Organization`. */
export type OrganizationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<Organization>;
};

export type OutlineItemType = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** SEO info */
  seoInfos?: Maybe<Array<SeoInfo>>;
  seoObjectType: Scalars['String']['output'];
};

export type OutlineType = {
  /** Outline items */
  items?: Maybe<Array<OutlineItemType>>;
};

/** A connection from an object to a list of objects of type `Page`. */
export type PageConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PageEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PageType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Page`. */
export type PageEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PageType>;
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

export type PageType = {
  content: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Page title */
  name?: Maybe<Scalars['String']['output']>;
  /** Page permalink */
  permalink?: Maybe<Scalars['String']['output']>;
  /** Page file relative url */
  relativeUrl: Scalars['String']['output'];
};

export type PasswordOptionsType = {
  /** Require a digit ('0' - '9'). */
  requireDigit: Scalars['Boolean']['output'];
  /** Require a lower case letter ('a' - 'z'). */
  requireLowercase: Scalars['Boolean']['output'];
  /** Require a non letter or digit character. */
  requireNonAlphanumeric: Scalars['Boolean']['output'];
  /** Require an upper case letter ('A' - 'Z'). */
  requireUppercase: Scalars['Boolean']['output'];
  /** The minimum length a password must be. */
  requiredLength: Scalars['Int']['output'];
  /** The minimum number of unique chars a password must comprised of. */
  requiredUniqueChars: Scalars['Int']['output'];
};

/** A connection from an object to a list of objects of type `PaymentIn`. */
export type PaymentInConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PaymentInEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PaymentInType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PaymentIn`. */
export type PaymentInEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PaymentInType>;
};

export type PaymentInType = {
  authorizedDate?: Maybe<Scalars['DateTime']['output']>;
  billingAddress?: Maybe<OrderAddressType>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  capturedDate?: Maybe<Scalars['DateTime']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  currency: CurrencyType;
  customerId: Scalars['String']['output'];
  customerName?: Maybe<Scalars['String']['output']>;
  /** Customer order Payment dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  gatewayCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  incomingDate?: Maybe<Scalars['DateTime']['output']>;
  isApproved: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  number: Scalars['String']['output'];
  objectType: Scalars['String']['output'];
  operationType: Scalars['String']['output'];
  /** Associated Order */
  order: CustomerOrderType;
  orderId?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  parentOperationId?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<OrderPaymentMethodType>;
  price: MoneyType;
  purpose?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
  sum: MoneyType;
  tax: MoneyType;
  transactions: Array<PaymentTransactionType>;
  vendor?: Maybe<CommonVendor>;
  voidedDate?: Maybe<Scalars['DateTime']['output']>;
};


export type PaymentInTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentMethodType = {
  /** Value of payment gateway code */
  code: Scalars['String']['output'];
  /** Currency */
  currency: CurrencyType;
  /** Payment method description */
  description?: Maybe<Scalars['String']['output']>;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  /** Is payment method available for partial payments */
  isAvailableForPartial: Scalars['Boolean']['output'];
  /** Value of payment method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** Value of payment method name */
  name?: Maybe<Scalars['String']['output']>;
  /** Value of payment group type */
  paymentMethodGroupType: Scalars['String']['output'];
  /** Value of payment method type */
  paymentMethodType: Scalars['String']['output'];
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Value of payment method priority */
  priority: Scalars['Int']['output'];
  /** Tax details */
  taxDetails?: Maybe<Array<TaxDetailType>>;
  /** Tax percent rate */
  taxPercentRate: Scalars['Decimal']['output'];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars['String']['output']>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
};

export type PaymentTransactionType = {
  amount: MoneyType;
  gatewayIpAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isProcessed: Scalars['Boolean']['output'];
  note?: Maybe<Scalars['String']['output']>;
  processAttemptCount: Scalars['Int']['output'];
  processError?: Maybe<Scalars['String']['output']>;
  processedDate?: Maybe<Scalars['DateTime']['output']>;
  requestData?: Maybe<Scalars['String']['output']>;
  responseCode?: Maybe<Scalars['String']['output']>;
  responseData?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type PaymentType = {
  /** Amount */
  amount: MoneyType;
  /** Billing address */
  billingAddress?: Maybe<CartAddressType>;
  /** Text comment */
  comment?: Maybe<Scalars['String']['output']>;
  /** Currency */
  currency: CurrencyType;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  /** Discounts */
  discounts: Array<Maybe<DiscountType>>;
  /** Cart payment dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  /** Payment Id */
  id: Scalars['String']['output'];
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['String']['output']>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  purpose?: Maybe<Scalars['String']['output']>;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Tax percent rate */
  taxPercentRate: Scalars['Decimal']['output'];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars['String']['output']>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
  vendor?: Maybe<CommonVendor>;
};


export type PaymentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type PriceType = {
  /** Actual price */
  actual: MoneyType;
  /** Actual price with tax */
  actualWithTax: MoneyType;
  /** Currency */
  currency: Scalars['String']['output'];
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  discountPercent: Scalars['Decimal']['output'];
  /** Discounts */
  discounts: Array<CatalogDiscountType>;
  /** End date */
  endDate?: Maybe<Scalars['DateTime']['output']>;
  /** Price list */
  list: MoneyType;
  /** Price list with tax */
  listWithTax: MoneyType;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']['output']>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']['output']>;
  /** Sale price */
  sale: MoneyType;
  /** Sale price with tax */
  saleWithTax: MoneyType;
  /** Start date */
  startDate?: Maybe<Scalars['DateTime']['output']>;
  /** Tier prices */
  tierPrices: Array<TierPriceType>;
  /**
   * Valid from
   * @deprecated startDate
   */
  validFrom?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Valid until
   * @deprecated endDate
   */
  validUntil?: Maybe<Scalars['DateTime']['output']>;
};

export type ProcessPaymentRequestResultType = {
  errorMessage?: Maybe<Scalars['String']['output']>;
  htmlForm?: Maybe<Scalars['String']['output']>;
  isSuccess: Scalars['Boolean']['output'];
  /** New payment status */
  newPaymentStatus?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  redirectUrl?: Maybe<Scalars['String']['output']>;
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  /** Assets */
  assets: Array<Asset>;
  associations?: Maybe<ProductAssociationConnection>;
  /** Product availability data */
  availabilityData: AvailabilityData;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']['output']>;
  /** Breadcrumbs */
  breadcrumbs: Array<Breadcrumb>;
  /** The unique ID of the catalog */
  catalogId?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Category>;
  /** The product SKU. */
  code: Scalars['String']['output'];
  description?: Maybe<DescriptionType>;
  descriptions: Array<DescriptionType>;
  /** Global Trade Item Number */
  gtin?: Maybe<Scalars['String']['output']>;
  hasVariations: Scalars['Boolean']['output'];
  /** The unique ID of the product. */
  id: Scalars['String']['output'];
  /** Product images */
  images: Array<ImageType>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['String']['output']>;
  /** Product added at least in one wishlist */
  inWishlist: Scalars['Boolean']['output'];
  keyProperties: Array<Property>;
  masterVariation?: Maybe<VariationType>;
  /** Max. quantity */
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  /** Min. quantity */
  minQuantity?: Maybe<Scalars['Int']['output']>;
  /** Minimim product variation price */
  minVariationPrice?: Maybe<PriceType>;
  /** The name of the product. */
  name: Scalars['String']['output'];
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']['output']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']['output']>;
  /** Outlines */
  outlines: Array<OutlineType>;
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
  /** Request related SEO info */
  seoInfo: SeoInfo;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']['output']>;
  variations: Array<VariationType>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
  videos?: Maybe<VideoConnection>;
  /** List of wishlist ID with this product */
  wishlistIds: Array<Maybe<Scalars['String']['output']>>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductAssociationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionsArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductKeyPropertiesArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductVideosArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/** product association. */
export type ProductAssociation = {
  associatedObjectId?: Maybe<Scalars['String']['output']>;
  associatedObjectType?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars['Int']['output']>;
  tags: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `ProductAssociation`. */
export type ProductAssociationConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductAssociationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductAssociation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `ProductAssociation`. */
export type ProductAssociationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ProductAssociation>;
};

/** A connection from an object to a list of objects of type `Product`. */
export type ProductConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductEdge>>>;
  /** Filter facets */
  filter_facets: Array<FilterFacet>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Product>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Range facets */
  range_facets: Array<RangeFacet>;
  /** Term facets */
  term_facets: Array<TermFacet>;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Product`. */
export type ProductEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<Product>;
};

export type ProductSuggestionsQueryResponseType = {
  suggestions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** Represents promotion object */
export type Promotion = {
  /** Promotion description */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID of the promotion. */
  id: Scalars['String']['output'];
  /** The name of the promotion */
  name: Scalars['String']['output'];
  /** Promotion type */
  type?: Maybe<Scalars['String']['output']>;
};

/** Products attributes. */
export type Property = {
  /** The display order of the property. */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Is property hidden. */
  hidden: Scalars['Boolean']['output'];
  /** The unique ID of the property. */
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  /** Is property has multiple values. */
  multivalue: Scalars['Boolean']['output'];
  /** The name of the property. */
  name: Scalars['String']['output'];
  /** @deprecated Use propertyDictionaryItems instead. */
  propertyDictItems?: Maybe<PropertyDictionaryItemConnection>;
  propertyDictionaryItems?: Maybe<PropertyDictionaryItemConnection>;
  propertyType: PropertyType;
  /** ValueType of the property. */
  propertyValueType: PropertyValueTypes;
  /** @deprecated Use propertyType instead. */
  type: Scalars['String']['output'];
  value?: Maybe<Scalars['PropertyValue']['output']>;
  valueId?: Maybe<Scalars['String']['output']>;
  /**
   * ValueType of the property.
   * @deprecated Use propertyValueType instead.
   */
  valueType: Scalars['String']['output'];
};


/** Products attributes. */
export type PropertyPropertyDictItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


/** Products attributes. */
export type PropertyPropertyDictionaryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/** A connection from an object to a list of objects of type `Property`. */
export type PropertyConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PropertyEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Property>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Represents property dictionary item */
export type PropertyDictionaryItem = {
  /** The unique ID of the property dictionary item. */
  id: Scalars['String']['output'];
  /** Value order. */
  sortOrder: Scalars['Int']['output'];
  /** Value alias. */
  value?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PropertyDictionaryItemEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PropertyDictionaryItem>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PropertyDictionaryItem>;
};

/** An edge in a connection from an object to another object of type `Property`. */
export type PropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<Property>;
};

/** The type of catalog property. */
export enum PropertyType {
  Catalog = 'CATALOG',
  Category = 'CATEGORY',
  Product = 'PRODUCT',
  Variation = 'VARIATION'
}

/** The type of catalog property value. */
export enum PropertyValueTypes {
  Boolean = 'BOOLEAN',
  DateTime = 'DATE_TIME',
  GeoPoint = 'GEO_POINT',
  Integer = 'INTEGER',
  LongText = 'LONG_TEXT',
  Number = 'NUMBER',
  ShortText = 'SHORT_TEXT'
}

/** A connection from an object to a list of objects of type `PushMessage`. */
export type PushMessageConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PushMessageEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PushMessageType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PushMessage`. */
export type PushMessageEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PushMessageType>;
};

export type PushMessageType = {
  createdDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isHidden: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  shortMessage: Scalars['String']['output'];
};

export type Query = {
  cart?: Maybe<CartType>;
  carts?: Maybe<CartConnection>;
  categories?: Maybe<CategoryConnection>;
  category?: Maybe<Category>;
  checkEmailUniqueness?: Maybe<Scalars['Boolean']['output']>;
  checkUsernameUniqueness?: Maybe<Scalars['Boolean']['output']>;
  childCategories?: Maybe<ChildCategoriesQueryResponseType>;
  contact?: Maybe<ContactType>;
  contacts?: Maybe<ContactConnection>;
  contract?: Maybe<ContractType>;
  countries: Array<CountryType>;
  customerReviews?: Maybe<CustomerReviewConnection>;
  dynamicProperties?: Maybe<DynamicPropertyConnection>;
  dynamicProperty?: Maybe<DynamicPropertyType>;
  evaluateDynamicContent?: Maybe<EvaluateDynamicContentResultType>;
  fileUploadOptions?: Maybe<FileUploadScopeOptionsType>;
  fulfillmentCenter?: Maybe<FulfillmentCenterType>;
  fulfillmentCenters?: Maybe<FulfillmentCenterConnection>;
  me?: Maybe<UserType>;
  menu?: Maybe<MenuLinkListType>;
  menus: Array<MenuLinkListType>;
  order?: Maybe<CustomerOrderType>;
  orderLineItemStatuses?: Maybe<LocalizedSettingResponseType>;
  orderStatuses?: Maybe<LocalizedSettingResponseType>;
  orders?: Maybe<CustomerOrderConnection>;
  organization?: Maybe<Organization>;
  organizationContracts?: Maybe<ContractConnection>;
  organizationOrders?: Maybe<CustomerOrderConnection>;
  organizations?: Maybe<OrganizationConnection>;
  page?: Maybe<PageType>;
  pages?: Maybe<PageConnection>;
  paymentStatuses?: Maybe<LocalizedSettingResponseType>;
  payments?: Maybe<PaymentInConnection>;
  product?: Maybe<Product>;
  productSuggestions?: Maybe<ProductSuggestionsQueryResponseType>;
  products?: Maybe<ProductConnection>;
  properties?: Maybe<PropertyConnection>;
  property?: Maybe<Property>;
  pushMessages?: Maybe<PushMessageConnection>;
  quote?: Maybe<QuoteType>;
  quoteAttachmentOptions?: Maybe<FileUploadScopeOptionsType>;
  quotes?: Maybe<QuoteConnection>;
  regions: Array<CountryRegionType>;
  requestPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  role?: Maybe<RoleType>;
  shipmentStatuses?: Maybe<LocalizedSettingResponseType>;
  skyflowCards?: Maybe<SkyflowCardResponseType>;
  slugInfo?: Maybe<SlugInfoResponseType>;
  store?: Maybe<StoreResponseType>;
  tasks?: Maybe<WorkTaskConnection>;
  user?: Maybe<UserType>;
  validateCoupon?: Maybe<Scalars['Boolean']['output']>;
  validatePassword?: Maybe<CustomIdentityResultType>;
  vendor?: Maybe<Vendor>;
  wishlist?: Maybe<WishlistType>;
  wishlists?: Maybe<WishlistConnection>;
};


export type QueryCartArgs = {
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCartsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  categoryIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  fuzzy?: InputMaybe<Scalars['Boolean']['input']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoryArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckEmailUniquenessArgs = {
  email: Scalars['String']['input'];
};


export type QueryCheckUsernameUniquenessArgs = {
  username: Scalars['String']['input'];
};


export type QueryChildCategoriesArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  maxLevel?: InputMaybe<Scalars['Int']['input']>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  productFilter?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryContactArgs = {
  id: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryContactsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryContractArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCustomerReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryDynamicPropertiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  objectType?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDynamicPropertyArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  idOrName: Scalars['String']['input'];
  objectType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEvaluateDynamicContentArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  placeName?: InputMaybe<Scalars['String']['input']>;
  productId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
  userGroups?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryFileUploadOptionsArgs = {
  scope?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFulfillmentCenterArgs = {
  id: Scalars['String']['input'];
};


export type QueryFulfillmentCentersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  fulfillmentCenterIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMenuArgs = {
  cultureName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryMenusArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryOrderArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderLineItemStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationContractsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  organizationId: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPageArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryPagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryPaymentStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  custom?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductSuggestionsArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  custom?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  fuzzy?: InputMaybe<Scalars['Boolean']['input']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPropertiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
  types?: InputMaybe<Array<InputMaybe<PropertyType>>>;
};


export type QueryPropertyArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};


export type QueryPushMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  withHidden?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryQuoteArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryQuotesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRegionsArgs = {
  countryId: Scalars['String']['input'];
};


export type QueryRequestPasswordResetArgs = {
  loginOrEmail: Scalars['String']['input'];
  urlSuffix?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRoleArgs = {
  roleName: Scalars['String']['input'];
};


export type QueryShipmentStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySkyflowCardsArgs = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySlugInfoArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStoreArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryTasksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  endDueDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  responsibleId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  startDueDate?: InputMaybe<Scalars['DateTime']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  loginProvider?: InputMaybe<Scalars['String']['input']>;
  providerKey?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryValidateCouponArgs = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  coupon: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryValidatePasswordArgs = {
  password: Scalars['String']['input'];
};


export type QueryVendorArgs = {
  id: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWishlistArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  listId: Scalars['String']['input'];
};


export type QueryWishlistsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QuoteAddressType = {
  addressType?: Maybe<Scalars['Int']['output']>;
  city: Scalars['String']['output'];
  countryCode?: Maybe<Scalars['String']['output']>;
  countryName: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  /** ID */
  id?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  line1?: Maybe<Scalars['String']['output']>;
  line2?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  outerId?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  regionId?: Maybe<Scalars['String']['output']>;
  regionName?: Maybe<Scalars['String']['output']>;
};

export type QuoteAttachmentType = {
  contentType?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use ContentType */
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  size: Scalars['Long']['output'];
  url: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `Quote`. */
export type QuoteConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<QuoteEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<QuoteType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Quote`. */
export type QuoteEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<QuoteType>;
};

export type QuoteItemType = {
  catalogId: Scalars['String']['output'];
  categoryId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  listPrice: MoneyType;
  name: Scalars['String']['output'];
  product?: Maybe<Product>;
  productId: Scalars['String']['output'];
  proposalPrices: Array<QuoteTierPriceType>;
  quantity: Scalars['Int']['output'];
  salePrice: MoneyType;
  selectedTierPrice?: Maybe<QuoteTierPriceType>;
  sku: Scalars['String']['output'];
  taxType?: Maybe<Scalars['String']['output']>;
};

export type QuoteShipmentMethodType = {
  currency: CurrencyType;
  logoUrl?: Maybe<Scalars['String']['output']>;
  optionName?: Maybe<Scalars['String']['output']>;
  price: MoneyType;
  shipmentMethodCode: Scalars['String']['output'];
  typeName?: Maybe<Scalars['String']['output']>;
};

export type QuoteTaxDetailType = {
  amount: MoneyType;
  name?: Maybe<Scalars['String']['output']>;
  rate: MoneyType;
};

export type QuoteTierPriceType = {
  price: MoneyType;
  quantity: Scalars['Long']['output'];
};

export type QuoteTotalsType = {
  adjustmentQuoteExlTax: MoneyType;
  discountTotal: MoneyType;
  grandTotalExlTax: MoneyType;
  grandTotalInclTax: MoneyType;
  originalSubTotalExlTax: MoneyType;
  shippingTotal: MoneyType;
  subTotalExlTax: MoneyType;
  taxTotal: MoneyType;
};

export type QuoteType = {
  addresses: Array<QuoteAddressType>;
  attachments: Array<QuoteAttachmentType>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  coupon?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  currency: CurrencyType;
  customerId?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  /** Quote dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  employeeId?: Maybe<Scalars['String']['output']>;
  employeeName?: Maybe<Scalars['String']['output']>;
  enableNotification: Scalars['Boolean']['output'];
  expirationDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  innerComment?: Maybe<Scalars['String']['output']>;
  isAnonymous: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  isLocked: Scalars['Boolean']['output'];
  items: Array<QuoteItemType>;
  languageCode?: Maybe<Scalars['String']['output']>;
  manualRelDiscountAmount: MoneyType;
  manualShippingTotal: MoneyType;
  manualSubTotal: MoneyType;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  number: Scalars['String']['output'];
  objectType?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  reminderDate?: Maybe<Scalars['DateTime']['output']>;
  shipmentMethod?: Maybe<QuoteShipmentMethodType>;
  status?: Maybe<Scalars['String']['output']>;
  storeId: Scalars['String']['output'];
  tag?: Maybe<Scalars['String']['output']>;
  taxDetails: Array<QuoteTaxDetailType>;
  totals: QuoteTotalsType;
};


export type QuoteTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type RangeFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Ranges */
  ranges: Array<FacetRangeType>;
};

export type Rating = {
  /** Total count of customer reviews */
  reviewCount: Scalars['Int']['output'];
  /** Average rating */
  value: Scalars['Decimal']['output'];
};

export type RefreshCartType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type RegisterAccountType = {
  createdBy?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type RegisterContactType = {
  about?: Maybe<Scalars['String']['output']>;
  address?: Maybe<MemberAddressType>;
  birthdate?: Maybe<Scalars['Date']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  /** Contact's dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  firstName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};


export type RegisterContactTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterOrganizationType = {
  address?: Maybe<MemberAddressType>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** Contact's dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};


export type RegisterOrganizationTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type RegistrationErrorType = {
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  parameter?: Maybe<Scalars['String']['output']>;
};

export type RejectTaskCommandType = {
  id: Scalars['String']['input'];
};

export type RemoveAddressFromFavoritesCommandType = {
  addressId: Scalars['String']['input'];
};

export type RemoveQuoteItemCommandType = {
  lineItemId: Scalars['String']['input'];
  quoteId: Scalars['String']['input'];
};

export type RequestRegistrationType = {
  /** Contact's account */
  account?: Maybe<RegisterAccountType>;
  /** Created contact */
  contact?: Maybe<RegisterContactType>;
  /** Created company */
  organization?: Maybe<RegisterOrganizationType>;
  /** Account creation result */
  result?: Maybe<AccountCreationResultType>;
};

export type RoleType = {
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  normalizedName: Scalars['String']['output'];
  /** Permissions in Role */
  permissions: Array<Maybe<Scalars['String']['output']>>;
};

export type SeoInfo = {
  id: Scalars['String']['output'];
  imageAltDescription?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  languageCode?: Maybe<Scalars['String']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  objectId: Scalars['String']['output'];
  objectType: Scalars['String']['output'];
  pageTitle?: Maybe<Scalars['String']['output']>;
  semanticUrl: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
};

export type ShipmentType = {
  /** Text comment */
  comment?: Maybe<Scalars['String']['output']>;
  /** Currency */
  currency: CurrencyType;
  /** Delivery address */
  deliveryAddress?: Maybe<CartAddressType>;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  /** Discounts */
  discounts: Array<DiscountType>;
  /** Cart shipment dynamic property values */
  dynamicProperties: Array<DynamicPropertyValueType>;
  /** Fee */
  fee: MoneyType;
  /** Fee with tax */
  feeWithTax: MoneyType;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']['output']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']['output']>;
  /** Shipment Id */
  id: Scalars['String']['output'];
  /** Items */
  items: Array<CartShipmentItemType>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']['output']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']['output']>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']['output']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']['output']>;
  shippingMethod?: Maybe<ShippingMethodType>;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Tax percent rate */
  taxPercentRate: Scalars['Decimal']['output'];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars['String']['output']>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
  vendor?: Maybe<CommonVendor>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']['output']>;
  /** Value of weight */
  weight?: Maybe<Scalars['Decimal']['output']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']['output']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']['output']>;
};


export type ShipmentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingMethodType = {
  /** Value of shipping gateway code */
  code: Scalars['String']['output'];
  /** Currency */
  currency: CurrencyType;
  /** Shipping method description */
  description?: Maybe<Scalars['String']['output']>;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  id: Scalars['String']['output'];
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** Shipping method name */
  name?: Maybe<Scalars['String']['output']>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars['String']['output']>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars['String']['output']>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Value of shipping method priority */
  priority: Scalars['Int']['output'];
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
};

export type SkyflowCardResponseType = {
  cards?: Maybe<Array<Maybe<SkyflowCardType>>>;
};

export type SkyflowCardType = {
  cardExpiration?: Maybe<Scalars['String']['output']>;
  cardNumber: Scalars['String']['output'];
  cardholderName?: Maybe<Scalars['String']['output']>;
  cvv?: Maybe<Scalars['String']['output']>;
  expiryMonth?: Maybe<Scalars['String']['output']>;
  expiryYear?: Maybe<Scalars['String']['output']>;
  skyflowId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type SlugInfoResponseType = {
  /** SEO info */
  entityInfo?: Maybe<SeoInfo>;
};

export type StoreResponseType = {
  /** Available currencies */
  availableCurrencies: Array<CurrencyType>;
  /** Available languages */
  availableLanguages: Array<LanguageType>;
  /** Store catalog ID */
  catalogId: Scalars['String']['output'];
  /** Currency */
  defaultCurrency: CurrencyType;
  /** Language */
  defaultLanguage: LanguageType;
  /** GraphQL settings */
  graphQLSettings: GraphQlSettingsType;
  /** Store settings */
  settings: StoreSettingsType;
  /** Store ID */
  storeId: Scalars['String']['output'];
  /** Store name */
  storeName: Scalars['String']['output'];
  /** Store URL */
  storeUrl?: Maybe<Scalars['String']['output']>;
};

export type StoreSettingsType = {
  /** Allow anonymous users to visit the store  */
  anonymousUsersAllowed: Scalars['Boolean']['output'];
  /** Allow anonymous users to create orders (XAPI) */
  createAnonymousOrderEnabled: Scalars['Boolean']['output'];
  /** Email address verification enabled */
  emailVerificationEnabled: Scalars['Boolean']['output'];
  /** Email address verification required */
  emailVerificationRequired: Scalars['Boolean']['output'];
  /** SPA */
  isSpa: Scalars['Boolean']['output'];
  modules: Array<ModuleSettingsType>;
  /** Password requirements */
  passwordRequirements?: Maybe<PasswordOptionsType>;
  /** Store ID */
  quotesEnabled: Scalars['Boolean']['output'];
  /** SEO links */
  seoLinkType: Scalars['String']['output'];
  /** Store ID */
  subscriptionEnabled: Scalars['Boolean']['output'];
  /** Tax calculation enabled */
  taxCalculationEnabled: Scalars['Boolean']['output'];
};

export type SubmitQuoteCommandType = {
  comment: Scalars['String']['input'];
  quoteId: Scalars['String']['input'];
};

export type Subscriptions = {
  ping?: Maybe<Scalars['String']['output']>;
  pushMessageCreated: PushMessageType;
};

export type TaxDetailType = {
  /** Amount */
  amount: MoneyType;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Price */
  price: MoneyType;
  /** Rate */
  rate: MoneyType;
};

export type TermFacet = Facet & {
  /** Three facet types: Terms, Range, and Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Terms */
  terms: Array<FacetTermType>;
};

export type TierPriceType = {
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Quantity */
  quantity: Scalars['Long']['output'];
};

export type UpdateQuoteAddressesCommandType = {
  addresses: Array<InputMaybe<InputQuoteAddressType>>;
  quoteId: Scalars['String']['input'];
};

export type UpdateQuoteAttachmentsCommandType = {
  quoteId: Scalars['String']['input'];
  urls: Array<InputMaybe<Scalars['String']['input']>>;
};

export type UserType = {
  accessFailedCount: Scalars['Int']['output'];
  /** The associated contact info */
  contact?: Maybe<ContactType>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailConfirmed: Scalars['Boolean']['output'];
  /** Make this user change their password when they sign in next time */
  forcePasswordChange?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  isAdministrator: Scalars['Boolean']['output'];
  /** Account locked state */
  lockedState?: Maybe<Scalars['Boolean']['output']>;
  lockoutEnabled: Scalars['Boolean']['output'];
  lockoutEnd?: Maybe<Scalars['DateTime']['output']>;
  memberId?: Maybe<Scalars['String']['output']>;
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  normalizedEmail?: Maybe<Scalars['String']['output']>;
  normalizedUserName?: Maybe<Scalars['String']['output']>;
  operator?: Maybe<UserType>;
  passwordExpired: Scalars['Boolean']['output'];
  /** Password expiry in days */
  passwordExpiryInDays?: Maybe<Scalars['Int']['output']>;
  /** Account permissions */
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  phoneNumberConfirmed: Scalars['Boolean']['output'];
  photoUrl?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  securityStamp: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
  twoFactorEnabled: Scalars['Boolean']['output'];
  userName: Scalars['String']['output'];
  userType?: Maybe<Scalars['String']['output']>;
};

export type ValidationErrorType = {
  /** Error code */
  errorCode?: Maybe<Scalars['String']['output']>;
  /** Error msg */
  errorMessage?: Maybe<Scalars['String']['output']>;
  errorParameters?: Maybe<Array<Maybe<ErrorParameterType>>>;
  /** Object id */
  objectId?: Maybe<Scalars['String']['output']>;
  /** Object type */
  objectType?: Maybe<Scalars['String']['output']>;
};

export type VariationType = {
  /** Assets */
  assets: Array<Asset>;
  /** Availability data */
  availabilityData: AvailabilityData;
  /** SKU of variation. */
  code: Scalars['String']['output'];
  /** Id of variation. */
  id: Scalars['String']['output'];
  /** Product images */
  images: Array<ImageType>;
  /** Max. quantity. */
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  /** Min. quantity. */
  minQuantity?: Maybe<Scalars['Int']['output']>;
  /** Name of variation. */
  name: Scalars['String']['output'];
  /** Outlines */
  outlines?: Maybe<Array<OutlineType>>;
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']['output']>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
};

/** Vendor Info */
export type Vendor = {
  /** About vendor */
  about?: Maybe<Scalars['String']['output']>;
  addresses?: Maybe<MemberAddressConnection>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  /** Emails */
  emails: Array<Maybe<Scalars['String']['output']>>;
  groups: Array<Maybe<Scalars['String']['output']>>;
  /** Icon URL */
  iconUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** Member type */
  memberType: Scalars['String']['output'];
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phones */
  phones: Array<Maybe<Scalars['String']['output']>>;
  /** Vendor rating */
  rating?: Maybe<Rating>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** SEO object type */
  seoObjectType: Scalars['String']['output'];
  /** Site URL */
  siteUrl?: Maybe<Scalars['String']['output']>;
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
};


/** Vendor Info */
export type VendorAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


/** Vendor Info */
export type VendorDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


/** Vendor Info */
export type VendorRatingArgs = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};


/** Vendor Info */
export type VendorSeoInfoArgs = {
  cultureName: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

/** A connection from an object to a list of objects of type `Video`. */
export type VideoConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<VideoEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<VideoType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Video`. */
export type VideoEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<VideoType>;
};

export type VideoType = {
  /** Video URL */
  contentUrl: Scalars['String']['output'];
  /** Culture name */
  cultureName?: Maybe<Scalars['String']['output']>;
  /** Video description */
  description: Scalars['String']['output'];
  /** Video duration */
  duration?: Maybe<Scalars['String']['output']>;
  /** Embeded video URL */
  embedUrl?: Maybe<Scalars['String']['output']>;
  /** Video name */
  name: Scalars['String']['output'];
  /** ID of the object video is attached to */
  ownerId: Scalars['String']['output'];
  /** Type of the object video is attached to (Product, Category) */
  ownerType: Scalars['String']['output'];
  /** Sort order */
  sortOrder: Scalars['Int']['output'];
  /** Video thumbnial URL */
  thumbnailUrl: Scalars['String']['output'];
  /** Video upload date */
  uploadDate?: Maybe<Scalars['DateTime']['output']>;
};

/** A connection from an object to a list of objects of type `Wishlist`. */
export type WishlistConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<WishlistEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<WishlistType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Wishlist`. */
export type WishlistEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<WishlistType>;
};

export enum WishlistScopeType {
  /** Organization scope */
  Organization = 'Organization',
  /** Private scope */
  Private = 'Private'
}

export type WishlistType = {
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Shopping cart user ID */
  customerId?: Maybe<Scalars['String']['output']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']['output']>;
  /** Wishlist description */
  description?: Maybe<Scalars['String']['output']>;
  /** Shopping cart ID */
  id: Scalars['String']['output'];
  /** Items */
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Item count */
  itemsCount?: Maybe<Scalars['Int']['output']>;
  /** Wishlist modified date */
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  /** Shopping cart name */
  name: Scalars['String']['output'];
  /** Wishlist scope */
  scope?: Maybe<WishlistScopeType>;
  /** Shopping cart store ID */
  storeId?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `WorkTask`. */
export type WorkTaskConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<WorkTaskEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<WorkTaskType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `WorkTask`. */
export type WorkTaskEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<WorkTaskType>;
};

export type WorkTaskType = {
  completed?: Maybe<Scalars['Boolean']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  parameters?: Maybe<Scalars['String']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
  responsibleName?: Maybe<Scalars['String']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  workflowId?: Maybe<Scalars['String']['output']>;
};

export type AddAddressToFavoritesMutationVariables = Exact<{
  command: AddAddressToFavoritesCommandType;
}>;


export type AddAddressToFavoritesMutation = { addAddressToFavorites?: boolean };

export type AddWishlistMutationVariables = Exact<{
  command: InputCreateWishlistType;
}>;


export type AddWishlistMutation = { createWishlist?: { id: string } };

export type AddWishlistBulkItemMutationVariables = Exact<{
  command: InputAddWishlistBulkItemType;
}>;


export type AddWishlistBulkItemMutation = { addWishlistBulkItem?: { wishlists?: Array<{ id: string }> } };

export type AddWishlistItemMutationVariables = Exact<{
  command: InputAddWishlistItemType;
}>;


export type AddWishlistItemMutation = { addWishlistItem?: { id: string } };

export type ChangePasswordMutationVariables = Exact<{
  command?: InputMaybe<InputChangePasswordType>;
}>;


export type ChangePasswordMutation = { changePassword?: { succeeded: boolean, errors?: Array<{ code: string, description?: string, parameter?: string }> } };

export type ChangeWishlistMutationVariables = Exact<{
  command: InputChangeWishlistType;
}>;


export type ChangeWishlistMutation = { changeWishlist?: { id: string, name: string, description?: string, scope?: WishlistScopeType, items?: Array<{ id: string, name: string, imageUrl?: string, sku: string, productId: string, quantity: number, productType?: string, salePrice: { amount: any, formattedAmount: string }, listPrice: { amount: any, formattedAmount: string }, product?: { name: string, id: string, code: string, slug?: string, outline?: string, minQuantity?: number, maxQuantity?: number, imgSrc?: string, images: Array<{ url: string }>, vendor?: { id: string, name: string }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, price: { actual: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } } } }> } };

export type WishlistLineItemFieldsFragment = { id: string, name: string, imageUrl?: string, sku: string, productId: string, quantity: number, productType?: string, salePrice: { amount: any, formattedAmount: string }, listPrice: { amount: any, formattedAmount: string }, product?: { name: string, id: string, code: string, slug?: string, outline?: string, minQuantity?: number, maxQuantity?: number, imgSrc?: string, images: Array<{ url: string }>, vendor?: { id: string, name: string }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, price: { actual: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } } } };

export type AvailabilityDataFragment = { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number };

export type PropertyFragment = { name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string };

export type ConfirmEmailMutationVariables = Exact<{
  command: InputConfirmEmailType;
}>;


export type ConfirmEmailMutation = { confirmEmail?: { succeeded: boolean } };

export type CreateContactMutationVariables = Exact<{
  command: InputCreateContactType;
}>;


export type CreateContactMutation = { createContact?: { id: string } };

export type CreateUserMutationVariables = Exact<{
  command: InputCreateUserType;
}>;


export type CreateUserMutation = { createUser?: { succeeded: boolean, errors?: Array<{ code?: string, description?: string }> } };

export type DeleteMemberAddressesMutationVariables = Exact<{
  command: InputDeleteMemberAddressType;
}>;


export type DeleteMemberAddressesMutation = { deleteMemberAddresses?: { id: string } };

export type DeleteWishlistMutationVariables = Exact<{
  command: InputRemoveWishlistType;
}>;


export type DeleteWishlistMutation = { removeWishlist?: boolean };

export type DeleteWishlistItemMutationVariables = Exact<{
  command: InputRemoveWishlistItemType;
}>;


export type DeleteWishlistItemMutation = { removeWishlistItem?: { id: string } };

export type InviteUserMutationVariables = Exact<{
  command: InputInviteUserType;
}>;


export type InviteUserMutation = { inviteUser?: { succeeded: boolean, errors?: Array<{ code: string, description?: string, parameter?: string }> } };

export type RequestRegistrationMutationVariables = Exact<{
  command: InputRequestRegistrationType;
}>;


export type RequestRegistrationMutation = { requestRegistration?: { account?: { id: string }, organization?: { id: string }, contact?: { id: string }, result?: { succeeded: boolean, errors?: Array<{ code?: string, description?: string, parameter?: string }> } } };

export type RegisterByInvitationMutationVariables = Exact<{
  command: InputRegisterByInvitationType;
}>;


export type RegisterByInvitationMutation = { registerByInvitation?: { succeeded: boolean, errors?: Array<{ code: string, description?: string, parameter?: string }> } };

export type RemoveAddressFromFavoritesMutationVariables = Exact<{
  command: RemoveAddressFromFavoritesCommandType;
}>;


export type RemoveAddressFromFavoritesMutation = { removeAddressFromFavorites?: boolean };

export type ResetPasswordByTokenMutationVariables = Exact<{
  command?: InputMaybe<InputResetPasswordByTokenType>;
}>;


export type ResetPasswordByTokenMutation = { resetPasswordByToken?: { succeeded: boolean, errors?: Array<{ code: string, description?: string, parameter?: string }> } };

export type SendVerifyEmailMutationVariables = Exact<{
  command?: InputMaybe<InputSendVerifyEmailType>;
}>;


export type SendVerifyEmailMutation = { sendVerifyEmail?: boolean };

export type UpdateContactMutationVariables = Exact<{
  command: InputUpdateContactType;
}>;


export type UpdateContactMutation = { updateContact?: { id: string } };

export type UpdateMemberAddressesMutationVariables = Exact<{
  command: InputUpdateMemberAddressType;
}>;


export type UpdateMemberAddressesMutation = { updateMemberAddresses?: { id: string } };

export type UpdatePersonalDataMutationVariables = Exact<{
  command: InputUpdatePersonalDataType;
}>;


export type UpdatePersonalDataMutation = { updatePersonalData?: { succeeded: boolean, errors?: Array<{ code?: string, description?: string }> } };

export type UpdateWishListItemsMutationVariables = Exact<{
  command: InputUpdateWishlistItemsType;
}>;


export type UpdateWishListItemsMutation = { updateWishListItems?: { id: string } };

export type CheckEmailUniquenessQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type CheckEmailUniquenessQuery = { checkEmailUniqueness?: boolean };

export type CheckUsernameUniquenessQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type CheckUsernameUniquenessQuery = { checkUsernameUniqueness?: boolean };

export type GetDefaultShippingAddressQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDefaultShippingAddressQuery = { me?: { contact?: { defaultShippingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, isFavorite: boolean, phone?: string, email?: string, description?: string, addressType?: number } } } };

export type MemberAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, isFavorite: boolean, phone?: string, email?: string, description?: string, addressType?: number };

export type GetMeQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetMeQuery = { me?: { id: string, memberId?: string, userName: string, email?: string, emailConfirmed: boolean, photoUrl?: string, phoneNumber?: string, permissions?: Array<string>, isAdministrator: boolean, passwordExpired: boolean, passwordExpiryInDays?: number, forcePasswordChange?: boolean, lockedState?: boolean, contact?: { firstName: string, lastName: string, fullName: string, organizationId?: string, organizations?: { items?: Array<{ id: string, name?: string }> } }, operator?: { userName: string, contact?: { fullName: string } } } };

export type GetMyAddressesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetMyAddressesQuery = { me?: { contact?: { addresses?: { items?: Array<{ id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, isFavorite: boolean, phone?: string, email?: string, description?: string, addressType?: number }> } } } };

export type GetWishlistQueryVariables = Exact<{
  listId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetWishlistQuery = { wishlist?: { name: string, description?: string, scope?: WishlistScopeType, id: string, modifiedDate?: any, items?: Array<{ id: string, name: string, imageUrl?: string, sku: string, productId: string, quantity: number, productType?: string, salePrice: { amount: any, formattedAmount: string }, listPrice: { amount: any, formattedAmount: string }, product?: { name: string, id: string, code: string, slug?: string, outline?: string, minQuantity?: number, maxQuantity?: number, imgSrc?: string, images: Array<{ url: string }>, vendor?: { id: string, name: string }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, price: { actual: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } } } }> } };

export type GetWishlistsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetWishlistsQuery = { wishlists?: { items?: Array<{ id: string, name: string, description?: string, scope?: WishlistScopeType, modifiedDate?: any, itemsCount?: number }> } };

export type RequestPasswordResetQueryVariables = Exact<{
  loginOrEmail: Scalars['String']['input'];
  urlSuffix: Scalars['String']['input'];
}>;


export type RequestPasswordResetQuery = { requestPasswordReset?: boolean };

export type CartAddressFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number };

export type CartIdFragment = { id: string };

export type CouponFragment = { code?: string, isAppliedSuccessfully: boolean };

export type DiscountFragment = { description?: string, amount: any, coupon?: string };

export type FullCartFragment = { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> };

export type ShortCartFragment = { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> };

export type ShortLineItemFragment = { id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } };

export type ValidationErrorFragment = { errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> };

export type GiftFragment = { id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number };

export type ShippingMethodFragment = { id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } };

export type MoneyFragment = { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } };

export type CurrencyFragment = { code: string, symbol: string };

export type PaymentMethodFragment = { code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string };

export type FullLineItemFragment = { name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> };

export type FullLineItemProductFragment = { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } };

export type CommonVendorFragment = { id: string, name: string, rating?: { value: any, reviewCount: number } };

export type ShipmentFragment = { id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } };

export type PaymentFragment = { id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } };

export type AddBulkItemsCartMutationVariables = Exact<{
  command: InputAddBulkItemsType;
}>;


export type AddBulkItemsCartMutation = { addBulkItemsCart?: { cart?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }, errors?: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddCouponMutationVariables = Exact<{
  command: InputAddCouponType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type AddCouponMutation = { addCoupon?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddGiftItemsMutationVariables = Exact<{
  command: InputAddGiftItemsType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type AddGiftItemsMutation = { addGiftItems?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddItemMutationVariables = Exact<{
  command: InputAddItemType;
}>;


export type AddItemMutation = { addItem?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddItemsCartMutationVariables = Exact<{
  command: InputAddItemsType;
}>;


export type AddItemsCartMutation = { addItemsCart?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddOrUpdateCartPaymentMutationVariables = Exact<{
  command: InputAddOrUpdateCartPaymentType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type AddOrUpdateCartPaymentMutation = { addOrUpdateCartPayment?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type AddOrUpdateCartShipmentMutationVariables = Exact<{
  command: InputAddOrUpdateCartShipmentType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type AddOrUpdateCartShipmentMutation = { addOrUpdateCartShipment?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ChangeCartCommentMutationVariables = Exact<{
  command: InputChangeCommentType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type ChangeCartCommentMutation = { changeComment?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ChangeFullCartItemQuantityMutationVariables = Exact<{
  command: InputChangeCartItemQuantityType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type ChangeFullCartItemQuantityMutation = { changeCartItemQuantity?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ChangePurchaseOrderNumberMutationVariables = Exact<{
  command?: InputMaybe<InputChangePurchaseOrderNumber>;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type ChangePurchaseOrderNumberMutation = { changePurchaseOrderNumber?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ChangeShortCartItemQuantityMutationVariables = Exact<{
  command: InputChangeCartItemQuantityType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type ChangeShortCartItemQuantityMutation = { changeCartItemQuantity?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ClearCartMutationVariables = Exact<{
  command: InputClearCartType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type ClearCartMutation = { clearCart?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type MergeCartMutationVariables = Exact<{
  command: InputMergeCartType;
}>;


export type MergeCartMutation = { mergeCart?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type RejectGiftItemsMutationVariables = Exact<{
  command: InputRejectGiftItemsType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type RejectGiftItemsMutation = { rejectGiftItems?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type RemoveCartItemsMutationVariables = Exact<{
  command: InputRemoveItemsType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type RemoveCartItemsMutation = { removeCartItems?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type RemoveCouponMutationVariables = Exact<{
  command: InputRemoveCouponType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type RemoveCouponMutation = { removeCoupon?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type RemoveShipmentMutationVariables = Exact<{
  command: InputRemoveShipmentType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type RemoveShipmentMutation = { removeShipment?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type SelectCartItemsMutationVariables = Exact<{
  command: InputChangeCartItemsSelectedType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type SelectCartItemsMutation = { selectCartItems?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type UnselectCartItemsMutationVariables = Exact<{
  command: InputChangeCartItemsSelectedType;
  skipQuery: Scalars['Boolean']['input'];
}>;


export type UnselectCartItemsMutation = { unSelectCartItems?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type ValidateCouponMutationVariables = Exact<{
  command: InputValidateCouponType;
}>;


export type ValidateCouponMutation = { validateCoupon?: boolean };

export type GetFullCartQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFullCartQuery = { cart?: { purchaseOrderNumber?: string, comment?: string, itemsQuantity: number, id: string, availableGifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, availableShippingMethods: Array<{ id: string, code: string, logoUrl?: string, optionName?: string, optionDescription?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, availablePaymentMethods: Array<{ code: string, name?: string, description?: string, logoUrl?: string, paymentMethodGroupType: string }>, items: Array<{ name: string, inStockQuantity: number, imageUrl?: string, selectedForCheckout: boolean, productType?: string, id: string, sku: string, quantity: number, productId: string, product?: { id: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, salePrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> }>, gifts: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string, quantity: number }>, coupons: Array<{ code?: string, isAppliedSuccessfully: boolean }>, discounts: Array<{ description?: string, amount: any, coupon?: string }>, shipments: Array<{ id: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, payments: Array<{ id: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, currency: { code: string, symbol: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type GetShortCartQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetShortCartQuery = { cart?: { itemsQuantity: number, id: string, items: Array<{ id: string, sku: string, quantity: number, productId: string, extendedPrice: { amount: any } }>, validationErrors: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, objectType?: string, errorParameters?: Array<{ key: string, value: string }> }> } };

export type GetProductQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
}>;


export type GetProductQuery = { product?: { name: string, id: string, code: string, slug?: string, outline?: string, hasVariations: boolean, minQuantity?: number, maxQuantity?: number, imgSrc?: string, inWishlist: boolean, productType?: string, images: Array<{ url: string }>, assets: Array<{ name?: string, url: string }>, breadcrumbs: Array<{ itemId: string, typeName: string, title: string, seoPath?: string }>, description?: { content?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, variations: Array<{ id: string, name: string, minQuantity?: number, maxQuantity?: number, code: string, productType?: string, images: Array<{ url: string }>, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, price: { actual: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } } }>, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, price: { discountPercent: any, actual: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } }, seoInfo: { pageTitle?: string, metaKeywords?: string, metaDescription?: string }, videos?: { items?: Array<{ name: string, thumbnailUrl: string, embedUrl?: string }> } } };

export type GetProductWishlistsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
}>;


export type GetProductWishlistsQuery = { product?: { wishlistIds: Array<string> } };

export type GetSearchResultsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  query: Scalars['String']['input'];
  filter?: InputMaybe<Scalars['String']['input']>;
  withProducts: Scalars['Boolean']['input'];
  withCategories: Scalars['Boolean']['input'];
  withPages: Scalars['Boolean']['input'];
  withSuggestions: Scalars['Boolean']['input'];
  productsAfter?: InputMaybe<Scalars['String']['input']>;
  productsFirst?: InputMaybe<Scalars['Int']['input']>;
  productsSort?: InputMaybe<Scalars['String']['input']>;
  productsFuzzy?: InputMaybe<Scalars['Boolean']['input']>;
  productsFuzzyLevel?: InputMaybe<Scalars['Int']['input']>;
  categoriesAfter?: InputMaybe<Scalars['String']['input']>;
  categoriesFirst?: InputMaybe<Scalars['Int']['input']>;
  categoriesSort?: InputMaybe<Scalars['String']['input']>;
  categoriesFuzzy?: InputMaybe<Scalars['Boolean']['input']>;
  categoriesFuzzyLevel?: InputMaybe<Scalars['Int']['input']>;
  pagesFirst?: InputMaybe<Scalars['Int']['input']>;
  pagesAfter?: InputMaybe<Scalars['String']['input']>;
  suggestionsSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetSearchResultsQuery = { productSuggestions?: { suggestions?: Array<string> }, pages?: { totalCount?: number, items?: Array<{ name?: string, permalink?: string }> }, categories?: { totalCount?: number, items?: Array<{ id: string, name: string, slug?: string, seoInfo: { semanticUrl: string } }> }, products?: { totalCount?: number, items?: Array<{ id: string, name: string, code: string, slug?: string, imgSrc?: string, hasVariations: boolean, vendor?: { id: string, name: string }, availabilityData: { availableQuantity: number }, price: { actual: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string } }, minVariationPrice?: { actual: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string } } }> } };

export type SearchProductsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  fuzzy?: InputMaybe<Scalars['Boolean']['input']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  withFacets: Scalars['Boolean']['input'];
  withImages: Scalars['Boolean']['input'];
}>;


export type SearchProductsQuery = { products?: { totalCount?: number, items?: Array<{ name: string, id: string, code: string, minQuantity?: number, maxQuantity?: number, inWishlist: boolean, productType?: string, hasVariations: boolean, slug?: string, outline?: string, imgSrc?: string, vendor?: { id: string, name: string }, variations: Array<{ id: string, price: { list: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, actual: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } }>, images?: Array<{ url: string }>, description?: { content?: string }, availabilityData: { isActive: boolean, isAvailable: boolean, isBuyable: boolean, isInStock: boolean, availableQuantity: number }, price: { discountPercent: any, actual: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }, minVariationPrice?: { actual: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }>, term_facets?: Array<{ name: string, label: string, terms: Array<{ label: string, term: string, count: number, isSelected: boolean }> }>, range_facets?: Array<{ name: string, label: string, ranges: Array<{ label: string, count: number, from: number, to: number, includeFrom: boolean, includeTo: boolean, isSelected: boolean }> }> } };

export type SearchRelatedProductsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchRelatedProductsQuery = { product?: { associations?: { items?: Array<{ product?: { name: string, id: string, code: string, slug?: string, imgSrc?: string, hasVariations: boolean, minQuantity?: number, maxQuantity?: number, inWishlist: boolean, images: Array<{ url: string }>, vendor?: { id: string, name: string }, variations: Array<{ id: string }>, minVariationPrice?: { list: { amount: any, formattedAmount: string }, actual: { amount: any, formattedAmount: string } }, availabilityData: { availableQuantity: number, isAvailable: boolean, isInStock: boolean }, price: { actual: { amount: any, formattedAmount: string }, list: { amount: any, formattedAmount: string }, sale: { amount: any, formattedAmount: string }, discountAmount: { amount: any, formattedAmount: string } } } }> } } };

export type GetCountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCountriesQuery = { countries: Array<{ id: string, name: string, regions: Array<{ id: string, name: string }> }> };

export type GetMenuQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  cultureName: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type GetMenuQuery = { menu?: { items: Array<{ title: string, url: string, childItems: Array<{ title: string, url: string }> }> } };

export type GetMenusQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetMenusQuery = { menus: Array<{ name: string, items: Array<{ title: string, url: string, priority: number }> }> };

export type FileUploadOptionsFragment = { maxFileSize: number, allowedExtensions: Array<string> };

export type DeleteFileMutationVariables = Exact<{
  command: DeleteFileCommandType;
}>;


export type DeleteFileMutation = { deleteFile?: boolean };

export type GetFileUploadOptionsQueryVariables = Exact<{
  scope?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFileUploadOptionsQuery = { fileUploadOptions?: { maxFileSize: number, allowedExtensions: Array<string> } };

export type AllCurrencyFieldsFragment = { code: string, symbol: string, exchangeRate: any, customFormatting?: string, englishName: string, cultureName: string };

export type AllLanguageFieldsFragment = { isInvariant: boolean, cultureName: string, nativeName: string, threeLetterLanguageName: string, twoLetterLanguageName: string, twoLetterRegionName: string, threeLetterRegionName: string };

export type FullOrderFieldsFragment = { comment?: string, purchaseOrderNumber?: string, id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, currency: { code: string, symbol: string }, shipments: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl?: string, typeName?: string }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, inPayments: Array<{ id: string, number: string, isApproved: boolean, gatewayCode?: string, paymentMethod?: { logoUrl?: string, code: string, typeName: string, paymentMethodType: number, paymentMethodGroupType: number }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, availablePaymentMethods: Array<{ code: string, logoUrl?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, amount: { amount: any, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } };

export type ShortOrderFieldsFragment = { id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, amount: { amount: any, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } };

export type OrderLineItemFieldsFragment = { id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } };

export type OrderAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number };

export type QuoteAddressFieldsFragment = { firstName: string, lastName: string, line1?: string, line2?: string, city: string, countryCode?: string, countryName: string, regionId?: string, regionName?: string, postalCode?: string, phone?: string, email?: string, addressType?: number, key?: string };

export type QuoteLineItemFieldsFragment = { id: string, sku: string, productId: string, name: string, imageUrl?: string, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, selectedTierPrice?: { quantity: number, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }, product?: { id: string, slug?: string, brandName?: string, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { availableQuantity: number, isInStock: boolean } } };

export type GetFulfillmentCenterQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetFulfillmentCenterQuery = { fulfillmentCenter?: { id: string, name?: string, description?: string, shortDescription?: string, address?: { city?: string, countryCode?: string, countryName?: string, line1?: string, line2?: string, postalCode: string, zip?: string, phone?: string } } };

export type GetFulfillmentCentersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  fulfillmentCenterIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type GetFulfillmentCentersQuery = { fulfillmentCenters?: { items?: Array<{ id: string, name?: string, description?: string, shortDescription?: string, address?: { city?: string, countryCode?: string, countryName?: string, line1?: string, line2?: string, postalCode: string, zip?: string, phone?: string } }> } };

export type AddOrUpdateOrderPaymentMutationVariables = Exact<{
  command: InputAddOrUpdateOrderPaymentType;
}>;


export type AddOrUpdateOrderPaymentMutation = { addOrUpdateOrderPayment?: { id: string } };

export type CreateOrderFromCartMutationVariables = Exact<{
  command: InputCreateOrderFromCartType;
}>;


export type CreateOrderFromCartMutation = { createOrderFromCart?: { comment?: string, purchaseOrderNumber?: string, id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, currency: { code: string, symbol: string }, shipments: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl?: string, typeName?: string }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, inPayments: Array<{ id: string, number: string, isApproved: boolean, gatewayCode?: string, paymentMethod?: { logoUrl?: string, code: string, typeName: string, paymentMethodType: number, paymentMethodGroupType: number }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, availablePaymentMethods: Array<{ code: string, logoUrl?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, amount: { amount: any, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } };

export type GetFullOrderQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFullOrderQuery = { order?: { comment?: string, purchaseOrderNumber?: string, id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, currency: { code: string, symbol: string }, shipments: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl?: string, typeName?: string }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, inPayments: Array<{ id: string, number: string, isApproved: boolean, gatewayCode?: string, paymentMethod?: { logoUrl?: string, code: string, typeName: string, paymentMethodType: number, paymentMethodGroupType: number }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, availablePaymentMethods: Array<{ code: string, logoUrl?: string, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, amount: { amount: any, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } };

export type GetShortOrderQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetShortOrderQuery = { order?: { id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, quantity: number, sku: string, outerId?: string, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }> }, extendedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, vendor?: { id: string, name: string, rating?: { value: any, reviewCount: number } } }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, amount: { amount: any, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } };

export type GetOrdersQueryVariables = Exact<{
  filter?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrdersQuery = { orders?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, status?: string, statusDisplayValue?: string, number: string, customerId: string, purchaseOrderNumber?: string, currency: { code: string }, total: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, inPayments: Array<{ number: string }> }>, term_facets: Array<{ name: string, terms: Array<{ term: string, label: string, count: number }> }> } };

export type ChangeOrganizationContactRoleMutationVariables = Exact<{
  command: InputChangeOrganizationContactRoleType;
}>;


export type ChangeOrganizationContactRoleMutation = { changeOrganizationContactRole?: { succeeded: boolean, errors?: Array<{ code: string, parameter?: string, description?: string }> } };

export type LockOrganizationContactMutationVariables = Exact<{
  command: InputLockUnlockOrganizationContactType;
}>;


export type LockOrganizationContactMutation = { lockOrganizationContact?: { id: string } };

export type RemoveMemberFromOrganizationMutationVariables = Exact<{
  command: InputRemoveMemberFromOrganizationType;
}>;


export type RemoveMemberFromOrganizationMutation = { removeMemberFromOrganization?: { id: string } };

export type UnlockOrganizationContactMutationVariables = Exact<{
  command: InputLockUnlockOrganizationContactType;
}>;


export type UnlockOrganizationContactMutation = { unlockOrganizationContact?: { id: string } };

export type UpdateOrganizationMutationVariables = Exact<{
  command: InputUpdateOrganizationType;
}>;


export type UpdateOrganizationMutation = { updateOrganization?: { id: string } };

export type GetOrganizationAddressesQueryVariables = Exact<{
  id: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrganizationAddressesQuery = { organization?: { addresses?: { totalCount?: number, items?: Array<{ id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, isFavorite: boolean, phone?: string, email?: string, description?: string, addressType?: number }> } } };

export type GetOrganizationContactsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOrganizationContactsQuery = { organization?: { contacts?: { totalCount?: number, items?: Array<{ id: string, name?: string, firstName: string, lastName: string, fullName: string, emails: Array<string>, status?: string, securityAccounts?: Array<{ id: string, email?: string, roles?: Array<{ id: string, name: string }> }> }> } } };

export type GetPageQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
}>;


export type GetPageQuery = { page?: { id: string, name?: string, content: string } };

export type AuthorizePaymentMutationVariables = Exact<{
  command: InputAuthorizePaymentType;
}>;


export type AuthorizePaymentMutation = { authorizePayment?: { isSuccess: boolean, errorMessage?: string } };

export type DeleteSkyFlowCardMutationVariables = Exact<{
  command: DeleteSkyflowCardCommandType;
}>;


export type DeleteSkyFlowCardMutation = { deleteSkyflowCard?: boolean };

export type InitializePaymentMutationVariables = Exact<{
  command: InputInitializePaymentType;
}>;


export type InitializePaymentMutation = { initializePayment?: { isSuccess: boolean, errorMessage?: string, actionHtmlForm?: string, actionRedirectUrl?: string, paymentActionType?: string, publicParameters?: Array<{ key: string, value?: string }> } };

export type GetSkyflowCardsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSkyflowCardsQuery = { skyflowCards?: { cards?: Array<{ cardNumber: string, cardExpiration?: string, skyflowId: string }> } };

export type PushMessageFragment = { id: string, createdDate: any, shortMessage: string, isRead: boolean };

export type ClearAllPushMessagesMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearAllPushMessagesMutation = { clearAllPushMessages?: boolean };

export type MarkAllPushMessagesReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesReadMutation = { markAllPushMessagesRead?: boolean };

export type MarkAllPushMessagesUnreadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesUnreadMutation = { markAllPushMessagesUnread?: boolean };

export type MarkPushMessageReadMutationVariables = Exact<{
  command: InputMarkPushMessageReadType;
}>;


export type MarkPushMessageReadMutation = { markPushMessageRead?: boolean };

export type MarkPushMessageUnreadMutationVariables = Exact<{
  command: InputMarkPushMessageUnreadType;
}>;


export type MarkPushMessageUnreadMutation = { markPushMessageUnread?: boolean };

export type GetPushMessagesQueryVariables = Exact<{
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  withHidden?: InputMaybe<Scalars['Boolean']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPushMessagesQuery = { pushMessages?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, shortMessage: string, isRead: boolean }> }, unreadCount?: { totalCount?: number }, unreadCountWithHidden?: { totalCount?: number } };

export type OnPushMessageCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnPushMessageCreatedSubscription = { pushMessageCreated: { id: string, createdDate: any, shortMessage: string, isRead: boolean } };

export type QuoteAttachmentFragment = { name: string, url: string, contentType?: string, size: number };

export type ChangeQuoteCommentMutationVariables = Exact<{
  command: ChangeQuoteCommentCommandType;
}>;


export type ChangeQuoteCommentMutation = { changeQuoteComment?: { id: string } };

export type ChangeQuoteItemQuantityMutationVariables = Exact<{
  command: ChangeQuoteItemQuantityCommandType;
}>;


export type ChangeQuoteItemQuantityMutation = { changeQuoteItemQuantity?: { id: string } };

export type CreateQuoteMutationVariables = Exact<{
  command: CreateQuoteCommandType;
}>;


export type CreateQuoteMutation = { createQuote?: { id: string } };

export type CreateQuoteFromCartMutationVariables = Exact<{
  command: CreateQuoteFromCartCommandType;
}>;


export type CreateQuoteFromCartMutation = { createQuoteFromCart?: { id: string } };

export type RemoveQuoteItemMutationVariables = Exact<{
  command: RemoveQuoteItemCommandType;
}>;


export type RemoveQuoteItemMutation = { removeQuoteItem?: { id: string } };

export type SubmitQuoteRequestMutationVariables = Exact<{
  command: SubmitQuoteCommandType;
}>;


export type SubmitQuoteRequestMutation = { submitQuoteRequest?: { id: string } };

export type UpdateQuoteAddressesMutationVariables = Exact<{
  command: UpdateQuoteAddressesCommandType;
}>;


export type UpdateQuoteAddressesMutation = { updateQuoteAddresses?: { id: string } };

export type UpdateQuoteAttachmentsMutationVariables = Exact<{
  command: UpdateQuoteAttachmentsCommandType;
}>;


export type UpdateQuoteAttachmentsMutation = { updateQuoteAttachments?: { id: string } };

export type GetQuoteQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetQuoteQuery = { quote?: { id: string, number: string, createdDate: any, cancelledDate?: any, cancelReason?: string, comment?: string, isCancelled: boolean, status?: string, attachments: Array<{ name: string, url: string, contentType?: string, size: number }>, items: Array<{ id: string, sku: string, productId: string, name: string, imageUrl?: string, listPrice: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, selectedTierPrice?: { quantity: number, price: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }, product?: { id: string, slug?: string, brandName?: string, properties: Array<{ name: string, value?: any, type: string, hidden: boolean, valueType: string, label: string }>, availabilityData: { availableQuantity: number, isInStock: boolean } } }>, addresses: Array<{ firstName: string, lastName: string, line1?: string, line2?: string, city: string, countryCode?: string, countryName: string, regionId?: string, regionName?: string, postalCode?: string, phone?: string, email?: string, addressType?: number, key?: string }>, totals: { grandTotalInclTax: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } } };

export type GetQuotesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetQuotesQuery = { quotes?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, customerId?: string, number: string, status?: string, totals: { grandTotalInclTax: { amount: any, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } } }> } };

export type GetSlugInfoQueryVariables = Exact<{
  slug?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSlugInfoQuery = { slugInfo?: { entityInfo?: { id: string, isActive: boolean, languageCode?: string, objectId: string, objectType: string, semanticUrl: string } } };

export type GetStoreQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
}>;


export type GetStoreQuery = { store?: { storeId: string, storeName: string, catalogId: string, storeUrl?: string, defaultLanguage: { isInvariant: boolean, cultureName: string, nativeName: string, threeLetterLanguageName: string, twoLetterLanguageName: string, twoLetterRegionName: string, threeLetterRegionName: string }, availableLanguages: Array<{ isInvariant: boolean, cultureName: string, nativeName: string, threeLetterLanguageName: string, twoLetterLanguageName: string, twoLetterRegionName: string, threeLetterRegionName: string }>, defaultCurrency: { code: string, symbol: string, exchangeRate: any, customFormatting?: string, englishName: string, cultureName: string }, availableCurrencies: Array<{ code: string, symbol: string, exchangeRate: any, customFormatting?: string, englishName: string, cultureName: string }>, settings: { quotesEnabled: boolean, subscriptionEnabled: boolean, taxCalculationEnabled: boolean, anonymousUsersAllowed: boolean, isSpa: boolean, emailVerificationEnabled: boolean, emailVerificationRequired: boolean, createAnonymousOrderEnabled: boolean, seoLinkType: string, passwordRequirements?: { requireLowercase: boolean, requireUppercase: boolean, requireDigit: boolean, requiredLength: number, requiredUniqueChars: number, requireNonAlphanumeric: boolean }, modules: Array<{ moduleId: string, settings: Array<{ name: string, value?: any }> }> } } };

export const AvailabilityDataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}}]} as unknown as DocumentNode<AvailabilityDataFragment, unknown>;
export const PropertyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<PropertyFragment, unknown>;
export const WishlistLineItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"wishlistLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"outline"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<WishlistLineItemFieldsFragment, unknown>;
export const MemberAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"memberAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<MemberAddressFieldsFragment, unknown>;
export const CartIdFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]} as unknown as DocumentNode<CartIdFragment, unknown>;
export const ShortLineItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<ShortLineItemFragment, unknown>;
export const ValidationErrorFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}}]} as unknown as DocumentNode<ValidationErrorFragment, unknown>;
export const ShortCartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}}]} as unknown as DocumentNode<ShortCartFragment, unknown>;
export const GiftFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}}]} as unknown as DocumentNode<GiftFragment, unknown>;
export const CurrencyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]} as unknown as DocumentNode<CurrencyFragment, unknown>;
export const MoneyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]} as unknown as DocumentNode<MoneyFragment, unknown>;
export const ShippingMethodFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<ShippingMethodFragment, unknown>;
export const PaymentMethodFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}}]} as unknown as DocumentNode<PaymentMethodFragment, unknown>;
export const FullLineItemProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}}]} as unknown as DocumentNode<FullLineItemProductFragment, unknown>;
export const CommonVendorFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]} as unknown as DocumentNode<CommonVendorFragment, unknown>;
export const FullLineItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}}]} as unknown as DocumentNode<FullLineItemFragment, unknown>;
export const CouponFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}}]} as unknown as DocumentNode<CouponFragment, unknown>;
export const DiscountFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}}]} as unknown as DocumentNode<DiscountFragment, unknown>;
export const CartAddressFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<CartAddressFragment, unknown>;
export const ShipmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<ShipmentFragment, unknown>;
export const PaymentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<PaymentFragment, unknown>;
export const FullCartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}}]} as unknown as DocumentNode<FullCartFragment, unknown>;
export const FileUploadOptionsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fileUploadOptions"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FileUploadScopeOptionsType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxFileSize"}},{"kind":"Field","name":{"kind":"Name","value":"allowedExtensions"}}]}}]} as unknown as DocumentNode<FileUploadOptionsFragment, unknown>;
export const AllCurrencyFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"allCurrencyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"exchangeRate"}},{"kind":"Field","name":{"kind":"Name","value":"customFormatting"}},{"kind":"Field","name":{"kind":"Name","value":"englishName"}},{"kind":"Field","name":{"kind":"Name","value":"cultureName"}}]}}]} as unknown as DocumentNode<AllCurrencyFieldsFragment, unknown>;
export const AllLanguageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"allLanguageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LanguageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isInvariant"}},{"kind":"Field","name":{"kind":"Name","value":"cultureName"}},{"kind":"Field","name":{"kind":"Name","value":"nativeName"}},{"kind":"Field","name":{"kind":"Name","value":"threeLetterLanguageName"}},{"kind":"Field","name":{"kind":"Name","value":"twoLetterLanguageName"}},{"kind":"Field","name":{"kind":"Name","value":"twoLetterRegionName"}},{"kind":"Field","name":{"kind":"Name","value":"threeLetterRegionName"}}]}}]} as unknown as DocumentNode<AllLanguageFieldsFragment, unknown>;
export const OrderLineItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<OrderLineItemFieldsFragment, unknown>;
export const ShortOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}}]} as unknown as DocumentNode<ShortOrderFieldsFragment, unknown>;
export const OrderAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<OrderAddressFieldsFragment, unknown>;
export const FullOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<FullOrderFieldsFragment, unknown>;
export const QuoteAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]} as unknown as DocumentNode<QuoteAddressFieldsFragment, unknown>;
export const QuoteLineItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedTierPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<QuoteLineItemFieldsFragment, unknown>;
export const PushMessageFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<PushMessageFragment, unknown>;
export const QuoteAttachmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteAttachment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteAttachmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]} as unknown as DocumentNode<QuoteAttachmentFragment, unknown>;
export const AddAddressToFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAddressToFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddAddressToFavoritesCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addAddressToFavorites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<AddAddressToFavoritesMutation, AddAddressToFavoritesMutationVariables>;
export const AddWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreateWishlistType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddWishlistMutation, AddWishlistMutationVariables>;
export const AddWishlistBulkItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWishlistBulkItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddWishlistBulkItemType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWishlistBulkItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<AddWishlistBulkItemMutation, AddWishlistBulkItemMutationVariables>;
export const AddWishlistItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWishlistItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddWishlistItemType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWishlistItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddWishlistItemMutation, AddWishlistItemMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangePasswordType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const ChangeWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeWishlistType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"wishlistLineItemFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"wishlistLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"outline"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChangeWishlistMutation, ChangeWishlistMutationVariables>;
export const ConfirmEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"confirmEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputConfirmEmailType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}}]}}]}}]} as unknown as DocumentNode<ConfirmEmailMutation, ConfirmEmailMutationVariables>;
export const CreateContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createContact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreateContactType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateContactMutation, CreateContactMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreateUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const DeleteMemberAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMemberAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputDeleteMemberAddressType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMemberAddresses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteMemberAddressesMutation, DeleteMemberAddressesMutationVariables>;
export const DeleteWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveWishlistType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteWishlistMutation, DeleteWishlistMutationVariables>;
export const DeleteWishlistItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWishlistItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveWishlistItemType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeWishlistItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteWishlistItemMutation, DeleteWishlistItemMutationVariables>;
export const InviteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputInviteUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]} as unknown as DocumentNode<InviteUserMutation, InviteUserMutationVariables>;
export const RequestRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"requestRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRequestRegistrationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RequestRegistrationMutation, RequestRegistrationMutationVariables>;
export const RegisterByInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterByInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRegisterByInvitationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerByInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterByInvitationMutation, RegisterByInvitationMutationVariables>;
export const RemoveAddressFromFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAddressFromFavorites"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveAddressFromFavoritesCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAddressFromFavorites"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<RemoveAddressFromFavoritesMutation, RemoveAddressFromFavoritesMutationVariables>;
export const ResetPasswordByTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPasswordByToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputResetPasswordByTokenType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPasswordByToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]} as unknown as DocumentNode<ResetPasswordByTokenMutation, ResetPasswordByTokenMutationVariables>;
export const SendVerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendVerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSendVerifyEmailType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendVerifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<SendVerifyEmailMutation, SendVerifyEmailMutationVariables>;
export const UpdateContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateContact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateContactType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateContactMutation, UpdateContactMutationVariables>;
export const UpdateMemberAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateMemberAddressType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberAddresses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateMemberAddressesMutation, UpdateMemberAddressesMutationVariables>;
export const UpdatePersonalDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePersonalData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdatePersonalDataType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePersonalData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePersonalDataMutation, UpdatePersonalDataMutationVariables>;
export const UpdateWishListItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWishListItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateWishlistItemsType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWishListItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateWishListItemsMutation, UpdateWishListItemsMutationVariables>;
export const CheckEmailUniquenessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"checkEmailUniqueness"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkEmailUniqueness"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<CheckEmailUniquenessQuery, CheckEmailUniquenessQueryVariables>;
export const CheckUsernameUniquenessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"checkUsernameUniqueness"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkUsernameUniqueness"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}}]}]}}]} as unknown as DocumentNode<CheckUsernameUniquenessQuery, CheckUsernameUniquenessQueryVariables>;
export const GetDefaultShippingAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDefaultShippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultShippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"memberAddressFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"memberAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<GetDefaultShippingAddressQuery, GetDefaultShippingAddressQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"memberId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"emailConfirmed"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}},{"kind":"Field","name":{"kind":"Name","value":"isAdministrator"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpired"}},{"kind":"Field","name":{"kind":"Name","value":"passwordExpiryInDays"}},{"kind":"Field","name":{"kind":"Name","value":"forcePasswordChange"}},{"kind":"Field","name":{"kind":"Name","value":"lockedState"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"operator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetMyAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addresses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"memberAddressFields"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"memberAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<GetMyAddressesQuery, GetMyAddressesQueryVariables>;
export const GetWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"listId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"listId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"listId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedDate"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"wishlistLineItemFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"wishlistLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"outline"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetWishlistQuery, GetWishlistQueryVariables>;
export const GetWishlistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlists"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedDate"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}}]}}]}}]}}]} as unknown as DocumentNode<GetWishlistsQuery, GetWishlistsQueryVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"requestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loginOrEmail"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"urlSuffix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loginOrEmail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loginOrEmail"}}},{"kind":"Argument","name":{"kind":"Name","value":"urlSuffix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"urlSuffix"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetQuery, RequestPasswordResetQueryVariables>;
export const AddBulkItemsCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddBulkItemsCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddBulkItemsType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addBulkItemsCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<AddBulkItemsCartMutation, AddBulkItemsCartMutationVariables>;
export const AddCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddCouponType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<AddCouponMutation, AddCouponMutationVariables>;
export const AddGiftItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddGiftItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddGiftItemsType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addGiftItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<AddGiftItemsMutation, AddGiftItemsMutationVariables>;
export const AddItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddItemType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<AddItemMutation, AddItemMutationVariables>;
export const AddItemsCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddItemsCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddItemsType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addItemsCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<AddItemsCartMutation, AddItemsCartMutationVariables>;
export const AddOrUpdateCartPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddOrUpdateCartPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddOrUpdateCartPaymentType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addOrUpdateCartPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<AddOrUpdateCartPaymentMutation, AddOrUpdateCartPaymentMutationVariables>;
export const AddOrUpdateCartShipmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddOrUpdateCartShipment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddOrUpdateCartShipmentType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addOrUpdateCartShipment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<AddOrUpdateCartShipmentMutation, AddOrUpdateCartShipmentMutationVariables>;
export const ChangeCartCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeCartComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCommentType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<ChangeCartCommentMutation, ChangeCartCommentMutationVariables>;
export const ChangeFullCartItemQuantityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeFullCartItemQuantity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCartItemQuantityType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeCartItemQuantity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<ChangeFullCartItemQuantityMutation, ChangeFullCartItemQuantityMutationVariables>;
export const ChangePurchaseOrderNumberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePurchaseOrderNumber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangePurchaseOrderNumber"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePurchaseOrderNumber"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<ChangePurchaseOrderNumberMutation, ChangePurchaseOrderNumberMutationVariables>;
export const ChangeShortCartItemQuantityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeShortCartItemQuantity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCartItemQuantityType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeCartItemQuantity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<ChangeShortCartItemQuantityMutation, ChangeShortCartItemQuantityMutationVariables>;
export const ClearCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputClearCartType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<ClearCartMutation, ClearCartMutationVariables>;
export const MergeCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergeCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMergeCartType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergeCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<MergeCartMutation, MergeCartMutationVariables>;
export const RejectGiftItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectGiftItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRejectGiftItemsType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectGiftItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<RejectGiftItemsMutation, RejectGiftItemsMutationVariables>;
export const RemoveCartItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCartItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveItemsType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCartItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<RemoveCartItemsMutation, RemoveCartItemsMutationVariables>;
export const RemoveCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveCouponType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<RemoveCouponMutation, RemoveCouponMutationVariables>;
export const RemoveShipmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveShipment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveShipmentType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeShipment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<RemoveShipmentMutation, RemoveShipmentMutationVariables>;
export const SelectCartItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SelectCartItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCartItemsSelectedType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectCartItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<SelectCartItemsMutation, SelectCartItemsMutationVariables>;
export const UnselectCartItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnselectCartItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeCartItemsSelectedType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unSelectCartItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipQuery"}}}]}]}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<UnselectCartItemsMutation, UnselectCartItemsMutationVariables>;
export const ValidateCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ValidateCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputValidateCouponType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validateCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<ValidateCouponMutation, ValidateCouponMutationVariables>;
export const GetFullCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFullCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullCart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"gift"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shippingMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShippingMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"optionDescription"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"paymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItemProduct"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commonVendor"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommonVendor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"inStockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"selectedForCheckout"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItemProduct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commonVendor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"coupon"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CouponType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isAppliedSuccessfully"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"discount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DiscountType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartAddress"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shipment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ShipmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"payment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentGatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartAddress"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"availableGifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableShippingMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shippingMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"paymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"gift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"coupon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"discount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shipment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"payment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<GetFullCartQuery, GetFullCartQueryVariables>;
export const GetShortCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShortCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortCart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"cartId"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortLineItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"validationError"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationErrorType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"errorParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortCart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"cartId"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortLineItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"validationErrors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ruleSet"},"value":{"kind":"StringValue","value":"*","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"validationError"}}]}}]}}]} as unknown as DocumentNode<GetShortCartQuery, GetShortCartQueryVariables>;
export const GetProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"outline"}},{"kind":"Field","name":{"kind":"Name","value":"hasVariations"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"inWishlist"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"breadcrumbs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"seoPath"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seoInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"metaKeywords"}},{"kind":"Field","name":{"kind":"Name","value":"metaDescription"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"embedUrl"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}}]} as unknown as DocumentNode<GetProductQuery, GetProductQueryVariables>;
export const GetProductWishlistsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProductWishlists"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlistIds"}}]}}]}}]} as unknown as DocumentNode<GetProductWishlistsQuery, GetProductWishlistsQueryVariables>;
export const GetSearchResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSearchResults"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withProducts"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withCategories"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withPages"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withSuggestions"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productsAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productsFirst"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productsSort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productsFuzzy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productsFuzzyLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoriesAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFirst"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoriesSort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFuzzy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFuzzyLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagesFirst"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagesAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"suggestionsSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSuggestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"suggestionsSize"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withSuggestions"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagesFirst"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagesAfter"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withPages"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"permalink"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoriesAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFirst"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoriesSort"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFuzzy"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzyLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoriesFuzzyLevel"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withCategories"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"seoInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"semanticUrl"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productsAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productsFirst"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productsSort"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productsFuzzy"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzyLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productsFuzzyLevel"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withProducts"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasVariations"}},{"kind":"Field","name":{"kind":"Name","value":"minVariationPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetSearchResultsQuery, GetSearchResultsQueryVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fuzzy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fuzzyLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withFacets"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withImages"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fuzzy"}}},{"kind":"Argument","name":{"kind":"Name","value":"fuzzyLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fuzzyLevel"}}},{"kind":"Argument","name":{"kind":"Name","value":"productIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"inWishlist"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasVariations"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"outline"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withImages"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"StringValue","value":"QuickReview","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"availabilityData"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountPercent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minVariationPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"term_facets"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withFacets"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"terms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"term"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"isSelected"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"range_facets"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withFacets"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"ranges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"includeFrom"}},{"kind":"Field","name":{"kind":"Name","value":"includeTo"}},{"kind":"Field","name":{"kind":"Name","value":"isSelected"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"availabilityData"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityData"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isBuyable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}},{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const SearchRelatedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRelatedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"group"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"associations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"group"},"value":{"kind":"Variable","name":{"kind":"Name","value":"group"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasVariations"}},{"kind":"Field","name":{"kind":"Name","value":"variations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minVariationPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"inWishlist"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"actual"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"list"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sale"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchRelatedProductsQuery, SearchRelatedProductsQueryVariables>;
export const GetCountriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCountries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCountriesQuery, GetCountriesQueryVariables>;
export const GetMenuDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenu"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menu"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"childItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMenuQuery, GetMenuQueryVariables>;
export const GetMenusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}}]}}]}}]}}]} as unknown as DocumentNode<GetMenusQuery, GetMenusQueryVariables>;
export const DeleteFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteFileCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteFileMutation, DeleteFileMutationVariables>;
export const GetFileUploadOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFileUploadOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileUploadOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fileUploadOptions"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fileUploadOptions"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FileUploadScopeOptionsType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxFileSize"}},{"kind":"Field","name":{"kind":"Name","value":"allowedExtensions"}}]}}]} as unknown as DocumentNode<GetFileUploadOptionsQuery, GetFileUploadOptionsQueryVariables>;
export const GetFulfillmentCenterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFulfillmentCenter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fulfillmentCenter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]} as unknown as DocumentNode<GetFulfillmentCenterQuery, GetFulfillmentCenterQueryVariables>;
export const GetFulfillmentCentersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFulfillmentCenters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fulfillmentCenterIds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fulfillmentCenters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"fulfillmentCenterIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fulfillmentCenterIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortDescription"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFulfillmentCentersQuery, GetFulfillmentCentersQueryVariables>;
export const AddOrUpdateOrderPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddOrUpdateOrderPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddOrUpdateOrderPaymentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addOrUpdateOrderPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddOrUpdateOrderPaymentMutation, AddOrUpdateOrderPaymentMutationVariables>;
export const CreateOrderFromCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrderFromCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreateOrderFromCartType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrderFromCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]} as unknown as DocumentNode<CreateOrderFromCartMutation, CreateOrderFromCartMutationVariables>;
export const GetFullOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFullOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"number"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"number"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]} as unknown as DocumentNode<GetFullOrderQuery, GetFullOrderQueryVariables>;
export const GetShortOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShortOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"number"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"number"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]} as unknown as DocumentNode<GetShortOrderQuery, GetShortOrderQueryVariables>;
export const GetOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"facet"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"facet"},"value":{"kind":"Variable","name":{"kind":"Name","value":"facet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"term_facets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"terms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"term"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<GetOrdersQuery, GetOrdersQueryVariables>;
export const ChangeOrganizationContactRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeOrganizationContactRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeOrganizationContactRoleType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeOrganizationContactRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<ChangeOrganizationContactRoleMutation, ChangeOrganizationContactRoleMutationVariables>;
export const LockOrganizationContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LockOrganizationContact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputLockUnlockOrganizationContactType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lockOrganizationContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<LockOrganizationContactMutation, LockOrganizationContactMutationVariables>;
export const RemoveMemberFromOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMemberFromOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRemoveMemberFromOrganizationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMemberFromOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveMemberFromOrganizationMutation, RemoveMemberFromOrganizationMutationVariables>;
export const UnlockOrganizationContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnlockOrganizationContact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputLockUnlockOrganizationContactType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unlockOrganizationContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UnlockOrganizationContactMutation, UnlockOrganizationContactMutationVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateOrganizationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const GetOrganizationAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addresses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"memberAddressFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"memberAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MemberAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"isFavorite"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<GetOrganizationAddressesQuery, GetOrganizationAddressesQueryVariables>;
export const GetOrganizationContactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationContacts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchPhrase"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"searchPhrase"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchPhrase"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"emails"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"securityAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrganizationContactsQuery, GetOrganizationContactsQueryVariables>;
export const GetPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"content"}}]}}]}}]} as unknown as DocumentNode<GetPageQuery, GetPageQueryVariables>;
export const AuthorizePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthorizePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAuthorizePaymentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authorizePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}}]}}]}}]} as unknown as DocumentNode<AuthorizePaymentMutation, AuthorizePaymentMutationVariables>;
export const DeleteSkyFlowCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSkyFlowCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteSkyflowCardCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSkyflowCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteSkyFlowCardMutation, DeleteSkyFlowCardMutationVariables>;
export const InitializePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitializePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputInitializePaymentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initializePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"actionHtmlForm"}},{"kind":"Field","name":{"kind":"Name","value":"actionRedirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentActionType"}},{"kind":"Field","name":{"kind":"Name","value":"publicParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<InitializePaymentMutation, InitializePaymentMutationVariables>;
export const GetSkyflowCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSkyflowCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skyflowCards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cardExpiration"}},{"kind":"Field","name":{"kind":"Name","value":"skyflowId"}}]}}]}}]}}]} as unknown as DocumentNode<GetSkyflowCardsQuery, GetSkyflowCardsQueryVariables>;
export const ClearAllPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearAllPushMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearAllPushMessages"}}]}}]} as unknown as DocumentNode<ClearAllPushMessagesMutation, ClearAllPushMessagesMutationVariables>;
export const MarkAllPushMessagesReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesRead"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesReadMutation, MarkAllPushMessagesReadMutationVariables>;
export const MarkAllPushMessagesUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesUnread"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesUnread"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesUnreadMutation, MarkAllPushMessagesUnreadMutationVariables>;
export const MarkPushMessageReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkPushMessageRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMarkPushMessageReadType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPushMessageRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<MarkPushMessageReadMutation, MarkPushMessageReadMutationVariables>;
export const MarkPushMessageUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkPushMessageUnread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMarkPushMessageUnreadType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPushMessageUnread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<MarkPushMessageUnreadMutation, MarkPushMessageUnreadMutationVariables>;
export const GetPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPushMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withHidden"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"withHidden"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withHidden"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"unreadCount"},"name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"unreadCountWithHidden"},"name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"withHidden"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<GetPushMessagesQuery, GetPushMessagesQueryVariables>;
export const OnPushMessageCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnPushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]} as unknown as DocumentNode<OnPushMessageCreatedSubscription, OnPushMessageCreatedSubscriptionVariables>;
export const ChangeQuoteCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeQuoteComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeQuoteCommentCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeQuoteComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ChangeQuoteCommentMutation, ChangeQuoteCommentMutationVariables>;
export const ChangeQuoteItemQuantityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeQuoteItemQuantity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeQuoteItemQuantityCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeQuoteItemQuantity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ChangeQuoteItemQuantityMutation, ChangeQuoteItemQuantityMutationVariables>;
export const CreateQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuoteCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateQuoteMutation, CreateQuoteMutationVariables>;
export const CreateQuoteFromCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuoteFromCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuoteFromCartCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuoteFromCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateQuoteFromCartMutation, CreateQuoteFromCartMutationVariables>;
export const RemoveQuoteItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveQuoteItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveQuoteItemCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeQuoteItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveQuoteItemMutation, RemoveQuoteItemMutationVariables>;
export const SubmitQuoteRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitQuoteRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitQuoteCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitQuoteRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SubmitQuoteRequestMutation, SubmitQuoteRequestMutationVariables>;
export const UpdateQuoteAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuoteAddresses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuoteAddressesCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuoteAddresses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateQuoteAddressesMutation, UpdateQuoteAddressesMutationVariables>;
export const UpdateQuoteAttachmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateQuoteAttachments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateQuoteAttachmentsCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateQuoteAttachments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateQuoteAttachmentsMutation, UpdateQuoteAttachmentsMutationVariables>;
export const GetQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledDate"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"isCancelled"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"quoteAttachment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"quoteLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"quoteAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grandTotalInclTax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteAttachment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteAttachmentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"listPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedTierPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availabilityData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"isInStock"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"quoteAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"QuoteAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]} as unknown as DocumentNode<GetQuoteQuery, GetQuoteQueryVariables>;
export const GetQuotesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuotes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grandTotalInclTax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<GetQuotesQuery, GetQuotesQueryVariables>;
export const GetSlugInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSlugInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slugInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entityInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectType"}},{"kind":"Field","name":{"kind":"Name","value":"semanticUrl"}}]}}]}}]}}]} as unknown as DocumentNode<GetSlugInfoQuery, GetSlugInfoQueryVariables>;
export const GetStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"store"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"storeName"}},{"kind":"Field","name":{"kind":"Name","value":"catalogId"}},{"kind":"Field","name":{"kind":"Name","value":"storeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"defaultLanguage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"allLanguageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableLanguages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"allLanguageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"allCurrencyFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableCurrencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"allCurrencyFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quotesEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"anonymousUsersAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"isSpa"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerificationEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerificationRequired"}},{"kind":"Field","name":{"kind":"Name","value":"createAnonymousOrderEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"seoLinkType"}},{"kind":"Field","name":{"kind":"Name","value":"passwordRequirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requireLowercase"}},{"kind":"Field","name":{"kind":"Name","value":"requireUppercase"}},{"kind":"Field","name":{"kind":"Name","value":"requireDigit"}},{"kind":"Field","name":{"kind":"Name","value":"requiredLength"}},{"kind":"Field","name":{"kind":"Name","value":"requiredUniqueChars"}},{"kind":"Field","name":{"kind":"Name","value":"requireNonAlphanumeric"}}]}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleId"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"allLanguageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LanguageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isInvariant"}},{"kind":"Field","name":{"kind":"Name","value":"cultureName"}},{"kind":"Field","name":{"kind":"Name","value":"nativeName"}},{"kind":"Field","name":{"kind":"Name","value":"threeLetterLanguageName"}},{"kind":"Field","name":{"kind":"Name","value":"twoLetterLanguageName"}},{"kind":"Field","name":{"kind":"Name","value":"twoLetterRegionName"}},{"kind":"Field","name":{"kind":"Name","value":"threeLetterRegionName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"allCurrencyFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"exchangeRate"}},{"kind":"Field","name":{"kind":"Name","value":"customFormatting"}},{"kind":"Field","name":{"kind":"Name","value":"englishName"}},{"kind":"Field","name":{"kind":"Name","value":"cultureName"}}]}}]} as unknown as DocumentNode<GetStoreQuery, GetStoreQueryVariables>;
export const OperationNames = {
  Query: {
    checkEmailUniqueness: 'checkEmailUniqueness',
    checkUsernameUniqueness: 'checkUsernameUniqueness',
    GetDefaultShippingAddress: 'GetDefaultShippingAddress',
    GetMe: 'GetMe',
    GetMyAddresses: 'GetMyAddresses',
    GetWishlist: 'GetWishlist',
    GetWishlists: 'GetWishlists',
    requestPasswordReset: 'requestPasswordReset',
    GetFullCart: 'GetFullCart',
    GetShortCart: 'GetShortCart',
    GetProduct: 'GetProduct',
    GetProductWishlists: 'GetProductWishlists',
    GetSearchResults: 'GetSearchResults',
    SearchProducts: 'SearchProducts',
    SearchRelatedProducts: 'SearchRelatedProducts',
    GetCountries: 'GetCountries',
    GetMenu: 'GetMenu',
    GetMenus: 'GetMenus',
    GetFileUploadOptions: 'GetFileUploadOptions',
    GetFulfillmentCenter: 'GetFulfillmentCenter',
    GetFulfillmentCenters: 'GetFulfillmentCenters',
    GetFullOrder: 'GetFullOrder',
    GetShortOrder: 'GetShortOrder',
    GetOrders: 'GetOrders',
    GetOrganizationAddresses: 'GetOrganizationAddresses',
    GetOrganizationContacts: 'GetOrganizationContacts',
    GetPage: 'GetPage',
    GetSkyflowCards: 'GetSkyflowCards',
    GetPushMessages: 'GetPushMessages',
    GetQuote: 'GetQuote',
    GetQuotes: 'GetQuotes',
    GetSlugInfo: 'GetSlugInfo',
    GetStore: 'GetStore'
  },
  Mutation: {
    AddAddressToFavorites: 'AddAddressToFavorites',
    AddWishlist: 'AddWishlist',
    AddWishlistBulkItem: 'AddWishlistBulkItem',
    AddWishlistItem: 'AddWishlistItem',
    ChangePassword: 'ChangePassword',
    ChangeWishlist: 'ChangeWishlist',
    confirmEmail: 'confirmEmail',
    createContact: 'createContact',
    createUser: 'createUser',
    DeleteMemberAddresses: 'DeleteMemberAddresses',
    DeleteWishlist: 'DeleteWishlist',
    DeleteWishlistItem: 'DeleteWishlistItem',
    InviteUser: 'InviteUser',
    requestRegistration: 'requestRegistration',
    RegisterByInvitation: 'RegisterByInvitation',
    RemoveAddressFromFavorites: 'RemoveAddressFromFavorites',
    ResetPasswordByToken: 'ResetPasswordByToken',
    SendVerifyEmail: 'SendVerifyEmail',
    updateContact: 'updateContact',
    UpdateMemberAddresses: 'UpdateMemberAddresses',
    UpdatePersonalData: 'UpdatePersonalData',
    UpdateWishListItems: 'UpdateWishListItems',
    AddBulkItemsCart: 'AddBulkItemsCart',
    AddCoupon: 'AddCoupon',
    AddGiftItems: 'AddGiftItems',
    AddItem: 'AddItem',
    AddItemsCart: 'AddItemsCart',
    AddOrUpdateCartPayment: 'AddOrUpdateCartPayment',
    AddOrUpdateCartShipment: 'AddOrUpdateCartShipment',
    ChangeCartComment: 'ChangeCartComment',
    ChangeFullCartItemQuantity: 'ChangeFullCartItemQuantity',
    ChangePurchaseOrderNumber: 'ChangePurchaseOrderNumber',
    ChangeShortCartItemQuantity: 'ChangeShortCartItemQuantity',
    ClearCart: 'ClearCart',
    MergeCart: 'MergeCart',
    RejectGiftItems: 'RejectGiftItems',
    RemoveCartItems: 'RemoveCartItems',
    RemoveCoupon: 'RemoveCoupon',
    RemoveShipment: 'RemoveShipment',
    SelectCartItems: 'SelectCartItems',
    UnselectCartItems: 'UnselectCartItems',
    ValidateCoupon: 'ValidateCoupon',
    DeleteFile: 'DeleteFile',
    AddOrUpdateOrderPayment: 'AddOrUpdateOrderPayment',
    CreateOrderFromCart: 'CreateOrderFromCart',
    ChangeOrganizationContactRole: 'ChangeOrganizationContactRole',
    LockOrganizationContact: 'LockOrganizationContact',
    RemoveMemberFromOrganization: 'RemoveMemberFromOrganization',
    UnlockOrganizationContact: 'UnlockOrganizationContact',
    UpdateOrganization: 'UpdateOrganization',
    AuthorizePayment: 'AuthorizePayment',
    DeleteSkyFlowCard: 'DeleteSkyFlowCard',
    InitializePayment: 'InitializePayment',
    ClearAllPushMessages: 'ClearAllPushMessages',
    MarkAllPushMessagesRead: 'MarkAllPushMessagesRead',
    MarkAllPushMessagesUnread: 'MarkAllPushMessagesUnread',
    MarkPushMessageRead: 'MarkPushMessageRead',
    MarkPushMessageUnread: 'MarkPushMessageUnread',
    ChangeQuoteComment: 'ChangeQuoteComment',
    ChangeQuoteItemQuantity: 'ChangeQuoteItemQuantity',
    CreateQuote: 'CreateQuote',
    CreateQuoteFromCart: 'CreateQuoteFromCart',
    RemoveQuoteItem: 'RemoveQuoteItem',
    SubmitQuoteRequest: 'SubmitQuoteRequest',
    UpdateQuoteAddresses: 'UpdateQuoteAddresses',
    UpdateQuoteAttachments: 'UpdateQuoteAttachments'
  },
  Subscription: {
    OnPushMessageCreated: 'OnPushMessageCreated'
  },
  Fragment: {
    wishlistLineItemFields: 'wishlistLineItemFields',
    availabilityData: 'availabilityData',
    property: 'property',
    memberAddressFields: 'memberAddressFields',
    cartAddress: 'cartAddress',
    cartId: 'cartId',
    coupon: 'coupon',
    discount: 'discount',
    fullCart: 'fullCart',
    shortCart: 'shortCart',
    shortLineItem: 'shortLineItem',
    validationError: 'validationError',
    gift: 'gift',
    shippingMethod: 'shippingMethod',
    money: 'money',
    currency: 'currency',
    paymentMethod: 'paymentMethod',
    fullLineItem: 'fullLineItem',
    fullLineItemProduct: 'fullLineItemProduct',
    commonVendor: 'commonVendor',
    shipment: 'shipment',
    payment: 'payment',
    fileUploadOptions: 'fileUploadOptions',
    allCurrencyFields: 'allCurrencyFields',
    allLanguageFields: 'allLanguageFields',
    fullOrderFields: 'fullOrderFields',
    shortOrderFields: 'shortOrderFields',
    orderLineItemFields: 'orderLineItemFields',
    orderAddressFields: 'orderAddressFields',
    quoteAddressFields: 'quoteAddressFields',
    quoteLineItemFields: 'quoteLineItemFields',
    pushMessage: 'pushMessage',
    quoteAttachment: 'quoteAttachment'
  }
}
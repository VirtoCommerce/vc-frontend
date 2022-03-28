// This file was generated based on "graphql.codegen.yml". Do not edit manually.
/* eslint-disable */

export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Date` scalar type represents a year, month and day in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  Date: any;
  /** The `DateTime` scalar type represents a date and time. `DateTime` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTime: any;
  Decimal: any;
  DynamicPropertyValue: any;
  Long: any;
  OptionalDecimal: any;
  OptionalNullableDecimal: any;
  OptionalString: any;
  PropertyValue: any;
};

export type Asset = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']>;
  /** Group of the asset. */
  group?: Maybe<Scalars['String']>;
  /** The unique ID of the asset. */
  id?: Maybe<Scalars['String']>;
  /** MimeType of the asset. */
  mimeType?: Maybe<Scalars['String']>;
  /** The name of the asset. */
  name?: Maybe<Scalars['String']>;
  /** RelativeUrl of the asset. */
  relativeUrl?: Maybe<Scalars['String']>;
  /** Size of the asset. */
  size?: Maybe<Scalars['Long']>;
  /** Type id of the asset. */
  typeId?: Maybe<Scalars['String']>;
  /** Url of the asset. */
  url?: Maybe<Scalars['String']>;
};

export type AvailabilityData = {
  /** Available quantity */
  availableQuantity: Scalars['Long'];
  /** Inventories */
  inventories?: Maybe<Array<Maybe<InventoryInfo>>>;
  /** Is active */
  isActive?: Maybe<Scalars['Boolean']>;
  /** Is available */
  isAvailable?: Maybe<Scalars['Boolean']>;
  /** Is buyable */
  isBuyable?: Maybe<Scalars['Boolean']>;
  /** Is in stock */
  isInStock?: Maybe<Scalars['Boolean']>;
  /** Is track inventory */
  isTrackInventory?: Maybe<Scalars['Boolean']>;
};

export type Breadcrumb = {
  /** Id of item the breadcrumb calculated for */
  itemId: Scalars['String'];
  /** Semantic URL keyword */
  semanticUrl?: Maybe<Scalars['String']>;
  /** Full path from catalog */
  seoPath?: Maybe<Scalars['String']>;
  /** Name of current breadcrumb */
  title: Scalars['String'];
  /** Catalog, category or product */
  typeName?: Maybe<Scalars['String']>;
};

export type BulkCartType = {
  /** Cart */
  cart?: Maybe<CartType>;
  /** A set of errors in case the Skus are invalid */
  errors?: Maybe<Array<Maybe<ValidationErrorType>>>;
};

export type CartAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city?: Maybe<Scalars['String']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']>;
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Postal code */
  postalCode: Scalars['String'];
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Cart`. */
export type CartEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<CartType>;
};

export type CartShipmentItemType = {
  lineItem?: Maybe<LineItemType>;
  /** Quantity */
  quantity?: Maybe<Scalars['Int']>;
};

export type CartType = {
  /** Addresses */
  addresses?: Maybe<Array<Maybe<CartAddressType>>>;
  /** Available Gifts */
  availableGifts?: Maybe<Array<Maybe<GiftItemType>>>;
  /** Available payment methods */
  availablePaymentMethods?: Maybe<Array<Maybe<PaymentMethodType>>>;
  availableShippingMethods?: Maybe<Array<Maybe<ShippingMethodType>>>;
  /** Shopping cart channel ID */
  channelId?: Maybe<Scalars['String']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']>;
  /** Coupons */
  coupons?: Maybe<Array<Maybe<CouponType>>>;
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Shopping cart user ID */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  /** Total discount */
  discountTotal?: Maybe<MoneyType>;
  /** Total discount with tax */
  discountTotalWithTax?: Maybe<MoneyType>;
  /** Discounts */
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Total extended price */
  extendedPriceTotal?: Maybe<MoneyType>;
  /** Total extended price with tax */
  extendedPriceTotalWithTax?: Maybe<MoneyType>;
  fee?: Maybe<MoneyType>;
  /** Gifts */
  gifts?: Maybe<Array<Maybe<GiftItemType>>>;
  /** Total handling */
  handlingTotal?: Maybe<MoneyType>;
  /** Total handling with tax */
  handlingTotalWithTax?: Maybe<MoneyType>;
  /** Has physical products */
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Shopping cart ID */
  id?: Maybe<Scalars['String']>;
  /** Displays whether the shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Displays whether the shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /**
   * Shows whether the cart is valid
   * @deprecated Deprecated, because of useless (no need to know validation state without details). Use validationErrors field.
   */
  isValid?: Maybe<Scalars['Boolean']>;
  /** Items */
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Item count */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Quantity of items */
  itemsQuantity?: Maybe<Scalars['Int']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart organization ID */
  organizationId?: Maybe<Scalars['String']>;
  /** Payment price */
  paymentPrice?: Maybe<MoneyType>;
  /** Payment price with tax */
  paymentPriceWithTax?: Maybe<MoneyType>;
  /** Total payment */
  paymentTotal?: Maybe<MoneyType>;
  /** Total payment with tax */
  paymentTotalWithTax?: Maybe<MoneyType>;
  /** Payments */
  payments?: Maybe<Array<Maybe<PaymentType>>>;
  /** Purchase order number */
  purchaseOrderNumber?: Maybe<Scalars['String']>;
  /** Shipments */
  shipments?: Maybe<Array<Maybe<ShipmentType>>>;
  /** Shipping price */
  shippingPrice?: Maybe<MoneyType>;
  /** Shipping price with tax */
  shippingPriceWithTax?: Maybe<MoneyType>;
  /** Total shipping */
  shippingTotal?: Maybe<MoneyType>;
  /** Total shipping with tax */
  shippingTotalWithTax?: Maybe<MoneyType>;
  /** Shopping cart status */
  status?: Maybe<Scalars['String']>;
  /** Shopping cart store ID */
  storeId?: Maybe<Scalars['String']>;
  /** Shopping cart subtotal */
  subTotal?: Maybe<MoneyType>;
  /** Subtotal with tax */
  subTotalWithTax?: Maybe<MoneyType>;
  /** Tax details */
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percentage */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Total tax */
  taxTotal?: Maybe<MoneyType>;
  /** Shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Shopping cart total */
  total?: Maybe<MoneyType>;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']>;
  /** A set of errors in case the cart is invalid */
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Shopping cart volumetric weight value */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart weight unit value */
  weightUnit?: Maybe<Scalars['String']>;
};


export type CartTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};


export type CartTypeIsValidArgs = {
  ruleSet?: InputMaybe<Scalars['String']>;
};


export type CartTypeValidationErrorsArgs = {
  ruleSet?: InputMaybe<Scalars['String']>;
};

export type CatalogDiscountType = {
  /** Discount amount */
  amount?: Maybe<Scalars['Decimal']>;
  /** Discount amount with tax */
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Discount amount in the specified currency */
  moneyAmount?: Maybe<MoneyType>;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax?: Maybe<MoneyType>;
  promotion?: Maybe<Promotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
};

export type Category = {
  /** Breadcrumbs */
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  /** SKU of category. */
  code: Scalars['String'];
  description?: Maybe<CategoryDescriptionType>;
  descriptions?: Maybe<Array<Maybe<CategoryDescriptionType>>>;
  /** Have a parent */
  hasParent?: Maybe<Scalars['Boolean']>;
  /** Id of category. */
  id: Scalars['String'];
  /** Images */
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** The category image. */
  imgSrc?: Maybe<Scalars['String']>;
  /** Level in hierarchy */
  level?: Maybe<Scalars['Int']>;
  /** Name of category. */
  name: Scalars['String'];
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
  /** Outlines */
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  parent?: Maybe<Category>;
  /** Category path in to the requested catalog  (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<Property>>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** Request related slug for category */
  slug?: Maybe<Scalars['String']>;
};


export type CategoryDescriptionArgs = {
  type?: InputMaybe<Scalars['String']>;
};


export type CategoryDescriptionsArgs = {
  type?: InputMaybe<Scalars['String']>;
};


export type CategoryPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

export type CategoryDescriptionType = {
  /** Description text. */
  content: Scalars['String'];
  /** Description type. */
  descriptionType: Scalars['String'];
  /** Description ID. */
  id: Scalars['String'];
  /** Description language code. */
  languageCode: Scalars['String'];
};

/** An edge in a connection from an object to another object of type `Category`. */
export type CategoryEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Category>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Contact`. */
export type ContactEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContactType>;
};

export type ContactType = {
  addresses?: Maybe<MemberAddressConnection>;
  birthDate?: Maybe<Scalars['Date']>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Contact's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  /** List of contact`s emails */
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  id: Scalars['String'];
  lastName: Scalars['String'];
  memberType: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizations?: Maybe<OrganizationConnection>;
  organizationsIds: Array<Maybe<Scalars['String']>>;
  outerId?: Maybe<Scalars['String']>;
  phones: Array<Maybe<Scalars['String']>>;
  securityAccounts?: Maybe<Array<Maybe<UserType>>>;
  /** Contact status */
  status?: Maybe<Scalars['String']>;
};


export type ContactTypeAddressesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type ContactTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};


export type ContactTypeOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  searchPhrase?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type CountryRegionType = {
  /** Code of country region. For example 'AL'. */
  id: Scalars['String'];
  /** Name of country region. For example 'Alabama'. */
  name: Scalars['String'];
};

export type CountryType = {
  /** Code of country. For example 'USA'. */
  id: Scalars['String'];
  /** Name of country. For example 'United States of America'. */
  name: Scalars['String'];
  regions?: Maybe<Array<Maybe<CountryRegionType>>>;
};

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars['String']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully?: Maybe<Scalars['Boolean']>;
};

export type CurrencyType = {
  /** Currency code may be used ISO 4217 */
  code: Scalars['String'];
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars['String']>;
  /** Exchange rate */
  exchangeRate?: Maybe<Scalars['Decimal']>;
  /** Symbol */
  symbol?: Maybe<Scalars['String']>;
};

export type CustomIdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorInfoType>>>;
  succeeded: Scalars['Boolean'];
};

/** A connection from an object to a list of objects of type `CustomerOrder`. */
export type CustomerOrderConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CustomerOrderEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CustomerOrderType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `CustomerOrder`. */
export type CustomerOrderEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<CustomerOrderType>;
};

export type CustomerOrderType = {
  addresses: Array<Maybe<OrderAddressType>>;
  cancelReason?: Maybe<Scalars['String']>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  channelId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  coupons?: Maybe<Array<Maybe<Scalars['String']>>>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  currency?: Maybe<CurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<OrderDiscountType>>>;
  /** Customer order dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  fee?: Maybe<MoneyType>;
  feeTotal: Scalars['Decimal'];
  feeTotalWithTax: Scalars['Decimal'];
  feeWithTax: Scalars['Decimal'];
  id: Scalars['String'];
  inPayments: Array<Maybe<PaymentInType>>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  isPrototype: Scalars['Boolean'];
  items: Array<Maybe<OrderLineItemType>>;
  languageCode?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  parentOperationId?: Maybe<Scalars['String']>;
  paymentDiscountTotal?: Maybe<MoneyType>;
  paymentDiscountTotalWithTax?: Maybe<MoneyType>;
  paymentSubTotal?: Maybe<MoneyType>;
  paymentSubTotalWithTax?: Maybe<MoneyType>;
  paymentTaxTotal?: Maybe<MoneyType>;
  paymentTotal?: Maybe<MoneyType>;
  paymentTotalWithTax?: Maybe<MoneyType>;
  purchaseOrderNumber?: Maybe<Scalars['String']>;
  shipments?: Maybe<Array<Maybe<OrderShipmentType>>>;
  shippingDiscountTotal?: Maybe<MoneyType>;
  shippingDiscountTotalWithTax?: Maybe<MoneyType>;
  shippingSubTotal?: Maybe<MoneyType>;
  shippingSubTotalWithTax?: Maybe<MoneyType>;
  shippingTaxTotal?: Maybe<MoneyType>;
  shippingTotal?: Maybe<MoneyType>;
  shippingTotalWithTax?: Maybe<MoneyType>;
  shoppingCartId?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  storeName?: Maybe<Scalars['String']>;
  subTotal?: Maybe<MoneyType>;
  subTotalDiscount?: Maybe<MoneyType>;
  subTotalDiscountWithTax?: Maybe<MoneyType>;
  subTotalTaxTotal?: Maybe<MoneyType>;
  subTotalWithTax?: Maybe<MoneyType>;
  subscriptionId?: Maybe<Scalars['String']>;
  subscriptionNumber?: Maybe<Scalars['String']>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
};


export type CustomerOrderTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type DescriptionType = {
  /** Description text. */
  content: Scalars['String'];
  /** Description ID. */
  id: Scalars['String'];
  /** Description language code. */
  languageCode: Scalars['String'];
  /** Description type. */
  reviewType: Scalars['String'];
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `DictionaryItem`. */
export type DictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<DictionaryItemType>;
};

export type DictionaryItemType = {
  /** Id */
  id: Scalars['String'];
  /** Localized dictionary item value */
  label?: Maybe<Scalars['String']>;
  /** Name */
  name: Scalars['String'];
};

export type DiscountType = {
  /** Discount amount */
  amount?: Maybe<Scalars['Decimal']>;
  /** Discount amount with tax */
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Discount amount in the specified currency */
  moneyAmount?: Maybe<MoneyType>;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax?: Maybe<MoneyType>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `DynamicProperty`. */
export type DynamicPropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<DynamicPropertyType>;
};

export type DynamicPropertyType = {
  dictionaryItems?: Maybe<DictionaryItemConnection>;
  /** The order for the dynamic property to display */
  displayOrder?: Maybe<Scalars['Int']>;
  /** Id */
  id: Scalars['String'];
  /** Is dynamic property value an array */
  isArray?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value a dictionary */
  isDictionary?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value multilingual */
  isMultilingual?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value required */
  isRequired?: Maybe<Scalars['Boolean']>;
  /** Localized property name */
  label?: Maybe<Scalars['String']>;
  /** Name */
  name: Scalars['String'];
  /** Object type */
  objectType: Scalars['String'];
  /** Value type */
  valueType?: Maybe<Scalars['String']>;
};


export type DynamicPropertyTypeDictionaryItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type DynamicPropertyValueType = {
  /** Associated dictionary item */
  dictionaryItem?: Maybe<DictionaryItemType>;
  /** Associated dynamic property */
  dynamicProperty?: Maybe<DynamicPropertyType>;
  /** Property name */
  name?: Maybe<Scalars['String']>;
  /** Property value */
  value?: Maybe<Scalars['DynamicPropertyValue']>;
  /** Value type */
  valueType?: Maybe<Scalars['String']>;
};

export type ErrorParameterType = {
  /** key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
};

export type Facet = {
  /** Three facet types: Terms, Range, and Filter */
  facetType?: Maybe<FacetTypes>;
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
};

export type FacetRangeType = {
  /** Amount of products for which the values in a field fall into the specified range */
  count?: Maybe<Scalars['Long']>;
  /** The range’s lower endpoint in number format, 0 represents infinity */
  from?: Maybe<Scalars['Long']>;
  /** The range’s lower endpoint in string format, empty string represents infinity */
  fromStr?: Maybe<Scalars['String']>;
  /** The flag indicates that From exclusive */
  includeFrom: Scalars['Boolean'];
  /** The flag indicates that To exclusive */
  includeTo: Scalars['Boolean'];
  /** is selected state */
  isSelected?: Maybe<Scalars['Boolean']>;
  /** Localization label */
  label?: Maybe<Scalars['String']>;
  /** Maximum value among all values contained within the range */
  max?: Maybe<Scalars['Long']>;
  /** Minimum value among all values contained within the range */
  min?: Maybe<Scalars['Long']>;
  /** The range’s upper endpoint in number format, 0 represents infinity */
  to?: Maybe<Scalars['Long']>;
  /** The range’s upper endpoint in string format, empty string represents infinity */
  toStr?: Maybe<Scalars['String']>;
  /** Sum of all values contained in the range */
  total?: Maybe<Scalars['Long']>;
};

export type FacetTermType = {
  /** count */
  count?: Maybe<Scalars['Long']>;
  /** is selected state */
  isSelected?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
  /** term */
  term?: Maybe<Scalars['String']>;
};

export enum FacetTypes {
  Filter = 'FILTER',
  Range = 'RANGE',
  Terms = 'TERMS'
}

export type FilterFacet = Facet & {
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
};

export type GiftItemType = {
  /** Product category ID */
  categoryId?: Maybe<Scalars['String']>;
  /** Artificial ID for this value object */
  id: Scalars['String'];
  /** Value of reward image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  /** Line item ID in case there is a gift in the cart. If there is no gift, it stays null */
  lineItemId?: Maybe<Scalars['String']>;
  /** Measurement unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** Name of the reward */
  name: Scalars['String'];
  product?: Maybe<Product>;
  /** Product ID */
  productId?: Maybe<Scalars['String']>;
  /** Promotion ID */
  promotionId: Scalars['String'];
  /** Number of gifts in the reward */
  quantity: Scalars['Int'];
};

export type IdentityErrorInfoType = {
  /** Error code */
  code: Scalars['String'];
  /** Error description */
  description?: Maybe<Scalars['String']>;
  /** Error parameter */
  errorParameter?: Maybe<Scalars['Int']>;
};

export type IdentityErrorType = {
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
};

export type IdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorType>>>;
  succeeded: Scalars['Boolean'];
};

export type ImageType = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']>;
  /** Image group */
  group?: Maybe<Scalars['String']>;
  /** Image ID */
  id?: Maybe<Scalars['String']>;
  /** Image name */
  name?: Maybe<Scalars['String']>;
  /** Image relative URL */
  relativeUrl?: Maybe<Scalars['String']>;
  /** Sort order */
  sortOrder?: Maybe<Scalars['Int']>;
  /** Image URL */
  url?: Maybe<Scalars['String']>;
};

export type InputAddBulkItemsType = {
  cartId?: InputMaybe<Scalars['String']>;
  /** Bulk cart items */
  cartItems: Array<InputMaybe<InputNewBulkItemType>>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddCouponType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Coupon code */
  couponCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddGiftItemsType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** IDs of gift rewards to add to the cart */
  ids: Array<InputMaybe<Scalars['String']>>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddItemType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Comment */
  comment?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Price */
  price?: InputMaybe<Scalars['Decimal']>;
  /** Product ID */
  productId: Scalars['String'];
  /** Quantity */
  quantity: Scalars['Int'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddItemsType = {
  cartId?: InputMaybe<Scalars['String']>;
  /** Cart items */
  cartItems: Array<InputMaybe<InputNewCartItemType>>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddOrUpdateCartAddressType = {
  /** Address */
  address: InputAddressType;
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddOrUpdateCartPaymentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Payment */
  payment: InputPaymentType;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddOrUpdateCartShipmentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Shipment */
  shipment: InputShipmentType;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddWishlistItemType = {
  /** List ID */
  listId: Scalars['String'];
  /** Product ID to add */
  productId: Scalars['String'];
};

export type InputAddressType = {
  addressType?: InputMaybe<Scalars['Int']>;
  /** City */
  city?: InputMaybe<Scalars['OptionalString']>;
  /** Country code */
  countryCode?: InputMaybe<Scalars['OptionalString']>;
  /** Country */
  countryName?: InputMaybe<Scalars['OptionalString']>;
  /** Email */
  email?: InputMaybe<Scalars['OptionalString']>;
  /** First name */
  firstName?: InputMaybe<Scalars['OptionalString']>;
  /** ID */
  id?: InputMaybe<Scalars['String']>;
  /** ID */
  key?: InputMaybe<Scalars['OptionalString']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['OptionalString']>;
  /** Line1 */
  line1?: InputMaybe<Scalars['OptionalString']>;
  /** Line2 */
  line2?: InputMaybe<Scalars['OptionalString']>;
  /** Middle name */
  middleName?: InputMaybe<Scalars['OptionalString']>;
  /** Name */
  name?: InputMaybe<Scalars['OptionalString']>;
  /** Company name */
  organization?: InputMaybe<Scalars['OptionalString']>;
  /** Outer ID */
  outerId?: InputMaybe<Scalars['OptionalString']>;
  /** Phone */
  phone?: InputMaybe<Scalars['OptionalString']>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars['OptionalString']>;
  /** Region ID */
  regionId?: InputMaybe<Scalars['OptionalString']>;
  /** Region */
  regionName?: InputMaybe<Scalars['OptionalString']>;
  /** Zip */
  zip?: InputMaybe<Scalars['OptionalString']>;
};

export type InputApplicationUserLoginType = {
  loginProvider: Scalars['String'];
  providerKey: Scalars['String'];
};

export type InputAssignPermissionScopeType = {
  scope: Scalars['String'];
  type: Scalars['String'];
};

export type InputAssignPermissionType = {
  assignedScopes?: InputMaybe<Array<InputMaybe<InputAssignPermissionScopeType>>>;
  name: Scalars['String'];
};

export type InputAssignRoleType = {
  concurrencyStamp?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  permissions: Array<InputMaybe<InputAssignPermissionType>>;
};

export type InputChangeCartItemCommentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Comment */
  comment: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Line item Id */
  lineItemId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeCartItemPriceType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Line item Id */
  lineItemId: Scalars['String'];
  /** Price */
  price: Scalars['Decimal'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeCartItemQuantityType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Line item Id */
  lineItemId: Scalars['String'];
  /** Quantity */
  quantity: Scalars['Int'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeCommentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Comment */
  comment?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeOrderStatusType = {
  /** Order ID */
  orderId: Scalars['String'];
  /** Order status */
  status: Scalars['String'];
};

export type InputChangePurchaseOrderNumber = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Purchase Order Number */
  purchaseOrderNumber?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputClearCartType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputClearPaymentsType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputClearShipmentsType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputCreateApplicationUserType = {
  /** Username of the creator */
  createdBy?: InputMaybe<Scalars['String']>;
  /** Date of user creation */
  createdDate?: InputMaybe<Scalars['DateTime']>;
  /** User Email */
  email: Scalars['String'];
  /** User ID */
  id?: InputMaybe<Scalars['String']>;
  /** Can user be locked out */
  lockoutEnabled?: InputMaybe<Scalars['Boolean']>;
  /** End date of lockout */
  lockoutEnd?: InputMaybe<Scalars['DateTime']>;
  /** External logins */
  logins?: InputMaybe<Array<InputMaybe<InputApplicationUserLoginType>>>;
  /** Id of the associated Member */
  memberId?: InputMaybe<Scalars['String']>;
  /** User password (nullable, for external logins) */
  password?: InputMaybe<Scalars['String']>;
  /** Password expiration date */
  passwordExpired?: InputMaybe<Scalars['Boolean']>;
  /** User phone number */
  phoneNumber?: InputMaybe<Scalars['String']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: InputMaybe<Scalars['Boolean']>;
  /** User photo URL */
  photoUrl?: InputMaybe<Scalars['String']>;
  /** List of user roles */
  roles?: InputMaybe<Array<InputMaybe<InputAssignRoleType>>>;
  /** Associated Store Id */
  storeId?: InputMaybe<Scalars['String']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: InputMaybe<Scalars['Boolean']>;
  /** User name */
  userName: Scalars['String'];
  /** User type (Manager, Customer) */
  userType: Scalars['String'];
};

export type InputCreateContactType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  defaultLanguage?: InputMaybe<Scalars['String']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  firstName: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id?: InputMaybe<Scalars['String']>;
  lastName: Scalars['String'];
  memberType?: InputMaybe<Scalars['String']>;
  middleName?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  organizations?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  photoUrl?: InputMaybe<Scalars['String']>;
  salutation?: InputMaybe<Scalars['String']>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type InputCreateOrderFromCartType = {
  /** Cart ID */
  cartId?: InputMaybe<Scalars['String']>;
};

export type InputCreateOrganizationType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id?: InputMaybe<Scalars['String']>;
  memberType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type InputCreateUserType = {
  /** Application user to create */
  applicationUser: InputCreateApplicationUserType;
};

export type InputCreateWishlistType = {
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars['String']>;
  /** List name */
  listName?: InputMaybe<Scalars['String']>;
  /** Store ID */
  storeId: Scalars['String'];
  /** Owner ID */
  userId: Scalars['String'];
};

export type InputDeleteContactType = {
  contactId: Scalars['String'];
};

export type InputDeleteMemberAddressType = {
  addresses: Array<InputMaybe<InputMemberAddressType>>;
  memberId: Scalars['String'];
};

export type InputDeleteUserType = {
  userNames: Array<InputMaybe<Scalars['String']>>;
};

export type InputDynamicPropertyValueType = {
  /** Culture name ("en-US") for multilingual property */
  cultureName?: InputMaybe<Scalars['String']>;
  /** Language ("en-US") for multilingual property */
  locale?: InputMaybe<Scalars['String']>;
  /** Dynamic property name */
  name: Scalars['String'];
  /** Dynamic property value. ID must be passed for dictionary item */
  value?: InputMaybe<Scalars['DynamicPropertyValue']>;
};

export type InputInviteUserType = {
  /** Emails which will receive invites */
  emails: Array<Scalars['String']>;
  /** Optional message to include into email with instructions which invites persons will see */
  message?: InputMaybe<Scalars['String']>;
  /** ID of organization where contact will be added for user */
  organizationId: Scalars['String'];
  /** ID of store which will send invites */
  storeId: Scalars['String'];
  /** Optional URL suffix: you may provide here relative URL to your page which handle registration by invite */
  urlSuffix?: InputMaybe<Scalars['String']>;
};

export type InputMemberAddressType = {
  addressType?: InputMaybe<Scalars['Int']>;
  /** City */
  city: Scalars['String'];
  /** Country code */
  countryCode: Scalars['String'];
  /** Country name */
  countryName: Scalars['String'];
  /** Email */
  email?: InputMaybe<Scalars['String']>;
  /** First name */
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  /** key */
  key?: InputMaybe<Scalars['String']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['String']>;
  /** Line1 */
  line1: Scalars['String'];
  /** Line2 */
  line2?: InputMaybe<Scalars['String']>;
  /** Middle name */
  middleName?: InputMaybe<Scalars['String']>;
  /** Name */
  name?: InputMaybe<Scalars['String']>;
  /** Company name */
  organization?: InputMaybe<Scalars['String']>;
  /** Outer id */
  outerId?: InputMaybe<Scalars['String']>;
  /** Phone */
  phone?: InputMaybe<Scalars['String']>;
  /** Postal code */
  postalCode: Scalars['String'];
  /** Region id */
  regionId?: InputMaybe<Scalars['String']>;
  /** Region name */
  regionName?: InputMaybe<Scalars['String']>;
  /** Zip */
  zip?: InputMaybe<Scalars['String']>;
};

export type InputMergeCartType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Second cart Id */
  secondCartId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputMoveWishlistItemType = {
  /** Destination List ID */
  destinationListId: Scalars['String'];
  /** Line item ID to move */
  lineItemId: Scalars['String'];
  /** Source List ID */
  listId: Scalars['String'];
};

export type InputNewBulkItemType = {
  /** Product SKU */
  productSku: Scalars['String'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']>;
};

export type InputNewCartItemType = {
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Product Id */
  productId: Scalars['String'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']>;
};

export type InputOrderBankCardInfoType = {
  bankCardCVV2: Scalars['String'];
  bankCardMonth: Scalars['Int'];
  bankCardNumber: Scalars['String'];
  bankCardType: Scalars['String'];
  bankCardYear: Scalars['Int'];
  cardholderName: Scalars['String'];
};

export type InputPaymentType = {
  amount?: InputMaybe<Scalars['OptionalDecimal']>;
  billingAddress?: InputMaybe<InputAddressType>;
  currency?: InputMaybe<Scalars['OptionalString']>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Payment ID */
  id?: InputMaybe<Scalars['OptionalString']>;
  /** Payment outer ID value */
  outerId?: InputMaybe<Scalars['OptionalString']>;
  /** Payment gateway code value */
  paymentGatewayCode?: InputMaybe<Scalars['OptionalString']>;
  price?: InputMaybe<Scalars['OptionalDecimal']>;
};

export type InputPersonalDataType = {
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  fullName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  middleName?: InputMaybe<Scalars['String']>;
};

export type InputProcessOrderPaymentType = {
  /** Credit card details */
  bankCardInfo?: InputMaybe<InputOrderBankCardInfoType>;
  /** Order ID */
  orderId: Scalars['String'];
  /** Payment ID */
  paymentId: Scalars['String'];
};

export type InputRegisterByInvitationType = {
  /** First name of person */
  firstName: Scalars['String'];
  /** Last name of person */
  lastName: Scalars['String'];
  /** Password */
  password: Scalars['String'];
  /** Phone */
  phone?: InputMaybe<Scalars['String']>;
  /** Invitation token */
  token: Scalars['String'];
  /** ID of use created for invited email */
  userId: Scalars['String'];
  /** Username */
  username: Scalars['String'];
};

export type InputRejectGiftItemsType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Ids of gift lineItems to reject from cart */
  ids: Array<InputMaybe<Scalars['String']>>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputRemoveCartAddressType = {
  /** Address Id */
  addressId: Scalars['String'];
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputRemoveCartType = {
  /** Cart Id */
  cartId: Scalars['String'];
};

export type InputRemoveCouponType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Coupon code */
  couponCode?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputRemoveItemType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Line item Id */
  lineItemId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputRemoveShipmentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Shipment Id */
  shipmentId?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputRemoveWishlistItemType = {
  /** Line item ID to remove */
  lineItemId: Scalars['String'];
  /** List ID */
  listId: Scalars['String'];
};

export type InputRemoveWishlistType = {
  /** List ID */
  listId: Scalars['String'];
};

export type InputRenameWishlistType = {
  /** List ID */
  listId: Scalars['String'];
  /** New List name */
  listName?: InputMaybe<Scalars['String']>;
};

export type InputResetPasswordByTokenType = {
  /** New password according with system security policy */
  newPassword: Scalars['String'];
  /** User password reset token */
  token: Scalars['String'];
  /** User identifier */
  userId: Scalars['String'];
};

export type InputSendVerifyEmailType = {
  email?: InputMaybe<Scalars['String']>;
};

export type InputShipmentType = {
  /** Currency value */
  currency?: InputMaybe<Scalars['OptionalString']>;
  /** Delivery address */
  deliveryAddress?: InputMaybe<InputAddressType>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Fulfillment center iD */
  fulfillmentCenterId?: InputMaybe<Scalars['OptionalString']>;
  /** Height value */
  height?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Shipment ID */
  id?: InputMaybe<Scalars['OptionalString']>;
  /** Length value */
  length?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Measurement unit value */
  measureUnit?: InputMaybe<Scalars['OptionalString']>;
  /** Price value */
  price?: InputMaybe<Scalars['OptionalDecimal']>;
  /** Shipping method code */
  shipmentMethodCode?: InputMaybe<Scalars['OptionalString']>;
  /** Shipping method option */
  shipmentMethodOption?: InputMaybe<Scalars['OptionalString']>;
  /** Volumetric weight value */
  volumetricWeight?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Weight value */
  weight?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Weight unit value */
  weightUnit?: InputMaybe<Scalars['OptionalString']>;
  /** Width value */
  width?: InputMaybe<Scalars['OptionalNullableDecimal']>;
};

export type InputUpdateApplicationUserType = {
  /** Failed login attempts for the current user */
  accessFailedCount?: InputMaybe<Scalars['Int']>;
  /** User Email */
  email: Scalars['String'];
  /** User ID */
  id: Scalars['String'];
  /** Can user be locked out */
  lockoutEnabled?: InputMaybe<Scalars['Boolean']>;
  /** End date of lockout */
  lockoutEnd?: InputMaybe<Scalars['DateTime']>;
  /** Id of the associated Memeber */
  memberId?: InputMaybe<Scalars['String']>;
  /** Password Hash */
  passwordHash?: InputMaybe<Scalars['String']>;
  /** User phone number */
  phoneNumber?: InputMaybe<Scalars['String']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: InputMaybe<Scalars['Boolean']>;
  /** User photo URL */
  photoUrl?: InputMaybe<Scalars['String']>;
  /** List of user roles */
  roles?: InputMaybe<Array<InputMaybe<InputAssignRoleType>>>;
  /** SecurityStamp */
  securityStamp: Scalars['String'];
  /** Associated Store Id */
  storeId?: InputMaybe<Scalars['String']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: InputMaybe<Scalars['Boolean']>;
  /** User name */
  userName: Scalars['String'];
  /** User type (Manager, Customer) */
  userType: Scalars['String'];
};

export type InputUpdateCartDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputUpdateCartItemDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Line item Id */
  lineItemId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputUpdateCartPaymentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Payment Id */
  paymentId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputUpdateCartShipmentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Shipment Id */
  shipmentId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputUpdateContactType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  defaultLanguage?: InputMaybe<Scalars['String']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  firstName: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id: Scalars['String'];
  lastName: Scalars['String'];
  memberType?: InputMaybe<Scalars['String']>;
  middleName?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  organizations?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  photoUrl?: InputMaybe<Scalars['String']>;
  salutation?: InputMaybe<Scalars['String']>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type InputUpdateMemberAddressType = {
  addresses: Array<InputMaybe<InputMemberAddressType>>;
  memberId: Scalars['String'];
};

export type InputUpdateMemberDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  memberId: Scalars['String'];
};

export type InputUpdateOrderDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']>;
};

export type InputUpdateOrderItemDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  lineItemId?: InputMaybe<Scalars['String']>;
  orderId?: InputMaybe<Scalars['String']>;
};

export type InputUpdateOrderPaymentDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']>;
  paymentId?: InputMaybe<Scalars['String']>;
};

export type InputUpdateOrderShipmentDynamicPropertiesType = {
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  orderId?: InputMaybe<Scalars['String']>;
  shipmentId?: InputMaybe<Scalars['String']>;
};

export type InputUpdateOrganizationType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  emails?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  groups?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id: Scalars['String'];
  memberType?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phones?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type InputUpdatePersonalDataType = {
  personalData: InputPersonalDataType;
};

export type InputUpdateRoleInnerType = {
  /** Concurrency Stamp */
  concurrencyStamp?: InputMaybe<Scalars['String']>;
  /** Role description */
  description?: InputMaybe<Scalars['String']>;
  /** Role ID */
  id: Scalars['String'];
  /** Role name */
  name: Scalars['String'];
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

export type InputValidateCouponType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  /** Coupon */
  coupon: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InventoryInfo = {
  /** Allow backorder */
  allowBackorder?: Maybe<Scalars['Boolean']>;
  /** Allow preorder */
  allowPreorder?: Maybe<Scalars['Boolean']>;
  /** Backorder availability date */
  backorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  fulfillmentCenterId: Scalars['String'];
  fulfillmentCenterName: Scalars['String'];
  /** Inventory in stock quantity */
  inStockQuantity?: Maybe<Scalars['Long']>;
  /** Preorder availability date */
  preorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  /** Inventory reserved quantity */
  reservedQuantity?: Maybe<Scalars['Long']>;
};

export type LineItemType = {
  /** Catalog ID value */
  catalogId?: Maybe<Scalars['String']>;
  /** Category ID value */
  categoryId?: Maybe<Scalars['String']>;
  /** Line item create date */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  /** Total discount */
  discountTotal?: Maybe<MoneyType>;
  /** Total discount with tax */
  discountTotalWithTax?: Maybe<MoneyType>;
  /** Discounts */
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Extended price */
  extendedPrice?: Maybe<MoneyType>;
  /** Extended price with tax */
  extendedPriceWithTax?: Maybe<MoneyType>;
  /** Line item fulfillment center ID value */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Line item fulfillment center name value */
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  /** Height value */
  height?: Maybe<Scalars['Decimal']>;
  /** Line item ID */
  id: Scalars['String'];
  /** Value of line item image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  /** In stock quantity */
  inStockQuantity?: Maybe<Scalars['Int']>;
  /** flag of line item is a gift */
  isGift?: Maybe<Scalars['Boolean']>;
  /** Shows whether this is read-only */
  isReadOnly?: Maybe<Scalars['Boolean']>;
  /** Shows whether the line item is recurring */
  isReccuring?: Maybe<Scalars['Boolean']>;
  /** Shows whether this is valid */
  isValid?: Maybe<Scalars['Boolean']>;
  /** Culture name in the ISO 3166-1 alpha-3 format */
  languageCode?: Maybe<Scalars['String']>;
  /** Length value */
  length?: Maybe<Scalars['Decimal']>;
  /** List price */
  listPrice?: Maybe<MoneyType>;
  /** List price with tax */
  listPriceWithTax?: Maybe<MoneyType>;
  /** Measurement unit value */
  measureUnit?: Maybe<Scalars['String']>;
  /** Line item name value */
  name?: Maybe<Scalars['String']>;
  /** Line item comment value */
  note?: Maybe<Scalars['String']>;
  /** Line item quantity value */
  objectType?: Maybe<Scalars['String']>;
  /** Placed price */
  placedPrice?: Maybe<MoneyType>;
  /** Placed price with tax */
  placedPriceWithTax?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  /** Product ID value */
  productId?: Maybe<Scalars['String']>;
  /** Product type: Physical, Digital, or Subscription */
  productType?: Maybe<Scalars['String']>;
  /** Line item quantity value */
  quantity?: Maybe<Scalars['Int']>;
  /** Requirement for line item shipping */
  requiredShipping?: Maybe<Scalars['Boolean']>;
  /** Sale price */
  salePrice?: Maybe<MoneyType>;
  /** Sale price with tax */
  salePriceWithTax?: Maybe<MoneyType>;
  /** Line item shipping method code value */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Product SKU value */
  sku?: Maybe<Scalars['String']>;
  /** Tax details */
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Total shipping tax amount value */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax total */
  taxTotal?: Maybe<MoneyType>;
  /** Shipping tax type value */
  taxType?: Maybe<Scalars['String']>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars['String']>;
  /** Validation errors */
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Volumetric weight value */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Warehouse location */
  warehouseLocation?: Maybe<Scalars['String']>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars['Decimal']>;
  /** Weight unit value */
  weightUnit?: Maybe<Scalars['String']>;
  /** Width value */
  width?: Maybe<Scalars['Decimal']>;
};


export type LineItemTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `MemberAddress`. */
export type MemberAddressEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<MemberAddressType>;
};

export type MemberAddressType = {
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city?: Maybe<Scalars['String']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']>;
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Is default address or not */
  isDefault: Scalars['Boolean'];
  /** Id */
  key?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Postal code */
  postalCode: Scalars['String'];
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
};

export type MemberType = {
  addresses?: Maybe<Array<Maybe<MemberAddressType>>>;
  /** Contact's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  id: Scalars['String'];
  memberType: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  phones: Array<Maybe<Scalars['String']>>;
};


export type MemberTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type MenuLinkListType = {
  items?: Maybe<Array<Maybe<MenuLinkType>>>;
  /** Menu name */
  name?: Maybe<Scalars['String']>;
  /** Menu outer ID */
  outerId?: Maybe<Scalars['String']>;
};

export type MenuLinkType = {
  /** Menu item object ID */
  associatedObjectId?: Maybe<Scalars['String']>;
  /** Menu item object name */
  associatedObjectName?: Maybe<Scalars['String']>;
  /** Menu item type name */
  associatedObjectType?: Maybe<Scalars['String']>;
  /** Menu item outerID */
  outerId?: Maybe<Scalars['String']>;
  /** Menu item priority */
  priority?: Maybe<Scalars['Int']>;
  /** Menu item title */
  title?: Maybe<Scalars['String']>;
  /** Menu item url */
  url?: Maybe<Scalars['String']>;
};

export type MoneyType = {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars['Decimal'];
  /** Currency type */
  currency?: Maybe<CurrencyType>;
  /** Number of decimal digits for the associated currency. */
  decimalDigits: Scalars['Int'];
  /** Formatted amount. */
  formattedAmount: Scalars['String'];
  /** Formatted amount without currency. */
  formattedAmountWithoutCurrency: Scalars['String'];
  /** Formatted amount without point. */
  formattedAmountWithoutPoint: Scalars['String'];
  /** Formatted amount without point and currency. */
  formattedAmountWithoutPointAndCurrency: Scalars['String'];
};

export type Mutations = {
  addBulkItemsCart?: Maybe<BulkCartType>;
  addCartAddress?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  addGiftItems?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  addWishlistItem?: Maybe<WishlistType>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']>;
  changePurchaseOrderNumber?: Maybe<CartType>;
  clearCart?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  clearShipments?: Maybe<CartType>;
  createContact?: Maybe<ContactType>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  createOrganization?: Maybe<Organization>;
  createUser?: Maybe<IdentityResultType>;
  createWishlist?: Maybe<WishlistType>;
  deleteContact?: Maybe<Scalars['Boolean']>;
  deleteMemberAddresses?: Maybe<MemberType>;
  deleteUsers?: Maybe<IdentityResultType>;
  inviteUser?: Maybe<CustomIdentityResultType>;
  mergeCart?: Maybe<CartType>;
  moveWishlistItem?: Maybe<WishlistType>;
  processOrderPayment?: Maybe<ProcessPaymentRequestResultType>;
  registerByInvitation?: Maybe<CustomIdentityResultType>;
  registerPointsOperation?: Maybe<Scalars['Boolean']>;
  rejectGiftItems?: Maybe<CartType>;
  removeCart?: Maybe<Scalars['Boolean']>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeShipment?: Maybe<CartType>;
  removeWishlist?: Maybe<Scalars['Boolean']>;
  removeWishlistItem?: Maybe<WishlistType>;
  renameWishlist?: Maybe<WishlistType>;
  resetPasswordByToken?: Maybe<CustomIdentityResultType>;
  sendVerifyEmail?: Maybe<Scalars['Boolean']>;
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
  updateRole?: Maybe<IdentityResultType>;
  updateUser?: Maybe<IdentityResultType>;
  validateCoupon?: Maybe<Scalars['Boolean']>;
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


export type MutationsAddWishlistItemArgs = {
  command: InputAddWishlistItemType;
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


export type MutationsChangeCommentArgs = {
  command?: InputMaybe<InputChangeCommentType>;
};


export type MutationsChangeOrderStatusArgs = {
  command: InputChangeOrderStatusType;
};


export type MutationsChangePurchaseOrderNumberArgs = {
  command?: InputMaybe<InputChangePurchaseOrderNumber>;
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


export type MutationsCreateContactArgs = {
  command: InputCreateContactType;
};


export type MutationsCreateOrderFromCartArgs = {
  command: InputCreateOrderFromCartType;
};


export type MutationsCreateOrganizationArgs = {
  command: InputCreateOrganizationType;
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


export type MutationsDeleteMemberAddressesArgs = {
  command: InputDeleteMemberAddressType;
};


export type MutationsDeleteUsersArgs = {
  command: InputDeleteUserType;
};


export type MutationsInviteUserArgs = {
  command: InputInviteUserType;
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


export type MutationsRegisterByInvitationArgs = {
  command: InputRegisterByInvitationType;
};


export type MutationsRegisterPointsOperationArgs = {
  command: RegisterPointsOperationType;
};


export type MutationsRejectGiftItemsArgs = {
  command: InputRejectGiftItemsType;
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


export type MutationsRemoveCouponArgs = {
  command: InputRemoveCouponType;
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


export type MutationsRenameWishlistArgs = {
  command: InputRenameWishlistType;
};


export type MutationsResetPasswordByTokenArgs = {
  command?: InputMaybe<InputResetPasswordByTokenType>;
};


export type MutationsSendVerifyEmailArgs = {
  command?: InputMaybe<InputSendVerifyEmailType>;
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


export type MutationsUpdateRoleArgs = {
  command: InputUpdateRoleType;
};


export type MutationsUpdateUserArgs = {
  command: InputUpdateUserType;
};


export type MutationsValidateCouponArgs = {
  command: InputValidateCouponType;
};

export type OrderAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city?: Maybe<Scalars['String']>;
  /** Country code */
  countryCode?: Maybe<Scalars['String']>;
  /** Country name */
  countryName?: Maybe<Scalars['String']>;
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Postal code */
  postalCode: Scalars['String'];
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
};

export type OrderDiscountType = {
  /** Order discount amount */
  amount?: Maybe<MoneyType>;
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
};

export type OrderLineItemType = {
  cancelReason?: Maybe<Scalars['String']>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  catalogId: Scalars['String'];
  categoryId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  discounts: Array<Maybe<OrderDiscountType>>;
  /** Customer order Line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  extendedPrice?: Maybe<MoneyType>;
  extendedPriceWithTax?: Maybe<MoneyType>;
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  fulfillmentLocationCode?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  id: Scalars['String'];
  imageUrl?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  isGift?: Maybe<Scalars['Boolean']>;
  length?: Maybe<Scalars['Decimal']>;
  measureUnit?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  objectType: Scalars['String'];
  outerId?: Maybe<Scalars['String']>;
  placedPrice?: Maybe<MoneyType>;
  placedPriceWithTax?: Maybe<MoneyType>;
  price?: Maybe<MoneyType>;
  priceId?: Maybe<Scalars['String']>;
  priceWithTax?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  productId: Scalars['String'];
  productType?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
  reserveQuantity: Scalars['Int'];
  shippingMethodCode?: Maybe<Scalars['String']>;
  sku: Scalars['String'];
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
};


export type OrderLineItemTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type OrderPaymentMethodType = {
  code: Scalars['String'];
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  isActive: Scalars['Boolean'];
  isAvailableForPartial: Scalars['Boolean'];
  logoUrl: Scalars['String'];
  paymentMethodGroupType?: Maybe<Scalars['Int']>;
  paymentMethodType?: Maybe<Scalars['Int']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  priority: Scalars['Int'];
  storeId: Scalars['String'];
  taxDetails?: Maybe<Array<Maybe<OrderTaxDetailType>>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  typeName: Scalars['String'];
};

export type OrderShipmentItemType = {
  barCode?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  lineItem?: Maybe<OrderLineItemType>;
  lineItemId: Scalars['String'];
  outerId?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
};

export type OrderShipmentPackageType = {
  barCode?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  id: Scalars['String'];
  items: Array<Maybe<OrderShipmentItemType>>;
  length?: Maybe<Scalars['Decimal']>;
  measureUnit: Scalars['String'];
  packageType?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit: Scalars['String'];
  width?: Maybe<Scalars['Decimal']>;
};

export type OrderShipmentType = {
  cancelReason?: Maybe<Scalars['String']>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  customerOrderId?: Maybe<Scalars['String']>;
  deliveryAddress?: Maybe<OrderAddressType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts: Array<Maybe<OrderDiscountType>>;
  /** Customer order Shipment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  id: Scalars['String'];
  inPayments: Array<Maybe<PaymentInType>>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  items: Array<Maybe<OrderShipmentItemType>>;
  length?: Maybe<Scalars['Decimal']>;
  measureUnit?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  packages: Array<Maybe<OrderShipmentPackageType>>;
  parentOperationId?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  shipmentMethodCode?: Maybe<Scalars['String']>;
  shipmentMethodOption?: Maybe<Scalars['String']>;
  shippingMethod?: Maybe<OrderShippingMethodType>;
  status?: Maybe<Scalars['String']>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
};


export type OrderShipmentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type OrderShippingMethodType = {
  code: Scalars['String'];
  id: Scalars['String'];
  isActive: Scalars['Boolean'];
  logoUrl: Scalars['String'];
  priority: Scalars['Int'];
  storeId: Scalars['String'];
  taxType?: Maybe<Scalars['String']>;
  typeName: Scalars['String'];
};

export type OrderTaxDetailType = {
  amount?: Maybe<MoneyType>;
  name: Scalars['String'];
  rate?: Maybe<MoneyType>;
};

/** Organization info */
export type Organization = {
  addresses?: Maybe<MemberAddressConnection>;
  /** Business category */
  businessCategory?: Maybe<Scalars['String']>;
  contacts?: Maybe<ContactConnection>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  /** Default shipping address */
  defaultShippingAddress?: Maybe<MemberAddressType>;
  /** Description */
  description?: Maybe<Scalars['String']>;
  /** Organization's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['String'];
  /** Member type */
  memberType: Scalars['String'];
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Owner id */
  ownerId?: Maybe<Scalars['String']>;
  /** Parent id */
  parentId?: Maybe<Scalars['String']>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** SEO object type */
  seoObjectType: Scalars['String'];
  /** Organization status */
  status?: Maybe<Scalars['String']>;
};


/** Organization info */
export type OrganizationAddressesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};


/** Organization info */
export type OrganizationContactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  searchPhrase?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


/** Organization info */
export type OrganizationDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Organization`. */
export type OrganizationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Organization>;
};

export type OutlineItemType = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  /** SEO info */
  seoInfos?: Maybe<Array<Maybe<SeoInfo>>>;
  seoObjectType?: Maybe<Scalars['String']>;
};

export type OutlineType = {
  /** Outline items */
  items?: Maybe<Array<Maybe<OutlineItemType>>>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `PaymentIn`. */
export type PaymentInEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<PaymentInType>;
};

export type PaymentInType = {
  authorizedDate?: Maybe<Scalars['DateTime']>;
  billingAddress?: Maybe<OrderAddressType>;
  cancelReason?: Maybe<Scalars['String']>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  capturedDate?: Maybe<Scalars['DateTime']>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  currency?: Maybe<CurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  /** Customer order Payment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  gatewayCode?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  incomingDate?: Maybe<Scalars['DateTime']>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  /** Associated Order */
  order: CustomerOrderType;
  orderId?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  parentOperationId?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<OrderPaymentMethodType>;
  price?: Maybe<MoneyType>;
  purpose?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  sum?: Maybe<MoneyType>;
  tax?: Maybe<MoneyType>;
  transactions?: Maybe<Array<Maybe<PaymentTransactionType>>>;
  voidedDate?: Maybe<Scalars['DateTime']>;
};


export type PaymentInTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type PaymentMethodType = {
  /** Value of payment gateway code */
  code?: Maybe<Scalars['String']>;
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  /** Is payment method available for partial payments */
  isAvailableForPartial?: Maybe<Scalars['Boolean']>;
  /** Value of payment method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /**
   * Value of payment method name
   * @deprecated Left for backward compatibility. Should be removed in future. Use Code.
   */
  name?: Maybe<Scalars['String']>;
  /** Value of payment group type */
  paymentMethodGroupType?: Maybe<Scalars['String']>;
  /** Value of payment method type */
  paymentMethodType?: Maybe<Scalars['String']>;
  /** Price */
  price?: Maybe<MoneyType>;
  /** Price with tax */
  priceWithTax?: Maybe<MoneyType>;
  /** Value of payment method priority */
  priority?: Maybe<Scalars['Int']>;
  /** Tax details */
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax total */
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Total */
  total?: Maybe<MoneyType>;
  /** Total with tax */
  totalWithTax?: Maybe<MoneyType>;
};

export type PaymentTransactionType = {
  amount?: Maybe<MoneyType>;
  gatewayIpAddress: Scalars['String'];
  id: Scalars['String'];
  isProcessed: Scalars['Boolean'];
  note: Scalars['String'];
  processAttemptCount: Scalars['Int'];
  processError?: Maybe<Scalars['String']>;
  processedDate?: Maybe<Scalars['DateTime']>;
  requestData: Scalars['String'];
  responseCode: Scalars['String'];
  responseData: Scalars['String'];
  status: Scalars['String'];
  type: Scalars['String'];
};

export type PaymentType = {
  /** Amount */
  amount?: Maybe<MoneyType>;
  /** Billing address */
  billingAddress?: Maybe<CartAddressType>;
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  /** Discounts */
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart payment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Payment Id */
  id?: Maybe<Scalars['String']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['String']>;
  /** Price */
  price?: Maybe<MoneyType>;
  /** Price with tax */
  priceWithTax?: Maybe<MoneyType>;
  /** Tax details */
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax total */
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Total */
  total?: Maybe<MoneyType>;
  /** Total with tax */
  totalWithTax?: Maybe<MoneyType>;
};


export type PaymentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type PointsOperationType = {
  amount: Scalars['Int'];
  balance: Scalars['Int'];
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  id: Scalars['String'];
  isDeposit: Scalars['Boolean'];
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  reason: Scalars['String'];
  storeId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
};

export type PriceType = {
  /** Actual price */
  actual?: Maybe<MoneyType>;
  /** Actual price with tax */
  actualWithTax?: Maybe<MoneyType>;
  /** Currency */
  currency?: Maybe<Scalars['String']>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  discountPercent?: Maybe<Scalars['Decimal']>;
  /** Discounts */
  discounts?: Maybe<Array<Maybe<CatalogDiscountType>>>;
  /** End date */
  endDate?: Maybe<Scalars['DateTime']>;
  /** Price list */
  list?: Maybe<MoneyType>;
  /** Price list with tax */
  listWithTax?: Maybe<MoneyType>;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']>;
  /** Sale price */
  sale?: Maybe<MoneyType>;
  /** Sale price with tax */
  saleWithTax?: Maybe<MoneyType>;
  /** Start date */
  startDate?: Maybe<Scalars['DateTime']>;
  /** Tier prices */
  tierPrices?: Maybe<Array<Maybe<TierPriceType>>>;
  /**
   * Valid from
   * @deprecated startDate
   */
  validFrom?: Maybe<Scalars['DateTime']>;
  /**
   * Valid until
   * @deprecated endDate
   */
  validUntil?: Maybe<Scalars['DateTime']>;
};

export type ProcessPaymentRequestResultType = {
  errorMessage?: Maybe<Scalars['String']>;
  htmlForm?: Maybe<Scalars['String']>;
  isSuccess: Scalars['Boolean'];
  /** New payment status */
  newPaymentStatus?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  redirectUrl?: Maybe<Scalars['String']>;
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  /** Assets */
  assets?: Maybe<Array<Maybe<Asset>>>;
  associations?: Maybe<ProductAssociationConnection>;
  /** Product availability data */
  availabilityData?: Maybe<AvailabilityData>;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']>;
  /** Breadcrumbs */
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  /** The unique ID of the catalog */
  catalogId?: Maybe<Scalars['String']>;
  category?: Maybe<Category>;
  /** The product SKU. */
  code: Scalars['String'];
  description?: Maybe<DescriptionType>;
  descriptions?: Maybe<Array<Maybe<DescriptionType>>>;
  hasVariations?: Maybe<Scalars['Boolean']>;
  /** The unique ID of the product. */
  id: Scalars['String'];
  /** Product images */
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['String']>;
  masterVariation?: Maybe<VariationType>;
  /** Max. quantity */
  maxQuantity?: Maybe<Scalars['Int']>;
  /** Min. quantity */
  minQuantity?: Maybe<Scalars['Int']>;
  /** The name of the product. */
  name: Scalars['String'];
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
  /** Outlines */
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  /** Product price */
  price?: Maybe<PriceType>;
  /** Product prices */
  prices?: Maybe<Array<Maybe<PriceType>>>;
  /** The type of product */
  productType?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<Property>>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']>;
  variations?: Maybe<Array<Maybe<VariationType>>>;
  videos?: Maybe<VideoConnection>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductAssociationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  group?: InputMaybe<Scalars['String']>;
  query?: InputMaybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionArgs = {
  type?: InputMaybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionsArgs = {
  type?: InputMaybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductVideosArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** product association. */
export type ProductAssociation = {
  associatedObjectId?: Maybe<Scalars['String']>;
  associatedObjectType?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars['Int']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  type?: Maybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `ProductAssociation`. */
export type ProductAssociationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ProductAssociation>;
};

/** A connection from an object to a list of objects of type `Product`. */
export type ProductConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductEdge>>>;
  /** Filter facets */
  filter_facets?: Maybe<Array<Maybe<FilterFacet>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Product>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Range facets */
  range_facets?: Maybe<Array<Maybe<RangeFacet>>>;
  /** Term facets */
  term_facets?: Maybe<Array<Maybe<TermFacet>>>;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Product`. */
export type ProductEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Product>;
};

/** Represents promotion object */
export type Promotion = {
  /** Promotion description */
  description?: Maybe<Scalars['String']>;
  /** The unique ID of the promotion. */
  id: Scalars['String'];
  /** The name of the promotion */
  name: Scalars['String'];
  /** Promotion type */
  type?: Maybe<Scalars['String']>;
};

/** Products attributes. */
export type Property = {
  /** Is property hidden. */
  hidden: Scalars['Boolean'];
  /** The unique ID of the product. */
  id?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  /** Is property has multiple values. */
  multivalue: Scalars['Boolean'];
  /** The name of the property. */
  name: Scalars['String'];
  propertyDictItems?: Maybe<PropertyDictionaryItemConnection>;
  type?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['PropertyValue']>;
  valueId?: Maybe<Scalars['String']>;
  /** ValueType of the property. */
  valueType?: Maybe<Scalars['String']>;
};


/** Products attributes. */
export type PropertyPropertyDictItemsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** Represents property dictionary item */
export type PropertyDictionaryItem = {
  /** The unique ID of the property dictionary item. */
  id: Scalars['String'];
  /** Value order. */
  sortOrder: Scalars['Int'];
  /** Value alias. */
  value?: Maybe<Scalars['String']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<PropertyDictionaryItem>;
};

/** An edge in a connection from an object to another object of type `Property`. */
export type PropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
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

export type Query = {
  balance?: Maybe<UserBalanceType>;
  cart?: Maybe<CartType>;
  carts?: Maybe<CartConnection>;
  categories?: Maybe<CategoryConnection>;
  category?: Maybe<Category>;
  checkEmailUniqueness?: Maybe<Scalars['Boolean']>;
  checkUsernameUniqueness?: Maybe<Scalars['Boolean']>;
  contact?: Maybe<ContactType>;
  contacts?: Maybe<ContactConnection>;
  countries?: Maybe<Array<Maybe<CountryType>>>;
  dynamicProperties?: Maybe<DynamicPropertyConnection>;
  dynamicProperty?: Maybe<DynamicPropertyType>;
  me?: Maybe<UserType>;
  menus?: Maybe<Array<Maybe<MenuLinkListType>>>;
  order?: Maybe<CustomerOrderType>;
  orders?: Maybe<CustomerOrderConnection>;
  organization?: Maybe<Organization>;
  organizations?: Maybe<OrganizationConnection>;
  payments?: Maybe<PaymentInConnection>;
  product?: Maybe<Product>;
  products?: Maybe<ProductConnection>;
  properties?: Maybe<PropertyConnection>;
  property?: Maybe<Property>;
  regions?: Maybe<Array<Maybe<CountryRegionType>>>;
  requestPasswordReset?: Maybe<Scalars['Boolean']>;
  role?: Maybe<RoleType>;
  searchPointsOperations?: Maybe<SearchPointsOperationsResultType>;
  user?: Maybe<UserType>;
  validatePassword?: Maybe<CustomIdentityResultType>;
  wishlist?: Maybe<WishlistType>;
  wishlists?: Maybe<WishlistConnection>;
};


export type QueryBalanceArgs = {
  includeOperations?: InputMaybe<Scalars['Boolean']>;
  storeId?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryCartArgs = {
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode: Scalars['String'];
  storeId: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryCartsArgs = {
  after?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
  storeId?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  categoryIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  facet?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  fuzzy?: InputMaybe<Scalars['Boolean']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  storeId?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryCategoryArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryCheckEmailUniquenessArgs = {
  email: Scalars['String'];
};


export type QueryCheckUsernameUniquenessArgs = {
  username: Scalars['String'];
};


export type QueryContactArgs = {
  id: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryContactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  searchPhrase?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryDynamicPropertiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  objectType?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryDynamicPropertyArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  idOrName: Scalars['String'];
  objectType?: InputMaybe<Scalars['String']>;
};


export type QueryMenusArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  keyword?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
};


export type QueryOrderArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  number?: InputMaybe<Scalars['String']>;
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  searchPhrase?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryPaymentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryProductArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  facet?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  fuzzy?: InputMaybe<Scalars['Boolean']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  query?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryPropertiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  storeId: Scalars['String'];
  types?: InputMaybe<Array<InputMaybe<PropertyType>>>;
};


export type QueryPropertyArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
};


export type QueryRegionsArgs = {
  countryId: Scalars['String'];
};


export type QueryRequestPasswordResetArgs = {
  loginOrEmail: Scalars['String'];
  urlSuffix?: InputMaybe<Scalars['String']>;
};


export type QueryRoleArgs = {
  roleName: Scalars['String'];
};


export type QuerySearchPointsOperationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  storeId?: InputMaybe<Scalars['String']>;
  take?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['String']>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  loginProvider?: InputMaybe<Scalars['String']>;
  providerKey?: InputMaybe<Scalars['String']>;
  userName?: InputMaybe<Scalars['String']>;
};


export type QueryValidatePasswordArgs = {
  password: Scalars['String'];
};


export type QueryWishlistArgs = {
  listId: Scalars['String'];
};


export type QueryWishlistsArgs = {
  after?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
  storeId?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
};

export type RangeFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Ranges */
  ranges?: Maybe<Array<Maybe<FacetRangeType>>>;
};

export type RegisterPointsOperationType = {
  /** Amount */
  amount: Scalars['Int'];
  /** Reason */
  reason: Scalars['String'];
  /** Store Id */
  storeId?: InputMaybe<Scalars['String']>;
  /** User Id */
  userId: Scalars['String'];
};

export type RoleType = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  normalizedName: Scalars['String'];
  /** Permissions in Role */
  permissions: Array<Maybe<Scalars['String']>>;
};

export type SearchPointsOperationsResultType = {
  results: Array<Maybe<PointsOperationType>>;
  totalCount: Scalars['Int'];
};

export type SeoInfo = {
  id?: Maybe<Scalars['String']>;
  imageAltDescription?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  languageCode?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaKeywords?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  objectId?: Maybe<Scalars['String']>;
  objectType?: Maybe<Scalars['String']>;
  pageTitle?: Maybe<Scalars['String']>;
  semanticUrl?: Maybe<Scalars['String']>;
  storeId?: Maybe<Scalars['String']>;
};

export type ShipmentType = {
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Delivery address */
  deliveryAddress?: Maybe<CartAddressType>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  /** Discounts */
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart shipment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Shipment Id */
  id?: Maybe<Scalars['String']>;
  /** Items */
  items?: Maybe<Array<Maybe<CartShipmentItemType>>>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  /** Price */
  price?: Maybe<MoneyType>;
  /** Price with tax */
  priceWithTax?: Maybe<MoneyType>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  /** Tax details */
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax total */
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Total */
  total?: Maybe<MoneyType>;
  /** Total with tax */
  totalWithTax?: Maybe<MoneyType>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Value of weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
};


export type ShipmentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type ShippingMethodType = {
  /** Value of shipping gateway code */
  code?: Maybe<Scalars['String']>;
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Discount amount with tax */
  discountAmountWithTax?: Maybe<MoneyType>;
  id?: Maybe<Scalars['String']>;
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars['String']>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars['String']>;
  /** Price */
  price?: Maybe<MoneyType>;
  /** Price with tax */
  priceWithTax?: Maybe<MoneyType>;
  /** Value of shipping method priority */
  priority?: Maybe<Scalars['Int']>;
  /** Total */
  total?: Maybe<MoneyType>;
  /** Total with tax */
  totalWithTax?: Maybe<MoneyType>;
};

export type TaxDetailType = {
  /** Amount */
  amount?: Maybe<MoneyType>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Price */
  price?: Maybe<MoneyType>;
  /** Rate */
  rate?: Maybe<MoneyType>;
};

export type TermFacet = Facet & {
  /** Three facet types: Terms, Range, and Filter */
  facetType?: Maybe<FacetTypes>;
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Terms */
  terms?: Maybe<Array<Maybe<FacetTermType>>>;
};

export type TierPriceType = {
  /** Price */
  price?: Maybe<MoneyType>;
  /** Price with tax */
  priceWithTax?: Maybe<MoneyType>;
  /** Quantity */
  quantity?: Maybe<Scalars['Long']>;
};

export type UserBalanceType = {
  amount: Scalars['Int'];
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  id: Scalars['String'];
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  pointsOperations: Array<Maybe<PointsOperationType>>;
  storeId?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
};

export type UserType = {
  accessFailedCount: Scalars['Int'];
  /** The associated contact info */
  contact?: Maybe<ContactType>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate?: Maybe<Scalars['DateTime']>;
  email?: Maybe<Scalars['String']>;
  emailConfirmed: Scalars['Boolean'];
  id: Scalars['String'];
  isAdministrator: Scalars['Boolean'];
  /** Account locked state */
  lockedState?: Maybe<Scalars['Boolean']>;
  lockoutEnabled: Scalars['Boolean'];
  lockoutEnd?: Maybe<Scalars['DateTime']>;
  memberId?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  normalizedEmail?: Maybe<Scalars['String']>;
  normalizedUserName?: Maybe<Scalars['String']>;
  passwordExpired: Scalars['Boolean'];
  /** Account permissions */
  permissions?: Maybe<Array<Maybe<Scalars['String']>>>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed: Scalars['Boolean'];
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  securityStamp: Scalars['String'];
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled: Scalars['Boolean'];
  userName: Scalars['String'];
  userType?: Maybe<Scalars['String']>;
};

export type ValidationErrorType = {
  /** Error code */
  errorCode?: Maybe<Scalars['String']>;
  /** Error msg */
  errorMessage?: Maybe<Scalars['String']>;
  errorParameters?: Maybe<Array<Maybe<ErrorParameterType>>>;
  /** Object id */
  objectId?: Maybe<Scalars['String']>;
  /** Object type */
  objectType?: Maybe<Scalars['String']>;
};

export type VariationType = {
  /** Assets */
  assets?: Maybe<Array<Maybe<Asset>>>;
  /** Availability data */
  availabilityData?: Maybe<AvailabilityData>;
  /** SKU of variation. */
  code?: Maybe<Scalars['String']>;
  /** Id of variation. */
  id?: Maybe<Scalars['String']>;
  /** Product images */
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** Max. quantity. */
  maxQuantity?: Maybe<Scalars['Int']>;
  /** Min. quantity. */
  minQuantity?: Maybe<Scalars['Int']>;
  /** Name of variation. */
  name?: Maybe<Scalars['String']>;
  /** Outlines */
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  /** Product price */
  price?: Maybe<PriceType>;
  /** Product prices */
  prices?: Maybe<Array<Maybe<PriceType>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Video`. */
export type VideoEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<VideoType>;
};

export type VideoType = {
  /** Video URL */
  contentUrl?: Maybe<Scalars['String']>;
  /** Culture name */
  cultureName?: Maybe<Scalars['String']>;
  /** Video description */
  description?: Maybe<Scalars['String']>;
  /** Video duration */
  duration?: Maybe<Scalars['String']>;
  /** Embeded video URL */
  embedUrl?: Maybe<Scalars['String']>;
  /** Video name */
  name: Scalars['String'];
  /** ID of the object video is attached to */
  ownerId?: Maybe<Scalars['String']>;
  /** Type of the object video is attached to (Product, Category) */
  ownerType?: Maybe<Scalars['String']>;
  /** Sort order */
  sortOrder: Scalars['Int'];
  /** Video thumbnial URL */
  thumbnailUrl?: Maybe<Scalars['String']>;
  /** Video upload date */
  uploadDate?: Maybe<Scalars['DateTime']>;
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
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge in a connection from an object to another object of type `Wishlist`. */
export type WishlistEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<WishlistType>;
};

export type WishlistType = {
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Shopping cart user ID */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  /** Shopping cart ID */
  id?: Maybe<Scalars['String']>;
  /** Items */
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Item count */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart store ID */
  storeId?: Maybe<Scalars['String']>;
};

export type DeleteMemberAddressesMutationVariables = Exact<{
  command: InputDeleteMemberAddressType;
}>;


export type DeleteMemberAddressesMutation = { deleteMemberAddresses?: { id: string } };

export type UpdateMemberAddressesMutationVariables = Exact<{
  command: InputUpdateMemberAddressType;
}>;


export type UpdateMemberAddressesMutation = { updateMemberAddresses?: { id: string } };

export type UpdatePersonalDataMutationVariables = Exact<{
  command: InputUpdatePersonalDataType;
}>;


export type UpdatePersonalDataMutation = { updatePersonalData?: { succeeded: boolean, errors?: Array<{ code?: string, description: string }> } };

export type GetDefaultShippingAddressQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDefaultShippingAddressQuery = { me?: { contact?: { defaultShippingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, phone?: string, email?: string, addressType?: number } } } };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { me?: { id: string, memberId?: string, userName: string, email?: string, emailConfirmed: boolean, photoUrl?: string, phoneNumber?: string, permissions?: Array<string>, contact?: { firstName: string, lastName: string, fullName: string } } };

export type GetMyAddressesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
}>;


export type GetMyAddressesQuery = { me?: { contact?: { addresses?: { items?: Array<{ id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, phone?: string, email?: string, addressType?: number }> } } } };

export type GetMyOrderQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
  number?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetMyOrderQuery = { order?: { id: string, number: string, comment?: string, createdDate: any, status?: string, discounts?: Array<{ coupon?: string, description?: string, promotionId?: string, amount?: { amount: any, formattedAmount: string, currency?: { code: string } } }>, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, subTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, discountTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, shippingTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string }, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, quantity: number, sku: string, product?: { brandName?: string, slug?: string, masterVariation?: { id?: string } }, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, placedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, shipments?: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl: string, typeName: string }, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number } }>, inPayments: Array<{ gatewayCode?: string, number: string, paymentMethod?: { logoUrl: string, typeName: string }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number } }> } };

export type GetMyOrdersQueryVariables = Exact<{
  filter?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type GetMyOrdersQuery = { orders?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, status?: string, number: string, customerId: string, purchaseOrderNumber?: string, currency?: { code: string }, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, inPayments: Array<{ number: string }> }> } };

export type AddBulkItemsToCartMutationVariables = Exact<{
  command: InputAddBulkItemsType;
}>;


export type AddBulkItemsToCartMutation = { addBulkItemsCart?: { errors?: Array<{ errorCode?: string, errorMessage?: string, objectId?: string }> } };

export type AddCouponMutationVariables = Exact<{
  command: InputAddCouponType;
}>;


export type AddCouponMutation = { addCoupon?: { name: string } };

export type AddGiftItemsMutationVariables = Exact<{
  command: InputAddGiftItemsType;
}>;


export type AddGiftItemsMutation = { addGiftItems?: { name: string } };

export type AddItemMutationVariables = Exact<{
  command: InputAddItemType;
}>;


export type AddItemMutation = { addItem?: { name: string, itemsQuantity?: number } };

export type AddItemsCartMutationVariables = Exact<{
  command: InputAddItemsType;
}>;


export type AddItemsCartMutation = { addItemsCart?: { name: string } };

export type AddOrUpdateCartPaymentMutationVariables = Exact<{
  command: InputAddOrUpdateCartPaymentType;
}>;


export type AddOrUpdateCartPaymentMutation = { addOrUpdateCartPayment?: { id?: string } };

export type AddOrUpdateCartShipmentMutationVariables = Exact<{
  command: InputAddOrUpdateCartShipmentType;
}>;


export type AddOrUpdateCartShipmentMutation = { addOrUpdateCartShipment?: { id?: string } };

export type ChangeCommentMutationVariables = Exact<{
  command: InputChangeCommentType;
}>;


export type ChangeCommentMutation = { changeComment?: { name: string, itemsQuantity?: number } };

export type ChangeCartItemQuantityMutationVariables = Exact<{
  command: InputChangeCartItemQuantityType;
}>;


export type ChangeCartItemQuantityMutation = { changeCartItemQuantity?: { name: string, itemsQuantity?: number } };

export type ChangePurchaseOrderNumberMutationVariables = Exact<{
  command?: InputMaybe<InputChangePurchaseOrderNumber>;
}>;


export type ChangePurchaseOrderNumberMutation = { changePurchaseOrderNumber?: { id?: string, name: string, purchaseOrderNumber?: string } };

export type CreateOrderFromCartMutationVariables = Exact<{
  command: InputCreateOrderFromCartType;
}>;


export type CreateOrderFromCartMutation = { createOrderFromCart?: { id: string, number: string, comment?: string, discounts?: Array<{ coupon?: string, description?: string, promotionId?: string, amount?: { amount: any, formattedAmount: string, currency?: { code: string } } }>, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, subTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, discountTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, shippingTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string }, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, quantity: number, sku: string, product?: { brandName?: string, slug?: string, masterVariation?: { id?: string } }, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, placedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, shipments?: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl: string, typeName: string }, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number } }>, inPayments: Array<{ gatewayCode?: string, paymentMethod?: { logoUrl: string, typeName: string }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number } }> } };

export type RejectGiftItemsMutationVariables = Exact<{
  command: InputRejectGiftItemsType;
}>;


export type RejectGiftItemsMutation = { rejectGiftItems?: { name: string } };

export type RemoveCartMutationVariables = Exact<{
  command: InputRemoveCartType;
}>;


export type RemoveCartMutation = { removeCart?: boolean };

export type RemoveCartItemMutationVariables = Exact<{
  command: InputRemoveItemType;
}>;


export type RemoveCartItemMutation = { removeCartItem?: { name: string } };

export type RemoveCouponMutationVariables = Exact<{
  command: InputRemoveCouponType;
}>;


export type RemoveCouponMutation = { removeCoupon?: { name: string } };

export type ValidateCouponMutationVariables = Exact<{
  command: InputValidateCouponType;
}>;


export type ValidateCouponMutation = { validateCoupon?: boolean };

export type GetAvailPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetAvailPaymentMethodsQuery = { cart?: { availablePaymentMethods?: Array<{ code?: string, logoUrl?: string, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }> } };

export type GetAvailShippingMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetAvailShippingMethodsQuery = { cart?: { availableShippingMethods?: Array<{ id?: string, code?: string, logoUrl?: string, optionName?: string, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }> } };

export type GetMyCartQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetMyCartQuery = { cart?: { id?: string, name: string, comment?: string, purchaseOrderNumber?: string, itemsCount?: number, itemsQuantity?: number, coupons?: Array<{ code?: string }>, shipments?: Array<{ id?: string, shipmentMethodCode?: string, shipmentMethodOption?: string, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number }, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, discounts?: Array<{ promotionId?: string, description?: string, amount?: any, coupon?: string }>, payments?: Array<{ id?: string, paymentGatewayCode?: string, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number } }>, addresses?: Array<{ id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number }>, items?: Array<{ id: string, imageUrl?: string, inStockQuantity?: number, isGift?: boolean, isReadOnly?: boolean, isReccuring?: boolean, isValid?: boolean, name?: string, productId?: string, quantity?: number, sku?: string, thumbnailImageUrl?: string, product?: { brandName?: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id?: string }, variations?: Array<{ id?: string, minQuantity?: number, maxQuantity?: number }> }, validationErrors?: Array<{ errorCode?: string, errorMessage?: string, errorParameters?: Array<{ key: string, value: string }> }>, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, listPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string }, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, discountTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, subTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, shippingTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, shippingPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, extendedPriceTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, extendedPriceTotalWithTax?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, validationErrors?: Array<{ errorCode?: string, errorMessage?: string, objectId?: string, errorParameters?: Array<{ key: string, value: string }> }>, availablePaymentMethods?: Array<{ code?: string, logoUrl?: string, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, availableShippingMethods?: Array<{ id?: string, code?: string, logoUrl?: string, optionName?: string, optionDescription?: string, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } }>, gifts?: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string }>, availableGifts?: Array<{ id: string, imageUrl?: string, name: string, lineItemId?: string }> } };

export type GetProductQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type GetProductQuery = { product?: { name: string, id: string, code: string, slug?: string, outline?: string, minQuantity?: number, maxQuantity?: number, imgSrc?: string, images?: Array<{ url?: string }>, breadcrumbs?: Array<{ itemId: string, typeName?: string, title: string, seoPath?: string }>, description?: { content: string, id: string }, descriptions?: Array<{ content: string, id: string }>, properties?: Array<{ name: string, value?: any, type?: string }>, variations?: Array<{ id?: string, name?: string, minQuantity?: number, maxQuantity?: number, code?: string, images?: Array<{ url?: string }>, properties?: Array<{ name: string, value?: any, type?: string }>, availabilityData?: { isActive?: boolean, isAvailable?: boolean, isBuyable?: boolean, isInStock?: boolean, availableQuantity: any }, price?: { actual?: { amount: any, formattedAmount: string }, discountAmount?: { amount: any, formattedAmount: string }, sale?: { amount: any, formattedAmount: string }, list?: { amount: any, formattedAmount: string } } }>, availabilityData?: { isActive?: boolean, isAvailable?: boolean, isBuyable?: boolean, isInStock?: boolean, availableQuantity: any }, price?: { actual?: { amount: any, formattedAmount: string }, discountAmount?: { amount: any, formattedAmount: string }, sale?: { amount: any, formattedAmount: string }, list?: { amount: any, formattedAmount: string } } } };

export type GetSearchResultsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  query?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  productsAfter?: InputMaybe<Scalars['String']>;
  productsFirst?: InputMaybe<Scalars['Int']>;
  productsSort?: InputMaybe<Scalars['String']>;
  productsFuzzy?: InputMaybe<Scalars['Boolean']>;
  productsFuzzyLevel?: InputMaybe<Scalars['Int']>;
  categoriesAfter?: InputMaybe<Scalars['String']>;
  categoriesFirst?: InputMaybe<Scalars['Int']>;
  categoriesSort?: InputMaybe<Scalars['String']>;
  categoriesFuzzy?: InputMaybe<Scalars['Boolean']>;
  categoriesFuzzyLevel?: InputMaybe<Scalars['Int']>;
}>;


export type GetSearchResultsQuery = { products?: { totalCount?: number, items?: Array<{ id: string, name: string, code: string, slug?: string, imgSrc?: string, price?: { actual?: { amount: any, formattedAmount: string } } }> }, categories?: { totalCount?: number, items?: Array<{ id: string, name: string, seoInfo?: { semanticUrl?: string } }> } };

export type CategoriesQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type CategoriesQuery = { categories?: { totalCount?: number, items?: Array<{ id: string, name: string, code: string, slug?: string, path?: string, outline?: string, parent?: { id: string }, seoInfo?: { semanticUrl?: string } }> } };

export type SearchProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
  query?: InputMaybe<Scalars['String']>;
  fuzzy?: InputMaybe<Scalars['Boolean']>;
  fuzzyLevel?: InputMaybe<Scalars['Int']>;
  withFacets: Scalars['Boolean'];
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']>> | InputMaybe<Scalars['String']>>;
}>;


export type SearchProductsQuery = { products?: { totalCount?: number, items?: Array<{ name: string, id: string, code: string, minQuantity?: number, maxQuantity?: number, hasVariations?: boolean, slug?: string, outline?: string, imgSrc?: string, images?: Array<{ url?: string }>, description?: { content: string, id: string }, availabilityData?: { isActive?: boolean, isAvailable?: boolean, isBuyable?: boolean, isInStock?: boolean, availableQuantity: any }, price?: { actual?: { amount: any, formattedAmount: string }, discountAmount?: { amount: any, formattedAmount: string }, sale?: { amount: any, formattedAmount: string }, list?: { amount: any, formattedAmount: string } } }>, term_facets?: Array<{ name: string, label: string, terms?: Array<{ label: string, term?: string, count?: any, isSelected?: boolean }> }>, range_facets?: Array<{ name: string, label: string, ranges?: Array<{ label?: string, count?: any, from?: any, to?: any, includeFrom: boolean, includeTo: boolean, isSelected?: boolean }> }> } };

export type SearchRelatedProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  group?: InputMaybe<Scalars['String']>;
  query?: InputMaybe<Scalars['String']>;
}>;


export type SearchRelatedProductsQuery = { product?: { associations?: { items?: Array<{ product?: { name: string, id: string, slug?: string, imgSrc?: string, price?: { actual?: { formattedAmount: string } } } }> } } };

export type GetCountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCountriesQuery = { countries?: Array<{ id: string, name: string, regions?: Array<{ id: string, name: string }> }> };

export type GetMenusQueryVariables = Exact<{
  storeId: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  keyword?: InputMaybe<Scalars['String']>;
}>;


export type GetMenusQuery = { menus?: Array<{ name?: string, items?: Array<{ title?: string, url?: string, priority?: number }> }> };

export type CartAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number };

export type CurrencyFieldsFragment = { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string };

export type LineItemFieldsFragment = { id: string, imageUrl?: string, inStockQuantity?: number, isGift?: boolean, isReadOnly?: boolean, isReccuring?: boolean, isValid?: boolean, name?: string, productId?: string, quantity?: number, sku?: string, thumbnailImageUrl?: string, product?: { brandName?: string, slug?: string, minQuantity?: number, maxQuantity?: number, masterVariation?: { id?: string }, variations?: Array<{ id?: string, minQuantity?: number, maxQuantity?: number }> }, validationErrors?: Array<{ errorCode?: string, errorMessage?: string, errorParameters?: Array<{ key: string, value: string }> }>, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, listPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } };

export type MemberAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, isDefault: boolean, phone?: string, email?: string, addressType?: number };

export type MoneyFieldsFragment = { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } };

export type OrderAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, zip?: string, phone?: string, email?: string, addressType?: number };

export type OrderLineItemFieldsFragment = { id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, quantity: number, sku: string, product?: { brandName?: string, slug?: string, masterVariation?: { id?: string } }, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, placedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } }, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string, exchangeRate?: any, symbol?: string } } };

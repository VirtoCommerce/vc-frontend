export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  Long: any;
  OptionalDecimal: any;
  OptionalNullableDecimal: any;
  OptionalString: any;
};

export type Asset = {
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
  inventories?: Maybe<Array<Maybe<InventoryInfo>>>;
  isActive?: Maybe<Scalars['Boolean']>;
  isAvailable?: Maybe<Scalars['Boolean']>;
  isBuyable?: Maybe<Scalars['Boolean']>;
  isInStock?: Maybe<Scalars['Boolean']>;
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

export type CartAddressType = {
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
  addresses?: Maybe<Array<Maybe<CartAddressType>>>;
  /** Available Gifts */
  availableGifts?: Maybe<Array<Maybe<GiftItemType>>>;
  availablePaymentMethods?: Maybe<Array<Maybe<PaymentMethodType>>>;
  availableShippingMethods?: Maybe<Array<Maybe<ShippingMethodType>>>;
  /** Shopping cart channel id */
  channelId?: Maybe<Scalars['String']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']>;
  coupons?: Maybe<Array<Maybe<CouponType>>>;
  currency?: Maybe<CurrencyType>;
  /** Shopping cart user id */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  extendedPriceTotal?: Maybe<MoneyType>;
  extendedPriceTotalWithTax?: Maybe<MoneyType>;
  fee?: Maybe<MoneyType>;
  /** Gifts */
  gifts?: Maybe<Array<Maybe<GiftItemType>>>;
  handlingTotal?: Maybe<MoneyType>;
  handlingTotalWithTax?: Maybe<MoneyType>;
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Shopping cart Id */
  id?: Maybe<Scalars['String']>;
  /** Sign that shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /**
   * The flag indicates the valid cart
   * @deprecated Deprecated, because of useless (no need to know validation state without details). Use validationErrors field.
   */
  isValid?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Count of different items */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Quantity of items */
  itemsQuantity?: Maybe<Scalars['Int']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart organization id */
  organizationId?: Maybe<Scalars['String']>;
  paymentPrice?: Maybe<MoneyType>;
  paymentPriceWithTax?: Maybe<MoneyType>;
  paymentTotal?: Maybe<MoneyType>;
  paymentTotalWithTax?: Maybe<MoneyType>;
  payments?: Maybe<Array<Maybe<PaymentType>>>;
  shipments?: Maybe<Array<Maybe<ShipmentType>>>;
  shippingPrice?: Maybe<MoneyType>;
  shippingPriceWithTax?: Maybe<MoneyType>;
  shippingTotal?: Maybe<MoneyType>;
  shippingTotalWithTax?: Maybe<MoneyType>;
  /** Shopping cart status */
  status?: Maybe<Scalars['String']>;
  /** Shopping cart store id */
  storeId?: Maybe<Scalars['String']>;
  subTotal?: Maybe<MoneyType>;
  subTotalWithTax?: Maybe<MoneyType>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<MoneyType>;
  /** Shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']>;
  /** A set of errors in case of invalid cart */
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Shopping cart value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of weight unit */
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
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  moneyAmount?: Maybe<MoneyType>;
  moneyAmountWithTax?: Maybe<MoneyType>;
  promotion?: Maybe<Promotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
};

export type Category = {
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  /** SKU of category. */
  code: Scalars['String'];
  hasParent?: Maybe<Scalars['Boolean']>;
  /** Id of category. */
  id: Scalars['String'];
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** The category image. */
  imgSrc?: Maybe<Scalars['String']>;
  /** Level in hierarchy */
  level?: Maybe<Scalars['Int']>;
  /** Name of category. */
  name: Scalars['String'];
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
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
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  moneyAmount?: Maybe<MoneyType>;
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
  /** Localized Property Name */
  label?: Maybe<Scalars['String']>;
  /** Name */
  name: Scalars['String'];
  /** Object Type */
  objectType: Scalars['String'];
  /** Value Type */
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
  /** Property Name */
  name?: Maybe<Scalars['String']>;
  /** Property Value */
  value?: Maybe<Scalars['String']>;
  /** Value Type */
  valueType?: Maybe<Scalars['String']>;
};

export type ErrorParameterType = {
  /** key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
};

export type Facet = {
  /** The three types of facets. Terms, Range, Filter */
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
  /** Product Category Id */
  categoryId?: Maybe<Scalars['String']>;
  /** Artificial ID for this value object */
  id: Scalars['String'];
  /** Value of reward image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  /** ID of lineItem if gift is in cart. Otherwise null */
  lineItemId?: Maybe<Scalars['String']>;
  /** Measure Unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** Name of the reward */
  name: Scalars['String'];
  product?: Maybe<Product>;
  /** Product id */
  productId?: Maybe<Scalars['String']>;
  /** Promotion Id */
  promotionId: Scalars['String'];
  /** Quantity of gifts in the reward */
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
  cultureName?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  relativeUrl?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
};

export type InputAddCouponType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
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
  /** Ids of gift rewards to add to cart */
  ids: Array<InputMaybe<Scalars['String']>>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddItemType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  comment?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  price?: InputMaybe<Scalars['Decimal']>;
  productId: Scalars['String'];
  quantity: Scalars['Int'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddItemsType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartItems: Array<InputMaybe<InputNewCartItemType>>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddOrUpdateCartAddressType = {
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
  shipment: InputShipmentType;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputAddressType = {
  addressType?: InputMaybe<Scalars['Int']>;
  /** City */
  city?: InputMaybe<Scalars['OptionalString']>;
  /** Country code */
  countryCode?: InputMaybe<Scalars['OptionalString']>;
  /** Country name */
  countryName?: InputMaybe<Scalars['OptionalString']>;
  /** Email */
  email?: InputMaybe<Scalars['OptionalString']>;
  /** First name */
  firstName?: InputMaybe<Scalars['OptionalString']>;
  /** Id */
  id?: InputMaybe<Scalars['String']>;
  /** Id */
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
  /** Outer id */
  outerId?: InputMaybe<Scalars['OptionalString']>;
  /** Phone */
  phone?: InputMaybe<Scalars['OptionalString']>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars['OptionalString']>;
  /** Region id */
  regionId?: InputMaybe<Scalars['OptionalString']>;
  /** Region name */
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
  comment: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
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
  lineItemId: Scalars['String'];
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
  lineItemId: Scalars['String'];
  quantity: Scalars['Int'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeCommentType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
  comment?: InputMaybe<Scalars['String']>;
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InputChangeOrderStatusType = {
  orderId: Scalars['String'];
  status: Scalars['String'];
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

export type InputDeleteContactType = {
  contactId: Scalars['String'];
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
  value?: InputMaybe<Scalars['String']>;
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
  secondCartId: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
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
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** the payment id */
  id?: InputMaybe<Scalars['OptionalString']>;
  /** Value of payment outer id */
  outerId?: InputMaybe<Scalars['OptionalString']>;
  /** Value of payment gateway code */
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
  bankCardInfo?: InputMaybe<InputOrderBankCardInfoType>;
  orderId: Scalars['String'];
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
  cartId: Scalars['String'];
};

export type InputRemoveCouponType = {
  cartId?: InputMaybe<Scalars['String']>;
  cartName?: InputMaybe<Scalars['String']>;
  cartType?: InputMaybe<Scalars['String']>;
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
  shipmentId?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
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
  currency?: InputMaybe<Scalars['OptionalString']>;
  deliveryAddress?: InputMaybe<InputAddressType>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Fulfillment center id */
  fulfillmentCenterId?: InputMaybe<Scalars['OptionalString']>;
  /** Value of height */
  height?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Shipment Id */
  id?: InputMaybe<Scalars['OptionalString']>;
  /** Value of length */
  length?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Value of measurement units */
  measureUnit?: InputMaybe<Scalars['OptionalString']>;
  price?: InputMaybe<Scalars['OptionalDecimal']>;
  /** Shipment method code */
  shipmentMethodCode?: InputMaybe<Scalars['OptionalString']>;
  /** Shipment method option */
  shipmentMethodOption?: InputMaybe<Scalars['OptionalString']>;
  /** Value of volumetric weight */
  volumetricWeight?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Value of weight */
  weight?: InputMaybe<Scalars['OptionalNullableDecimal']>;
  /** Value of weight unit */
  weightUnit?: InputMaybe<Scalars['OptionalString']>;
  /** Value of width */
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
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
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
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
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
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
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
  coupon: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  currencyCode?: InputMaybe<Scalars['String']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
};

export type InventoryInfo = {
  allowBackorder?: Maybe<Scalars['Boolean']>;
  allowPreorder?: Maybe<Scalars['Boolean']>;
  backorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  fulfillmentCenterId: Scalars['String'];
  fulfillmentCenterName: Scalars['String'];
  inStockQuantity?: Maybe<Scalars['Long']>;
  preorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  reservedQuantity?: Maybe<Scalars['Long']>;
};

export type LineItemType = {
  /** Value of catalog id */
  catalogId?: Maybe<Scalars['String']>;
  /** Value of category id */
  categoryId?: Maybe<Scalars['String']>;
  /** Line item created date */
  createdDate?: Maybe<Scalars['DateTime']>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  extendedPrice?: Maybe<MoneyType>;
  extendedPriceWithTax?: Maybe<MoneyType>;
  /** Value of line item Fulfillment center ID */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of line item Fulfillment center name */
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Line item id */
  id: Scalars['String'];
  /** Value of line item image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  inStockQuantity?: Maybe<Scalars['Int']>;
  /** flag of line item is a gift */
  isGift?: Maybe<Scalars['Boolean']>;
  /** Is readOnly */
  isReadOnly?: Maybe<Scalars['Boolean']>;
  /** flag of line item is recurring */
  isReccuring?: Maybe<Scalars['Boolean']>;
  isValid?: Maybe<Scalars['Boolean']>;
  /** Culture name in ISO 3166-1 alpha-3 format */
  languageCode?: Maybe<Scalars['String']>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  listPrice?: Maybe<MoneyType>;
  listPriceWithTax?: Maybe<MoneyType>;
  /** Value of measurement unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** Value of line item name */
  name?: Maybe<Scalars['String']>;
  /** Value of line item comment */
  note?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  objectType?: Maybe<Scalars['String']>;
  placedPrice?: Maybe<MoneyType>;
  placedPriceWithTax?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  /** Value of product id */
  productId?: Maybe<Scalars['String']>;
  /** type of product (can be Physical, Digital or Subscription) */
  productType?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  quantity?: Maybe<Scalars['Int']>;
  /** requirement for line item shipping */
  requiredShipping?: Maybe<Scalars['Boolean']>;
  salePrice?: Maybe<MoneyType>;
  salePriceWithTax?: Maybe<MoneyType>;
  /** Value of line item shipping method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Value of product SKU */
  sku?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Value of total shipping tax amount */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<MoneyType>;
  /** Value of shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars['String']>;
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  warehouseLocation?: Maybe<Scalars['String']>;
  /** Value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
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

export type MoneyType = {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars['Decimal'];
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
  addCartAddress?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  addGiftItems?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']>;
  clearCart?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  clearShipments?: Maybe<CartType>;
  createContact?: Maybe<ContactType>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  createOrganization?: Maybe<Organization>;
  createUser?: Maybe<IdentityResultType>;
  deleteContact?: Maybe<Scalars['Boolean']>;
  deleteUsers?: Maybe<IdentityResultType>;
  inviteUser?: Maybe<CustomIdentityResultType>;
  mergeCart?: Maybe<CartType>;
  processOrderPayment?: Maybe<ProcessPaymentRequestResultType>;
  registerByInvitation?: Maybe<CustomIdentityResultType>;
  rejectGiftItems?: Maybe<CartType>;
  removeCart?: Maybe<Scalars['Boolean']>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeShipment?: Maybe<CartType>;
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


export type MutationsDeleteContactArgs = {
  command: InputDeleteContactType;
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


export type MutationsProcessOrderPaymentArgs = {
  command: InputProcessOrderPaymentType;
};


export type MutationsRegisterByInvitationArgs = {
  command: InputRegisterByInvitationType;
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
  seoInfos?: Maybe<Array<Maybe<SeoInfo>>>;
  seoObjectType?: Maybe<Scalars['String']>;
};

export type OutlineType = {
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
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
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
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  /** Value of payment method priority */
  priority?: Maybe<Scalars['Int']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
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
  amount?: Maybe<MoneyType>;
  billingAddress?: Maybe<CartAddressType>;
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart payment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Payment Id */
  id?: Maybe<Scalars['String']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
};


export type PaymentTypeDynamicPropertiesArgs = {
  cultureName?: InputMaybe<Scalars['String']>;
};

export type PriceType = {
  actual?: Maybe<MoneyType>;
  actualWithTax?: Maybe<MoneyType>;
  currency?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountPercent?: Maybe<Scalars['Decimal']>;
  discounts?: Maybe<Array<Maybe<CatalogDiscountType>>>;
  endDate?: Maybe<Scalars['DateTime']>;
  list?: Maybe<MoneyType>;
  listWithTax?: Maybe<MoneyType>;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']>;
  sale?: Maybe<MoneyType>;
  saleWithTax?: Maybe<MoneyType>;
  startDate?: Maybe<Scalars['DateTime']>;
  tierPrices?: Maybe<Array<Maybe<TierPriceType>>>;
  /** @deprecated startDate */
  validFrom?: Maybe<Scalars['DateTime']>;
  /** @deprecated endDate */
  validUntil?: Maybe<Scalars['DateTime']>;
};

export type ProcessPaymentRequestResultType = {
  errorMessage?: Maybe<Scalars['String']>;
  htmlForm?: Maybe<Scalars['String']>;
  isSuccess: Scalars['Boolean'];
  newPaymentStatus?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  redirectUrl?: Maybe<Scalars['String']>;
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  assets?: Maybe<Array<Maybe<Asset>>>;
  associations?: Maybe<ProductAssociationConnection>;
  availabilityData?: Maybe<AvailabilityData>;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']>;
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  catalogId?: Maybe<Scalars['String']>;
  category?: Maybe<Category>;
  /** The product SKU. */
  code: Scalars['String'];
  description?: Maybe<DescriptionType>;
  descriptions?: Maybe<Array<Maybe<DescriptionType>>>;
  /** The unique ID of the product. */
  id: Scalars['String'];
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['String']>;
  /** The name of the product. */
  name: Scalars['String'];
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  price?: Maybe<PriceType>;
  prices?: Maybe<Array<Maybe<PriceType>>>;
  /** The type of product */
  productType?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<Property>>>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']>;
  variations?: Maybe<Array<Maybe<VariationType>>>;
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
  filter_facets?: Maybe<Array<Maybe<FilterFacet>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Product>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  range_facets?: Maybe<Array<Maybe<RangeFacet>>>;
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
  value?: Maybe<Scalars['String']>;
  valueId?: Maybe<Scalars['String']>;
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
  user?: Maybe<UserType>;
  validatePassword?: Maybe<CustomIdentityResultType>;
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
  userId: Scalars['String'];
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

export type RoleType = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  normalizedName: Scalars['String'];
  /** Permissions in Role */
  permissions: Array<Maybe<Scalars['String']>>;
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
  currency?: Maybe<CurrencyType>;
  deliveryAddress?: Maybe<CartAddressType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart shipment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Shipment Id */
  id?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<CartShipmentItemType>>>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
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
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  id?: Maybe<Scalars['String']>;
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars['String']>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  /** Value of shipping method priority */
  priority?: Maybe<Scalars['Int']>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
};

export type TaxDetailType = {
  amount?: Maybe<MoneyType>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  rate?: Maybe<MoneyType>;
};

export type TermFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Terms */
  terms?: Maybe<Array<Maybe<FacetTermType>>>;
};

export type TierPriceType = {
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  quantity?: Maybe<Scalars['Long']>;
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
  assets?: Maybe<Array<Maybe<Asset>>>;
  availabilityData?: Maybe<AvailabilityData>;
  /** SKU of variation. */
  code?: Maybe<Scalars['String']>;
  /** Id of variation. */
  id?: Maybe<Scalars['String']>;
  images?: Maybe<Array<Maybe<ImageType>>>;
  /** Name of variation. */
  name?: Maybe<Scalars['String']>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  price?: Maybe<PriceType>;
  prices?: Maybe<Array<Maybe<PriceType>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
};

export type UpdatePersonalDataMutationVariables = Exact<{
  command: InputUpdatePersonalDataType;
}>;


export type UpdatePersonalDataMutation = { updatePersonalData?: { succeeded: boolean, errors?: Array<{ code?: string | null | undefined, description: string } | null | undefined> | null | undefined } | null | undefined };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { me?: { id: string, userName: string, email?: string | null | undefined, emailConfirmed: boolean, photoUrl?: string | null | undefined, phoneNumber?: string | null | undefined, permissions?: Array<string | null | undefined> | null | undefined } | null | undefined };

export type GetMyAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyAddressesQuery = { me?: { contact?: { addresses?: { items?: Array<{ id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type GetMyOrdersQueryVariables = Exact<{
  filter: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type GetMyOrdersQuery = { orders?: { totalCount?: number | null | undefined, items?: Array<{ id: string, createdDate: any, status?: string | null | undefined, number: string, customerId: string, items: Array<{ sku: string, name: string, quantity: number, product?: { slug?: string | null | undefined, name: string } | null | undefined, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined>, currency?: { code: string } | null | undefined, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type AddCouponMutationVariables = Exact<{
  command: InputAddCouponType;
}>;


export type AddCouponMutation = { addCoupon?: { name: string } | null | undefined };

export type AddItemMutationVariables = Exact<{
  command: InputAddItemType;
}>;


export type AddItemMutation = { addItem?: { name: string, itemsQuantity?: number | null | undefined } | null | undefined };

export type AddOrUpdateCartPaymentMutationVariables = Exact<{
  command: InputAddOrUpdateCartPaymentType;
}>;


export type AddOrUpdateCartPaymentMutation = { addOrUpdateCartPayment?: { id?: string | null | undefined } | null | undefined };

export type AddOrUpdateCartShipmentMutationVariables = Exact<{
  command: InputAddOrUpdateCartShipmentType;
}>;


export type AddOrUpdateCartShipmentMutation = { addOrUpdateCartShipment?: { id?: string | null | undefined } | null | undefined };

export type ChangeCommentMutationVariables = Exact<{
  command: InputChangeCommentType;
}>;


export type ChangeCommentMutation = { changeComment?: { name: string, itemsQuantity?: number | null | undefined } | null | undefined };

export type ChangeCartItemQuantityMutationVariables = Exact<{
  command: InputChangeCartItemQuantityType;
}>;


export type ChangeCartItemQuantityMutation = { changeCartItemQuantity?: { name: string, itemsQuantity?: number | null | undefined } | null | undefined };

export type CreateOrderFromCartMutationVariables = Exact<{
  command: InputCreateOrderFromCartType;
}>;


export type CreateOrderFromCartMutation = { createOrderFromCart?: { id: string, number: string, comment?: string | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, subTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, discountTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, shippingTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined, items: Array<{ id: string, imageUrl?: string | null | undefined, isGift?: boolean | null | undefined, name: string, productId: string, quantity: number, sku: string, product?: { brandName?: string | null | undefined, slug?: string | null | undefined } | null | undefined, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, placedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> } | null | undefined };

export type RemoveCartMutationVariables = Exact<{
  command: InputRemoveCartType;
}>;


export type RemoveCartMutation = { removeCart?: boolean | null | undefined };

export type RemoveCartItemMutationVariables = Exact<{
  command: InputRemoveItemType;
}>;


export type RemoveCartItemMutation = { removeCartItem?: { name: string } | null | undefined };

export type RemoveCouponMutationVariables = Exact<{
  command: InputRemoveCouponType;
}>;


export type RemoveCouponMutation = { removeCoupon?: { name: string } | null | undefined };

export type ValidateCouponMutationVariables = Exact<{
  command: InputValidateCouponType;
}>;


export type ValidateCouponMutation = { validateCoupon?: boolean | null | undefined };

export type GetAvailPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetAvailPaymentMethodsQuery = { cart?: { availablePaymentMethods?: Array<{ code?: string | null | undefined, name?: string | null | undefined, logoUrl?: string | null | undefined, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type GetAvailShippingMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetAvailShippingMethodsQuery = { cart?: { availableShippingMethods?: Array<{ id?: string | null | undefined, code?: string | null | undefined, logoUrl?: string | null | undefined, optionName?: string | null | undefined, price?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type GetMyCartQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
}>;


export type GetMyCartQuery = { cart?: { id?: string | null | undefined, name: string, comment?: string | null | undefined, itemsCount?: number | null | undefined, itemsQuantity?: number | null | undefined, isValid?: boolean | null | undefined, coupons?: Array<{ code?: string | null | undefined } | null | undefined> | null | undefined, shipments?: Array<{ id?: string | null | undefined, shipmentMethodCode?: string | null | undefined, deliveryAddress?: { id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined } | null | undefined } | null | undefined> | null | undefined, discounts?: Array<{ promotionId?: string | null | undefined, description?: string | null | undefined, amount?: any | null | undefined, coupon?: string | null | undefined } | null | undefined> | null | undefined, payments?: Array<{ id?: string | null | undefined, paymentGatewayCode?: string | null | undefined, billingAddress?: { id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined } | null | undefined } | null | undefined> | null | undefined, addresses?: Array<{ id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined } | null | undefined> | null | undefined, items?: Array<{ id: string, imageUrl?: string | null | undefined, inStockQuantity?: number | null | undefined, isGift?: boolean | null | undefined, isReadOnly?: boolean | null | undefined, isReccuring?: boolean | null | undefined, isValid?: boolean | null | undefined, name?: string | null | undefined, productId?: string | null | undefined, quantity?: number | null | undefined, sku?: string | null | undefined, thumbnailImageUrl?: string | null | undefined, product?: { brandName?: string | null | undefined, slug?: string | null | undefined } | null | undefined, validationErrors?: Array<{ errorCode?: string | null | undefined, errorMessage?: string | null | undefined, errorParameters?: Array<{ key: string, value: string } | null | undefined> | null | undefined } | null | undefined> | null | undefined, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, listPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined, total?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, discountTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, subTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, shippingTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, shippingPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, extendedPriceTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, extendedPriceTotalWithTax?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, validationErrors?: Array<{ errorCode?: string | null | undefined, errorMessage?: string | null | undefined, objectId?: string | null | undefined, errorParameters?: Array<{ key: string, value: string } | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type GetProductQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type GetProductQuery = { product?: { name: string, id: string, code: string, slug?: string | null | undefined, outline?: string | null | undefined, imgSrc?: string | null | undefined, images?: Array<{ url?: string | null | undefined } | null | undefined> | null | undefined, breadcrumbs?: Array<{ title: string, seoPath?: string | null | undefined } | null | undefined> | null | undefined, description?: { content: string, id: string, languageCode: string, reviewType: string } | null | undefined, descriptions?: Array<{ content: string, id: string, languageCode: string, reviewType: string } | null | undefined> | null | undefined, properties?: Array<{ name: string, value?: string | null | undefined, type?: string | null | undefined } | null | undefined> | null | undefined, variations?: Array<{ id?: string | null | undefined, name?: string | null | undefined, code?: string | null | undefined, images?: Array<{ url?: string | null | undefined } | null | undefined> | null | undefined, properties?: Array<{ name: string, value?: string | null | undefined, type?: string | null | undefined } | null | undefined> | null | undefined, availabilityData?: { isActive?: boolean | null | undefined, isAvailable?: boolean | null | undefined, isBuyable?: boolean | null | undefined, isInStock?: boolean | null | undefined, availableQuantity: any } | null | undefined, price?: { actual?: { amount: any, formattedAmount: string } | null | undefined, discountAmount?: { amount: any, formattedAmount: string } | null | undefined, sale?: { amount: any, formattedAmount: string } | null | undefined, list?: { amount: any, formattedAmount: string } | null | undefined } | null | undefined } | null | undefined> | null | undefined, availabilityData?: { isActive?: boolean | null | undefined, isAvailable?: boolean | null | undefined, isBuyable?: boolean | null | undefined, isInStock?: boolean | null | undefined, availableQuantity: any } | null | undefined, price?: { actual?: { amount: any, formattedAmount: string } | null | undefined, discountAmount?: { amount: any, formattedAmount: string } | null | undefined, sale?: { amount: any, formattedAmount: string } | null | undefined, list?: { amount: any, formattedAmount: string } | null | undefined } | null | undefined } | null | undefined };

export type CategoriesQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type CategoriesQuery = { categories?: { totalCount?: number | null | undefined, items?: Array<{ id: string, name: string, code: string, slug?: string | null | undefined, path?: string | null | undefined, outline?: string | null | undefined, parent?: { id: string } | null | undefined, seoInfo?: { semanticUrl?: string | null | undefined } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type SearchProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
}>;


export type SearchProductsQuery = { products?: { totalCount?: number | null | undefined, items?: Array<{ name: string, id: string, code: string, slug?: string | null | undefined, outline?: string | null | undefined, imgSrc?: string | null | undefined, images?: Array<{ url?: string | null | undefined } | null | undefined> | null | undefined, description?: { content: string, id: string, languageCode: string, reviewType: string } | null | undefined, availabilityData?: { isActive?: boolean | null | undefined, isAvailable?: boolean | null | undefined, isBuyable?: boolean | null | undefined, isInStock?: boolean | null | undefined, availableQuantity: any } | null | undefined, price?: { actual?: { amount: any, formattedAmount: string } | null | undefined, discountAmount?: { amount: any, formattedAmount: string } | null | undefined, sale?: { amount: any, formattedAmount: string } | null | undefined, list?: { amount: any, formattedAmount: string } | null | undefined } | null | undefined } | null | undefined> | null | undefined, term_facets?: Array<{ name: string, terms?: Array<{ term?: string | null | undefined, count?: any | null | undefined, isSelected?: boolean | null | undefined } | null | undefined> | null | undefined } | null | undefined> | null | undefined, range_facets?: Array<{ name: string, ranges?: Array<{ label?: string | null | undefined, count?: any | null | undefined, from?: any | null | undefined, to?: any | null | undefined, isSelected?: boolean | null | undefined } | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type SearchRelatedProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type SearchRelatedProductsQuery = { product?: { name: string, id: string, associations?: { items?: Array<{ product?: { name: string, id: string, slug?: string | null | undefined, imgSrc?: string | null | undefined, availabilityData?: { isActive?: boolean | null | undefined, isAvailable?: boolean | null | undefined, isBuyable?: boolean | null | undefined, isInStock?: boolean | null | undefined, availableQuantity: any } | null | undefined, price?: { actual?: { amount: any, formattedAmount: string } | null | undefined, discountAmount?: { amount: any, formattedAmount: string } | null | undefined, sale?: { amount: any, formattedAmount: string } | null | undefined, list?: { amount: any, formattedAmount: string } | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined };

export type CartAddressFieldsFragment = { id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined };

export type CurrencyFieldsFragment = { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined };

export type LineItemFieldsFragment = { id: string, imageUrl?: string | null | undefined, inStockQuantity?: number | null | undefined, isGift?: boolean | null | undefined, isReadOnly?: boolean | null | undefined, isReccuring?: boolean | null | undefined, isValid?: boolean | null | undefined, name?: string | null | undefined, productId?: string | null | undefined, quantity?: number | null | undefined, sku?: string | null | undefined, thumbnailImageUrl?: string | null | undefined, product?: { brandName?: string | null | undefined, slug?: string | null | undefined } | null | undefined, validationErrors?: Array<{ errorCode?: string | null | undefined, errorMessage?: string | null | undefined, errorParameters?: Array<{ key: string, value: string } | null | undefined> | null | undefined } | null | undefined> | null | undefined, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, listPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined };

export type MemberAddressFieldsFragment = { id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined };

export type MoneyFieldsFragment = { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined };

export type OrderAddressFieldsFragment = { id?: string | null | undefined, name?: string | null | undefined, organization?: string | null | undefined, firstName?: string | null | undefined, lastName?: string | null | undefined, line1?: string | null | undefined, line2?: string | null | undefined, city?: string | null | undefined, countryCode?: string | null | undefined, countryName?: string | null | undefined, regionId?: string | null | undefined, regionName?: string | null | undefined, postalCode: string, zip?: string | null | undefined, phone?: string | null | undefined, email?: string | null | undefined, addressType?: number | null | undefined };

export type OrderLineItemFieldsFragment = { id: string, imageUrl?: string | null | undefined, isGift?: boolean | null | undefined, name: string, productId: string, quantity: number, sku: string, product?: { brandName?: string | null | undefined, slug?: string | null | undefined } | null | undefined, extendedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, placedPrice?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined, taxTotal?: { amount: any, decimalDigits: number, formattedAmount: string, formattedAmountWithoutCurrency: string, formattedAmountWithoutPoint: string, formattedAmountWithoutPointAndCurrency: string, currency?: { code: string, customFormatting?: string | null | undefined, exchangeRate?: any | null | undefined, symbol?: string | null | undefined } | null | undefined } | null | undefined };

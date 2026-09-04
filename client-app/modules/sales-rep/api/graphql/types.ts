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
  AnyValue: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Decimal: { input: number; output: number; }
  DynamicPropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
  Long: { input: number; output: number; }
  PropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
  StoreAssetUrl: { input: any; output: any; }
};

export type Asset = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']['output']>;
  /** The description of the asset. */
  description?: Maybe<Scalars['String']['output']>;
  /** The group of the asset. */
  group?: Maybe<Scalars['String']['output']>;
  /** The unique ID of the asset. */
  id: Scalars['String']['output'];
  /** The MIME type of the asset. */
  mimeType?: Maybe<Scalars['String']['output']>;
  /** The name of the asset. */
  name?: Maybe<Scalars['String']['output']>;
  /** The relative URL of the asset. */
  relativeUrl?: Maybe<Scalars['String']['output']>;
  /** The size of the asset in bytes. */
  size: Scalars['Long']['output'];
  /** The type ID of the asset. */
  typeId: Scalars['String']['output'];
  /** The URL of the asset. */
  url: Scalars['StoreAssetUrl']['output'];
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

export type BrandType = {
  bannerUrl?: Maybe<Scalars['StoreAssetUrl']['output']>;
  /** Brand property name. */
  brandPropertyName?: Maybe<Scalars['String']['output']>;
  /** Unlocalized brand name. */
  brandPropertyValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** Indicates if the brand is featured. */
  featured?: Maybe<Scalars['Boolean']['output']>;
  /** Brand ID. */
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['StoreAssetUrl']['output']>;
  /** Brand name. */
  name?: Maybe<Scalars['String']['output']>;
  permalink: Scalars['String']['output'];
};


export type BrandTypeDescriptionArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
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
  /** Assets */
  assets: Array<Asset>;
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
  imgSrc?: Maybe<Scalars['StoreAssetUrl']['output']>;
  /** Level in hierarchy */
  level: Scalars['Int']['output'];
  /** The name of the category. */
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
  /** Category relevance score */
  relevanceScore?: Maybe<Scalars['Float']['output']>;
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

export type CommonVendor = {
  /** Vendor ID */
  id: Scalars['String']['output'];
  /** Vendor name */
  name: Scalars['String']['output'];
  /** Vendor rating */
  rating?: Maybe<Rating>;
};

export type CurrencyType = {
  /** Currency code may be used ISO 4217 */
  code: Scalars['String']['output'];
  /** Currency culture name */
  cultureName: Scalars['String']['output'];
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars['String']['output']>;
  /** Currency english name */
  englishName: Scalars['String']['output'];
  /** Exchange rate */
  exchangeRate: Scalars['Decimal']['output'];
  /** Currency name */
  name: Scalars['String']['output'];
  /** Symbol */
  symbol: Scalars['String']['output'];
};

export type CustomerCartStatistics = {
  /** Compares two periods (current vs previous). Reuses the period results, so a bucket another selection already asked for is not aggregated again. */
  comparison?: Maybe<CustomerCartStatisticsComparison>;
  /** Currency the money figures below are converted to. */
  currencyCode: Scalars['String']['output'];
  /** Cart figures for a single date range. Omit both bounds for what is in the carts right now. */
  period?: Maybe<CustomerCartStatisticsPeriod>;
};


export type CustomerCartStatisticsComparisonArgs = {
  current: SalesRepStatisticsPeriodInput;
  filter?: InputMaybe<Scalars['String']['input']>;
  previous: SalesRepStatisticsPeriodInput;
};


export type CustomerCartStatisticsPeriodArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CustomerCartStatisticsComparison = {
  /** Current average minus the previous one. */
  averageChange: MoneyType;
  /** Percentage change of the average; null when the previous average is zero. */
  averageChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current contributing-cart count minus the previous one. */
  countChange: Scalars['Int']['output'];
  /** Percentage change of the count; null when the previous count is zero. */
  countChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current selected-for-checkout quantity minus the previous one. */
  selectedItemQuantityChange: Scalars['Int']['output'];
  /** Percentage change of the selected-for-checkout quantity; null when the previous quantity is zero. */
  selectedItemQuantityChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current goods subtotal minus the previous one. */
  totalChange: MoneyType;
  /** Percentage change of the goods subtotal; null when the previous subtotal is zero. */
  totalChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current not-selected-for-checkout quantity minus the previous one. */
  unselectedItemQuantityChange: Scalars['Int']['output'];
  /** Percentage change of the not-selected-for-checkout quantity; null when the previous quantity is zero. */
  unselectedItemQuantityChangePercent?: Maybe<Scalars['Decimal']['output']>;
};

export type CustomerCartStatisticsPeriod = {
  /** 'total' divided by 'count'. */
  average: MoneyType;
  /** Number of distinct carts contributing to 'total'; a cart whose lines are all parked reports quantities but does not count. */
  count: Scalars['Int']['output'];
  /** Summed quantity of the line items selected for checkout. */
  selectedItemQuantity: Scalars['Int']['output'];
  /** Goods subtotal of the lines picked for checkout in the range (list price less line discount, gifts excluded). Excludes shipping, taxes, fees and cart-level discounts. */
  total: MoneyType;
  /** Summed quantity of the line items NOT selected for checkout. */
  unselectedItemQuantity: Scalars['Int']['output'];
  /** Non-null when 'count'/'total'/'average' exclude line items in an unconfigured currency; describes what was excluded. Item quantities are never affected. */
  warning?: Maybe<Scalars['String']['output']>;
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

export type CustomerOrderStatistics = {
  /** Compares two periods (current vs previous). Reuses the period results, so a bucket shared with a 'period' selection is not queried again. */
  comparison?: Maybe<CustomerOrderStatisticsComparison>;
  /** Currency all figures below are converted to. */
  currencyCode: Scalars['String']['output'];
  /** Order statistics for a single date range. Omit both bounds for lifetime. */
  period?: Maybe<CustomerOrderStatisticsPeriod>;
};


export type CustomerOrderStatisticsComparisonArgs = {
  current: SalesRepStatisticsPeriodInput;
  filter?: InputMaybe<Scalars['String']['input']>;
  previous: SalesRepStatisticsPeriodInput;
};


export type CustomerOrderStatisticsPeriodArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CustomerOrderStatisticsComparison = {
  /** Current average minus previous average (amount, formatted amount and currency). */
  averageChange: MoneyType;
  /** Percentage change of average; null when the previous average is zero. */
  averageChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current count minus previous count. */
  countChange: Scalars['Int']['output'];
  /** Percentage change of count; null when the previous count is zero. */
  countChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current total minus previous total (amount, formatted amount and currency). */
  totalChange: MoneyType;
  /** Percentage change of total; null when the previous total is zero. */
  totalChangePercent?: Maybe<Scalars['Decimal']['output']>;
};

export type CustomerOrderStatisticsPeriod = {
  /** Average order value in the range (amount, formatted amount and currency). */
  average: MoneyType;
  /** Number of orders in the range. */
  count: Scalars['Int']['output'];
  /** Date of the earliest order in the range; on an unbounded period this is the "customer since" date. */
  firstOrderDate?: Maybe<Scalars['DateTime']['output']>;
  /** Date of the most recent order in the range. */
  lastOrderDate?: Maybe<Scalars['DateTime']['output']>;
  /** Sum of order totals in the range (amount, formatted amount and currency). */
  total: MoneyType;
  /** Non-null when the figures are partial because some orders were in an unconfigured currency and could not be converted; describes what was excluded. */
  warning?: Maybe<Scalars['String']['output']>;
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
  /** Order totals */
  orderTotals?: Maybe<Array<Maybe<OrderTotalType>>>;
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


export type CustomerOrderTypeInPaymentsArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
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

export type Facet = {
  /** Three facet types: Terms, Range, and Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Display order of the facet. */
  order?: Maybe<Scalars['Int']['output']>;
};

export type FacetRangeType = {
  /** Amount of products for which the values in a field fall into the specified range */
  count: Scalars['Long']['output'];
  /** The range’s lower endpoint in number format */
  from?: Maybe<Scalars['Decimal']['output']>;
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
  max: Scalars['Decimal']['output'];
  /** Minimum value among all values contained within the range */
  min: Scalars['Decimal']['output'];
  /** The range’s upper endpoint in number format */
  to?: Maybe<Scalars['Decimal']['output']>;
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

export type FilterFacet = Facet & {
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int']['output'];
  /** The three types of facets. Terms, Range, Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Display order of the facet. */
  order?: Maybe<Scalars['Int']['output']>;
};

export type ImageType = {
  /** Culture name */
  cultureName?: Maybe<Scalars['String']['output']>;
  /** The description of the image */
  description?: Maybe<Scalars['String']['output']>;
  /** The group of the image */
  group?: Maybe<Scalars['String']['output']>;
  /** The unique ID of the image */
  id: Scalars['String']['output'];
  /** The name of the image */
  name?: Maybe<Scalars['String']['output']>;
  /** The relative URL of the image */
  relativeUrl?: Maybe<Scalars['String']['output']>;
  /** Sort order */
  sortOrder: Scalars['Int']['output'];
  /** The URL of the image */
  url: Scalars['StoreAssetUrl']['output'];
};

export type InputChangeSalesRepTaskStatus = {
  /** True marks the task done; false reopens it. */
  completed: Scalars['Boolean']['input'];
  /** Id of the task to change. Must be a task the caller owns. */
  id: Scalars['String']['input'];
};

export type InputCreateSalesRepTask = {
  /** Free-text notes. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** When the task is due. */
  dueDate: Scalars['DateTime']['input'];
  /** Task title. */
  name: Scalars['String']['input'];
  /** Lowest, Low, Normal, High or Highest. Defaults to Normal. */
  priority?: InputMaybe<Scalars['String']['input']>;
  /** One of the values configured in the TaskManagement.TaskTypes settings dictionary. */
  type?: InputMaybe<Scalars['String']['input']>;
};

export type InputDeleteSalesRepTask = {
  /** Id of the task to delete. Must be a task the caller owns. */
  id: Scalars['String']['input'];
};

export type InputSalesRepLayout = {
  /** Top-level fixed regions with their blocks. */
  regions: Array<InputSalesRepLayoutRegion>;
  /** Document schema version. */
  schemaVersion: Scalars['Int']['input'];
  /** Layout surface identifier (e.g. "dashboard", "customerProfile"). */
  scope: Scalars['String']['input'];
  /** Optional store to scope the layout to. */
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InputSalesRepLayoutBlock = {
  /** Whether the block is parked in the hidden tray. */
  hidden: Scalars['Boolean']['input'];
  /** Instance id (frontend-generated, stable across saves, unique within the layout). */
  id: Scalars['String']['input'];
  /** Block-type-specific settings (send an empty list for none). */
  settings: Array<InputSalesRepLayoutSetting>;
  /** Block type discriminator (frontend-owned vocabulary). */
  type: Scalars['String']['input'];
};

export type InputSalesRepLayoutRegion = {
  /** Blocks in render order (array position is the order). */
  blocks: Array<InputSalesRepLayoutBlock>;
  /** Fixed region id (e.g. "statistics", "mainLeft", "mainRight"). */
  id: Scalars['String']['input'];
};

export type InputSalesRepLayoutSetting = {
  /** Setting key (block-type-specific, frontend-owned vocabulary). */
  key: Scalars['String']['input'];
  /** Scalar setting value (string, number, boolean). */
  value?: InputMaybe<Scalars['AnyValue']['input']>;
};

export type InputSendCustomerCommunicationType = {
  /** Optional culture for localizing the email template (e.g. "en-US"). */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** The Rep's message (required, max 1000 chars). May contain a URL. */
  message: Scalars['String']['input'];
  /** Customer organization whose members receive the message. */
  organizationId: Scalars['String']['input'];
  /** Send an email to the recipients. */
  sendEmail: Scalars['Boolean']['input'];
  /** Send an in-store push notification to the recipients. */
  sendPush: Scalars['Boolean']['input'];
  /** Store the message is sent on behalf of (scopes the email template and sender address). */
  storeId: Scalars['String']['input'];
  /** Optional message title/heading. */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type InputUpdateSalesRepTask = {
  /** Free-text notes. Send the stored value back unchanged to keep it; empty string clears it. */
  description: Scalars['String']['input'];
  /** When the task is due. */
  dueDate: Scalars['DateTime']['input'];
  /** Id of the task to change. Must be a task the caller owns. */
  id: Scalars['String']['input'];
  /** Task title. */
  name: Scalars['String']['input'];
  /** Lowest, Low, Normal, High or Highest. Empty string means Normal. */
  priority: Scalars['String']['input'];
  /** One of the values configured in the TaskManagement.TaskTypes settings dictionary. Empty string clears it. */
  type: Scalars['String']['input'];
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
  changeSalesRepTaskStatus?: Maybe<SalesRepTask>;
  createSalesRepTask?: Maybe<SalesRepTask>;
  deleteSalesRepTask?: Maybe<Scalars['Boolean']['output']>;
  saveSalesRepLayout?: Maybe<SalesRepLayout>;
  sendCustomerCommunication?: Maybe<SalesRepCommunicationResult>;
  updateSalesRepTask?: Maybe<SalesRepTask>;
};


export type MutationsChangeSalesRepTaskStatusArgs = {
  command: InputChangeSalesRepTaskStatus;
};


export type MutationsCreateSalesRepTaskArgs = {
  command: InputCreateSalesRepTask;
};


export type MutationsDeleteSalesRepTaskArgs = {
  command: InputDeleteSalesRepTask;
};


export type MutationsSaveSalesRepLayoutArgs = {
  command: InputSalesRepLayout;
};


export type MutationsSendCustomerCommunicationArgs = {
  command: InputSendCustomerCommunicationType;
};


export type MutationsUpdateSalesRepTaskArgs = {
  command: InputUpdateSalesRepTask;
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

export type OrderConfigurationItemFileType = {
  /** MIME type of the file */
  contentType?: Maybe<Scalars['String']['output']>;
  /** Name of the file */
  name: Scalars['String']['output'];
  /** Size of the file */
  size: Scalars['Long']['output'];
  /** URL of the file */
  url: Scalars['String']['output'];
};

export type OrderConfigurationItemType = {
  /** Custom text for 'Text' configuration item section */
  customText?: Maybe<Scalars['String']['output']>;
  /** Extended price */
  extendedPrice: MoneyType;
  /** List of files for 'File' configuration item section */
  files?: Maybe<Array<Maybe<OrderConfigurationItemFileType>>>;
  /** Configuration item ID */
  id: Scalars['String']['output'];
  /** Configuration item image URL */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Configuration item name */
  name?: Maybe<Scalars['String']['output']>;
  /** List price */
  price: MoneyType;
  product?: Maybe<Product>;
  /** Configuration item product ID */
  productId?: Maybe<Scalars['String']['output']>;
  /** Configuration item product quantity */
  quantity?: Maybe<Scalars['Int']['output']>;
  /** Sale price */
  salePrice: MoneyType;
  /** Configuration item section ID */
  sectionId: Scalars['String']['output'];
  /** Configuration item section name */
  sectionName?: Maybe<Scalars['String']['output']>;
  /** Configuration item SKU */
  sku?: Maybe<Scalars['String']['output']>;
  /** Configuration item type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars['String']['output'];
};

export type OrderDiscountType = {
  /** Order discount amount */
  amount: MoneyType;
  coupon?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the new PromotionDescription field instead */
  description?: Maybe<Scalars['String']['output']>;
  /** Description of the promotion */
  promotionDescription?: Maybe<Scalars['String']['output']>;
  promotionId?: Maybe<Scalars['String']['output']>;
  /** Name of the promotion */
  promotionName?: Maybe<Scalars['String']['output']>;
};

export type OrderLineItemType = {
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['DateTime']['output']>;
  catalogId: Scalars['String']['output'];
  categoryId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  /** Configuration items for configurable product */
  configurationItems?: Maybe<Array<Maybe<OrderConfigurationItemType>>>;
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
  listTotal: MoneyType;
  listTotalWithTax: MoneyType;
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
  /** Indicates whether the PlacedPrice should be visible to the customer */
  showPlacedPrice: Scalars['Boolean']['output'];
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

export type OrderPaymentMethodType = {
  code: Scalars['String']['output'];
  currency: CurrencyType;
  description?: Maybe<Scalars['String']['output']>;
  discountAmount: MoneyType;
  discountAmountWithTax: MoneyType;
  isActive: Scalars['Boolean']['output'];
  isAvailableForPartial: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** Localized name of payment method. */
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
  pickupLocation?: Maybe<PickupLocationType>;
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

export type OrderTotalType = {
  /** Total discount */
  discountTotal: MoneyType;
  /** Is current total in default total currency */
  isDefaultTotalCurrency: Scalars['Boolean']['output'];
  /** Cart subtotal */
  subTotal: MoneyType;
  /** Total tax */
  taxTotal: MoneyType;
  /** Cart total */
  total: MoneyType;
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

export type PickupAddressType = {
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
  /** Id */
  id: Scalars['String']['output'];
  /** Key */
  key?: Maybe<Scalars['String']['output']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** Region id */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']['output']>;
};

export type PickupLocationType = {
  /** Address */
  address?: Maybe<PickupAddressType>;
  /** ContactEmail */
  contactEmail?: Maybe<Scalars['String']['output']>;
  /** ContactPhone */
  contactPhone?: Maybe<Scalars['String']['output']>;
  /** Days until ready for pickup */
  deliveryDays?: Maybe<Scalars['Int']['output']>;
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** GeoLocation */
  geoLocation?: Maybe<Scalars['String']['output']>;
  /** Id */
  id: Scalars['String']['output'];
  /** IsActive */
  isActive: Scalars['Boolean']['output'];
  /** Name */
  name: Scalars['String']['output'];
  /** How long an order will be stored at a pickup point */
  storageDays?: Maybe<Scalars['Int']['output']>;
  /** WorkingHours */
  workingHours?: Maybe<Scalars['String']['output']>;
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
  /** The product price list name */
  pricelistName?: Maybe<Scalars['String']['output']>;
  /** Sale price */
  sale: MoneyType;
  /** Sale price with tax */
  saleWithTax: MoneyType;
  /** Start date */
  startDate?: Maybe<Scalars['DateTime']['output']>;
  /** Tier prices */
  tierPrices: Array<TierPriceType>;
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  /** Assets */
  assets: Array<Asset>;
  associations?: Maybe<ProductAssociationConnection>;
  /** Product availability data */
  availabilityData: AvailabilityData;
  brand?: Maybe<BrandType>;
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
  /** Global Trade Item Number (GTIN) */
  gtin?: Maybe<Scalars['String']['output']>;
  hasVariations: Scalars['Boolean']['output'];
  /** Height */
  height?: Maybe<Scalars['Decimal']['output']>;
  /** The unique ID of the product. */
  id: Scalars['String']['output'];
  /** Product images */
  images: Array<ImageType>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['StoreAssetUrl']['output']>;
  /** Product added at least in one wishlist */
  inWishlist: Scalars['Boolean']['output'];
  /** Product is configurable */
  isConfigurable: Scalars['Boolean']['output'];
  /** Product was purchased */
  isPurchased: Scalars['Boolean']['output'];
  keyProperties: Array<Property>;
  /** Length */
  length?: Maybe<Scalars['Decimal']['output']>;
  /** Get points amount */
  loyaltyPoints?: Maybe<MoneyType>;
  /** Manufacturer Part Number (MPN) */
  manufacturerPartNumber?: Maybe<Scalars['String']['output']>;
  masterVariation?: Maybe<VariationType>;
  /** Max. quantity */
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  /** Measure unit */
  measureUnit?: Maybe<Scalars['String']['output']>;
  /** Min. quantity */
  minQuantity?: Maybe<Scalars['Int']['output']>;
  /** Minimum product variation price */
  minVariationPrice?: Maybe<PriceType>;
  /** The name of the product. */
  name: Scalars['String']['output'];
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']['output']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']['output']>;
  /** Outlines */
  outlines: Array<OutlineType>;
  /** Defines the number of items in a package. Quantity step for your product's. */
  packSize: Scalars['Int']['output'];
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
  /** Product rating */
  rating?: Maybe<Rating>;
  /** Product relevance score */
  relevanceScore?: Maybe<Scalars['Float']['output']>;
  /** Request related SEO info */
  seoInfo: SeoInfo;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']['output']>;
  variations: Array<VariationType>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
  videos?: Maybe<VideoConnection>;
  /** Weight */
  weight?: Maybe<Scalars['Decimal']['output']>;
  /** Weight unit */
  weightUnit?: Maybe<Scalars['String']['output']>;
  /** Width */
  width?: Maybe<Scalars['Decimal']['output']>;
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
  /** Color code in CSS format. */
  colorCode?: Maybe<Scalars['String']['output']>;
  /** The display order of the property. */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  group?: Maybe<PropertyGroup>;
  /** Is property hidden. */
  hidden: Scalars['Boolean']['output'];
  /** The unique ID of the property. */
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  /** Is property has multiple values. */
  multivalue: Scalars['Boolean']['output'];
  /** The name of the property. */
  name: Scalars['String']['output'];
  propertyDictionaryItems?: Maybe<PropertyDictionaryItemConnection>;
  propertyType: PropertyType;
  /** ValueType of the property. */
  propertyValueType: PropertyValueTypes;
  value?: Maybe<Scalars['PropertyValue']['output']>;
  /** The display order of the value. */
  valueDisplayOrder?: Maybe<Scalars['Int']['output']>;
  valueId?: Maybe<Scalars['String']['output']>;
};


/** Products attributes. */
export type PropertyPropertyDictionaryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents property dictionary item */
export type PropertyDictionaryItem = {
  /** Color code in CSS format. */
  colorCode: Scalars['String']['output'];
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

/** Property group. */
export type PropertyGroup = {
  /** The localized description of the property group. */
  description?: Maybe<Scalars['String']['output']>;
  /** The display order of the property group. */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** The unique ID of the property group. */
  id: Scalars['String']['output'];
  /** The localized name of the property group. */
  name?: Maybe<Scalars['String']['output']>;
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
  Color = 'COLOR',
  DateTime = 'DATE_TIME',
  GeoPoint = 'GEO_POINT',
  Html = 'HTML',
  Integer = 'INTEGER',
  LongText = 'LONG_TEXT',
  Measure = 'MEASURE',
  Number = 'NUMBER',
  ShortText = 'SHORT_TEXT'
}

export type Query = {
  customerSalesReps?: Maybe<SalesRepContactConnection>;
  salesRepCartFilterRules?: Maybe<Array<Maybe<SalesRepCartFilterRule>>>;
  salesRepCustomer?: Maybe<SalesRepCustomerDetails>;
  salesRepCustomerCartStatistics?: Maybe<CustomerCartStatistics>;
  salesRepCustomerCounts?: Maybe<SalesRepCustomerCounts>;
  salesRepCustomerFilterRules?: Maybe<Array<Maybe<SalesRepCustomerFilterRule>>>;
  salesRepCustomerOrder?: Maybe<CustomerOrderType>;
  salesRepCustomerOrderStatistics?: Maybe<CustomerOrderStatistics>;
  salesRepCustomerOrders?: Maybe<CustomerOrderConnection>;
  salesRepCustomerSortRules?: Maybe<Array<Maybe<SalesRepCustomerSortRule>>>;
  salesRepCustomers?: Maybe<SalesRepCustomerConnection>;
  salesRepDocument?: Maybe<SalesRepDocument>;
  salesRepDocumentCategories?: Maybe<Array<Maybe<SalesRepDocumentCategory>>>;
  salesRepDocuments?: Maybe<SalesRepDocumentConnection>;
  salesRepLayout?: Maybe<SalesRepLayout>;
  salesRepOrderFilterRules?: Maybe<Array<Maybe<SalesRepOrderFilterRule>>>;
  salesRepOrderSortRules?: Maybe<Array<Maybe<SalesRepOrderSortRule>>>;
  salesRepOrders?: Maybe<SalesRepOrderConnection>;
  salesRepTask?: Maybe<SalesRepTask>;
  salesRepTaskFilterRules?: Maybe<Array<Maybe<SalesRepTaskFilterRule>>>;
  salesRepTaskSortRules?: Maybe<Array<Maybe<SalesRepTaskSortRule>>>;
  salesRepTaskTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  salesRepTasks?: Maybe<SalesRepTaskConnection>;
  salesRepTopSellerFilterRules?: Maybe<Array<Maybe<SalesRepTopSellerFilterRule>>>;
  salesRepTopSellerSortRules?: Maybe<Array<Maybe<SalesRepTopSellerSortRule>>>;
  salesRepTopSellers?: Maybe<Array<Maybe<SalesRepTopSeller>>>;
};


export type QueryCustomerSalesRepsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCartFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerArgs = {
  organizationId: Scalars['String']['input'];
};


export type QuerySalesRepCustomerCartStatisticsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerCountsArgs = {
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerOrderArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};


export type QuerySalesRepCustomerOrderStatisticsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomerSortRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepCustomersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepDocumentArgs = {
  id: Scalars['String']['input'];
};


export type QuerySalesRepDocumentCategoriesArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  pinned?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepLayoutArgs = {
  scope: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepOrderFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepOrderSortRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepTaskArgs = {
  id: Scalars['String']['input'];
};


export type QuerySalesRepTaskFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepTaskSortRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepTasksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  today?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QuerySalesRepTopSellerFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepTopSellerSortRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepTopSellersArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type RangeFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Display order of the facet. */
  order?: Maybe<Scalars['Int']['output']>;
  /** Ranges */
  ranges: Array<FacetRangeType>;
  /** Statistics for the facet, such as min and max values across ranges. */
  statistics?: Maybe<RangeFacetStatistics>;
};

export type RangeFacetStatistics = {
  /** The maximum value in the range or across ranges. */
  max?: Maybe<Scalars['Float']['output']>;
  /** The minimum value in the range or across ranges. */
  min?: Maybe<Scalars['Float']['output']>;
};

export type Rating = {
  /** Total count of customer reviews */
  reviewCount: Scalars['Int']['output'];
  /** Average rating */
  value: Scalars['Decimal']['output'];
};

export type SalesRepAddress = {
  /** Address type. */
  addressType?: Maybe<Scalars['Int']['output']>;
  /** City. */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code. */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** Country name. */
  countryName?: Maybe<Scalars['String']['output']>;
  /** Description. */
  description?: Maybe<Scalars['String']['output']>;
  /** Email. */
  email?: Maybe<Scalars['String']['output']>;
  /** First name. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Id. */
  id?: Maybe<Scalars['String']['output']>;
  /** Whether this is the organization's default address. */
  isDefault: Scalars['Boolean']['output'];
  /** Id. */
  key?: Maybe<Scalars['String']['output']>;
  /** Last name. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Line1. */
  line1?: Maybe<Scalars['String']['output']>;
  /** Line2. */
  line2?: Maybe<Scalars['String']['output']>;
  /** Middle name. */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name. */
  name?: Maybe<Scalars['String']['output']>;
  /** Company name. */
  organization?: Maybe<Scalars['String']['output']>;
  /** Outer id. */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phone. */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** Region id. */
  regionId?: Maybe<Scalars['String']['output']>;
  /** Region name. */
  regionName?: Maybe<Scalars['String']['output']>;
  /** Zip. */
  zip?: Maybe<Scalars['String']['output']>;
};

export type SalesRepCartFilterRule = {
  /** Localized label for the kind. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable kind id — send it back as the salesRepCustomerCartStatistics 'kinds' argument. */
  name: Scalars['String']['output'];
};

export type SalesRepCommunicationResult = {
  /** Whether the email was accepted for delivery. */
  emailSent: Scalars['Boolean']['output'];
  /** Whether the push notification was accepted for delivery. */
  pushSent: Scalars['Boolean']['output'];
  /** True when at least one requested channel was accepted for delivery. */
  succeeded: Scalars['Boolean']['output'];
  /** Stable outcome codes for any channel that did not deliver (empty on full success). The storefront maps each code to a localized message. */
  warnings: Array<Scalars['String']['output']>;
};

export type SalesRepContact = {
  /** About the Sales Rep. */
  about?: Maybe<Scalars['String']['output']>;
  /** Email addresses to contact the Sales Rep. */
  emails?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** First name. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Full name. */
  fullName?: Maybe<Scalars['String']['output']>;
  /** Contact (member) id of the Sales Rep. */
  id: Scalars['String']['output'];
  /** Last name. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Middle name. */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Display name. */
  name?: Maybe<Scalars['String']['output']>;
  /** Phone numbers to contact the Sales Rep. */
  phones?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Photo URL. */
  photoUrl?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `SalesRepContact`. */
export type SalesRepContactConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<SalesRepContactEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SalesRepContact>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `SalesRepContact`. */
export type SalesRepContactEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SalesRepContact>;
};

export type SalesRepCustomer = {
  /** External/display account id (the organization's OuterId); null when it has none. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** Account type — the organization's business category (e.g. "Garden Center"). */
  accountType?: Maybe<Scalars['String']['output']>;
  /** The organization's default address (structured; the storefront formats it, e.g. "City, Region"). */
  address?: Maybe<SalesRepAddress>;
  /** URL of the organization's icon. */
  iconUrl?: Maybe<Scalars['String']['output']>;
  /** The rep's most recent order for this customer (only orders the rep created). */
  lastOrder?: Maybe<SalesRepOrder>;
  /** The rep's own order statistics for this customer over a date range (YTD purchases, order count, average, first/last order). Omit both bounds for lifetime; request several aliased selections (e.g. ytd + lastYtd) to build the purchase columns. */
  orderStatistics?: Maybe<CustomerOrderStatisticsPeriod>;
  /** Organization (customer) id. */
  organizationId: Scalars['String']['output'];
  /** Organization (customer) name. */
  organizationName?: Maybe<Scalars['String']['output']>;
};


export type SalesRepCustomerOrderStatisticsArgs = {
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

/** A connection from an object to a list of objects of type `SalesRepCustomer`. */
export type SalesRepCustomerConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<SalesRepCustomerEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SalesRepCustomer>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SalesRepCustomerCounts = {
  /** Number of customers (organizations) the rep is assigned to serve. */
  assignedCustomers: Scalars['Int']['output'];
  /** Compares two periods (current vs previous). Reuses the period results, so a bucket shared with a 'period' selection is not queried again. */
  comparison?: Maybe<SalesRepCustomerCountsComparison>;
  /** Customer counters for a single date range. Omit both bounds for lifetime. */
  period?: Maybe<SalesRepCustomerCountsPeriod>;
};


export type SalesRepCustomerCountsComparisonArgs = {
  current: SalesRepStatisticsPeriodInput;
  filter?: InputMaybe<Scalars['String']['input']>;
  previous: SalesRepStatisticsPeriodInput;
};


export type SalesRepCustomerCountsPeriodArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SalesRepCustomerCountsComparison = {
  /** Current new-customers count minus previous. */
  newCustomersChange: Scalars['Int']['output'];
  /** Percentage change of new-customers; null when the previous count is zero. */
  newCustomersChangePercent?: Maybe<Scalars['Decimal']['output']>;
  /** Current ordering-customers count minus previous. */
  orderingCustomersChange: Scalars['Int']['output'];
  /** Percentage change of ordering-customers; null when the previous count is zero. */
  orderingCustomersChangePercent?: Maybe<Scalars['Decimal']['output']>;
};

export type SalesRepCustomerCountsPeriod = {
  /** Customers first assigned to the rep within the range (by assignment date). */
  newCustomers: Scalars['Int']['output'];
  /** Distinct customers the rep ordered for within the range. */
  orderingCustomers: Scalars['Int']['output'];
};

export type SalesRepCustomerDetails = {
  /** Account type — the organization's business category. */
  accountType?: Maybe<Scalars['String']['output']>;
  /** The organization's default address (structured; the storefront formats it, e.g. "City, Region"). */
  address?: Maybe<SalesRepAddress>;
  /** URL of the organization's icon. */
  iconUrl?: Maybe<Scalars['String']['output']>;
  /** Organization (customer) id. */
  organizationId: Scalars['String']['output'];
  /** Organization (customer) name. */
  organizationName?: Maybe<Scalars['String']['output']>;
  /** Primary phone number (the primary contact's, falling back to the organization's). */
  phone?: Maybe<Scalars['String']['output']>;
  /** Primary contact of the organization (its owner, or the first contact member). */
  primaryContact?: Maybe<SalesRepContact>;
};

/** An edge in a connection from an object to another object of type `SalesRepCustomer`. */
export type SalesRepCustomerEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SalesRepCustomer>;
};

export type SalesRepCustomerFilterRule = {
  /** Localized label for the segment. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable segment id — send it back in the salesRepCustomers / salesRepCustomerCounts 'filter' argument. */
  name: Scalars['String']['output'];
};

export type SalesRepCustomerSortRule = {
  /** Direction applied when the 'sort' argument carries no direction suffix: 'asc' or 'desc'. */
  defaultDirection: Scalars['String']['output'];
  /** Localized label for the ordering. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable sort-rule id — send it back as the salesRepCustomers 'sort' argument (optionally suffixed ':asc'/':desc'). */
  name: Scalars['String']['output'];
  /** Whether the client may choose the direction (e.g. 'name:desc'); false = a ':asc'/':desc' opposite of the default is rejected. */
  supportsDirection: Scalars['Boolean']['output'];
};

export type SalesRepDocument = {
  /** Category from the document metadata — a salesRepDocumentCategories 'name'. */
  category?: Maybe<Scalars['String']['output']>;
  /** MIME content type of the file. */
  contentType?: Maybe<Scalars['String']['output']>;
  /** Upload date (the default sort key, newest first). */
  createdDate: Scalars['DateTime']['output'];
  /** Display name — the metadata name when set, otherwise the file name. */
  displayName?: Maybe<Scalars['String']['output']>;
  /** Id of the underlying library file. */
  fileId: Scalars['String']['output'];
  /** Document id. */
  id: Scalars['String']['output'];
  /** Whether this is the single pinned document of the library. */
  isPinned: Scalars['Boolean']['output'];
  /** Last modification date. */
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  /** Original file name (also the download file name); null when the file record is missing (out-of-band corruption). */
  name?: Maybe<Scalars['String']['output']>;
  /** Optional page count. */
  pageCount?: Maybe<Scalars['Int']['output']>;
  /** Optional preview image URL for the card grid. */
  previewUrl?: Maybe<Scalars['String']['output']>;
  /** File size in bytes; null when the file record is missing (out-of-band corruption). */
  size?: Maybe<Scalars['Long']['output']>;
  /** Optional short description. */
  summary?: Maybe<Scalars['String']['output']>;
  /** Authorized download URL (the file-experience-api endpoint — never a raw blob URL); always resolvable — for a corrupted document the download returns the server error (404). */
  url: Scalars['String']['output'];
};

export type SalesRepDocumentCategory = {
  /** Number of documents in the category. */
  count: Scalars['Int']['output'];
  /** Category name — send it back in the salesRepDocuments 'category' argument. */
  name: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `SalesRepDocument`. */
export type SalesRepDocumentConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<SalesRepDocumentEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SalesRepDocument>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `SalesRepDocument`. */
export type SalesRepDocumentEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SalesRepDocument>;
};

export type SalesRepLayout = {
  /** When the layout was last saved (UTC). */
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  /** Top-level fixed regions. */
  regions: Array<SalesRepLayoutRegion>;
  /** Document schema version, for frontend migration of older saved layouts. */
  schemaVersion: Scalars['Int']['output'];
};

export type SalesRepLayoutBlock = {
  /** Whether the block is parked in the hidden tray. */
  hidden: Scalars['Boolean']['output'];
  /** Instance id (frontend-generated, stable across saves, unique within the layout). */
  id: Scalars['String']['output'];
  /** Block-type-specific settings (may be empty). */
  settings: Array<SalesRepLayoutSetting>;
  /** Block type discriminator (frontend-owned vocabulary). */
  type: Scalars['String']['output'];
};

export type SalesRepLayoutRegion = {
  /** Blocks in render order (array position is the order). */
  blocks: Array<SalesRepLayoutBlock>;
  /** Fixed region id (e.g. "statistics", "mainLeft", "mainRight"). */
  id: Scalars['String']['output'];
};

export type SalesRepLayoutSetting = {
  /** Setting key (block-type-specific, frontend-owned vocabulary). */
  key: Scalars['String']['output'];
  /** Scalar setting value (string, number, boolean). */
  value?: Maybe<Scalars['AnyValue']['output']>;
};

export type SalesRepOrder = {
  /** Date the order was placed. */
  createdDate: Scalars['DateTime']['output'];
  /** Order id. */
  id: Scalars['String']['output'];
  /** Number of distinct line items in the order. */
  itemsCount: Scalars['Int']['output'];
  /** Total number of units in the order (sum of line-item quantities) — the "N units" figure. */
  itemsQuantity: Scalars['Int']['output'];
  /** Human-readable order number. */
  number?: Maybe<Scalars['String']['output']>;
  /** Organization (customer) id the order belongs to. */
  organizationId?: Maybe<Scalars['String']['output']>;
  /** Organization (customer) name. */
  organizationName?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
  /** Order grand total (amount, formatted amount and currency). */
  total: MoneyType;
};

/** A connection from an object to a list of objects of type `SalesRepOrder`. */
export type SalesRepOrderConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<SalesRepOrderEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SalesRepOrder>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `SalesRepOrder`. */
export type SalesRepOrderEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SalesRepOrder>;
};

export type SalesRepOrderFilterRule = {
  /** Localized label for the status. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable status id — send it back as the salesRepOrders 'status' argument. */
  name: Scalars['String']['output'];
};

export type SalesRepOrderSortRule = {
  /** Direction applied when the 'sort' argument carries no direction suffix: 'asc' or 'desc'. */
  defaultDirection: Scalars['String']['output'];
  /** Localized label for the ordering. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable sort-rule id — send it back as the salesRepOrders 'sort' argument (optionally suffixed ':asc'/':desc'). */
  name: Scalars['String']['output'];
  /** Whether the client may choose the direction (e.g. 'total:asc'); false = a ':asc'/':desc' opposite of the default is rejected. */
  supportsDirection: Scalars['Boolean']['output'];
};

export type SalesRepStatisticsPeriodInput = {
  /** Inclusive lower bound of the period (null = no lower bound). */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** Inclusive upper bound of the period (null = no upper bound). */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SalesRepTask = {
  /** True when finished as done; false or null on a cancelled task. Combine with isActive and dueDate to render the status: active and due before the start of the viewer's today = overdue, active otherwise = upcoming, completed = done. */
  completed?: Maybe<Scalars['Boolean']['output']>;
  /** When the task was created. */
  createdDate: Scalars['DateTime']['output'];
  /** Free-text notes. */
  description?: Maybe<Scalars['String']['output']>;
  /** When the task is due, as an instant. */
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  /** Task id. */
  id: Scalars['String']['output'];
  /** False once the task has been completed or cancelled. */
  isActive: Scalars['Boolean']['output'];
  /** When the task was last changed. */
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  /** Task title. */
  name: Scalars['String']['output'];
  /** Priority name: Lowest, Low, Normal, High or Highest. */
  priority?: Maybe<Scalars['String']['output']>;
  /** Task type - one of the values configured in the TaskManagement.TaskTypes settings dictionary. */
  type?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `SalesRepTask`. */
export type SalesRepTaskConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<SalesRepTaskEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<SalesRepTask>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `SalesRepTask`. */
export type SalesRepTaskEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<SalesRepTask>;
};

export type SalesRepTaskFilterRule = {
  /** Localized label for the rule. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable rule id — send it back in the salesRepTasks 'filter' argument. */
  name: Scalars['String']['output'];
};

export type SalesRepTaskSortRule = {
  /** Direction applied when the 'sort' argument carries no direction suffix: 'asc' or 'desc'. */
  defaultDirection: Scalars['String']['output'];
  /** Localized label for the ordering. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable sort-rule id — send it back as the salesRepTasks 'sort' argument (optionally suffixed ':asc'/':desc'). */
  name: Scalars['String']['output'];
  /** Whether the client may choose the direction; false = a ':asc'/':desc' opposite of the default is rejected. */
  supportsDirection: Scalars['Boolean']['output'];
};

export type SalesRepTopSeller = {
  /** Category id (from the line-item snapshot). */
  categoryId?: Maybe<Scalars['String']['output']>;
  /** Product image URL (from the line-item snapshot). */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Product name (from the line-item snapshot). */
  name?: Maybe<Scalars['String']['output']>;
  /** Product id the sales were aggregated by. */
  productId: Scalars['String']['output'];
  /** 1-based rank in the list (by the selected metric). */
  rank: Scalars['Int']['output'];
  /** Total revenue — sum of quantity × unit price (amount, formatted amount and currency). */
  revenue: MoneyType;
  /** Product SKU (from the line-item snapshot). */
  sku?: Maybe<Scalars['String']['output']>;
  /** Total units sold (sum of line-item quantities). */
  units: Scalars['Int']['output'];
  /** Non-null when Revenue is partial because some of this product's sales were in an unconfigured currency and could not be converted; describes what was excluded. */
  warning?: Maybe<Scalars['String']['output']>;
};

export type SalesRepTopSellerFilterRule = {
  /** Localized category label. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable rule id (a top-level category id) — send it back as the salesRepTopSellers 'filter' argument. */
  name: Scalars['String']['output'];
};

export type SalesRepTopSellerSortRule = {
  /** Direction applied when the 'sort' argument carries no direction suffix: 'asc' or 'desc'. */
  defaultDirection: Scalars['String']['output'];
  /** Localized label for the ordering. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** Stable sort-rule id — send it back as the salesRepTopSellers 'sort' argument (optionally suffixed ':asc'/':desc'). */
  name: Scalars['String']['output'];
  /** Whether the client may choose the direction; false = a ':asc'/':desc' opposite of the default is rejected (these rank highest-first only). */
  supportsDirection: Scalars['Boolean']['output'];
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
  outline?: Maybe<Scalars['String']['output']>;
  pageTitle?: Maybe<Scalars['String']['output']>;
  semanticUrl: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
};

export type TermFacet = Facet & {
  /** Three facet types: Terms, Range, and Filter */
  facetType: FacetTypes;
  /** Localized name of the facet. */
  label: Scalars['String']['output'];
  /** The key/name  of the facet. */
  name: Scalars['String']['output'];
  /** Display order of the facet. */
  order?: Maybe<Scalars['Int']['output']>;
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

export type VariationType = {
  /** Assets */
  assets: Array<Asset>;
  associations?: Maybe<ProductAssociationConnection>;
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
  /** Defines the number of items in a package. Quantity step for your product's. */
  packSize?: Maybe<Scalars['Int']['output']>;
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
  /** Product rating */
  rating?: Maybe<Rating>;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']['output']>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
};


export type VariationTypeAssociationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
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
  /** Embedded video URL */
  embedUrl?: Maybe<Scalars['String']['output']>;
  /** Video name */
  name: Scalars['String']['output'];
  /** ID of the object video is attached to */
  ownerId: Scalars['String']['output'];
  /** Type of the object video is attached to (Product, Category) */
  ownerType: Scalars['String']['output'];
  /** Sort order */
  sortOrder: Scalars['Int']['output'];
  /** Video thumbnail URL */
  thumbnailUrl: Scalars['String']['output'];
  /** Video upload date */
  uploadDate?: Maybe<Scalars['DateTime']['output']>;
};

export type PropertyFragment = { name: string, colorCode?: string, value?: string | number | boolean | null, valueDisplayOrder?: number, propertyType: PropertyType, hidden: boolean, propertyValueType: PropertyValueTypes, label: string, displayOrder?: number, group?: { id: string, name?: string, displayOrder?: number, description?: string } };

export type CurrencyFragment = { code: string, symbol: string };

export type MoneyFragment = { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } };

export type FullOrderFieldsFragment = { comment?: string, purchaseOrderNumber?: string, cancelReason?: string, id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, currency: { code: string, symbol: string }, shipments: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl?: string, typeName?: string }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, pickupLocation?: { id: string, name: string, description?: string, geoLocation?: string, deliveryDays?: number, storageDays?: number, contactEmail?: string, contactPhone?: string, workingHours?: string, isActive: boolean, address?: { id: string, key?: string, name?: string, organization?: string, countryCode?: string, countryName?: string, city?: string, postalCode?: string, line1?: string, line2?: string, regionId?: string, regionName?: string, phone?: string, email?: string, outerId?: string, description?: string, addressType?: number } } }>, inPayments: Array<{ id: string, number: string, isApproved: boolean, gatewayCode?: string, paymentMethod?: { name?: string, logoUrl?: string, code: string, typeName: string, paymentMethodType: number, paymentMethodGroupType: number }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, availablePaymentMethods: Array<{ name?: string, code: string, logoUrl?: string, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, showPlacedPrice: boolean, quantity: number, sku: string, outerId?: string, currency: { code: string, symbol: string }, listTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, colorCode?: string, value?: string | number | boolean | null, valueDisplayOrder?: number, propertyType: PropertyType, hidden: boolean, propertyValueType: PropertyValueTypes, label: string, displayOrder?: number, group?: { id: string, name?: string, displayOrder?: number, description?: string } }> }, extendedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discounts: Array<{ promotionId?: string, promotionName?: string }>, vendor?: { id: string, name: string, rating?: { value: number, reviewCount: number } }, configurationItems?: Array<{ id: string, name?: string, customText?: string, type: string, files?: Array<{ name: string, url: string }> }> }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, promotionName?: string, amount: { amount: number, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, orderTotals?: Array<{ isDefaultTotalCurrency: boolean, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }> };

export type OrderAddressFieldsFragment = { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number };

export type OrderLineItemFieldsFragment = { id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, showPlacedPrice: boolean, quantity: number, sku: string, outerId?: string, currency: { code: string, symbol: string }, listTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, colorCode?: string, value?: string | number | boolean | null, valueDisplayOrder?: number, propertyType: PropertyType, hidden: boolean, propertyValueType: PropertyValueTypes, label: string, displayOrder?: number, group?: { id: string, name?: string, displayOrder?: number, description?: string } }> }, extendedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discounts: Array<{ promotionId?: string, promotionName?: string }>, vendor?: { id: string, name: string, rating?: { value: number, reviewCount: number } }, configurationItems?: Array<{ id: string, name?: string, customText?: string, type: string, files?: Array<{ name: string, url: string }> }> };

export type ShortOrderFieldsFragment = { id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, showPlacedPrice: boolean, quantity: number, sku: string, outerId?: string, currency: { code: string, symbol: string }, listTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, colorCode?: string, value?: string | number | boolean | null, valueDisplayOrder?: number, propertyType: PropertyType, hidden: boolean, propertyValueType: PropertyValueTypes, label: string, displayOrder?: number, group?: { id: string, name?: string, displayOrder?: number, description?: string } }> }, extendedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discounts: Array<{ promotionId?: string, promotionName?: string }>, vendor?: { id: string, name: string, rating?: { value: number, reviewCount: number } }, configurationItems?: Array<{ id: string, name?: string, customText?: string, type: string, files?: Array<{ name: string, url: string }> }> }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, promotionName?: string, amount: { amount: number, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, orderTotals?: Array<{ isDefaultTotalCurrency: boolean, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }> };

export type SalesRepTaskFieldsFragment = { id: string, name: string, description?: string, type?: string, priority?: string, dueDate?: any, isActive: boolean, completed?: boolean };

export type ChangeSalesRepTaskStatusMutationVariables = Exact<{
  command: InputChangeSalesRepTaskStatus;
}>;


export type ChangeSalesRepTaskStatusMutation = { changeSalesRepTaskStatus?: { id: string, name: string, description?: string, type?: string, priority?: string, dueDate?: any, isActive: boolean, completed?: boolean } };

export type CreateSalesRepTaskMutationVariables = Exact<{
  command: InputCreateSalesRepTask;
}>;


export type CreateSalesRepTaskMutation = { createSalesRepTask?: { id: string, name: string, description?: string, type?: string, priority?: string, dueDate?: any, isActive: boolean, completed?: boolean } };

export type DeleteSalesRepTaskMutationVariables = Exact<{
  command: InputDeleteSalesRepTask;
}>;


export type DeleteSalesRepTaskMutation = { deleteSalesRepTask?: boolean };

export type SaveSalesRepLayoutMutationVariables = Exact<{
  command: InputSalesRepLayout;
}>;


export type SaveSalesRepLayoutMutation = { saveSalesRepLayout?: { regions: Array<{ id: string, blocks: Array<{ id: string, type: string, hidden: boolean, settings: Array<{ key: string, value?: any }> }> }> } };

export type SendCustomerCommunicationMutationVariables = Exact<{
  command: InputSendCustomerCommunicationType;
}>;


export type SendCustomerCommunicationMutation = { sendCustomerCommunication?: { succeeded: boolean, pushSent: boolean, emailSent: boolean, warnings: Array<string> } };

export type UpdateSalesRepTaskMutationVariables = Exact<{
  command: InputUpdateSalesRepTask;
}>;


export type UpdateSalesRepTaskMutation = { updateSalesRepTask?: { id: string, name: string, description?: string, type?: string, priority?: string, dueDate?: any, isActive: boolean, completed?: boolean } };

export type CustomerSalesRepsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type CustomerSalesRepsQuery = { customerSalesReps?: { totalCount?: number, items?: Array<{ id: string, name?: string, fullName?: string, emails?: Array<string>, phones?: Array<string> }> } };

export type SalesRepCustomerQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type SalesRepCustomerQuery = { salesRepCustomer?: { organizationId: string, organizationName?: string, iconUrl?: string, accountType?: string, phone?: string, address?: { city?: string, regionName?: string }, primaryContact?: { id: string, fullName?: string, name?: string } } };

export type SalesRepCustomerCartStatisticsQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  cartFilter?: InputMaybe<Scalars['String']['input']>;
  weekFrom?: InputMaybe<Scalars['DateTime']['input']>;
  weekTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepCustomerCartStatisticsQuery = { salesRepCustomerCartStatistics?: { activeCarts?: { selectedItemQuantity: number, unselectedItemQuantity: number }, itemsThisWeek?: { selectedItemQuantity: number } } };

export type SalesRepCustomerCountsQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  mtdFrom?: InputMaybe<Scalars['DateTime']['input']>;
  mtdTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepCustomerCountsQuery = { salesRepCustomerCounts?: { assignedCustomers: number, thisMonth?: { orderingCustomers: number, newCustomers: number } } };

export type SalesRepCustomerFilterRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomerFilterRulesQuery = { salesRepCustomerFilterRules?: Array<{ name: string, localizedName?: string }> };

export type SalesRepCustomerOptionsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomerOptionsQuery = { salesRepCustomers?: { totalCount?: number, items?: Array<{ organizationId: string, organizationName?: string }> } };

export type SalesRepCustomerOrderQueryVariables = Exact<{
  id: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomerOrderQuery = { salesRepCustomerOrder?: { organizationId?: string, organizationName?: string, comment?: string, purchaseOrderNumber?: string, cancelReason?: string, id: string, number: string, createdDate: any, status?: string, statusDisplayValue?: string, currency: { code: string, symbol: string }, shipments: Array<{ shipmentMethodCode?: string, shipmentMethodOption?: string, shippingMethod?: { logoUrl?: string, typeName?: string }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountAmount: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, deliveryAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number }, pickupLocation?: { id: string, name: string, description?: string, geoLocation?: string, deliveryDays?: number, storageDays?: number, contactEmail?: string, contactPhone?: string, workingHours?: string, isActive: boolean, address?: { id: string, key?: string, name?: string, organization?: string, countryCode?: string, countryName?: string, city?: string, postalCode?: string, line1?: string, line2?: string, regionId?: string, regionName?: string, phone?: string, email?: string, outerId?: string, description?: string, addressType?: number } } }>, inPayments: Array<{ id: string, number: string, isApproved: boolean, gatewayCode?: string, paymentMethod?: { name?: string, logoUrl?: string, code: string, typeName: string, paymentMethodType: number, paymentMethodGroupType: number }, billingAddress?: { id?: string, name?: string, organization?: string, firstName?: string, lastName?: string, line1?: string, line2?: string, city?: string, countryCode?: string, countryName?: string, regionId?: string, regionName?: string, postalCode: string, phone?: string, email?: string, addressType?: number } }>, availablePaymentMethods: Array<{ name?: string, code: string, logoUrl?: string, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }>, items: Array<{ id: string, imageUrl?: string, isGift?: boolean, name: string, productId: string, productType?: string, showPlacedPrice: boolean, quantity: number, sku: string, outerId?: string, currency: { code: string, symbol: string }, listTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, product?: { id: string, brandName?: string, slug?: string, masterVariation?: { id: string, slug?: string }, properties: Array<{ name: string, colorCode?: string, value?: string | number | boolean | null, valueDisplayOrder?: number, propertyType: PropertyType, hidden: boolean, propertyValueType: PropertyValueTypes, label: string, displayOrder?: number, group?: { id: string, name?: string, displayOrder?: number, description?: string } }> }, extendedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, price: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, placedPrice: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discounts: Array<{ promotionId?: string, promotionName?: string }>, vendor?: { id: string, name: string, rating?: { value: number, reviewCount: number } }, configurationItems?: Array<{ id: string, name?: string, customText?: string, type: string, files?: Array<{ name: string, url: string }> }> }>, discounts: Array<{ coupon?: string, description?: string, promotionId?: string, promotionName?: string, amount: { amount: number, formattedAmount: string, currency: { code: string } } }>, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingSubTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, shippingTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, orderTotals?: Array<{ isDefaultTotalCurrency: boolean, total: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, subTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, discountTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } }, taxTotal: { amount: number, formattedAmount: string, formattedAmountWithoutCurrency: string, currency: { code: string, symbol: string } } }> } };

export type SalesRepCustomerOrderStatisticsQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  mtdFrom?: InputMaybe<Scalars['DateTime']['input']>;
  mtdTo?: InputMaybe<Scalars['DateTime']['input']>;
  prevFrom?: InputMaybe<Scalars['DateTime']['input']>;
  prevTo?: InputMaybe<Scalars['DateTime']['input']>;
  ytdFrom?: InputMaybe<Scalars['DateTime']['input']>;
  ytdTo?: InputMaybe<Scalars['DateTime']['input']>;
  lastYearFrom?: InputMaybe<Scalars['DateTime']['input']>;
  lastYearTo?: InputMaybe<Scalars['DateTime']['input']>;
  weekFrom?: InputMaybe<Scalars['DateTime']['input']>;
  weekTo?: InputMaybe<Scalars['DateTime']['input']>;
  prevWeekFrom?: InputMaybe<Scalars['DateTime']['input']>;
  prevWeekTo?: InputMaybe<Scalars['DateTime']['input']>;
  recentFrom?: InputMaybe<Scalars['DateTime']['input']>;
  recentTo?: InputMaybe<Scalars['DateTime']['input']>;
  newOrdersFilter?: InputMaybe<Scalars['String']['input']>;
  withNewOrders: Scalars['Boolean']['input'];
  withWeek: Scalars['Boolean']['input'];
  withMtd: Scalars['Boolean']['input'];
  withMonthOverMonth: Scalars['Boolean']['input'];
  withYtd: Scalars['Boolean']['input'];
  withYearOverYear: Scalars['Boolean']['input'];
  withAverageOrderValue: Scalars['Boolean']['input'];
}>;


export type SalesRepCustomerOrderStatisticsQuery = { salesRepCustomerOrderStatistics?: { currencyCode: string, mtd?: { count: number, total: { amount: number, formattedAmount: string } }, ytd?: { count: number, total: { amount: number, formattedAmount: string }, average?: { formattedAmount: string } }, week?: { count: number, total: { formattedAmount: string } }, newOrders?: { count: number, total: { formattedAmount: string } }, recentOrders?: { count: number }, weekVsPrevWeek?: { countChangePercent?: number }, mtdVsPrevMonth?: { countChangePercent?: number }, ytdVsLastYear?: { countChangePercent?: number } } };

export type SalesRepCustomerOrdersQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  facet?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomerOrdersQuery = { salesRepCustomerOrders?: { totalCount?: number, items?: Array<{ id: string, number: string, organizationId?: string, organizationName?: string, customerId: string, createdDate: any, status?: string, statusDisplayValue?: string, total: { formattedAmount: string } }>, term_facets: Array<{ name: string, terms: Array<{ term: string, label: string, count: number }> }> } };

export type SalesRepCustomerSortRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomerSortRulesQuery = { salesRepCustomerSortRules?: Array<{ name: string, localizedName?: string, defaultDirection: string, supportsDirection: boolean }> };

export type SalesRepCustomersQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  ytdFrom?: InputMaybe<Scalars['DateTime']['input']>;
  ytdTo?: InputMaybe<Scalars['DateTime']['input']>;
  lastYearFrom?: InputMaybe<Scalars['DateTime']['input']>;
  lastYearTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepCustomersQuery = { salesRepCustomers?: { totalCount?: number, items?: Array<{ organizationId: string, organizationName?: string, accountType?: string, address?: { postalCode?: string, zip?: string, city?: string, regionName?: string }, ytd?: { count: number, total: { amount: number, formattedAmount: string } }, lastYear?: { count: number, total: { amount: number, formattedAmount: string } }, lastOrder?: { id: string, number?: string, createdDate: any } }> } };

export type SalesRepCustomersCountQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepCustomersCountQuery = { salesRepCustomers?: { totalCount?: number } };

export type SalesRepDocumentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SalesRepDocumentQuery = { salesRepDocument?: { id: string, name?: string, displayName?: string, category?: string, isPinned: boolean, contentType?: string, size?: number, createdDate: any, modifiedDate?: any, url: string, summary?: string, pageCount?: number, previewUrl?: string } };

export type SalesRepDocumentCategoriesQueryVariables = Exact<{
  keyword?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepDocumentCategoriesQuery = { salesRepDocumentCategories?: Array<{ name: string, count: number }> };

export type SalesRepDocumentsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepDocumentsQuery = { salesRepDocuments?: { totalCount?: number, items?: Array<{ id: string, name?: string, displayName?: string, category?: string, isPinned: boolean, contentType?: string, size?: number, createdDate: any, modifiedDate?: any, url: string, summary?: string, pageCount?: number, previewUrl?: string }> } };

export type SalesRepLayoutQueryVariables = Exact<{
  scope: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepLayoutQuery = { salesRepLayout?: { regions: Array<{ id: string, blocks: Array<{ id: string, type: string, hidden: boolean, settings: Array<{ key: string, value?: any }> }> }> } };

export type SalesRepOrderFilterRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  periodFrom?: InputMaybe<Scalars['DateTime']['input']>;
  periodTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepOrderFilterRulesQuery = { salesRepOrderFilterRules?: Array<{ name: string, localizedName?: string }> };

export type SalesRepOrderSortRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepOrderSortRulesQuery = { salesRepOrderSortRules?: Array<{ name: string, localizedName?: string, defaultDirection: string, supportsDirection: boolean }> };

export type SalesRepOrdersQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  periodFrom?: InputMaybe<Scalars['DateTime']['input']>;
  periodTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepOrdersQuery = { salesRepOrders?: { totalCount?: number, items?: Array<{ id: string, number?: string, organizationId?: string, organizationName?: string, createdDate: any, status?: string, statusDisplayValue?: string, itemsCount: number, total: { amount: number, formattedAmount: string, currency: { code: string, symbol: string } } }> } };

export type SalesRepOverdueTaskCountQueryVariables = Exact<{
  today: Scalars['DateTime']['input'];
}>;


export type SalesRepOverdueTaskCountQuery = { overdue?: { totalCount?: number } };

export type SalesRepTaskCountsQueryVariables = Exact<{
  today: Scalars['DateTime']['input'];
  period: SalesRepStatisticsPeriodInput;
}>;


export type SalesRepTaskCountsQuery = { day?: { totalCount?: number }, upcoming?: { totalCount?: number }, overdue?: { totalCount?: number }, completed?: { totalCount?: number } };

export type SalesRepTaskFilterRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepTaskFilterRulesQuery = { salesRepTaskFilterRules?: Array<{ name: string, localizedName?: string }> };

export type SalesRepTaskSortRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepTaskSortRulesQuery = { salesRepTaskSortRules?: Array<{ name: string, localizedName?: string, defaultDirection: string, supportsDirection: boolean }> };

export type SalesRepTaskTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type SalesRepTaskTypesQuery = { salesRepTaskTypes?: Array<string> };

export type SalesRepTasksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  today?: InputMaybe<Scalars['DateTime']['input']>;
  period?: InputMaybe<SalesRepStatisticsPeriodInput>;
}>;


export type SalesRepTasksQuery = { salesRepTasks?: { totalCount?: number, items?: Array<{ id: string, name: string, description?: string, type?: string, priority?: string, dueDate?: any, isActive: boolean, completed?: boolean }> } };

export type SalesRepTopSellerFilterRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  periodFrom?: InputMaybe<Scalars['DateTime']['input']>;
  periodTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepTopSellerFilterRulesQuery = { salesRepTopSellerFilterRules?: Array<{ name: string, localizedName?: string }> };

export type SalesRepTopSellerSortRulesQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepTopSellerSortRulesQuery = { salesRepTopSellerSortRules?: Array<{ name: string, localizedName?: string, defaultDirection: string, supportsDirection: boolean }> };

export type SalesRepTopSellersQueryVariables = Exact<{
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  periodFrom?: InputMaybe<Scalars['DateTime']['input']>;
  periodTo?: InputMaybe<Scalars['DateTime']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesRepTopSellersQuery = { salesRepTopSellers?: Array<{ rank: number, productId: string, name?: string, sku?: string, imageUrl?: string, categoryId?: string, units: number, revenue: { amount: number, formattedAmount: string, currency: { code: string } } }> };

export const CurrencyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]} as unknown as DocumentNode<CurrencyFragment, unknown>;
export const MoneyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]} as unknown as DocumentNode<MoneyFragment, unknown>;
export const PropertyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"colorCode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueDisplayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"propertyValueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}}]} as unknown as DocumentNode<PropertyFragment, unknown>;
export const OrderLineItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"showPlacedPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"configurationItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"customText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"colorCode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueDisplayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"propertyValueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}}]} as unknown as DocumentNode<OrderLineItemFieldsFragment, unknown>;
export const ShortOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderTotals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDefaultTotalCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"colorCode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueDisplayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"propertyValueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"showPlacedPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"configurationItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"customText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<ShortOrderFieldsFragment, unknown>;
export const OrderAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<OrderAddressFieldsFragment, unknown>;
export const FullOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"geoLocation"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryDays"}},{"kind":"Field","name":{"kind":"Name","value":"storageDays"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"workingHours"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"colorCode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueDisplayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"propertyValueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"showPlacedPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"configurationItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"customText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderTotals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDefaultTotalCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]} as unknown as DocumentNode<FullOrderFieldsFragment, unknown>;
export const SalesRepTaskFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"salesRepTaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}}]} as unknown as DocumentNode<SalesRepTaskFieldsFragment, unknown>;
export const ChangeSalesRepTaskStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeSalesRepTaskStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputChangeSalesRepTaskStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeSalesRepTaskStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"salesRepTaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"salesRepTaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}}]} as unknown as DocumentNode<ChangeSalesRepTaskStatusMutation, ChangeSalesRepTaskStatusMutationVariables>;
export const CreateSalesRepTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSalesRepTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreateSalesRepTask"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSalesRepTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"salesRepTaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"salesRepTaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}}]} as unknown as DocumentNode<CreateSalesRepTaskMutation, CreateSalesRepTaskMutationVariables>;
export const DeleteSalesRepTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSalesRepTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputDeleteSalesRepTask"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSalesRepTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteSalesRepTaskMutation, DeleteSalesRepTaskMutationVariables>;
export const SaveSalesRepLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveSalesRepLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSalesRepLayout"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveSalesRepLayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SaveSalesRepLayoutMutation, SaveSalesRepLayoutMutationVariables>;
export const SendCustomerCommunicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendCustomerCommunication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSendCustomerCommunicationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendCustomerCommunication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"pushSent"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<SendCustomerCommunicationMutation, SendCustomerCommunicationMutationVariables>;
export const UpdateSalesRepTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSalesRepTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateSalesRepTask"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSalesRepTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"salesRepTaskFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"salesRepTaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}}]} as unknown as DocumentNode<UpdateSalesRepTaskMutation, UpdateSalesRepTaskMutationVariables>;
export const CustomerSalesRepsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerSalesReps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerSalesReps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"emails"}},{"kind":"Field","name":{"kind":"Name","value":"phones"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerSalesRepsQuery, CustomerSalesRepsQueryVariables>;
export const SalesRepCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerQuery, SalesRepCustomerQueryVariables>;
export const SalesRepCustomerCartStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerCartStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerCartStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"activeCarts"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectedItemQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unselectedItemQuantity"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"itemsThisWeek"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectedItemQuantity"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerCartStatisticsQuery, SalesRepCustomerCartStatisticsQueryVariables>;
export const SalesRepCustomerCountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerCounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerCounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignedCustomers"}},{"kind":"Field","alias":{"kind":"Name","value":"thisMonth"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderingCustomers"}},{"kind":"Field","name":{"kind":"Name","value":"newCustomers"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerCountsQuery, SalesRepCustomerCountsQueryVariables>;
export const SalesRepCustomerFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerFilterRulesQuery, SalesRepCustomerFilterRulesQueryVariables>;
export const SalesRepCustomerOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOptionsQuery, SalesRepCustomerOptionsQueryVariables>;
export const SalesRepCustomerOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fullOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"currency"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CurrencyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"money"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmountWithoutCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"property"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Property"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"colorCode"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"valueDisplayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"propertyType"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"propertyValueType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLineItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isGift"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productType"}},{"kind":"Field","name":{"kind":"Name","value":"showPlacedPrice"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"listTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"brandName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"masterVariation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"property"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"extendedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"placedPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rating"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"configurationItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"customText"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"shortOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coupon"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"promotionId"}},{"kind":"Field","name":{"kind":"Name","value":"promotionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingSubTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderTotals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDefaultTotalCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"orderAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fullOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerOrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"shortOrderFields"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodCode"}},{"kind":"Field","name":{"kind":"Name","value":"shipmentMethodOption"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickupLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"geoLocation"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryDays"}},{"kind":"Field","name":{"kind":"Name","value":"storageDays"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"workingHours"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryName"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"regionId"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"outerId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"addressType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"inPayments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"CreatedDate:desc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"isApproved"}},{"kind":"Field","name":{"kind":"Name","value":"gatewayCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodGroupType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"orderAddressFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availablePaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"money"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOrderQuery, SalesRepCustomerOrderQueryVariables>;
export const SalesRepCustomerOrderStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOrderStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newOrdersFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withNewOrders"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withWeek"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withMtd"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withMonthOverMonth"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withYtd"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withYearOverYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withAverageOrderValue"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerOrderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","alias":{"kind":"Name","value":"mtd"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withMtd"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytd"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withYtd"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"average"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withAverageOrderValue"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"week"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withWeek"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"newOrders"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newOrdersFilter"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withNewOrders"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"recentOrders"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withNewOrders"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"weekVsPrevWeek"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekTo"}}}]}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withWeek"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mtdVsPrevMonth"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevTo"}}}]}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withMonthOverMonth"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytdVsLastYear"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}}}]}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withYearOverYear"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOrderStatisticsQuery, SalesRepCustomerOrderStatisticsQueryVariables>;
export const SalesRepCustomerOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"facet"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"facet"},"value":{"kind":"Variable","name":{"kind":"Name","value":"facet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"term_facets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"terms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"term"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOrdersQuery, SalesRepCustomerOrdersQueryVariables>;
export const SalesRepCustomerSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerSortRulesQuery, SalesRepCustomerSortRulesQueryVariables>;
export const SalesRepCustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytd"},"name":{"kind":"Name","value":"orderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"lastYear"},"name":{"kind":"Name","value":"orderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomersQuery, SalesRepCustomersQueryVariables>;
export const SalesRepCustomersCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomersCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomersCountQuery, SalesRepCustomersCountQueryVariables>;
export const SalesRepDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedDate"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}}]}}]}}]} as unknown as DocumentNode<SalesRepDocumentQuery, SalesRepDocumentQueryVariables>;
export const SalesRepDocumentCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepDocumentCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepDocumentCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<SalesRepDocumentCategoriesQuery, SalesRepDocumentCategoriesQueryVariables>;
export const SalesRepDocumentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepDocuments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isPinned"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedDate"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepDocumentsQuery, SalesRepDocumentsQueryVariables>;
export const SalesRepLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepLayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepLayoutQuery, SalesRepLayoutQueryVariables>;
export const SalesRepOrderFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrderFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrderFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}}]}}]}}]} as unknown as DocumentNode<SalesRepOrderFilterRulesQuery, SalesRepOrderFilterRulesQueryVariables>;
export const SalesRepOrderSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrderSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrderSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepOrderSortRulesQuery, SalesRepOrderSortRulesQueryVariables>;
export const SalesRepOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepOrdersQuery, SalesRepOrdersQueryVariables>;
export const SalesRepOverdueTaskCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOverdueTaskCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"overdue"},"name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"StringValue","value":"overdue","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SalesRepOverdueTaskCountQuery, SalesRepOverdueTaskCountQueryVariables>;
export const SalesRepTaskCountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTaskCounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepStatisticsPeriodInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"day"},"name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"upcoming"},"name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"StringValue","value":"upcoming","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"overdue"},"name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"StringValue","value":"overdue","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"completed"},"name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"StringValue","value":"completed","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SalesRepTaskCountsQuery, SalesRepTaskCountsQueryVariables>;
export const SalesRepTaskFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTaskFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTaskFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}}]}}]}}]} as unknown as DocumentNode<SalesRepTaskFilterRulesQuery, SalesRepTaskFilterRulesQueryVariables>;
export const SalesRepTaskSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTaskSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTaskSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepTaskSortRulesQuery, SalesRepTaskSortRulesQueryVariables>;
export const SalesRepTaskTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTaskTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTaskTypes"}}]}}]} as unknown as DocumentNode<SalesRepTaskTypesQuery, SalesRepTaskTypesQueryVariables>;
export const SalesRepTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTasks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepStatisticsPeriodInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"today"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"salesRepTaskFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"salesRepTaskFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SalesRepTask"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}}]} as unknown as DocumentNode<SalesRepTasksQuery, SalesRepTasksQueryVariables>;
export const SalesRepTopSellerFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTopSellerFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTopSellerFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}}]}}]}}]} as unknown as DocumentNode<SalesRepTopSellerFilterRulesQuery, SalesRepTopSellerFilterRulesQueryVariables>;
export const SalesRepTopSellerSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTopSellerSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTopSellerSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepTopSellerSortRulesQuery, SalesRepTopSellerSortRulesQueryVariables>;
export const SalesRepTopSellersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTopSellers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTopSellers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"units"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepTopSellersQuery, SalesRepTopSellersQueryVariables>;
export const OperationNames = {
  Query: {
    CustomerSalesReps: 'CustomerSalesReps',
    SalesRepCustomer: 'SalesRepCustomer',
    SalesRepCustomerCartStatistics: 'SalesRepCustomerCartStatistics',
    SalesRepCustomerCounts: 'SalesRepCustomerCounts',
    SalesRepCustomerFilterRules: 'SalesRepCustomerFilterRules',
    SalesRepCustomerOptions: 'SalesRepCustomerOptions',
    SalesRepCustomerOrder: 'SalesRepCustomerOrder',
    SalesRepCustomerOrderStatistics: 'SalesRepCustomerOrderStatistics',
    SalesRepCustomerOrders: 'SalesRepCustomerOrders',
    SalesRepCustomerSortRules: 'SalesRepCustomerSortRules',
    SalesRepCustomers: 'SalesRepCustomers',
    SalesRepCustomersCount: 'SalesRepCustomersCount',
    SalesRepDocument: 'SalesRepDocument',
    SalesRepDocumentCategories: 'SalesRepDocumentCategories',
    SalesRepDocuments: 'SalesRepDocuments',
    SalesRepLayout: 'SalesRepLayout',
    SalesRepOrderFilterRules: 'SalesRepOrderFilterRules',
    SalesRepOrderSortRules: 'SalesRepOrderSortRules',
    SalesRepOrders: 'SalesRepOrders',
    SalesRepOverdueTaskCount: 'SalesRepOverdueTaskCount',
    SalesRepTaskCounts: 'SalesRepTaskCounts',
    SalesRepTaskFilterRules: 'SalesRepTaskFilterRules',
    SalesRepTaskSortRules: 'SalesRepTaskSortRules',
    SalesRepTaskTypes: 'SalesRepTaskTypes',
    SalesRepTasks: 'SalesRepTasks',
    SalesRepTopSellerFilterRules: 'SalesRepTopSellerFilterRules',
    SalesRepTopSellerSortRules: 'SalesRepTopSellerSortRules',
    SalesRepTopSellers: 'SalesRepTopSellers'
  },
  Mutation: {
    ChangeSalesRepTaskStatus: 'ChangeSalesRepTaskStatus',
    CreateSalesRepTask: 'CreateSalesRepTask',
    DeleteSalesRepTask: 'DeleteSalesRepTask',
    SaveSalesRepLayout: 'SaveSalesRepLayout',
    SendCustomerCommunication: 'SendCustomerCommunication',
    UpdateSalesRepTask: 'UpdateSalesRepTask'
  },
  Fragment: {
    property: 'property',
    currency: 'currency',
    money: 'money',
    fullOrderFields: 'fullOrderFields',
    orderAddressFields: 'orderAddressFields',
    orderLineItemFields: 'orderLineItemFields',
    shortOrderFields: 'shortOrderFields',
    salesRepTaskFields: 'salesRepTaskFields'
  }
}
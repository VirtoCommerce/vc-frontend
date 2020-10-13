// This file was generated. Do not edit manually.
/* eslint-disable */

export type Maybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Date` scalar type represents a year, month and day in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  Date: any;
  /** The `DateTime` scalar type represents a date and time. `DateTime` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTime: any;
  /** The `DateTimeOffset` scalar type represents a date, time and offset from UTC. `DateTimeOffset` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTimeOffset: any;
  /** The `Seconds` scalar type represents a period of time represented as the total number of seconds. */
  Seconds: any;
  /** The `Milliseconds` scalar type represents a period of time represented as the total number of milliseconds. */
  Milliseconds: any;
  Decimal: any;
  Uri: any;
  Guid: any;
  Short: any;
  UShort: any;
  UInt: any;
  Long: any;
  BigInt: any;
  ULong: any;
  Byte: any;
  SByte: any;
}

export interface IQuery {
  cart?: Maybe<IExtendedCartType>;
  carts?: Maybe<IExtendedCartConnection>;
  categories?: Maybe<ICategoryConnection>;
  contact?: Maybe<IContactType>;
  order?: Maybe<ICustomerOrderType>;
  orders?: Maybe<ICustomerOrderConnection>;
  organization?: Maybe<IOrganization>;
  product?: Maybe<IProduct>;
  products?: Maybe<IProductConnection>;
  role?: Maybe<IRoleType>;
  user?: Maybe<IUserType>;
}


export interface IQueryCartArgs {
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  cartName?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
}


export interface IQueryCartsArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
}


export interface IQueryCategoriesArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  fuzzy?: Maybe<Scalars['Boolean']>;
  fuzzyLevel?: Maybe<Scalars['Int']>;
  facet?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  categoryIds?: Maybe<Array<Maybe<Scalars['String']>>>;
}


export interface IQueryContactArgs {
  id: Scalars['String'];
  userId: Scalars['String'];
}


export interface IQueryOrderArgs {
  id?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
}


export interface IQueryOrdersArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
}


export interface IQueryOrganizationArgs {
  id: Scalars['String'];
  userId: Scalars['String'];
}


export interface IQueryProductArgs {
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
}


export interface IQueryProductsArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  fuzzy?: Maybe<Scalars['Boolean']>;
  fuzzyLevel?: Maybe<Scalars['Int']>;
  facet?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  productIds?: Maybe<Array<Maybe<Scalars['String']>>>;
}


export interface IQueryRoleArgs {
  roleName: Scalars['String'];
}


export interface IQueryUserArgs {
  id?: Maybe<Scalars['String']>;
  userName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  loginProvider?: Maybe<Scalars['String']>;
  providerKey?: Maybe<Scalars['String']>;
}

/** Products are the sellable goods in an e-commerce project. */
export interface IProduct {
  assets?: Maybe<Array<Maybe<IAsset>>>;
  associations?: Maybe<IProductAssociationConnection>;
  availabilityData?: Maybe<IAvailabilityData>;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']>;
  catalogId?: Maybe<Scalars['String']>;
  category?: Maybe<ICategory>;
  /** The product SKU. */
  code: Scalars['String'];
  descriptions?: Maybe<Array<Maybe<IDescriptionType>>>;
  /** The unique ID of the product. */
  id: Scalars['String'];
  images?: Maybe<Array<Maybe<IImageType>>>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['String']>;
  masterVariation?: Maybe<IVariationType>;
  /** Get metaDescription for product. */
  metaDescription?: Maybe<Scalars['String']>;
  /** Get metaKeywords for product. */
  metaKeywords?: Maybe<Scalars['String']>;
  /** Get metaTitle for product. */
  metaTitle?: Maybe<Scalars['String']>;
  /** The name of the product. */
  name: Scalars['String'];
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']>;
  outlines?: Maybe<Array<Maybe<IOutlineType>>>;
  prices?: Maybe<Array<Maybe<IPriceType>>>;
  /** The type of product */
  productType?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<IProperty>>>;
  seoInfos?: Maybe<Array<Maybe<ISeoInfo>>>;
  /** Get slug for product. */
  slug?: Maybe<Scalars['String']>;
  tax?: Maybe<ITaxCategoryType>;
  variations?: Maybe<Array<Maybe<IVariationType>>>;
}


/** Products are the sellable goods in an e-commerce project. */
export interface IProductAssociationsArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  query?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
}

export interface ICategory {
  /** SKU of category. */
  code: Scalars['String'];
  hasParent?: Maybe<Scalars['Boolean']>;
  /** Id of category. */
  id: Scalars['String'];
  images?: Maybe<Array<Maybe<IImageType>>>;
  /** Name of category. */
  name: Scalars['String'];
  outlines?: Maybe<Array<Maybe<IOutlineType>>>;
  parent?: Maybe<ICategory>;
  seoInfos?: Maybe<Array<Maybe<ISeoInfo>>>;
  /** Get slug for category. You can pass storeId and cultureName for better accuracy */
  slug?: Maybe<Scalars['String']>;
}

/**
 * Represents the path from the catalog to one of the child objects (product or category):
 *             catalog/parent-category1/.../parent-categoryN/object
 */
export interface IOutlineType {
  items?: Maybe<Array<Maybe<IOutlineItemType>>>;
}

/** Represents one outline element: catalog, category or product. */
export interface IOutlineItemType {
  /** Object id */
  id: Scalars['String'];
  /** The name of current item */
  name?: Maybe<Scalars['String']>;
  seoInfos?: Maybe<Array<Maybe<ISeoInfo>>>;
  /** Object type */
  seoObjectType?: Maybe<Scalars['String']>;
}

export interface ISeoInfo {
  id: Scalars['String'];
  imageAltDescription?: Maybe<Scalars['String']>;
  /** Active/Inactive */
  isActive?: Maybe<Scalars['Boolean']>;
  languageCode?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  metaKeywords?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  /** SEO related object id */
  objectId?: Maybe<Scalars['String']>;
  /** SEO related object type name */
  objectType?: Maybe<Scalars['String']>;
  /** head title tag content */
  pageTitle?: Maybe<Scalars['String']>;
  /** Slug */
  semanticUrl?: Maybe<Scalars['String']>;
  /** Tenant StoreId which SEO defined */
  storeId?: Maybe<Scalars['String']>;
}

export interface IImageType {
  group?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  relativeUrl?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  url?: Maybe<Scalars['String']>;
}

export interface IDescriptionType {
  /** Description text. */
  content: Scalars['String'];
  /** Description ID. */
  id: Scalars['String'];
  /** Description language code. */
  languageCode: Scalars['String'];
  /** Description type. */
  reviewType: Scalars['String'];
}

export interface IVariationType {
  assets?: Maybe<Array<Maybe<IAsset>>>;
  availabilityData?: Maybe<IAvailabilityData>;
  /** SKU of variation. */
  code?: Maybe<Scalars['String']>;
  /** Id of variation. */
  id?: Maybe<Scalars['String']>;
  images?: Maybe<Array<Maybe<IImageType>>>;
  outlines?: Maybe<Array<Maybe<IOutlineType>>>;
  prices?: Maybe<Array<Maybe<IPriceType>>>;
  properties?: Maybe<Array<Maybe<IProperty>>>;
}

export interface IAvailabilityData {
  /** Available quantity */
  availableQuantity: Scalars['Long'];
  inventories?: Maybe<Array<Maybe<IInventoryInfo>>>;
  isActive?: Maybe<Scalars['Boolean']>;
  isAvailable?: Maybe<Scalars['Boolean']>;
  isBuyable?: Maybe<Scalars['Boolean']>;
  isInStock?: Maybe<Scalars['Boolean']>;
  isTrackInventory?: Maybe<Scalars['Boolean']>;
}

export interface IInventoryInfo {
  allowBackorder?: Maybe<Scalars['Boolean']>;
  allowPreorder?: Maybe<Scalars['Boolean']>;
  backorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  fulfillmentCenterId: Scalars['String'];
  fulfillmentCenterName: Scalars['String'];
  inStockQuantity?: Maybe<Scalars['Long']>;
  preorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  reservedQuantity?: Maybe<Scalars['Long']>;
}

export interface IPriceType {
  actual?: Maybe<IMoneyType>;
  actualWithTax?: Maybe<IMoneyType>;
  currency?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
  /** Relative benefit. 30% */
  discountPercent?: Maybe<Scalars['Decimal']>;
  discounts?: Maybe<Array<Maybe<ICatalogDiscountType>>>;
  list?: Maybe<IMoneyType>;
  listWithTax?: Maybe<IMoneyType>;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']>;
  sale?: Maybe<IMoneyType>;
  saleWithTax?: Maybe<IMoneyType>;
  tierPrices?: Maybe<Array<Maybe<ITierPriceType>>>;
  validFrom?: Maybe<Scalars['Date']>;
  validUntil?: Maybe<Scalars['Date']>;
}

export interface IMoneyType {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars['Decimal'];
  currency?: Maybe<ICurrencyType>;
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
}

/** Currency */
export interface ICurrencyType {
  /** Currency code may be used ISO 4217 */
  code: Scalars['String'];
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars['String']>;
  /** Exchange rate */
  exchangeRate?: Maybe<Scalars['Decimal']>;
  /** Symbol */
  symbol?: Maybe<Scalars['String']>;
}

export interface ITierPriceType {
  price?: Maybe<IMoneyType>;
  priceWithTax?: Maybe<IMoneyType>;
  quantity?: Maybe<Scalars['Long']>;
}

export interface ICatalogDiscountType {
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  promotion?: Maybe<IPromotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
}

/** Represents promotion object */
export interface IPromotion {
  /** Promotion description */
  description?: Maybe<Scalars['String']>;
  /** The unique ID of the promotion. */
  id: Scalars['String'];
  /** The name of the promotion */
  name: Scalars['String'];
  /** Promotion type */
  type?: Maybe<Scalars['String']>;
}

/** Products attributes. */
export interface IProperty {
  /** Is property hidden. */
  hidden: Scalars['Boolean'];
  /** The unique ID of the product. */
  id?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  /** Is property has multiple values. */
  multivalue: Scalars['Boolean'];
  /** The name of the property. */
  name: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  valueId?: Maybe<Scalars['String']>;
  valueType?: Maybe<Scalars['String']>;
}

export interface IAsset {
  /** Group of the asset. */
  group?: Maybe<Scalars['String']>;
  /** The unique ID of the asset. */
  id: Scalars['String'];
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
}

export interface ITaxCategoryType {
  rates?: Maybe<Array<Maybe<ITaxRate>>>;
}

export interface ITaxRate {
  line?: Maybe<ITaxLine>;
  percentRate?: Maybe<Scalars['Decimal']>;
  rate?: Maybe<Scalars['Decimal']>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetail>>>;
  /** Tax provider code */
  taxProviderCode: Scalars['String'];
}

export interface ITaxLine {
  amount?: Maybe<Scalars['Decimal']>;
  code: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  price?: Maybe<Scalars['Decimal']>;
  quantity?: Maybe<Scalars['Int']>;
  taxType: Scalars['String'];
}

export interface ITaxDetail {
  amount?: Maybe<Scalars['Decimal']>;
  /** Tax detail name. */
  name: Scalars['String'];
  rate?: Maybe<Scalars['Decimal']>;
}

/** A connection from an object to a list of objects of type `ProductAssociation`. */
export interface IProductAssociationConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<IProductAssociationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<IProductAssociation>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** Information about pagination in a connection. */
export interface IPageInfo {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
}

/** An edge in a connection from an object to another object of type `ProductAssociation`. */
export interface IProductAssociationEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<IProductAssociation>;
}

/** product association. */
export interface IProductAssociation {
  /**
   * Each link element can have an associated object like Product, Category, etc.
   *             Is a primary key of associated object
   */
  associatedObjectId?: Maybe<Scalars['String']>;
  /** Associated object type : 'product', 'category' etc */
  associatedObjectType?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  product?: Maybe<IProduct>;
  quantity?: Maybe<Scalars['Int']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Association type (Accessories, Up-Sales, Cross-Sales, Related etc) */
  type?: Maybe<Scalars['String']>;
}

/** A connection from an object to a list of objects of type `Product`. */
export interface IProductConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<IProductEdge>>>;
  filter_facets?: Maybe<Array<Maybe<IFilterFacet>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<IProduct>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  range_facets?: Maybe<Array<Maybe<IRangeFacet>>>;
  term_facets?: Maybe<Array<Maybe<ITermFacet>>>;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** An edge in a connection from an object to another object of type `Product`. */
export interface IProductEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<IProduct>;
}

export interface IFilterFacet extends IFacet {
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
}

export enum FacetTypes {
  Terms = 'TERMS',
  Range = 'RANGE',
  Filter = 'FILTER'
}

export interface IFacet {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
}

export interface IRangeFacet extends IFacet {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Ranges */
  ranges?: Maybe<Array<Maybe<IFacetRangeType>>>;
}

export interface IFacetRangeType {
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
}

export interface ITermFacet extends IFacet {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Terms */
  terms?: Maybe<Array<Maybe<IFacetTermType>>>;
}

export interface IFacetTermType {
  /** count */
  count?: Maybe<Scalars['Long']>;
  /** is selected state */
  isSelected?: Maybe<Scalars['Boolean']>;
  /** term */
  term?: Maybe<Scalars['String']>;
}

/** A connection from an object to a list of objects of type `Category`. */
export interface ICategoryConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<ICategoryEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ICategory>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** An edge in a connection from an object to another object of type `Category`. */
export interface ICategoryEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ICategory>;
}

/** Organization info */
export interface IOrganization {
  addresses: Array<Maybe<IMemberAddressType>>;
  /** Business category */
  businessCategory?: Maybe<Scalars['String']>;
  contacts?: Maybe<IContactConnection>;
  /** Description */
  description?: Maybe<Scalars['String']>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Description */
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
}


/** Organization info */
export interface IOrganizationContactsArgs {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
}

export interface IMemberAddressType {
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city: Scalars['String'];
  /** Country code */
  countryCode: Scalars['String'];
  /** Country name */
  countryName: Scalars['String'];
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1: Scalars['String'];
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
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
}

/** A connection from an object to a list of objects of type `Contact`. */
export interface IContactConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<IContactEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<IContactType>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** An edge in a connection from an object to another object of type `Contact`. */
export interface IContactEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<IContactType>;
}

export interface IContactType {
  addresses?: Maybe<Array<Maybe<IMemberAddressType>>>;
  birthDate?: Maybe<Scalars['Date']>;
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  id: Scalars['String'];
  lastName: Scalars['String'];
  memberType: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  /** All contact's organizations */
  organizations?: Maybe<Array<Maybe<IOrganization>>>;
  organizationsIds: Array<Maybe<Scalars['String']>>;
  outerId?: Maybe<Scalars['String']>;
  securityAccounts?: Maybe<Array<Maybe<IUserType>>>;
}

export interface IUserType {
  accessFailedCount: Scalars['Int'];
  /** The associated contact info */
  contact?: Maybe<IContactType>;
  createdBy: Scalars['String'];
  createdDate: Scalars['Date'];
  email?: Maybe<Scalars['String']>;
  emailConfirmed: Scalars['Boolean'];
  id: Scalars['String'];
  isAdministrator: Scalars['Boolean'];
  lockoutEnabled: Scalars['Boolean'];
  lockoutEnd?: Maybe<Scalars['DateTime']>;
  memberId?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['Date']>;
  normalizedEmail?: Maybe<Scalars['String']>;
  normalizedUserName: Scalars['String'];
  passwordExpired: Scalars['Boolean'];
  passwordHash?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed: Scalars['Boolean'];
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<IRoleType>>>;
  securityStamp: Scalars['String'];
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled: Scalars['Boolean'];
  userName: Scalars['String'];
  userType: Scalars['String'];
}

export interface IRoleType {
  description: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  normalizedName: Scalars['String'];
  /** Permissions in Role */
  permissions: Array<Maybe<Scalars['String']>>;
}

export interface IExtendedCartType {
  addresses?: Maybe<Array<Maybe<IAddressType>>>;
  availablePaymentMethods?: Maybe<Array<Maybe<IPaymentMethodType>>>;
  availableShippingMethods?: Maybe<Array<Maybe<IShippingMethodType>>>;
  /** Shopping cart channel id */
  channelId?: Maybe<Scalars['String']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']>;
  coupons?: Maybe<Array<Maybe<ICouponType>>>;
  createdDate?: Maybe<Scalars['DateTime']>;
  currency?: Maybe<ICurrencyType>;
  /** Shopping cart user id */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  discounts?: Maybe<Array<Maybe<IDiscountType>>>;
  discountTotal?: Maybe<IMoneyType>;
  discountTotalWithTax?: Maybe<IMoneyType>;
  extendedPriceTotal?: Maybe<IMoneyType>;
  extendedPriceTotalWithTax?: Maybe<IMoneyType>;
  handlingTotal?: Maybe<IMoneyType>;
  handlingTotalWithTax?: Maybe<IMoneyType>;
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Shopping cart Id */
  id?: Maybe<Scalars['String']>;
  /** Sign that shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is shared */
  isShared: Scalars['Boolean'];
  /** Is cart valid */
  isValid?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<ILineItemType>>>;
  /** Count of different items */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Quantity of items */
  itemsQuantity?: Maybe<Scalars['Int']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart organization id */
  organizationId?: Maybe<Scalars['String']>;
  paymentPrice?: Maybe<IMoneyType>;
  paymentPriceWithTax?: Maybe<IMoneyType>;
  payments?: Maybe<Array<Maybe<IPaymentType>>>;
  paymentTotal?: Maybe<IMoneyType>;
  paymentTotalWithTax?: Maybe<IMoneyType>;
  shipments?: Maybe<Array<Maybe<IShipmentType>>>;
  shippingPrice?: Maybe<IMoneyType>;
  shippingPriceWithTax?: Maybe<IMoneyType>;
  shippingTotal?: Maybe<IMoneyType>;
  shippingTotalWithTax?: Maybe<IMoneyType>;
  /** Shopping cart status */
  status?: Maybe<Scalars['String']>;
  /** Shopping cart store id */
  storeId?: Maybe<Scalars['String']>;
  subTotal?: Maybe<IMoneyType>;
  subTotalWithTax?: Maybe<IMoneyType>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IMoneyType>;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']>;
  validationErrors?: Maybe<Array<Maybe<IValidationErrorType>>>;
  /** Shopping cart value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
}

export interface ITaxDetailType {
  amount?: Maybe<IMoneyType>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<IMoneyType>;
  rate?: Maybe<IMoneyType>;
}

export interface IShipmentType {
  currency?: Maybe<ICurrencyType>;
  deliveryAddress?: Maybe<IAddressType>;
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
  discounts?: Maybe<Array<Maybe<IDiscountType>>>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Shipment Id */
  id?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<ICartShipmentItemType>>>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  price?: Maybe<IMoneyType>;
  priceWithTax?: Maybe<IMoneyType>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IMoneyType>;
  totalWithTax?: Maybe<IMoneyType>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Value of weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
}

export interface IAddressType {
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city: Scalars['String'];
  /** Country code */
  countryCode: Scalars['String'];
  /** Country name */
  countryName: Scalars['String'];
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1: Scalars['String'];
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
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
}

export interface ICartShipmentItemType {
  lineItem?: Maybe<ILineItemType>;
  /** Quantity */
  quantity?: Maybe<Scalars['Int']>;
}

export interface ILineItemType {
  /** Value of catalog id */
  catalogId?: Maybe<Scalars['String']>;
  /** Value of category id */
  categoryId?: Maybe<Scalars['String']>;
  /** Line item created date */
  createdDate: Scalars['Date'];
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
  discounts?: Maybe<Array<Maybe<IDiscountType>>>;
  discountTotal?: Maybe<IMoneyType>;
  discountTotalWithTax?: Maybe<IMoneyType>;
  extendedPrice?: Maybe<IMoneyType>;
  extendedPriceWithTax?: Maybe<IMoneyType>;
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
  listPrice?: Maybe<IMoneyType>;
  listPriceWithTax?: Maybe<IMoneyType>;
  /** Value of measurement unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** Value of line item name */
  name?: Maybe<Scalars['String']>;
  /** Value of line item comment */
  note?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  objectType?: Maybe<Scalars['String']>;
  placedPrice?: Maybe<IMoneyType>;
  placedPriceWithTax?: Maybe<IMoneyType>;
  product?: Maybe<IProduct>;
  /** Value of product id */
  productId?: Maybe<Scalars['String']>;
  /** type of product (can be Physical, Digital or Subscription) */
  productType?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  quantity?: Maybe<Scalars['Int']>;
  /** requirement for line item shipping */
  requiredShipping?: Maybe<Scalars['Boolean']>;
  salePrice?: Maybe<IMoneyType>;
  salePriceWithTax?: Maybe<IMoneyType>;
  /** Value of line item shipping method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Value of product SKU */
  sku?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Value of total shipping tax amount */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Value of shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars['String']>;
  validationErrors?: Maybe<Array<Maybe<IValidationErrorType>>>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  warehouseLocation?: Maybe<Scalars['String']>;
  /** Value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
}

export interface IValidationErrorType {
  /** Error code */
  errorCode?: Maybe<Scalars['String']>;
  /** Error msg */
  errorMessage?: Maybe<Scalars['String']>;
  errorParameters?: Maybe<Array<Maybe<IErrorParameterType>>>;
  /** Object id */
  objectId?: Maybe<Scalars['String']>;
  /** Object type */
  objectType?: Maybe<Scalars['String']>;
}

export interface IErrorParameterType {
  /** key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
}

export interface IDiscountType {
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
}

export interface IShippingMethodType {
  /** Value of shipping gateway code */
  code?: Maybe<Scalars['String']>;
  currency?: Maybe<ICurrencyType>;
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars['String']>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars['String']>;
  price?: Maybe<IMoneyType>;
  priceWithTax?: Maybe<IMoneyType>;
  /** Value of shipping method priority */
  priority?: Maybe<Scalars['Int']>;
  total?: Maybe<IMoneyType>;
  totalWithTax?: Maybe<IMoneyType>;
}

export interface IPaymentType {
  amount?: Maybe<IMoneyType>;
  billingAddress?: Maybe<IAddressType>;
  currency?: Maybe<ICurrencyType>;
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
  discounts?: Maybe<Array<Maybe<IDiscountType>>>;
  /** Payment Id */
  id?: Maybe<Scalars['String']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode: Scalars['String'];
  price?: Maybe<IMoneyType>;
  priceWithTax?: Maybe<IMoneyType>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IMoneyType>;
  totalWithTax?: Maybe<IMoneyType>;
}

export interface IPaymentMethodType {
  /** Value of payment gateway code */
  code?: Maybe<Scalars['String']>;
  currency?: Maybe<ICurrencyType>;
  discountAmount?: Maybe<IMoneyType>;
  discountAmountWithTax?: Maybe<IMoneyType>;
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
  price?: Maybe<IMoneyType>;
  priceWithTax?: Maybe<IMoneyType>;
  /** Value of payment method priority */
  priority?: Maybe<Scalars['Int']>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IMoneyType>;
  totalWithTax?: Maybe<IMoneyType>;
}

export interface ICouponType {
  /** Coupon code */
  code?: Maybe<Scalars['String']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully?: Maybe<Scalars['Boolean']>;
}

/** A connection from an object to a list of objects of type `ExtendedCart`. */
export interface IExtendedCartConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<IExtendedCartEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<IExtendedCartType>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** An edge in a connection from an object to another object of type `ExtendedCart`. */
export interface IExtendedCartEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<IExtendedCartType>;
}

export interface ICustomerOrderType {
  addresses: Array<Maybe<IOrderAddressType>>;
  cancelledDate?: Maybe<Scalars['Date']>;
  cancelReason?: Maybe<Scalars['String']>;
  channelId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['Date'];
  currency?: Maybe<ICurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<IOrderMoneyType>;
  discountTotal?: Maybe<IOrderMoneyType>;
  discountTotalWithTax?: Maybe<IOrderMoneyType>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  fee: Scalars['Decimal'];
  feeTotal: Scalars['Decimal'];
  feeTotalWithTax: Scalars['Decimal'];
  feeWithTax: Scalars['Decimal'];
  id: Scalars['String'];
  inPayments: Array<Maybe<IPaymentInType>>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  /** Flag determines that the order is the prototype */
  isPrototype: Scalars['Boolean'];
  items: Array<Maybe<IOrderLineItemType>>;
  languageCode?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['Date']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  parentOperationId?: Maybe<Scalars['String']>;
  paymentDiscountTotal?: Maybe<IOrderMoneyType>;
  paymentDiscountTotalWithTax?: Maybe<IOrderMoneyType>;
  paymentSubTotal?: Maybe<IOrderMoneyType>;
  paymentSubTotalWithTax?: Maybe<IOrderMoneyType>;
  paymentTaxTotal?: Maybe<IOrderMoneyType>;
  paymentTotal?: Maybe<IOrderMoneyType>;
  paymentTotalWithTax?: Maybe<IOrderMoneyType>;
  shipments: Array<Maybe<IOrderShipmentType>>;
  shippingDiscountTotal?: Maybe<IOrderMoneyType>;
  shippingDiscountTotalWithTax?: Maybe<IOrderMoneyType>;
  shippingSubTotal?: Maybe<IOrderMoneyType>;
  shippingSubTotalWithTax?: Maybe<IOrderMoneyType>;
  shippingTaxTotal?: Maybe<IOrderMoneyType>;
  shippingTotal?: Maybe<IOrderMoneyType>;
  shippingTotalWithTax?: Maybe<IOrderMoneyType>;
  /** The basis shopping cart id of which the order was created */
  shoppingCartId?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  storeName?: Maybe<Scalars['String']>;
  /** Identifier for subscription  associated with this order */
  subscriptionId?: Maybe<Scalars['String']>;
  /** Number for subscription  associated with this order */
  subscriptionNumber?: Maybe<Scalars['String']>;
  subTotal?: Maybe<IOrderMoneyType>;
  subTotalDiscount?: Maybe<IOrderMoneyType>;
  subTotalDiscountWithTax?: Maybe<IOrderMoneyType>;
  subTotalTaxTotal?: Maybe<IOrderMoneyType>;
  subTotalWithTax?: Maybe<IOrderMoneyType>;
  taxDetails: Array<Maybe<IOrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<IOrderMoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IOrderMoneyType>;
}

export interface IOrderMoneyType {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars['Decimal'];
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
}

export interface IOrderAddressType {
  addressType?: Maybe<Scalars['Int']>;
  /** City */
  city: Scalars['String'];
  /** Country code */
  countryCode: Scalars['String'];
  /** Country name */
  countryName: Scalars['String'];
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1: Scalars['String'];
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
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
}

export interface IOrderLineItemType {
  cancelledDate?: Maybe<Scalars['Date']>;
  cancelReason?: Maybe<Scalars['String']>;
  catalogId: Scalars['String'];
  categoryId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<ICurrencyType>;
  discountAmount?: Maybe<IOrderMoneyType>;
  discountAmountWithTax?: Maybe<IOrderMoneyType>;
  discounts: Array<Maybe<IOrderDiscountType>>;
  discountTotal?: Maybe<IOrderMoneyType>;
  discountTotalWithTax?: Maybe<IOrderMoneyType>;
  extendedPrice?: Maybe<IOrderMoneyType>;
  extendedPriceWithTax?: Maybe<IOrderMoneyType>;
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
  placedPrice?: Maybe<IOrderMoneyType>;
  placedPriceWithTax?: Maybe<IOrderMoneyType>;
  /** unit price without discount and tax */
  price: Scalars['Decimal'];
  /** Price id */
  priceId?: Maybe<Scalars['String']>;
  priceWithTax: Scalars['Decimal'];
  product?: Maybe<IProduct>;
  productId: Scalars['String'];
  productType?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
  /** Reserve quantity */
  reserveQuantity: Scalars['Int'];
  shippingMethodCode?: Maybe<Scalars['String']>;
  sku: Scalars['String'];
  taxDetails: Array<Maybe<IOrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<IOrderMoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
}

export interface IOrderTaxDetailType {
  amount?: Maybe<IOrderMoneyType>;
  name: Scalars['String'];
  rate?: Maybe<IOrderMoneyType>;
}

export interface IOrderDiscountType {
  amount?: Maybe<IOrderMoneyType>;
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
}

export interface IPaymentInType {
  authorizedDate?: Maybe<Scalars['Date']>;
  billingAddress?: Maybe<IOrderAddressType>;
  cancelledDate?: Maybe<Scalars['Date']>;
  cancelReason?: Maybe<Scalars['String']>;
  capturedDate?: Maybe<Scalars['Date']>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['Date'];
  currency?: Maybe<ICurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  /** Payment method (gateway) code */
  gatewayCode?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  incomingDate?: Maybe<Scalars['Date']>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['Date']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  orderId?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  parentOperationId: Scalars['String'];
  paymentMethod?: Maybe<Scalars['String']>;
  purpose?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  sum?: Maybe<IOrderMoneyType>;
  tax?: Maybe<IOrderMoneyType>;
  voidedDate?: Maybe<Scalars['Date']>;
}

export interface IOrderShipmentType {
  cancelledDate?: Maybe<Scalars['Date']>;
  cancelReason?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<ICurrencyType>;
  customerOrderId?: Maybe<Scalars['String']>;
  deliveryAddress?: Maybe<IOrderAddressType>;
  discountAmount?: Maybe<IOrderMoneyType>;
  discountAmountWithTax?: Maybe<IOrderMoneyType>;
  discounts: Array<Maybe<IOrderDiscountType>>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  id: Scalars['String'];
  inPayments: Array<Maybe<IPaymentInType>>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  items: Array<Maybe<IOrderShipmentItemType>>;
  length?: Maybe<Scalars['Decimal']>;
  measureUnit?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  objectType: Scalars['String'];
  operationType: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  packages: Array<Maybe<IOrderShipmentPackageType>>;
  parentOperationId?: Maybe<Scalars['String']>;
  price?: Maybe<IOrderMoneyType>;
  priceWithTax?: Maybe<IOrderMoneyType>;
  /** Current shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Current shipment option code */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  shippingMethod?: Maybe<IOrderShippingMethodType>;
  status?: Maybe<Scalars['String']>;
  taxDetails: Array<Maybe<IOrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<IOrderMoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IOrderMoneyType>;
  totalWithTax?: Maybe<IOrderMoneyType>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
}

export interface IOrderShippingMethodType {
  code: Scalars['String'];
  id: Scalars['String'];
  isActive: Scalars['Boolean'];
  logoUrl: Scalars['String'];
  priority: Scalars['Int'];
  storeId: Scalars['String'];
  taxType?: Maybe<Scalars['String']>;
  typeName: Scalars['String'];
}

export interface IOrderShipmentItemType {
  barCode?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  lineItem?: Maybe<IOrderLineItemType>;
  lineItemId: Scalars['String'];
  outerId?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
}

export interface IOrderShipmentPackageType {
  barCode?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  id: Scalars['String'];
  items: Array<Maybe<IOrderShipmentItemType>>;
  length?: Maybe<Scalars['Decimal']>;
  measureUnit: Scalars['String'];
  packageType?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit: Scalars['String'];
  width?: Maybe<Scalars['Decimal']>;
}

/** A connection from an object to a list of objects of type `CustomerOrder`. */
export interface ICustomerOrderConnection {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<ICustomerOrderEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ICustomerOrderType>>>;
  /** Information to aid in pagination. */
  pageInfo: IPageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
}

/** An edge in a connection from an object to another object of type `CustomerOrder`. */
export interface ICustomerOrderEdge {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ICustomerOrderType>;
}

export interface IMutations {
  addCartAddress?: Maybe<Scalars['Boolean']>;
  addCoupon?: Maybe<ICartType>;
  addItem?: Maybe<ICartType>;
  addItemsCart?: Maybe<Scalars['Boolean']>;
  addOrUpdateCartAddress?: Maybe<ICartType>;
  addOrUpdateCartPayment?: Maybe<ICartType>;
  addOrUpdateCartShipment?: Maybe<ICartType>;
  addSavedCart?: Maybe<Scalars['Boolean']>;
  cancelOrderPayment?: Maybe<Scalars['Boolean']>;
  changeCartItemComment?: Maybe<ICartType>;
  changeCartItemPrice?: Maybe<ICartType>;
  changeCartItemQuantity?: Maybe<ICartType>;
  changeComment?: Maybe<ICartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']>;
  clearCart?: Maybe<ICartType>;
  clearPayments?: Maybe<ICartType>;
  clearShipments?: Maybe<ICartType>;
  confirmOrderPayment?: Maybe<Scalars['Boolean']>;
  createContact?: Maybe<IContactType>;
  createOrderFromCart?: Maybe<ICustomerOrderType>;
  createOrganization?: Maybe<IOrganization>;
  createUser?: Maybe<IIdentityResultType>;
  deleteContact?: Maybe<Scalars['Boolean']>;
  deleteUsers?: Maybe<IIdentityResultType>;
  editSavedCart?: Maybe<Scalars['Boolean']>;
  mergeCart?: Maybe<ICartType>;
  removeCart?: Maybe<Scalars['Boolean']>;
  removeCartAddress?: Maybe<ICartType>;
  removeCartItem?: Maybe<ICartType>;
  removeCoupon?: Maybe<ICartType>;
  removeSavedCart?: Maybe<Scalars['Boolean']>;
  removeShipment?: Maybe<ICartType>;
  updateAddresses?: Maybe<IContactType>;
  updateContact?: Maybe<IContactType>;
  updateOrganization?: Maybe<IOrganization>;
  updateRole?: Maybe<IIdentityResultType>;
  updateUser?: Maybe<IIdentityResultType>;
  validateCoupon?: Maybe<Scalars['Boolean']>;
}


export interface IMutationsAddCartAddressArgs {
  command: IInputAddCartAddress;
}


export interface IMutationsAddCouponArgs {
  command: IInputAddCouponType;
}


export interface IMutationsAddItemArgs {
  command: IInputAddItemType;
}


export interface IMutationsAddItemsCartArgs {
  command: IInputAddItemsType;
}


export interface IMutationsAddOrUpdateCartAddressArgs {
  command: IInputAddOrUpdateCartAddressType;
}


export interface IMutationsAddOrUpdateCartPaymentArgs {
  command: IInputAddOrUpdateCartPaymentType;
}


export interface IMutationsAddOrUpdateCartShipmentArgs {
  command: IInputAddOrUpdateCartShipmentType;
}


export interface IMutationsAddSavedCartArgs {
  command: IInputAddSavedCartType;
}


export interface IMutationsCancelOrderPaymentArgs {
  command: IInputCancelOrderPaymentType;
}


export interface IMutationsChangeCartItemCommentArgs {
  command?: Maybe<IInputChangeCartItemCommentType>;
}


export interface IMutationsChangeCartItemPriceArgs {
  command: IInputChangeCartItemPriceType;
}


export interface IMutationsChangeCartItemQuantityArgs {
  command: IInputChangeCartItemQuantityType;
}


export interface IMutationsChangeCommentArgs {
  command?: Maybe<IInputChangeCommentType>;
}


export interface IMutationsChangeOrderStatusArgs {
  command: IInputChangeOrderStatusType;
}


export interface IMutationsClearCartArgs {
  command: IInputClearCartType;
}


export interface IMutationsClearPaymentsArgs {
  command: IInputClearPaymentsType;
}


export interface IMutationsClearShipmentsArgs {
  command: IInputClearShipmentsType;
}


export interface IMutationsConfirmOrderPaymentArgs {
  command: IInputConfirmOrderPaymentType;
}


export interface IMutationsCreateContactArgs {
  command: IInputCreateContactType;
}


export interface IMutationsCreateOrderFromCartArgs {
  command: IInputCreateOrderFromCartType;
}


export interface IMutationsCreateOrganizationArgs {
  command: IInputCreateOrganizationType;
}


export interface IMutationsCreateUserArgs {
  command: IInputCreateUserType;
}


export interface IMutationsDeleteContactArgs {
  command: IInputDeleteContactType;
}


export interface IMutationsDeleteUsersArgs {
  command: IInputDeleteUserType;
}


export interface IMutationsEditSavedCartArgs {
  command: IInputEditSavedCartType;
}


export interface IMutationsMergeCartArgs {
  command: IInputMergeCartType;
}


export interface IMutationsRemoveCartArgs {
  command: IInputRemoveCartType;
}


export interface IMutationsRemoveCartAddressArgs {
  command: IInputRemoveCartAddressType;
}


export interface IMutationsRemoveCartItemArgs {
  command: IInputRemoveItemType;
}


export interface IMutationsRemoveCouponArgs {
  command: IInputRemoveCouponType;
}


export interface IMutationsRemoveSavedCartArgs {
  command: IInputRemoveSavedCartType;
}


export interface IMutationsRemoveShipmentArgs {
  command: IInputRemoveShipmentType;
}


export interface IMutationsUpdateAddressesArgs {
  command: IInputUpdateContactAddressType;
}


export interface IMutationsUpdateContactArgs {
  command: IInputUpdateContactType;
}


export interface IMutationsUpdateOrganizationArgs {
  command: IInputUpdateOrganizationType;
}


export interface IMutationsUpdateRoleArgs {
  command: IInputUpdateRoleType;
}


export interface IMutationsUpdateUserArgs {
  command: IInputUpdateUserType;
}


export interface IMutationsValidateCouponArgs {
  command: IInputValidateCouponType;
}

export interface IInputUpdateContactAddressType {
  contactId: Scalars['String'];
  userId: Scalars['String'];
  addresses: Array<Maybe<IInputMemberAddressType>>;
}

export interface IInputMemberAddressType {
  /** City */
  city: Scalars['String'];
  /** Country code */
  countryCode: Scalars['String'];
  /** Country name */
  countryName: Scalars['String'];
  /** Email */
  email?: Maybe<Scalars['String']>;
  /** First name */
  firstName?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  /** key */
  key?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1: Scalars['String'];
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Company name */
  organization?: Maybe<Scalars['String']>;
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
  addressType?: Maybe<Scalars['Int']>;
}

export interface IInputUpdateOrganizationType {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<IInputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  userId: Scalars['String'];
}

export interface IInputCreateOrganizationType {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<IInputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  userId: Scalars['String'];
}

export interface IInputCreateContactType {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<IInputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  userId: Scalars['String'];
  fullName?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  salutation?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['String']>;
  defaultLanguage?: Maybe<Scalars['String']>;
  organizations?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface IInputUpdateContactType {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<IInputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  userId: Scalars['String'];
  fullName?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  salutation?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['String']>;
  defaultLanguage?: Maybe<Scalars['String']>;
  organizations?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface IInputDeleteContactType {
  userId: Scalars['String'];
  contactId: Scalars['String'];
}

export interface IIdentityResultType {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IIdentityErrorType>>>;
  succeeded: Scalars['Boolean'];
}

export interface IIdentityErrorType {
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
}

export interface IInputCreateUserType {
  userId: Scalars['String'];
  createdBy?: Maybe<Scalars['String']>;
  createdDate?: Maybe<Scalars['Date']>;
  email: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  isAdministrator?: Maybe<Scalars['Boolean']>;
  lockoutEnabled?: Maybe<Scalars['Boolean']>;
  lockoutEnd?: Maybe<Scalars['DateTimeOffset']>;
  logins?: Maybe<Array<Maybe<IInputApplicationUserLoginType>>>;
  memberId?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed?: Maybe<Scalars['Boolean']>;
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<IInputAssignRoleType>>>;
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  userName: Scalars['String'];
  userType: Scalars['String'];
}

export interface IInputApplicationUserLoginType {
  loginProvider: Scalars['String'];
  providerKey: Scalars['String'];
}

export interface IInputAssignRoleType {
  concurrencyStamp?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  permissions: Array<Maybe<IInputAssignPermissionType>>;
}

export interface IInputAssignPermissionType {
  assignedScopes?: Maybe<Array<Maybe<IInputAssignPermissionScopeType>>>;
  name: Scalars['String'];
}

export interface IInputAssignPermissionScopeType {
  scope: Scalars['String'];
  type: Scalars['String'];
}

export interface IInputUpdateUserType {
  userId: Scalars['String'];
  accessFailedCount?: Maybe<Scalars['Int']>;
  email: Scalars['String'];
  id: Scalars['String'];
  isAdministrator?: Maybe<Scalars['Boolean']>;
  lockoutEnabled?: Maybe<Scalars['Boolean']>;
  lockoutEnd?: Maybe<Scalars['DateTimeOffset']>;
  memberId?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed?: Maybe<Scalars['Boolean']>;
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<IInputAssignRoleType>>>;
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  userName: Scalars['String'];
  userType: Scalars['String'];
  passwordHash?: Maybe<Scalars['String']>;
  securityStamp: Scalars['String'];
}

export interface IInputDeleteUserType {
  userId: Scalars['String'];
  userNames: Array<Maybe<Scalars['String']>>;
}

export interface IInputUpdateRoleType {
  userId: Scalars['String'];
  concurrencyStamp?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  permissions: Array<Maybe<IInputAssignPermissionType>>;
}

export interface ICartType {
  addresses?: Maybe<Array<Maybe<IAddressType>>>;
  availablePaymentMethods?: Maybe<Array<Maybe<IPaymentMethodType>>>;
  availableShippingMethods?: Maybe<Array<Maybe<IShippingMethodType>>>;
  /** Shopping cart channel id */
  channelId?: Maybe<Scalars['String']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']>;
  coupons?: Maybe<Array<Maybe<ICouponType>>>;
  currency?: Maybe<ICurrencyType>;
  /** Shopping cart user id */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  discounts?: Maybe<Array<Maybe<IDiscountType>>>;
  discountTotal?: Maybe<IMoneyType>;
  discountTotalWithTax?: Maybe<IMoneyType>;
  extendedPriceTotal?: Maybe<IMoneyType>;
  extendedPriceTotalWithTax?: Maybe<IMoneyType>;
  handlingTotal?: Maybe<IMoneyType>;
  handlingTotalWithTax?: Maybe<IMoneyType>;
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Shopping cart Id */
  id?: Maybe<Scalars['String']>;
  /** Sign that shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /** Is cart valid */
  isValid?: Maybe<Scalars['Boolean']>;
  items?: Maybe<Array<Maybe<ILineItemType>>>;
  /** Count of different items */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Quantity of items */
  itemsQuantity?: Maybe<Scalars['Int']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart organization id */
  organizationId?: Maybe<Scalars['String']>;
  paymentPrice?: Maybe<IMoneyType>;
  paymentPriceWithTax?: Maybe<IMoneyType>;
  payments?: Maybe<Array<Maybe<IPaymentType>>>;
  paymentTotal?: Maybe<IMoneyType>;
  paymentTotalWithTax?: Maybe<IMoneyType>;
  shipments?: Maybe<Array<Maybe<IShipmentType>>>;
  shippingPrice?: Maybe<IMoneyType>;
  shippingPriceWithTax?: Maybe<IMoneyType>;
  shippingTotal?: Maybe<IMoneyType>;
  shippingTotalWithTax?: Maybe<IMoneyType>;
  /** Shopping cart status */
  status?: Maybe<Scalars['String']>;
  /** Shopping cart store id */
  storeId?: Maybe<Scalars['String']>;
  subTotal?: Maybe<IMoneyType>;
  subTotalWithTax?: Maybe<IMoneyType>;
  taxDetails?: Maybe<Array<Maybe<ITaxDetailType>>>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  taxTotal?: Maybe<IMoneyType>;
  /** Shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<IMoneyType>;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']>;
  validationErrors?: Maybe<Array<Maybe<IValidationErrorType>>>;
  /** Shopping cart value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
}

export interface IInputAddItemType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  productId: Scalars['String'];
  quantity: Scalars['Int'];
  price?: Maybe<Scalars['Decimal']>;
  comment?: Maybe<Scalars['String']>;
}

export interface IInputClearCartType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
}

export interface IInputChangeCommentType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
}

export interface IInputChangeCartItemPriceType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  productId: Scalars['String'];
  price: Scalars['Decimal'];
}

export interface IInputChangeCartItemQuantityType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  quantity: Scalars['Int'];
}

export interface IInputChangeCartItemCommentType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  comment: Scalars['Int'];
}

export interface IInputRemoveItemType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
}

export interface IInputAddCouponType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode: Scalars['String'];
}

export interface IInputRemoveCouponType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode?: Maybe<Scalars['String']>;
}

export interface IInputRemoveShipmentType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipmentId?: Maybe<Scalars['String']>;
}

export interface IInputAddOrUpdateCartShipmentType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipment: IInputShipmentType;
}

export interface IInputShipmentType {
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  /** Shipment method code */
  shipmentMethodCode: Scalars['String'];
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Value of weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
  deliveryAddress?: Maybe<IInputAddressType>;
  currency?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Decimal']>;
}

export interface IInputAddressType {
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
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Postal code */
  postalCode?: Maybe<Scalars['String']>;
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
  addressType?: Maybe<Scalars['Int']>;
}

export interface IInputAddOrUpdateCartPaymentType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  payment: IInputPaymentType;
}

export interface IInputPaymentType {
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode: Scalars['String'];
  billingAddress?: Maybe<IInputAddressType>;
  currency?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Decimal']>;
  amount?: Maybe<Scalars['Decimal']>;
}

export interface IInputValidateCouponType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  coupon: Scalars['String'];
}

export interface IInputMergeCartType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  secondCartId: Scalars['String'];
}

export interface IInputRemoveCartType {
  cartId: Scalars['String'];
}

export interface IInputClearShipmentsType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
}

export interface IInputClearPaymentsType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
}

export interface IInputAddOrUpdateCartAddressType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  address: IInputAddressType;
}

export interface IInputRemoveCartAddressType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  addressId: Scalars['String'];
}

export interface IInputCreateOrderFromCartType {
  cartId?: Maybe<Scalars['String']>;
}

export interface IInputChangeOrderStatusType {
  orderId?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
}

export interface IInputConfirmOrderPaymentType {
  payment: IInputPaymentInType;
}

export interface IInputPaymentInType {
  id?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  operationType: Scalars['String'];
  number: Scalars['String'];
  isApproved: Scalars['Boolean'];
  status?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  cancelledDate?: Maybe<Scalars['Date']>;
  cancelReason?: Maybe<Scalars['String']>;
  parentOperationId?: Maybe<Scalars['String']>;
  objectType?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  customerName?: Maybe<Scalars['String']>;
  customerId: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  /** Payment method (gateway) code */
  gatewayCode?: Maybe<Scalars['String']>;
  incomingDate?: Maybe<Scalars['Date']>;
  authorizedDate?: Maybe<Scalars['Date']>;
  capturedDate?: Maybe<Scalars['Date']>;
  voidedDate?: Maybe<Scalars['Date']>;
  orderId?: Maybe<Scalars['String']>;
  sum: Scalars['Decimal'];
  taxTotal: Scalars['Decimal'];
  currency: Scalars['String'];
  paymentStatus?: Maybe<Scalars['Int']>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails: Array<Maybe<IInputOrderTaxDetailType>>;
  discounts: Array<Maybe<IInputOrderDiscountType>>;
  paymentMethod?: Maybe<IInputOrderPaymentMethodType>;
  billingAddress?: Maybe<IInputOrderAddressType>;
}

export interface IInputOrderTaxDetailType {
  rate: Scalars['Decimal'];
  amount: Scalars['Decimal'];
  name: Scalars['String'];
}

export interface IInputOrderDiscountType {
  discountAmount: Scalars['Decimal'];
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  currency: Scalars['String'];
  discountAmountWithTax: Scalars['Decimal'];
}

export interface IInputOrderPaymentMethodType {
  id: Scalars['String'];
  taxDetails?: Maybe<Array<Maybe<IInputOrderTaxDetailType>>>;
  taxTotal: Scalars['Decimal'];
  typeName?: Maybe<Scalars['String']>;
  storeId?: Maybe<Scalars['String']>;
  discountAmountWithTax: Scalars['Decimal'];
  discountAmount: Scalars['Decimal'];
  totalWithTax: Scalars['Decimal'];
  total: Scalars['Decimal'];
  priceWithTax: Scalars['Decimal'];
  price: Scalars['Decimal'];
  currency?: Maybe<Scalars['String']>;
  isAvailableForPartial: Scalars['Boolean'];
  priority: Scalars['Int'];
  isActive: Scalars['Boolean'];
  logoUrl?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  code: Scalars['String'];
  paymentMethodType?: Maybe<Scalars['Int']>;
  paymentMethodGroupType?: Maybe<Scalars['Int']>;
}

export interface IInputOrderAddressType {
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
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Postal code */
  postalCode?: Maybe<Scalars['String']>;
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
  addressType?: Maybe<Scalars['Int']>;
}

export interface IInputCancelOrderPaymentType {
  payment: IInputPaymentInType;
}

export interface IInputAddSavedCartType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  isShare?: Maybe<Scalars['Boolean']>;
}

export interface IInputEditSavedCartType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  editCartId: Scalars['String'];
  editCartName: Scalars['String'];
  isShare?: Maybe<Scalars['Boolean']>;
}

export interface IInputRemoveSavedCartType {
  removeSavedCartId: Scalars['String'];
}

export interface IInputAddItemsType {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  addCartItems: Array<Maybe<IInputNewCartItemType>>;
}

export interface IInputNewCartItemType {
  /** Product Id */
  productId: Scalars['String'];
  /** Product qty */
  quantity?: Maybe<Scalars['Int']>;
}

export interface IInputAddCartAddress {
  cartId: Scalars['String'];
  userId: Scalars['String'];
  language: Scalars['String'];
  address: IInputAddressType;
}

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Long: any;
  /** The `DateTime` scalar type represents a date and time. `DateTime` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTime: any;
  Decimal: any;
  /** The `Date` scalar type represents a year, month and day in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  Date: any;
  /** The `DateTimeOffset` scalar type represents a date, time and offset from UTC. `DateTimeOffset` expects timestamps to be formatted in accordance with the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) standard. */
  DateTimeOffset: any;
};

export type Query = {
  cart?: Maybe<CartType>;
  carts?: Maybe<CartConnection>;
  categories?: Maybe<CategoryConnection>;
  category?: Maybe<Category>;
  contact?: Maybe<ContactType>;
  me?: Maybe<UserType>;
  order?: Maybe<CustomerOrderType>;
  orders?: Maybe<CustomerOrderConnection>;
  organization?: Maybe<Organization>;
  payments?: Maybe<PaymentInConnection>;
  product?: Maybe<Product>;
  products?: Maybe<ProductConnection>;
  role?: Maybe<RoleType>;
  user?: Maybe<UserType>;
};


export type QueryCartArgs = {
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  cartName?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};


export type QueryCartsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type QueryCategoriesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  fuzzy?: Maybe<Scalars['Boolean']>;
  fuzzyLevel?: Maybe<Scalars['Int']>;
  facet?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  categoryIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type QueryCategoryArgs = {
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryContactArgs = {
  id: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
};


export type QueryOrderArgs = {
  id?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryOrdersArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
};


export type QueryPaymentsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
};


export type QueryProductArgs = {
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryProductsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  fuzzy?: Maybe<Scalars['Boolean']>;
  fuzzyLevel?: Maybe<Scalars['Int']>;
  facet?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  productIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type QueryRoleArgs = {
  roleName: Scalars['String'];
};


export type QueryUserArgs = {
  id?: Maybe<Scalars['String']>;
  userName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  loginProvider?: Maybe<Scalars['String']>;
  providerKey?: Maybe<Scalars['String']>;
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  assets?: Maybe<Array<Maybe<Asset>>>;
  associations?: Maybe<ProductAssociationConnection>;
  availabilityData?: Maybe<AvailabilityData>;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']>;
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
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  query?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionArgs = {
  type?: Maybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionsArgs = {
  type?: Maybe<Scalars['String']>;
};

export type SeoInfo = {
  id?: Maybe<Scalars['String']>;
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

export type Category = {
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
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** Request related slug for category */
  slug?: Maybe<Scalars['String']>;
};

/**
 * Represents the path from the catalog to one of the child objects (product or category):
 *             catalog/parent-category1/.../parent-categoryN/object
 */
export type OutlineType = {
  items?: Maybe<Array<Maybe<OutlineItemType>>>;
};

/** Represents one outline element: catalog, category or product. */
export type OutlineItemType = {
  /** Object id */
  id: Scalars['String'];
  /** The name of current item */
  name?: Maybe<Scalars['String']>;
  seoInfos?: Maybe<Array<Maybe<SeoInfo>>>;
  /** Object type */
  seoObjectType?: Maybe<Scalars['String']>;
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

export type VariationType = {
  assets?: Maybe<Array<Maybe<Asset>>>;
  availabilityData?: Maybe<AvailabilityData>;
  /** SKU of variation. */
  code?: Maybe<Scalars['String']>;
  /** Id of variation. */
  id?: Maybe<Scalars['String']>;
  images?: Maybe<Array<Maybe<ImageType>>>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  price?: Maybe<PriceType>;
  prices?: Maybe<Array<Maybe<PriceType>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
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


export type PriceType = {
  actual?: Maybe<MoneyType>;
  actualWithTax?: Maybe<MoneyType>;
  currency?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  /** Relative benefit. 30% */
  discountPercent?: Maybe<Scalars['Decimal']>;
  discounts?: Maybe<Array<Maybe<CatalogDiscountType>>>;
  list?: Maybe<MoneyType>;
  listWithTax?: Maybe<MoneyType>;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']>;
  sale?: Maybe<MoneyType>;
  saleWithTax?: Maybe<MoneyType>;
  tierPrices?: Maybe<Array<Maybe<TierPriceType>>>;
  validFrom?: Maybe<Scalars['Date']>;
  validUntil?: Maybe<Scalars['Date']>;
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


/** Currency */
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


export type TierPriceType = {
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  quantity?: Maybe<Scalars['Long']>;
};

export type CatalogDiscountType = {
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  promotion?: Maybe<Promotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
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
  type?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  valueId?: Maybe<Scalars['String']>;
  valueType?: Maybe<Scalars['String']>;
};

export type Asset = {
  cultureName?: Maybe<Scalars['String']>;
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
};

/** A connection from an object to a list of objects of type `ProductAssociation`. */
export type ProductAssociationConnection = {
  /** Information to aid in pagination. */
  edges?: Maybe<Array<Maybe<ProductAssociationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductAssociation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
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

/** An edge in a connection from an object to another object of type `ProductAssociation`. */
export type ProductAssociationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ProductAssociation>;
};

/** product association. */
export type ProductAssociation = {
  /**
   * Each link element can have an associated object like Product, Category, etc.
   *             Is a primary key of associated object
   */
  associatedObjectId?: Maybe<Scalars['String']>;
  /** Associated object type : 'product', 'category' etc */
  associatedObjectType?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars['Int']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Association type (Accessories, Up-Sales, Cross-Sales, Related etc) */
  type?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `Product`. */
export type ProductConnection = {
  /** Information to aid in pagination. */
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

export type FilterFacet = Facet & {
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  label: Scalars['String'];
  /** The key/name  of the facet. */
  name: Scalars['String'];
};

export enum FacetTypes {
  Terms = 'TERMS',
  Range = 'RANGE',
  Filter = 'FILTER'
}

export type Facet = {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
};

export type RangeFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Ranges */
  ranges?: Maybe<Array<Maybe<FacetRangeType>>>;
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

export type TermFacet = Facet & {
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Terms */
  terms?: Maybe<Array<Maybe<FacetTermType>>>;
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

/** A connection from an object to a list of objects of type `Category`. */
export type CategoryConnection = {
  /** Information to aid in pagination. */
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
  lockoutEnabled: Scalars['Boolean'];
  lockoutEnd?: Maybe<Scalars['DateTime']>;
  memberId?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  normalizedEmail?: Maybe<Scalars['String']>;
  normalizedUserName?: Maybe<Scalars['String']>;
  passwordExpired: Scalars['Boolean'];
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

export type RoleType = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  normalizedName: Scalars['String'];
  /** Permissions in Role */
  permissions: Array<Maybe<Scalars['String']>>;
};

export type ContactType = {
  addresses?: Maybe<Array<Maybe<MemberAddressType>>>;
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
  organizations?: Maybe<Array<Maybe<Organization>>>;
  organizationsIds: Array<Maybe<Scalars['String']>>;
  outerId?: Maybe<Scalars['String']>;
  phones: Array<Maybe<Scalars['String']>>;
  securityAccounts?: Maybe<Array<Maybe<UserType>>>;
};

export type MemberAddressType = {
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
};

/** Organization info */
export type Organization = {
  addresses: Array<Maybe<MemberAddressType>>;
  /** Business category */
  businessCategory?: Maybe<Scalars['String']>;
  contacts?: Maybe<ContactConnection>;
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
};


/** Organization info */
export type OrganizationContactsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `Contact`. */
export type ContactConnection = {
  /** Information to aid in pagination. */
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

export type CartType = {
  addresses?: Maybe<Array<Maybe<AddressType>>>;
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
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  extendedPriceTotal?: Maybe<MoneyType>;
  extendedPriceTotalWithTax?: Maybe<MoneyType>;
  handlingTotal?: Maybe<MoneyType>;
  handlingTotalWithTax?: Maybe<MoneyType>;
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Shopping cart Id */
  id?: Maybe<Scalars['String']>;
  /** Sign that shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /** Is cart valid */
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
  payments?: Maybe<Array<Maybe<PaymentType>>>;
  paymentTotal?: Maybe<MoneyType>;
  paymentTotalWithTax?: Maybe<MoneyType>;
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
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Shopping cart value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
};

export type TaxDetailType = {
  amount?: Maybe<MoneyType>;
  name?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  rate?: Maybe<MoneyType>;
};

export type ShipmentType = {
  currency?: Maybe<CurrencyType>;
  deliveryAddress?: Maybe<AddressType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
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

export type AddressType = {
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
  postalCode: Scalars['String'];
  /** Region id */
  regionId?: Maybe<Scalars['String']>;
  /** Region name */
  regionName?: Maybe<Scalars['String']>;
  /** Zip */
  zip?: Maybe<Scalars['String']>;
};

export type CartShipmentItemType = {
  lineItem?: Maybe<LineItemType>;
  /** Quantity */
  quantity?: Maybe<Scalars['Int']>;
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
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  extendedPrice?: Maybe<MoneyType>;
  extendedPriceWithTax?: Maybe<MoneyType>;
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

export type ErrorParameterType = {
  /** key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
};

export type DiscountType = {
  amount?: Maybe<Scalars['Decimal']>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
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

export type PaymentType = {
  amount?: Maybe<MoneyType>;
  billingAddress?: Maybe<AddressType>;
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
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

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars['String']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully?: Maybe<Scalars['Boolean']>;
};

/** A connection from an object to a list of objects of type `Cart`. */
export type CartConnection = {
  /** Information to aid in pagination. */
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

export type CustomerOrderType = {
  addresses: Array<Maybe<OrderAddressType>>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  channelId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  currency?: Maybe<CurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  discountAmount?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  fee: Scalars['Decimal'];
  feeTotal: Scalars['Decimal'];
  feeTotalWithTax: Scalars['Decimal'];
  feeWithTax: Scalars['Decimal'];
  id: Scalars['String'];
  inPayments: Array<Maybe<PaymentInType>>;
  isApproved: Scalars['Boolean'];
  isCancelled: Scalars['Boolean'];
  /** Flag determines that the order is the prototype */
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
  shipments?: Maybe<Array<Maybe<OrderShipmentType>>>;
  shippingDiscountTotal?: Maybe<MoneyType>;
  shippingDiscountTotalWithTax?: Maybe<MoneyType>;
  shippingSubTotal?: Maybe<MoneyType>;
  shippingSubTotalWithTax?: Maybe<MoneyType>;
  shippingTaxTotal?: Maybe<MoneyType>;
  shippingTotal?: Maybe<MoneyType>;
  shippingTotalWithTax?: Maybe<MoneyType>;
  /** The basis shopping cart id of which the order was created */
  shoppingCartId?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  storeName?: Maybe<Scalars['String']>;
  /** Identifier for subscription  associated with this order */
  subscriptionId?: Maybe<Scalars['String']>;
  /** Number for subscription  associated with this order */
  subscriptionNumber?: Maybe<Scalars['String']>;
  subTotal?: Maybe<MoneyType>;
  subTotalDiscount?: Maybe<MoneyType>;
  subTotalDiscountWithTax?: Maybe<MoneyType>;
  subTotalTaxTotal?: Maybe<MoneyType>;
  subTotalWithTax?: Maybe<MoneyType>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
};

export type OrderAddressType = {
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
};

export type OrderLineItemType = {
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  catalogId: Scalars['String'];
  categoryId?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts: Array<Maybe<OrderDiscountType>>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
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
  /** Price id */
  priceId?: Maybe<Scalars['String']>;
  priceWithTax?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  productId: Scalars['String'];
  productType?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
  /** Reserve quantity */
  reserveQuantity: Scalars['Int'];
  shippingMethodCode?: Maybe<Scalars['String']>;
  sku: Scalars['String'];
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
};

export type OrderTaxDetailType = {
  amount?: Maybe<MoneyType>;
  name: Scalars['String'];
  rate?: Maybe<MoneyType>;
};

export type OrderDiscountType = {
  amount?: Maybe<MoneyType>;
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
};

export type PaymentInType = {
  authorizedDate?: Maybe<Scalars['DateTime']>;
  billingAddress?: Maybe<OrderAddressType>;
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  capturedDate?: Maybe<Scalars['DateTime']>;
  comment?: Maybe<Scalars['String']>;
  createdBy?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  currency?: Maybe<CurrencyType>;
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  /** Payment method (gateway) code */
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
  orderId?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  parentOperationId?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<OrderPaymentMethodType>;
  purpose?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  sum?: Maybe<MoneyType>;
  tax?: Maybe<MoneyType>;
  transactions?: Maybe<Array<Maybe<PaymentTransactionType>>>;
  voidedDate?: Maybe<Scalars['DateTime']>;
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

export type PaymentTransactionType = {
  amount?: Maybe<MoneyType>;
  /** Gateway IP address */
  gatewayIpAddress: Scalars['String'];
  id: Scalars['String'];
  /** Flag represent that current transaction is processed */
  isProcessed: Scalars['Boolean'];
  note: Scalars['String'];
  processAttemptCount: Scalars['Int'];
  /** Date when this transaction was handled */
  processedDate?: Maybe<Scalars['DateTime']>;
  processError?: Maybe<Scalars['String']>;
  /** Raw request data */
  requestData: Scalars['String'];
  /** Gateway or VC response status code */
  responseCode: Scalars['String'];
  /** Raw response data */
  responseData: Scalars['String'];
  /** "Active", "Expired", and "Inactive" or other */
  status: Scalars['String'];
  /**
   * The type of payment interaction.The payment can be Capture or CheckReceived.
   *             The value also includes customer payment interactions such as Website, Call, Store, or Unknown.
   */
  type: Scalars['String'];
};

export type OrderShipmentType = {
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  customerOrderId?: Maybe<Scalars['String']>;
  deliveryAddress?: Maybe<OrderAddressType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discounts: Array<Maybe<OrderDiscountType>>;
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
  /** Current shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Current shipment option code */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  shippingMethod?: Maybe<OrderShippingMethodType>;
  status?: Maybe<Scalars['String']>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  weight?: Maybe<Scalars['Decimal']>;
  weightUnit?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Decimal']>;
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

/** A connection from an object to a list of objects of type `CustomerOrder`. */
export type CustomerOrderConnection = {
  /** Information to aid in pagination. */
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

/** A connection from an object to a list of objects of type `PaymentIn`. */
export type PaymentInConnection = {
  /** Information to aid in pagination. */
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

export type Mutations = {
  addCoupon?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  cancelOrderPayment?: Maybe<Scalars['Boolean']>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']>;
  clearCart?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  clearShipments?: Maybe<CartType>;
  confirmOrderPayment?: Maybe<Scalars['Boolean']>;
  createContact?: Maybe<ContactType>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  createOrganization?: Maybe<Organization>;
  createUser?: Maybe<IdentityResultType>;
  deleteContact?: Maybe<Scalars['Boolean']>;
  deleteUsers?: Maybe<IdentityResultType>;
  mergeCart?: Maybe<CartType>;
  removeCart?: Maybe<Scalars['Boolean']>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeShipment?: Maybe<CartType>;
  updateAddresses?: Maybe<ContactType>;
  updateContact?: Maybe<ContactType>;
  updateOrganization?: Maybe<Organization>;
  updatePersonalData?: Maybe<IdentityResultType>;
  updateRole?: Maybe<IdentityResultType>;
  updateUser?: Maybe<IdentityResultType>;
  validateCoupon?: Maybe<Scalars['Boolean']>;
};


export type MutationsAddCouponArgs = {
  command: InputAddCouponType;
};


export type MutationsAddItemArgs = {
  command: InputAddItemType;
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


export type MutationsCancelOrderPaymentArgs = {
  command: InputCancelOrderPaymentType;
};


export type MutationsChangeCartItemCommentArgs = {
  command?: Maybe<InputChangeCartItemCommentType>;
};


export type MutationsChangeCartItemPriceArgs = {
  command: InputChangeCartItemPriceType;
};


export type MutationsChangeCartItemQuantityArgs = {
  command: InputChangeCartItemQuantityType;
};


export type MutationsChangeCommentArgs = {
  command?: Maybe<InputChangeCommentType>;
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


export type MutationsConfirmOrderPaymentArgs = {
  command: InputConfirmOrderPaymentType;
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


export type MutationsMergeCartArgs = {
  command: InputMergeCartType;
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


export type MutationsUpdateAddressesArgs = {
  command: InputUpdateContactAddressType;
};


export type MutationsUpdateContactArgs = {
  command: InputUpdateContactType;
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

export type InputUpdateContactAddressType = {
  contactId: Scalars['String'];
  addresses: Array<Maybe<InputMemberAddressType>>;
};

export type InputMemberAddressType = {
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
};

export type InputUpdateOrganizationType = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<InputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type InputCreateOrganizationType = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<InputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type InputCreateContactType = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<InputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  fullName?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  salutation?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['String']>;
  defaultLanguage?: Maybe<Scalars['String']>;
  organizations?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type InputUpdateContactType = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  memberType?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<InputMemberAddressType>>>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  fullName?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  salutation?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['String']>;
  defaultLanguage?: Maybe<Scalars['String']>;
  organizations?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type InputDeleteContactType = {
  contactId: Scalars['String'];
};

export type IdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorType>>>;
  succeeded: Scalars['Boolean'];
};

export type IdentityErrorType = {
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
};

export type InputUpdatePersonalDataType = {
  personalData: InputPersonalDataType;
};

export type InputPersonalDataType = {
  email?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  middleName?: Maybe<Scalars['String']>;
};

export type InputCreateUserType = {
  createdBy?: Maybe<Scalars['String']>;
  createdDate?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  isAdministrator?: Maybe<Scalars['Boolean']>;
  lockoutEnabled?: Maybe<Scalars['Boolean']>;
  lockoutEnd?: Maybe<Scalars['DateTimeOffset']>;
  logins?: Maybe<Array<Maybe<InputApplicationUserLoginType>>>;
  memberId?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed?: Maybe<Scalars['Boolean']>;
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<InputAssignRoleType>>>;
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  userName: Scalars['String'];
  userType: Scalars['String'];
};


export type InputApplicationUserLoginType = {
  loginProvider: Scalars['String'];
  providerKey: Scalars['String'];
};

export type InputAssignRoleType = {
  concurrencyStamp?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  permissions: Array<Maybe<InputAssignPermissionType>>;
};

export type InputAssignPermissionType = {
  assignedScopes?: Maybe<Array<Maybe<InputAssignPermissionScopeType>>>;
  name: Scalars['String'];
};

export type InputAssignPermissionScopeType = {
  scope: Scalars['String'];
  type: Scalars['String'];
};

export type InputUpdateUserType = {
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
  roles?: Maybe<Array<Maybe<InputAssignRoleType>>>;
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  userName: Scalars['String'];
  userType: Scalars['String'];
  passwordHash?: Maybe<Scalars['String']>;
  securityStamp: Scalars['String'];
};

export type InputDeleteUserType = {
  userNames: Array<Maybe<Scalars['String']>>;
};

export type InputUpdateRoleType = {
  concurrencyStamp?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  permissions: Array<Maybe<InputAssignPermissionType>>;
};

export type InputAddItemType = {
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
};

export type InputClearCartType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputChangeCommentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
};

export type InputChangeCartItemPriceType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  price: Scalars['Decimal'];
};

export type InputChangeCartItemQuantityType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  quantity: Scalars['Int'];
};

export type InputChangeCartItemCommentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  comment: Scalars['String'];
};

export type InputRemoveItemType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
};

export type InputAddCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode: Scalars['String'];
};

export type InputRemoveCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode?: Maybe<Scalars['String']>;
};

export type InputRemoveShipmentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipmentId?: Maybe<Scalars['String']>;
};

export type InputAddOrUpdateCartShipmentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipment: InputShipmentType;
};

export type InputShipmentType = {
  /** Shipment Id */
  id?: Maybe<Scalars['String']>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
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
  deliveryAddress?: Maybe<InputAddressType>;
  currency?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Decimal']>;
};

export type InputAddressType = {
  /** Id */
  id?: Maybe<Scalars['String']>;
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
};

export type InputAddOrUpdateCartPaymentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  payment: InputPaymentType;
};

export type InputPaymentType = {
  /** the payment id */
  id?: Maybe<Scalars['String']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<InputAddressType>;
  currency?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Decimal']>;
  amount?: Maybe<Scalars['Decimal']>;
};

export type InputValidateCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  coupon: Scalars['String'];
};

export type InputMergeCartType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  secondCartId: Scalars['String'];
};

export type InputRemoveCartType = {
  cartId: Scalars['String'];
};

export type InputClearShipmentsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputClearPaymentsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputAddOrUpdateCartAddressType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  address: InputAddressType;
};

export type InputRemoveCartAddressType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  addressId: Scalars['String'];
};

export type InputCreateOrderFromCartType = {
  cartId?: Maybe<Scalars['String']>;
};

export type InputChangeOrderStatusType = {
  orderId: Scalars['String'];
  status: Scalars['String'];
};

export type InputConfirmOrderPaymentType = {
  payment: InputPaymentInType;
};

export type InputPaymentInType = {
  id?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  operationType: Scalars['String'];
  number: Scalars['String'];
  isApproved: Scalars['Boolean'];
  status?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  cancelledDate?: Maybe<Scalars['DateTime']>;
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
  incomingDate?: Maybe<Scalars['DateTime']>;
  authorizedDate?: Maybe<Scalars['DateTime']>;
  capturedDate?: Maybe<Scalars['DateTime']>;
  voidedDate?: Maybe<Scalars['DateTime']>;
  orderId: Scalars['String'];
  sum: Scalars['Decimal'];
  taxTotal: Scalars['Decimal'];
  currency: Scalars['String'];
  paymentStatus?: Maybe<Scalars['Int']>;
  /** Tax category or type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<InputOrderTaxDetailType>>>;
  discounts?: Maybe<Array<Maybe<InputOrderDiscountType>>>;
  paymentMethod?: Maybe<InputOrderPaymentMethodType>;
  billingAddress?: Maybe<InputOrderAddressType>;
};

export type InputOrderTaxDetailType = {
  rate: Scalars['Decimal'];
  amount: Scalars['Decimal'];
  name: Scalars['String'];
};

export type InputOrderDiscountType = {
  discountAmount: Scalars['Decimal'];
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  currency: Scalars['String'];
  discountAmountWithTax: Scalars['Decimal'];
};

export type InputOrderPaymentMethodType = {
  id: Scalars['String'];
  taxDetails?: Maybe<Array<Maybe<InputOrderTaxDetailType>>>;
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
};

export type InputOrderAddressType = {
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
};

export type InputCancelOrderPaymentType = {
  payment: InputPaymentInType;
};

export type UpdatePersonalDataMutationVariables = Exact<{
  command: InputUpdatePersonalDataType;
}>;


export type UpdatePersonalDataMutation = { updatePersonalData?: Maybe<(
    Pick<IdentityResultType, 'succeeded'>
    & { errors?: Maybe<Array<Maybe<Pick<IdentityErrorType, 'code' | 'description'>>>> }
  )>; };

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;


export type GetMeQuery = { me?: Maybe<(
    Pick<UserType, 'id' | 'userName' | 'email' | 'emailConfirmed' | 'photoUrl' | 'phoneNumber' | 'permissions'>
    & { contact?: Maybe<Pick<ContactType, 'firstName' | 'lastName' | 'fullName'>> }
  )>; };

export type GetMyAddressesQueryVariables = Exact<{ [key: string]: never }>;


export type GetMyAddressesQuery = { me?: Maybe<{ contact?: Maybe<{ addresses?: Maybe<Array<Maybe<MemberAddressFieldsFragment>>> }> }> };

export type GetMyOrdersQueryVariables = Exact<{
  filter: Scalars['String'];
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
}>;


export type GetMyOrdersQuery = { orders?: Maybe<(
    Pick<CustomerOrderConnection, 'totalCount'>
    & { items?: Maybe<Array<Maybe<(
      Pick<CustomerOrderType, 'id' | 'createdDate' | 'status' | 'number' | 'customerId'>
      & { items: Array<Maybe<(
        Pick<OrderLineItemType, 'sku' | 'name' | 'quantity'>
        & { product?: Maybe<Pick<Product, 'slug' | 'name'>>; price?: Maybe<MoneyFieldsFragment> }
      )>>; currency?: Maybe<Pick<CurrencyType, 'code'>>; total?: Maybe<MoneyFieldsFragment>; }
    )>>>; }
  )>; };

export type AddItemMutationVariables = Exact<{
  command: InputAddItemType;
}>;


export type AddItemMutation = { addItem?: Maybe<Pick<CartType, 'name' | 'itemsQuantity'>> };

export type AddOrUpdateCartPaymentMutationVariables = Exact<{
  command: InputAddOrUpdateCartPaymentType;
}>;


export type AddOrUpdateCartPaymentMutation = { addOrUpdateCartPayment?: Maybe<Pick<CartType, 'id'>> };

export type AddOrUpdateCartShipmentMutationVariables = Exact<{
  command: InputAddOrUpdateCartShipmentType;
}>;


export type AddOrUpdateCartShipmentMutation = { addOrUpdateCartShipment?: Maybe<Pick<CartType, 'id'>> };

export type CreateOrderFromCartMutationVariables = Exact<{
  command: InputCreateOrderFromCartType;
}>;


export type CreateOrderFromCartMutation = { createOrderFromCart?: Maybe<Pick<CustomerOrderType, 'id' | 'number'>> };

export type RemoveCartMutationVariables = Exact<{
  command: InputRemoveCartType;
}>;


export type RemoveCartMutation = Pick<Mutations, 'removeCart'>;

export type GetAvailPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
}>;


export type GetAvailPaymentMethodsQuery = { cart?: Maybe<{ availablePaymentMethods?: Maybe<Array<Maybe<(
      Pick<PaymentMethodType, 'code' | 'name' | 'logoUrl'>
      & { price?: Maybe<MoneyFieldsFragment> }
    )>>>; }>; };

export type GetAvailShippingMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
}>;


export type GetAvailShippingMethodsQuery = { cart?: Maybe<{ availableShippingMethods?: Maybe<Array<Maybe<(
      Pick<ShippingMethodType, 'id' | 'code' | 'logoUrl' | 'optionName'>
      & { price?: Maybe<MoneyFieldsFragment> }
    )>>>; }>; };

export type GetMyCartQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
}>;


export type GetMyCartQuery = { cart?: Maybe<(
    Pick<CartType, 'id' | 'name' | 'itemsCount' | 'itemsQuantity' | 'isValid'>
    & { shipments?: Maybe<Array<Maybe<(
      Pick<ShipmentType, 'id' | 'shipmentMethodCode'>
      & { deliveryAddress?: Maybe<AddressFieldsFragment> }
    )>>>; discounts?: Maybe<Array<Maybe<Pick<DiscountType, 'promotionId' | 'description' | 'amount' | 'coupon'>>>>; payments?: Maybe<Array<Maybe<(
      Pick<PaymentType, 'id' | 'paymentGatewayCode'>
      & { billingAddress?: Maybe<AddressFieldsFragment> }
    )>>>; addresses?: Maybe<Array<Maybe<AddressFieldsFragment>>>; items?: Maybe<Array<Maybe<LineItemFieldsFragment>>>; currency?: Maybe<CurrencyFieldsFragment>; total?: Maybe<MoneyFieldsFragment>; discountTotal?: Maybe<MoneyFieldsFragment>; subTotal?: Maybe<MoneyFieldsFragment>; shippingTotal?: Maybe<MoneyFieldsFragment>; shippingPrice?: Maybe<MoneyFieldsFragment>; taxTotal?: Maybe<MoneyFieldsFragment>; extendedPriceTotal?: Maybe<MoneyFieldsFragment>; extendedPriceTotalWithTax?: Maybe<MoneyFieldsFragment>; validationErrors?: Maybe<Array<Maybe<(
      Pick<ValidationErrorType, 'errorCode' | 'errorMessage' | 'objectId'>
      & { errorParameters?: Maybe<Array<Maybe<Pick<ErrorParameterType, 'key' | 'value'>>>> }
    )>>>; }
  )>; };

export type GetProductQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type GetProductQuery = { product?: Maybe<(
    Pick<Product, 'name' | 'id' | 'code' | 'slug' | 'outline' | 'imgSrc'>
    & { images?: Maybe<Array<Maybe<Pick<ImageType, 'url'>>>>; description?: Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>; descriptions?: Maybe<Array<Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>>>; properties?: Maybe<Array<Maybe<Pick<Property, 'name' | 'value' | 'type'>>>>; variations?: Maybe<Array<Maybe<(
      Pick<VariationType, 'id' | 'code'>
      & { properties?: Maybe<Array<Maybe<Pick<Property, 'name' | 'value' | 'type'>>>>; availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>; price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
    )>>>; availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>; price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }>; }
  )>; };

export type CategoriesQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
}>;


export type CategoriesQuery = { categories?: Maybe<(
    Pick<CategoryConnection, 'totalCount'>
    & { items?: Maybe<Array<Maybe<(
      Pick<Category, 'id' | 'name' | 'code' | 'slug' | 'path' | 'outline'>
      & { parent?: Maybe<Pick<Category, 'id'>> }
    )>>>; }
  )>; };

export type SearchProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
}>;


export type SearchProductsQuery = { products?: Maybe<(
    Pick<ProductConnection, 'totalCount'>
    & { items?: Maybe<Array<Maybe<(
      Pick<Product, 'name' | 'id' | 'code' | 'slug' | 'outline' | 'imgSrc'>
      & { images?: Maybe<Array<Maybe<Pick<ImageType, 'url'>>>>; description?: Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>; availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>; price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
    )>>>; term_facets?: Maybe<Array<Maybe<(
      Pick<TermFacet, 'name'>
      & { terms?: Maybe<Array<Maybe<Pick<FacetTermType, 'term' | 'count' | 'isSelected'>>>> }
    )>>>; range_facets?: Maybe<Array<Maybe<(
      Pick<RangeFacet, 'name'>
      & { ranges?: Maybe<Array<Maybe<Pick<FacetRangeType, 'label' | 'count' | 'from' | 'to' | 'isSelected'>>>> }
    )>>>; }
  )>; };

export type SearchRelatedProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type SearchRelatedProductsQuery = { product?: Maybe<(
    Pick<Product, 'name' | 'id'>
    & { associations?: Maybe<{ items?: Maybe<Array<Maybe<{ product?: Maybe<(
          Pick<Product, 'name' | 'id' | 'slug' | 'imgSrc'>
          & { availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>; price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>; list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
        )>; }>>>; }>; }
  )>; };

export type AddressFieldsFragment = Pick<AddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

export type CurrencyFieldsFragment = Pick<CurrencyType, 'code' | 'customFormatting' | 'exchangeRate' | 'symbol'>;

export type LineItemFieldsFragment = (
  Pick<LineItemType, 'id' | 'imageUrl' | 'inStockQuantity' | 'isGift' | 'isReadOnly' | 'isReccuring' | 'isValid' | 'name' | 'productId' | 'quantity' | 'sku' | 'thumbnailImageUrl'>
  & { validationErrors?: Maybe<Array<Maybe<(
    Pick<ValidationErrorType, 'errorCode' | 'errorMessage'>
    & { errorParameters?: Maybe<Array<Maybe<Pick<ErrorParameterType, 'key' | 'value'>>>> }
  )>>>; extendedPrice?: Maybe<MoneyFieldsFragment>; listPrice?: Maybe<MoneyFieldsFragment>; taxTotal?: Maybe<MoneyFieldsFragment>; }
);

export type MemberAddressFieldsFragment = Pick<MemberAddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

export type MoneyFieldsFragment = (
  Pick<MoneyType, 'amount' | 'decimalDigits' | 'formattedAmount' | 'formattedAmountWithoutCurrency' | 'formattedAmountWithoutPoint' | 'formattedAmountWithoutPointAndCurrency'>
  & { currency?: Maybe<CurrencyFieldsFragment> }
);

export type OrderAddressFieldsFragment = Pick<OrderAddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

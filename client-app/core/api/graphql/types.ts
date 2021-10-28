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
  OptionalString: any;
  OptionalNullableDecimal: any;
  OptionalDecimal: any;
};

export type Query = {
  product?: Maybe<Product>;
  products?: Maybe<ProductConnection>;
  category?: Maybe<Category>;
  categories?: Maybe<CategoryConnection>;
  properties?: Maybe<PropertyConnection>;
  property?: Maybe<Property>;
  dynamicProperty?: Maybe<DynamicPropertyType>;
  dynamicProperties?: Maybe<DynamicPropertyConnection>;
  countries?: Maybe<Array<Maybe<CountryType>>>;
  regions?: Maybe<Array<Maybe<CountryRegionType>>>;
  me?: Maybe<UserType>;
  organization?: Maybe<Organization>;
  organizations?: Maybe<OrganizationConnection>;
  contact?: Maybe<ContactType>;
  contacts?: Maybe<ContactConnection>;
  checkUsernameUniqueness?: Maybe<Scalars['Boolean']>;
  checkEmailUniqueness?: Maybe<Scalars['Boolean']>;
  requestPasswordReset?: Maybe<Scalars['Boolean']>;
  validatePassword?: Maybe<CustomIdentityResultType>;
  user?: Maybe<UserType>;
  role?: Maybe<RoleType>;
  cart?: Maybe<CartType>;
  carts?: Maybe<CartConnection>;
  order?: Maybe<CustomerOrderType>;
  orders?: Maybe<CustomerOrderConnection>;
  payments?: Maybe<PaymentInConnection>;
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


export type QueryCategoryArgs = {
  id: Scalars['String'];
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
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


export type QueryPropertiesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  storeId: Scalars['String'];
  types?: Maybe<Array<Maybe<PropertyType>>>;
  filter?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryPropertyArgs = {
  id: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryDynamicPropertyArgs = {
  idOrName: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
};


export type QueryDynamicPropertiesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  cultureName?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type QueryRegionsArgs = {
  countryId: Scalars['String'];
};


export type QueryOrganizationArgs = {
  id: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
};


export type QueryOrganizationsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type QueryContactArgs = {
  id: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
};


export type QueryContactsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type QueryCheckUsernameUniquenessArgs = {
  username: Scalars['String'];
};


export type QueryCheckEmailUniquenessArgs = {
  email: Scalars['String'];
};


export type QueryRequestPasswordResetArgs = {
  loginOrEmail: Scalars['String'];
  urlSuffix?: Maybe<Scalars['String']>;
};


export type QueryValidatePasswordArgs = {
  password: Scalars['String'];
};


export type QueryUserArgs = {
  id?: Maybe<Scalars['String']>;
  userName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  loginProvider?: Maybe<Scalars['String']>;
  providerKey?: Maybe<Scalars['String']>;
};


export type QueryRoleArgs = {
  roleName: Scalars['String'];
};


export type QueryCartArgs = {
  storeId: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  cartName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
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


export type QueryPaymentsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
};

/** Products are the sellable goods in an e-commerce project. */
export type Product = {
  /** The unique ID of the product. */
  id: Scalars['String'];
  /** The product SKU. */
  code: Scalars['String'];
  catalogId?: Maybe<Scalars['String']>;
  /** The type of product */
  productType?: Maybe<Scalars['String']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
  /** Request related slug for product */
  slug?: Maybe<Scalars['String']>;
  /** The name of the product. */
  name: Scalars['String'];
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  descriptions?: Maybe<Array<Maybe<DescriptionType>>>;
  description?: Maybe<DescriptionType>;
  category?: Maybe<Category>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars['String']>;
  /** The outer identifier */
  outerId?: Maybe<Scalars['String']>;
  /** Get brandName for product. */
  brandName?: Maybe<Scalars['String']>;
  variations?: Maybe<Array<Maybe<VariationType>>>;
  availabilityData?: Maybe<AvailabilityData>;
  images?: Maybe<Array<Maybe<ImageType>>>;
  price?: Maybe<PriceType>;
  prices?: Maybe<Array<Maybe<PriceType>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
  assets?: Maybe<Array<Maybe<Asset>>>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  associations?: Maybe<ProductAssociationConnection>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionsArgs = {
  type?: Maybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionArgs = {
  type?: Maybe<Scalars['String']>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductPropertiesArgs = {
  names?: Maybe<Array<Maybe<Scalars['String']>>>;
};


/** Products are the sellable goods in an e-commerce project. */
export type ProductAssociationsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  query?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
};

export type SeoInfo = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  semanticUrl?: Maybe<Scalars['String']>;
  pageTitle?: Maybe<Scalars['String']>;
  metaDescription?: Maybe<Scalars['String']>;
  imageAltDescription?: Maybe<Scalars['String']>;
  metaKeywords?: Maybe<Scalars['String']>;
  storeId?: Maybe<Scalars['String']>;
  objectId?: Maybe<Scalars['String']>;
  objectType?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  languageCode?: Maybe<Scalars['String']>;
};

export type DescriptionType = {
  /** Description ID. */
  id: Scalars['String'];
  /** Description type. */
  reviewType: Scalars['String'];
  /** Description text. */
  content: Scalars['String'];
  /** Description language code. */
  languageCode: Scalars['String'];
};

export type Category = {
  /** Id of category. */
  id: Scalars['String'];
  /** The category image. */
  imgSrc?: Maybe<Scalars['String']>;
  /** SKU of category. */
  code: Scalars['String'];
  /** Name of category. */
  name: Scalars['String'];
  /** Level in hierarchy */
  level?: Maybe<Scalars['Int']>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars['String']>;
  /** Request related slug for category */
  slug?: Maybe<Scalars['String']>;
  /** Category path in to the requested catalog  (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: Maybe<Scalars['String']>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  parent?: Maybe<Category>;
  hasParent?: Maybe<Scalars['Boolean']>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
  images?: Maybe<Array<Maybe<ImageType>>>;
  breadcrumbs?: Maybe<Array<Maybe<Breadcrumb>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
};


export type CategoryPropertiesArgs = {
  names?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type OutlineType = {
  items?: Maybe<Array<Maybe<OutlineItemType>>>;
};

export type OutlineItemType = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  seoObjectType?: Maybe<Scalars['String']>;
  seoInfos?: Maybe<Array<Maybe<SeoInfo>>>;
};

export type ImageType = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
  relativeUrl?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<Scalars['Int']>;
  cultureName?: Maybe<Scalars['String']>;
};

export type Breadcrumb = {
  /** Id of item the breadcrumb calculated for */
  itemId: Scalars['String'];
  /** Name of current breadcrumb */
  title: Scalars['String'];
  /** Catalog, category or product */
  typeName?: Maybe<Scalars['String']>;
  /** Full path from catalog */
  seoPath?: Maybe<Scalars['String']>;
  /** Semantic URL keyword */
  semanticUrl?: Maybe<Scalars['String']>;
};

/** Products attributes. */
export type Property = {
  /** The unique ID of the product. */
  id?: Maybe<Scalars['String']>;
  /** The name of the property. */
  name: Scalars['String'];
  /** Is property hidden. */
  hidden: Scalars['Boolean'];
  /** Is property has multiple values. */
  multivalue: Scalars['Boolean'];
  label?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  valueType?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
  valueId?: Maybe<Scalars['String']>;
  propertyDictItems?: Maybe<PropertyDictionaryItemConnection>;
};


/** Products attributes. */
export type PropertyPropertyDictItemsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
};

/** A connection from an object to a list of objects of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PropertyDictionaryItemEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PropertyDictionaryItem>>>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
};

/** An edge in a connection from an object to another object of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<PropertyDictionaryItem>;
};

/** Represents property dictionary item */
export type PropertyDictionaryItem = {
  /** The unique ID of the property dictionary item. */
  id: Scalars['String'];
  /** Value alias. */
  value?: Maybe<Scalars['String']>;
  /** Value order. */
  sortOrder: Scalars['Int'];
};

export type VariationType = {
  /** Id of variation. */
  id?: Maybe<Scalars['String']>;
  /** Name of variation. */
  name?: Maybe<Scalars['String']>;
  /** SKU of variation. */
  code?: Maybe<Scalars['String']>;
  availabilityData?: Maybe<AvailabilityData>;
  images?: Maybe<Array<Maybe<ImageType>>>;
  price?: Maybe<PriceType>;
  prices?: Maybe<Array<Maybe<PriceType>>>;
  properties?: Maybe<Array<Maybe<Property>>>;
  assets?: Maybe<Array<Maybe<Asset>>>;
  outlines?: Maybe<Array<Maybe<OutlineType>>>;
};

export type AvailabilityData = {
  /** Available quantity */
  availableQuantity: Scalars['Long'];
  isBuyable?: Maybe<Scalars['Boolean']>;
  isAvailable?: Maybe<Scalars['Boolean']>;
  isInStock?: Maybe<Scalars['Boolean']>;
  isActive?: Maybe<Scalars['Boolean']>;
  isTrackInventory?: Maybe<Scalars['Boolean']>;
  inventories?: Maybe<Array<Maybe<InventoryInfo>>>;
};


export type InventoryInfo = {
  inStockQuantity?: Maybe<Scalars['Long']>;
  reservedQuantity?: Maybe<Scalars['Long']>;
  fulfillmentCenterId: Scalars['String'];
  fulfillmentCenterName: Scalars['String'];
  allowPreorder?: Maybe<Scalars['Boolean']>;
  allowBackorder?: Maybe<Scalars['Boolean']>;
  preorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
  backorderAvailabilityDate?: Maybe<Scalars['DateTime']>;
};


export type PriceType = {
  list?: Maybe<MoneyType>;
  listWithTax?: Maybe<MoneyType>;
  sale?: Maybe<MoneyType>;
  saleWithTax?: Maybe<MoneyType>;
  actual?: Maybe<MoneyType>;
  actualWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountPercent?: Maybe<Scalars['Decimal']>;
  currency?: Maybe<Scalars['String']>;
  /** @deprecated startDate */
  validFrom?: Maybe<Scalars['DateTime']>;
  startDate?: Maybe<Scalars['DateTime']>;
  /** @deprecated endDate */
  validUntil?: Maybe<Scalars['DateTime']>;
  endDate?: Maybe<Scalars['DateTime']>;
  tierPrices?: Maybe<Array<Maybe<TierPriceType>>>;
  discounts?: Maybe<Array<Maybe<CatalogDiscountType>>>;
  /** The product price list */
  pricelistId?: Maybe<Scalars['String']>;
  /** The product min qty */
  minQuantity?: Maybe<Scalars['Int']>;
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


export type CurrencyType = {
  /** Currency code may be used ISO 4217 */
  code: Scalars['String'];
  /** Symbol */
  symbol?: Maybe<Scalars['String']>;
  /** Exchange rate */
  exchangeRate?: Maybe<Scalars['Decimal']>;
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars['String']>;
};

export type TierPriceType = {
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  quantity?: Maybe<Scalars['Long']>;
};

export type CatalogDiscountType = {
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Decimal']>;
  moneyAmount?: Maybe<MoneyType>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  moneyAmountWithTax?: Maybe<MoneyType>;
  promotion?: Maybe<Promotion>;
};

/** Represents promotion object */
export type Promotion = {
  /** The unique ID of the promotion. */
  id: Scalars['String'];
  /** The name of the promotion */
  name: Scalars['String'];
  /** Promotion description */
  description?: Maybe<Scalars['String']>;
  /** Promotion type */
  type?: Maybe<Scalars['String']>;
};

export type Asset = {
  /** The unique ID of the asset. */
  id?: Maybe<Scalars['String']>;
  /** The name of the asset. */
  name?: Maybe<Scalars['String']>;
  /** MimeType of the asset. */
  mimeType?: Maybe<Scalars['String']>;
  /** Size of the asset. */
  size?: Maybe<Scalars['Long']>;
  /** Url of the asset. */
  url?: Maybe<Scalars['String']>;
  /** RelativeUrl of the asset. */
  relativeUrl?: Maybe<Scalars['String']>;
  /** Type id of the asset. */
  typeId?: Maybe<Scalars['String']>;
  /** Group of the asset. */
  group?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `ProductAssociation`. */
export type ProductAssociationConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductAssociationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductAssociation>>>;
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
  type?: Maybe<Scalars['String']>;
  priority?: Maybe<Scalars['Int']>;
  quantity?: Maybe<Scalars['Int']>;
  associatedObjectId?: Maybe<Scalars['String']>;
  associatedObjectType?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  product?: Maybe<Product>;
};

/** A connection from an object to a list of objects of type `Product`. */
export type ProductConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Product>>>;
  filter_facets?: Maybe<Array<Maybe<FilterFacet>>>;
  range_facets?: Maybe<Array<Maybe<RangeFacet>>>;
  term_facets?: Maybe<Array<Maybe<TermFacet>>>;
};

/** An edge in a connection from an object to another object of type `Product`. */
export type ProductEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Product>;
};

export type FilterFacet = Facet & {
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** The number of products matching the value specified in the filter facet expression */
  count: Scalars['Int'];
};

export enum FacetTypes {
  Terms = 'TERMS',
  Range = 'RANGE',
  Filter = 'FILTER'
}

export type Facet = {
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
};

export type RangeFacet = Facet & {
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** Ranges */
  ranges?: Maybe<Array<Maybe<FacetRangeType>>>;
};

export type FacetRangeType = {
  /** Amount of products for which the values in a field fall into the specified range */
  count?: Maybe<Scalars['Long']>;
  /** The range’s lower endpoint in number format, 0 represents infinity */
  from?: Maybe<Scalars['Long']>;
  /** The flag indicates that From exclusive */
  includeFrom: Scalars['Boolean'];
  /** The range’s lower endpoint in string format, empty string represents infinity */
  fromStr?: Maybe<Scalars['String']>;
  /** Maximum value among all values contained within the range */
  max?: Maybe<Scalars['Long']>;
  /** Minimum value among all values contained within the range */
  min?: Maybe<Scalars['Long']>;
  /** The range’s upper endpoint in number format, 0 represents infinity */
  to?: Maybe<Scalars['Long']>;
  /** The flag indicates that To exclusive */
  includeTo: Scalars['Boolean'];
  /** The range’s upper endpoint in string format, empty string represents infinity */
  toStr?: Maybe<Scalars['String']>;
  /** Sum of all values contained in the range */
  total?: Maybe<Scalars['Long']>;
  /** Localization label */
  label?: Maybe<Scalars['String']>;
  /** is selected state */
  isSelected?: Maybe<Scalars['Boolean']>;
};

export type TermFacet = Facet & {
  /** The key/name  of the facet. */
  name: Scalars['String'];
  /** Localized name of the facet. */
  label: Scalars['String'];
  /** The three types of facets. Terms, Range, Filter */
  facetType?: Maybe<FacetTypes>;
  /** Terms */
  terms?: Maybe<Array<Maybe<FacetTermType>>>;
};

export type FacetTermType = {
  /** term */
  term?: Maybe<Scalars['String']>;
  /** count */
  count?: Maybe<Scalars['Long']>;
  /** is selected state */
  isSelected?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
};

/** A connection from an object to a list of objects of type `Category`. */
export type CategoryConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CategoryEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Category>>>;
};

/** An edge in a connection from an object to another object of type `Category`. */
export type CategoryEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Category>;
};

/** A connection from an object to a list of objects of type `Property`. */
export type PropertyConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PropertyEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Property>>>;
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
  Product = 'PRODUCT',
  Variation = 'VARIATION',
  Category = 'CATEGORY',
  Catalog = 'CATALOG'
}

export type DynamicPropertyType = {
  /** Id */
  id: Scalars['String'];
  /** Name */
  name: Scalars['String'];
  /** Object Type */
  objectType: Scalars['String'];
  /** Localized Property Name */
  label?: Maybe<Scalars['String']>;
  /** The order for the dynamic property to display */
  displayOrder?: Maybe<Scalars['Int']>;
  /** Value Type */
  valueType?: Maybe<Scalars['String']>;
  /** Is dynamic property value an array */
  isArray?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value a dictionary */
  isDictionary?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value multilingual */
  isMultilingual?: Maybe<Scalars['Boolean']>;
  /** Is dynamic property value required */
  isRequired?: Maybe<Scalars['Boolean']>;
  dictionaryItems?: Maybe<DictionaryItemConnection>;
};


export type DynamicPropertyTypeDictionaryItemsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  filter?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `DictionaryItem`. */
export type DictionaryItemConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<DictionaryItemEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<DictionaryItemType>>>;
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
  /** Name */
  name: Scalars['String'];
  /** Localized dictionary item value */
  label?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `DynamicProperty`. */
export type DynamicPropertyConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<DynamicPropertyEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<DynamicPropertyType>>>;
};

/** An edge in a connection from an object to another object of type `DynamicProperty`. */
export type DynamicPropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<DynamicPropertyType>;
};

export type CountryType = {
  /** Code of country. For example 'USA'. */
  id: Scalars['String'];
  /** Name of country. For example 'United States of America'. */
  name: Scalars['String'];
  regions?: Maybe<Array<Maybe<CountryRegionType>>>;
};

export type CountryRegionType = {
  /** Code of country region. For example 'AL'. */
  id: Scalars['String'];
  /** Name of country region. For example 'Alabama'. */
  name: Scalars['String'];
};

export type UserType = {
  accessFailedCount: Scalars['Int'];
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
  phoneNumber?: Maybe<Scalars['String']>;
  phoneNumberConfirmed: Scalars['Boolean'];
  photoUrl?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  /** Account permissions */
  permissions?: Maybe<Array<Maybe<Scalars['String']>>>;
  securityStamp: Scalars['String'];
  storeId?: Maybe<Scalars['String']>;
  twoFactorEnabled: Scalars['Boolean'];
  userName: Scalars['String'];
  userType?: Maybe<Scalars['String']>;
  /** The associated contact info */
  contact?: Maybe<ContactType>;
  /** Account locked state */
  lockedState?: Maybe<Scalars['Boolean']>;
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
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  birthDate?: Maybe<Scalars['Date']>;
  fullName: Scalars['String'];
  id: Scalars['String'];
  memberType: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  /** Contact status */
  status?: Maybe<Scalars['String']>;
  /** List of contact`s emails */
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Contact's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  securityAccounts?: Maybe<Array<Maybe<UserType>>>;
  organizationId?: Maybe<Scalars['String']>;
  organizationsIds: Array<Maybe<Scalars['String']>>;
  phones: Array<Maybe<Scalars['String']>>;
  organizations?: Maybe<OrganizationConnection>;
  addresses?: Maybe<MemberAddressConnection>;
};


export type ContactTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};


export type ContactTypeOrganizationsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type ContactTypeAddressesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
};


export type DynamicPropertyValueType = {
  /** Property Name */
  name?: Maybe<Scalars['String']>;
  /** Value Type */
  valueType?: Maybe<Scalars['String']>;
  /** Property Value */
  value?: Maybe<Scalars['String']>;
  /** Associated dictionary item */
  dictionaryItem?: Maybe<DictionaryItemType>;
  /** Associated dynamic property */
  dynamicProperty?: Maybe<DynamicPropertyType>;
};

/** A connection from an object to a list of objects of type `Organization`. */
export type OrganizationConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<OrganizationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Organization>>>;
};

/** An edge in a connection from an object to another object of type `Organization`. */
export type OrganizationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Organization>;
};

/** Organization info */
export type Organization = {
  id: Scalars['String'];
  /** Description */
  description?: Maybe<Scalars['String']>;
  /** Business category */
  businessCategory?: Maybe<Scalars['String']>;
  /** Owner id */
  ownerId?: Maybe<Scalars['String']>;
  /** Parent id */
  parentId?: Maybe<Scalars['String']>;
  /** Name */
  name?: Maybe<Scalars['String']>;
  /** Member type */
  memberType: Scalars['String'];
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  phones?: Maybe<Array<Maybe<Scalars['String']>>>;
  emails?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** SEO object type */
  seoObjectType: Scalars['String'];
  /** Organization status */
  status?: Maybe<Scalars['String']>;
  /** Organization's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  contacts?: Maybe<ContactConnection>;
  addresses?: Maybe<MemberAddressConnection>;
};


/** Organization info */
export type OrganizationDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};


/** Organization info */
export type OrganizationContactsArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  searchPhrase?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


/** Organization info */
export type OrganizationAddressesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
};

/** A connection from an object to a list of objects of type `Contact`. */
export type ContactConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ContactEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ContactType>>>;
};

/** An edge in a connection from an object to another object of type `Contact`. */
export type ContactEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ContactType>;
};

/** A connection from an object to a list of objects of type `MemberAddress`. */
export type MemberAddressConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<MemberAddressEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<MemberAddressType>>>;
};

/** An edge in a connection from an object to another object of type `MemberAddress`. */
export type MemberAddressEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<MemberAddressType>;
};

export type MemberAddressType = {
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
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
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
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
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  addressType?: Maybe<Scalars['Int']>;
};

export type CustomIdentityResultType = {
  succeeded: Scalars['Boolean'];
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorInfoType>>>;
};

export type IdentityErrorInfoType = {
  /** Error code */
  code: Scalars['String'];
  /** Error parameter */
  errorParameter?: Maybe<Scalars['Int']>;
  /** Error description */
  description?: Maybe<Scalars['String']>;
};

export type CartType = {
  /** Shopping cart Id */
  id?: Maybe<Scalars['String']>;
  /** Shopping cart name */
  name: Scalars['String'];
  /** Shopping cart status */
  status?: Maybe<Scalars['String']>;
  /** Shopping cart store id */
  storeId?: Maybe<Scalars['String']>;
  /** Shopping cart channel id */
  channelId?: Maybe<Scalars['String']>;
  hasPhysicalProducts?: Maybe<Scalars['Boolean']>;
  /** Sign that shopping cart is anonymous */
  isAnonymous?: Maybe<Scalars['Boolean']>;
  /** Shopping cart user id */
  customerId?: Maybe<Scalars['String']>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars['String']>;
  /** Shopping cart organization id */
  organizationId?: Maybe<Scalars['String']>;
  /** Sign that shopping cart is recurring */
  isRecuring?: Maybe<Scalars['Boolean']>;
  /** Shopping cart text comment */
  comment?: Maybe<Scalars['String']>;
  /** Shopping cart value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Shopping cart value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Shopping cart value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  total?: Maybe<MoneyType>;
  subTotal?: Maybe<MoneyType>;
  subTotalWithTax?: Maybe<MoneyType>;
  extendedPriceTotal?: Maybe<MoneyType>;
  extendedPriceTotalWithTax?: Maybe<MoneyType>;
  currency?: Maybe<CurrencyType>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  fee?: Maybe<MoneyType>;
  shippingPrice?: Maybe<MoneyType>;
  shippingPriceWithTax?: Maybe<MoneyType>;
  shippingTotal?: Maybe<MoneyType>;
  shippingTotalWithTax?: Maybe<MoneyType>;
  shipments?: Maybe<Array<Maybe<ShipmentType>>>;
  availableShippingMethods?: Maybe<Array<Maybe<ShippingMethodType>>>;
  paymentPrice?: Maybe<MoneyType>;
  paymentPriceWithTax?: Maybe<MoneyType>;
  paymentTotal?: Maybe<MoneyType>;
  paymentTotalWithTax?: Maybe<MoneyType>;
  payments?: Maybe<Array<Maybe<PaymentType>>>;
  availablePaymentMethods?: Maybe<Array<Maybe<PaymentMethodType>>>;
  handlingTotal?: Maybe<MoneyType>;
  handlingTotalWithTax?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  addresses?: Maybe<Array<Maybe<CartAddressType>>>;
  /** Gifts */
  gifts?: Maybe<Array<Maybe<GiftItemType>>>;
  /** Available Gifts */
  availableGifts?: Maybe<Array<Maybe<GiftItemType>>>;
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Count of different items */
  itemsCount?: Maybe<Scalars['Int']>;
  /** Quantity of items */
  itemsQuantity?: Maybe<Scalars['Int']>;
  coupons?: Maybe<Array<Maybe<CouponType>>>;
  /** Cart dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /**
   * The flag indicates the valid cart
   * @deprecated Deprecated, because of useless (no need to know validation state without details). Use validationErrors field.
   */
  isValid?: Maybe<Scalars['Boolean']>;
  /** A set of errors in case of invalid cart */
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Shopping cart type */
  type?: Maybe<Scalars['String']>;
};


export type CartTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};


export type CartTypeIsValidArgs = {
  ruleSet?: Maybe<Scalars['String']>;
};


export type CartTypeValidationErrorsArgs = {
  ruleSet?: Maybe<Scalars['String']>;
};

export type TaxDetailType = {
  amount?: Maybe<MoneyType>;
  price?: Maybe<MoneyType>;
  rate?: Maybe<MoneyType>;
  name?: Maybe<Scalars['String']>;
};

export type ShipmentType = {
  /** Shipment Id */
  id?: Maybe<Scalars['String']>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['String']>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  deliveryAddress?: Maybe<CartAddressType>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['String']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  items?: Maybe<Array<Maybe<CartShipmentItemType>>>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  currency?: Maybe<CurrencyType>;
  /** Cart shipment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type ShipmentTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type CartAddressType = {
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
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
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
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
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  addressType?: Maybe<Scalars['Int']>;
};

export type CartShipmentItemType = {
  /** Quantity */
  quantity?: Maybe<Scalars['Int']>;
  lineItem?: Maybe<LineItemType>;
};

export type LineItemType = {
  product?: Maybe<Product>;
  inStockQuantity?: Maybe<Scalars['Int']>;
  warehouseLocation?: Maybe<Scalars['String']>;
  isValid?: Maybe<Scalars['Boolean']>;
  validationErrors?: Maybe<Array<Maybe<ValidationErrorType>>>;
  /** Value of catalog id */
  catalogId?: Maybe<Scalars['String']>;
  /** Value of category id */
  categoryId?: Maybe<Scalars['String']>;
  /** Line item created date */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** Value of height */
  height?: Maybe<Scalars['Decimal']>;
  /** Line item id */
  id: Scalars['String'];
  /** Value of line item image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  /** flag of line item is a gift */
  isGift?: Maybe<Scalars['Boolean']>;
  /** Is readOnly */
  isReadOnly?: Maybe<Scalars['Boolean']>;
  /** flag of line item is recurring */
  isReccuring?: Maybe<Scalars['Boolean']>;
  /** Culture name in ISO 3166-1 alpha-3 format */
  languageCode?: Maybe<Scalars['String']>;
  /** Value of length */
  length?: Maybe<Scalars['Decimal']>;
  /** Value of measurement unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** Value of line item name */
  name?: Maybe<Scalars['String']>;
  /** Value of line item comment */
  note?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  objectType?: Maybe<Scalars['String']>;
  /** Value of product id */
  productId?: Maybe<Scalars['String']>;
  /** type of product (can be Physical, Digital or Subscription) */
  productType?: Maybe<Scalars['String']>;
  /** Value of line item quantity */
  quantity?: Maybe<Scalars['Int']>;
  /** requirement for line item shipping */
  requiredShipping?: Maybe<Scalars['Boolean']>;
  /** Value of line item shipping method code */
  shipmentMethodCode?: Maybe<Scalars['String']>;
  /** Value of product SKU */
  sku?: Maybe<Scalars['String']>;
  /** Value of total shipping tax amount */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Value of shipping tax type */
  taxType?: Maybe<Scalars['String']>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars['String']>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['Decimal']>;
  /** Value of shopping cart weight */
  weight?: Maybe<Scalars['Decimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['String']>;
  /** Value of width */
  width?: Maybe<Scalars['Decimal']>;
  /** Value of line item Fulfillment center ID */
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  /** Value of line item Fulfillment center name */
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  extendedPrice?: Maybe<MoneyType>;
  extendedPriceWithTax?: Maybe<MoneyType>;
  listPrice?: Maybe<MoneyType>;
  listPriceWithTax?: Maybe<MoneyType>;
  placedPrice?: Maybe<MoneyType>;
  placedPriceWithTax?: Maybe<MoneyType>;
  salePrice?: Maybe<MoneyType>;
  salePriceWithTax?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  /** Cart line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type LineItemTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type ValidationErrorType = {
  /** Error code */
  errorCode?: Maybe<Scalars['String']>;
  /** Error msg */
  errorMessage?: Maybe<Scalars['String']>;
  /** Object id */
  objectId?: Maybe<Scalars['String']>;
  /** Object type */
  objectType?: Maybe<Scalars['String']>;
  errorParameters?: Maybe<Array<Maybe<ErrorParameterType>>>;
};

export type ErrorParameterType = {
  /** key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
};

export type DiscountType = {
  /** Coupon */
  coupon?: Maybe<Scalars['String']>;
  /** Value of discount description */
  description?: Maybe<Scalars['String']>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Decimal']>;
  moneyAmount?: Maybe<MoneyType>;
  amountWithTax?: Maybe<Scalars['Decimal']>;
  moneyAmountWithTax?: Maybe<MoneyType>;
};

export type ShippingMethodType = {
  id?: Maybe<Scalars['String']>;
  /** Value of shipping gateway code */
  code?: Maybe<Scalars['String']>;
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars['String']>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars['String']>;
  /** Value of shipping method priority */
  priority?: Maybe<Scalars['Int']>;
  currency?: Maybe<CurrencyType>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
};

export type PaymentType = {
  /** Payment Id */
  id?: Maybe<Scalars['String']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['String']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  amount?: Maybe<MoneyType>;
  billingAddress?: Maybe<CartAddressType>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
  discounts?: Maybe<Array<Maybe<DiscountType>>>;
  /** Cart payment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type PaymentTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type PaymentMethodType = {
  /** Value of payment gateway code */
  code?: Maybe<Scalars['String']>;
  /**
   * Value of payment method name
   * @deprecated Left for backward compatibility. Should be removed in future. Use Code.
   */
  name?: Maybe<Scalars['String']>;
  /** Value of payment method logo absolute URL */
  logoUrl?: Maybe<Scalars['String']>;
  /** Value of payment method type */
  paymentMethodType?: Maybe<Scalars['String']>;
  /** Value of payment group type */
  paymentMethodGroupType?: Maybe<Scalars['String']>;
  /** Value of payment method priority */
  priority?: Maybe<Scalars['Int']>;
  /** Is payment method available for partial payments */
  isAvailableForPartial?: Maybe<Scalars['Boolean']>;
  currency?: Maybe<CurrencyType>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  /** Tax percent rate */
  taxPercentRate?: Maybe<Scalars['Decimal']>;
  /** Tax type */
  taxType?: Maybe<Scalars['String']>;
  taxDetails?: Maybe<Array<Maybe<TaxDetailType>>>;
};

export type GiftItemType = {
  /** Promotion Id */
  promotionId: Scalars['String'];
  /** Quantity of gifts in the reward */
  quantity: Scalars['Int'];
  /** Product id */
  productId?: Maybe<Scalars['String']>;
  /** Product Category Id */
  categoryId?: Maybe<Scalars['String']>;
  /** Value of reward image absolute URL */
  imageUrl?: Maybe<Scalars['String']>;
  /** Name of the reward */
  name: Scalars['String'];
  /** Measure Unit */
  measureUnit?: Maybe<Scalars['String']>;
  /** ID of lineItem if gift is in cart. Otherwise null */
  lineItemId?: Maybe<Scalars['String']>;
  /** Artificial ID for this value object */
  id: Scalars['String'];
  product?: Maybe<Product>;
};

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars['String']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully?: Maybe<Scalars['Boolean']>;
};

/** A connection from an object to a list of objects of type `Cart`. */
export type CartConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CartEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CartType>>>;
};

/** An edge in a connection from an object to another object of type `Cart`. */
export type CartEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<CartType>;
};

export type CustomerOrderType = {
  id: Scalars['String'];
  operationType: Scalars['String'];
  parentOperationId?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  isApproved: Scalars['Boolean'];
  status?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  objectType: Scalars['String'];
  customerId: Scalars['String'];
  customerName?: Maybe<Scalars['String']>;
  channelId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  storeName?: Maybe<Scalars['String']>;
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  shoppingCartId?: Maybe<Scalars['String']>;
  isPrototype: Scalars['Boolean'];
  subscriptionNumber?: Maybe<Scalars['String']>;
  subscriptionId?: Maybe<Scalars['String']>;
  fee?: Maybe<MoneyType>;
  purchaseOrderNumber?: Maybe<Scalars['String']>;
  feeWithTax: Scalars['Decimal'];
  feeTotal: Scalars['Decimal'];
  feeTotalWithTax: Scalars['Decimal'];
  taxType?: Maybe<Scalars['String']>;
  taxPercentRate: Scalars['Decimal'];
  languageCode?: Maybe<Scalars['String']>;
  createdDate: Scalars['DateTime'];
  createdBy?: Maybe<Scalars['String']>;
  modifiedDate?: Maybe<Scalars['DateTime']>;
  modifiedBy?: Maybe<Scalars['String']>;
  currency?: Maybe<CurrencyType>;
  total?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  subTotal?: Maybe<MoneyType>;
  subTotalWithTax?: Maybe<MoneyType>;
  subTotalDiscount?: Maybe<MoneyType>;
  subTotalDiscountWithTax?: Maybe<MoneyType>;
  subTotalTaxTotal?: Maybe<MoneyType>;
  shippingTotal?: Maybe<MoneyType>;
  shippingTotalWithTax?: Maybe<MoneyType>;
  shippingSubTotal?: Maybe<MoneyType>;
  shippingSubTotalWithTax?: Maybe<MoneyType>;
  shippingDiscountTotal?: Maybe<MoneyType>;
  shippingDiscountTotalWithTax?: Maybe<MoneyType>;
  shippingTaxTotal?: Maybe<MoneyType>;
  paymentTotal?: Maybe<MoneyType>;
  paymentTotalWithTax?: Maybe<MoneyType>;
  paymentSubTotal?: Maybe<MoneyType>;
  paymentSubTotalWithTax?: Maybe<MoneyType>;
  paymentDiscountTotal?: Maybe<MoneyType>;
  paymentDiscountTotalWithTax?: Maybe<MoneyType>;
  paymentTaxTotal?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  addresses: Array<Maybe<OrderAddressType>>;
  items: Array<Maybe<OrderLineItemType>>;
  inPayments: Array<Maybe<PaymentInType>>;
  shipments?: Maybe<Array<Maybe<OrderShipmentType>>>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  /** Customer order dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  coupons?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type CustomerOrderTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type OrderAddressType = {
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** Id */
  key?: Maybe<Scalars['String']>;
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
  /** Middle name */
  middleName?: Maybe<Scalars['String']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']>;
  /** Line1 */
  line1?: Maybe<Scalars['String']>;
  /** Line2 */
  line2?: Maybe<Scalars['String']>;
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
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
  addressType?: Maybe<Scalars['Int']>;
};

export type OrderLineItemType = {
  id: Scalars['String'];
  productType?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  comment?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  isGift?: Maybe<Scalars['Boolean']>;
  shippingMethodCode?: Maybe<Scalars['String']>;
  fulfillmentLocationCode?: Maybe<Scalars['String']>;
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  weightUnit?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  measureUnit?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  length?: Maybe<Scalars['Decimal']>;
  width?: Maybe<Scalars['Decimal']>;
  isCancelled: Scalars['Boolean'];
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  objectType: Scalars['String'];
  categoryId?: Maybe<Scalars['String']>;
  catalogId: Scalars['String'];
  sku: Scalars['String'];
  priceId?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  taxPercentRate: Scalars['Decimal'];
  reserveQuantity: Scalars['Int'];
  quantity: Scalars['Int'];
  productId: Scalars['String'];
  currency?: Maybe<CurrencyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  discountTotal?: Maybe<MoneyType>;
  discountTotalWithTax?: Maybe<MoneyType>;
  extendedPrice?: Maybe<MoneyType>;
  extendedPriceWithTax?: Maybe<MoneyType>;
  placedPrice?: Maybe<MoneyType>;
  placedPriceWithTax?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  discounts: Array<Maybe<OrderDiscountType>>;
  product?: Maybe<Product>;
  /** Customer order Line item dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type OrderLineItemTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type OrderTaxDetailType = {
  rate?: Maybe<MoneyType>;
  amount?: Maybe<MoneyType>;
  name: Scalars['String'];
};

export type OrderDiscountType = {
  amount?: Maybe<MoneyType>;
  coupon?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  promotionId?: Maybe<Scalars['String']>;
};

export type PaymentInType = {
  id: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  customerName?: Maybe<Scalars['String']>;
  customerId: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  gatewayCode?: Maybe<Scalars['String']>;
  incomingDate?: Maybe<Scalars['DateTime']>;
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
  objectType: Scalars['String'];
  createdDate: Scalars['DateTime'];
  modifiedDate?: Maybe<Scalars['DateTime']>;
  createdBy?: Maybe<Scalars['String']>;
  modifiedBy?: Maybe<Scalars['String']>;
  authorizedDate?: Maybe<Scalars['DateTime']>;
  capturedDate?: Maybe<Scalars['DateTime']>;
  voidedDate?: Maybe<Scalars['DateTime']>;
  orderId?: Maybe<Scalars['String']>;
  price?: Maybe<MoneyType>;
  sum?: Maybe<MoneyType>;
  tax?: Maybe<MoneyType>;
  paymentMethod?: Maybe<OrderPaymentMethodType>;
  currency?: Maybe<CurrencyType>;
  billingAddress?: Maybe<OrderAddressType>;
  transactions?: Maybe<Array<Maybe<PaymentTransactionType>>>;
  /** Associated Order */
  order: CustomerOrderType;
  /** Customer order Payment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type PaymentInTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type OrderPaymentMethodType = {
  taxDetails?: Maybe<Array<Maybe<OrderTaxDetailType>>>;
  taxPercentRate: Scalars['Decimal'];
  taxTotal?: Maybe<MoneyType>;
  taxType?: Maybe<Scalars['String']>;
  typeName: Scalars['String'];
  storeId: Scalars['String'];
  totalWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  currency?: Maybe<CurrencyType>;
  isAvailableForPartial: Scalars['Boolean'];
  priority: Scalars['Int'];
  isActive: Scalars['Boolean'];
  logoUrl: Scalars['String'];
  code: Scalars['String'];
  paymentMethodType?: Maybe<Scalars['Int']>;
  paymentMethodGroupType?: Maybe<Scalars['Int']>;
};

export type PaymentTransactionType = {
  id: Scalars['String'];
  isProcessed: Scalars['Boolean'];
  processedDate?: Maybe<Scalars['DateTime']>;
  processError?: Maybe<Scalars['String']>;
  processAttemptCount: Scalars['Int'];
  requestData: Scalars['String'];
  responseData: Scalars['String'];
  responseCode: Scalars['String'];
  gatewayIpAddress: Scalars['String'];
  type: Scalars['String'];
  status: Scalars['String'];
  note: Scalars['String'];
  amount?: Maybe<MoneyType>;
};

export type OrderShipmentType = {
  id: Scalars['String'];
  operationType: Scalars['String'];
  parentOperationId?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  isApproved: Scalars['Boolean'];
  status?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  isCancelled: Scalars['Boolean'];
  cancelledDate?: Maybe<Scalars['DateTime']>;
  cancelReason?: Maybe<Scalars['String']>;
  objectType: Scalars['String'];
  organizationId?: Maybe<Scalars['String']>;
  organizationName?: Maybe<Scalars['String']>;
  fulfillmentCenterId?: Maybe<Scalars['String']>;
  fulfillmentCenterName?: Maybe<Scalars['String']>;
  employeeId?: Maybe<Scalars['String']>;
  employeeName?: Maybe<Scalars['String']>;
  shipmentMethodCode?: Maybe<Scalars['String']>;
  shipmentMethodOption?: Maybe<Scalars['String']>;
  shippingMethod?: Maybe<OrderShippingMethodType>;
  customerOrderId?: Maybe<Scalars['String']>;
  weightUnit?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Decimal']>;
  measureUnit?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Decimal']>;
  length?: Maybe<Scalars['Decimal']>;
  width?: Maybe<Scalars['Decimal']>;
  deliveryAddress?: Maybe<OrderAddressType>;
  taxType?: Maybe<Scalars['String']>;
  taxPercentRate: Scalars['Decimal'];
  price?: Maybe<MoneyType>;
  priceWithTax?: Maybe<MoneyType>;
  total?: Maybe<MoneyType>;
  totalWithTax?: Maybe<MoneyType>;
  discountAmount?: Maybe<MoneyType>;
  discountAmountWithTax?: Maybe<MoneyType>;
  taxTotal?: Maybe<MoneyType>;
  currency?: Maybe<CurrencyType>;
  taxDetails: Array<Maybe<OrderTaxDetailType>>;
  items: Array<Maybe<OrderShipmentItemType>>;
  packages: Array<Maybe<OrderShipmentPackageType>>;
  inPayments: Array<Maybe<PaymentInType>>;
  discounts: Array<Maybe<OrderDiscountType>>;
  /** Customer order Shipment dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
};


export type OrderShipmentTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type OrderShippingMethodType = {
  id: Scalars['String'];
  code: Scalars['String'];
  logoUrl: Scalars['String'];
  isActive: Scalars['Boolean'];
  priority: Scalars['Int'];
  taxType?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  typeName: Scalars['String'];
};

export type OrderShipmentItemType = {
  id: Scalars['String'];
  lineItemId: Scalars['String'];
  lineItem?: Maybe<OrderLineItemType>;
  barCode?: Maybe<Scalars['String']>;
  quantity: Scalars['Int'];
  outerId?: Maybe<Scalars['String']>;
};

export type OrderShipmentPackageType = {
  id: Scalars['String'];
  barCode?: Maybe<Scalars['String']>;
  packageType?: Maybe<Scalars['String']>;
  weightUnit: Scalars['String'];
  weight?: Maybe<Scalars['Decimal']>;
  measureUnit: Scalars['String'];
  height?: Maybe<Scalars['Decimal']>;
  length?: Maybe<Scalars['Decimal']>;
  width?: Maybe<Scalars['Decimal']>;
  items: Array<Maybe<OrderShipmentItemType>>;
};

/** A connection from an object to a list of objects of type `CustomerOrder`. */
export type CustomerOrderConnection = {
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<CustomerOrderEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<CustomerOrderType>>>;
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
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PaymentInEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PaymentInType>>>;
};

/** An edge in a connection from an object to another object of type `PaymentIn`. */
export type PaymentInEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<PaymentInType>;
};

export type Mutations = {
  updateMemberAddresses?: Maybe<MemberType>;
  updateOrganization?: Maybe<Organization>;
  createOrganization?: Maybe<Organization>;
  createContact?: Maybe<ContactType>;
  updateContact?: Maybe<ContactType>;
  deleteContact?: Maybe<Scalars['Boolean']>;
  updatePersonalData?: Maybe<IdentityResultType>;
  updateMemberDynamicProperties?: Maybe<MemberType>;
  sendVerifyEmail?: Maybe<Scalars['Boolean']>;
  resetPasswordByToken?: Maybe<CustomIdentityResultType>;
  inviteUser?: Maybe<CustomIdentityResultType>;
  registerByInvitation?: Maybe<CustomIdentityResultType>;
  createUser?: Maybe<IdentityResultType>;
  updateUser?: Maybe<IdentityResultType>;
  deleteUsers?: Maybe<IdentityResultType>;
  updateRole?: Maybe<IdentityResultType>;
  addItem?: Maybe<CartType>;
  addGiftItems?: Maybe<CartType>;
  rejectGiftItems?: Maybe<CartType>;
  clearCart?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeCartItemComment?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeShipment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  validateCoupon?: Maybe<Scalars['Boolean']>;
  mergeCart?: Maybe<CartType>;
  removeCart?: Maybe<Scalars['Boolean']>;
  clearShipments?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  removeCartAddress?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addCartAddress?: Maybe<CartType>;
  updateCartDynamicProperties?: Maybe<CartType>;
  updateCartItemDynamicProperties?: Maybe<CartType>;
  updateCartPaymentDynamicProperties?: Maybe<CartType>;
  updateCartShipmentDynamicProperties?: Maybe<CartType>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']>;
  processOrderPayment?: Maybe<ProcessPaymentRequestResultType>;
  updateOrderDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderItemDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderPaymentDynamicProperties?: Maybe<CustomerOrderType>;
  updateOrderShipmentDynamicProperties?: Maybe<CustomerOrderType>;
};


export type MutationsUpdateMemberAddressesArgs = {
  command: InputUpdateMemberAddressType;
};


export type MutationsUpdateOrganizationArgs = {
  command: InputUpdateOrganizationType;
};


export type MutationsCreateOrganizationArgs = {
  command: InputCreateOrganizationType;
};


export type MutationsCreateContactArgs = {
  command: InputCreateContactType;
};


export type MutationsUpdateContactArgs = {
  command: InputUpdateContactType;
};


export type MutationsDeleteContactArgs = {
  command: InputDeleteContactType;
};


export type MutationsUpdatePersonalDataArgs = {
  command: InputUpdatePersonalDataType;
};


export type MutationsUpdateMemberDynamicPropertiesArgs = {
  command: InputUpdateMemberDynamicPropertiesType;
};


export type MutationsSendVerifyEmailArgs = {
  command?: Maybe<InputSendVerifyEmailType>;
};


export type MutationsResetPasswordByTokenArgs = {
  command?: Maybe<InputResetPasswordByTokenType>;
};


export type MutationsInviteUserArgs = {
  command: InputInviteUserType;
};


export type MutationsRegisterByInvitationArgs = {
  command: InputRegisterByInvitationType;
};


export type MutationsCreateUserArgs = {
  command: InputCreateUserType;
};


export type MutationsUpdateUserArgs = {
  command: InputUpdateUserType;
};


export type MutationsDeleteUsersArgs = {
  command: InputDeleteUserType;
};


export type MutationsUpdateRoleArgs = {
  command: InputUpdateRoleType;
};


export type MutationsAddItemArgs = {
  command: InputAddItemType;
};


export type MutationsAddGiftItemsArgs = {
  command: InputAddGiftItemsType;
};


export type MutationsRejectGiftItemsArgs = {
  command: InputRejectGiftItemsType;
};


export type MutationsClearCartArgs = {
  command: InputClearCartType;
};


export type MutationsChangeCommentArgs = {
  command?: Maybe<InputChangeCommentType>;
};


export type MutationsChangeCartItemPriceArgs = {
  command: InputChangeCartItemPriceType;
};


export type MutationsChangeCartItemQuantityArgs = {
  command: InputChangeCartItemQuantityType;
};


export type MutationsChangeCartItemCommentArgs = {
  command?: Maybe<InputChangeCartItemCommentType>;
};


export type MutationsRemoveCartItemArgs = {
  command: InputRemoveItemType;
};


export type MutationsAddCouponArgs = {
  command: InputAddCouponType;
};


export type MutationsRemoveCouponArgs = {
  command: InputRemoveCouponType;
};


export type MutationsRemoveShipmentArgs = {
  command: InputRemoveShipmentType;
};


export type MutationsAddOrUpdateCartShipmentArgs = {
  command: InputAddOrUpdateCartShipmentType;
};


export type MutationsAddOrUpdateCartPaymentArgs = {
  command: InputAddOrUpdateCartPaymentType;
};


export type MutationsValidateCouponArgs = {
  command: InputValidateCouponType;
};


export type MutationsMergeCartArgs = {
  command: InputMergeCartType;
};


export type MutationsRemoveCartArgs = {
  command: InputRemoveCartType;
};


export type MutationsClearShipmentsArgs = {
  command: InputClearShipmentsType;
};


export type MutationsClearPaymentsArgs = {
  command: InputClearPaymentsType;
};


export type MutationsAddOrUpdateCartAddressArgs = {
  command: InputAddOrUpdateCartAddressType;
};


export type MutationsRemoveCartAddressArgs = {
  command: InputRemoveCartAddressType;
};


export type MutationsAddItemsCartArgs = {
  command: InputAddItemsType;
};


export type MutationsAddCartAddressArgs = {
  command: InputAddOrUpdateCartAddressType;
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


export type MutationsCreateOrderFromCartArgs = {
  command: InputCreateOrderFromCartType;
};


export type MutationsChangeOrderStatusArgs = {
  command: InputChangeOrderStatusType;
};


export type MutationsProcessOrderPaymentArgs = {
  command: InputProcessOrderPaymentType;
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

export type MemberType = {
  id: Scalars['String'];
  memberType: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  addresses?: Maybe<Array<Maybe<MemberAddressType>>>;
  /** Contact's dynamic property values */
  dynamicProperties: Array<Maybe<DynamicPropertyValueType>>;
  phones: Array<Maybe<Scalars['String']>>;
};


export type MemberTypeDynamicPropertiesArgs = {
  cultureName?: Maybe<Scalars['String']>;
};

export type InputUpdateMemberAddressType = {
  memberId: Scalars['String'];
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
  /** Outer id */
  outerId?: Maybe<Scalars['String']>;
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
  succeeded: Scalars['Boolean'];
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorType>>>;
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

export type InputUpdateMemberDynamicPropertiesType = {
  memberId: Scalars['String'];
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputDynamicPropertyValueType = {
  /** Dynamic property name */
  name: Scalars['String'];
  /** Dynamic property value. ID must be passed for dictionary item */
  value?: Maybe<Scalars['String']>;
  /** Language ("en-US") for multilingual property */
  locale?: Maybe<Scalars['String']>;
  /** Culture name ("en-US") for multilingual property */
  cultureName?: Maybe<Scalars['String']>;
};

export type InputSendVerifyEmailType = {
  email?: Maybe<Scalars['String']>;
};

export type InputResetPasswordByTokenType = {
  /** User password reset token */
  token: Scalars['String'];
  /** User identifier */
  userId: Scalars['String'];
  /** New password according with system security policy */
  newPassword: Scalars['String'];
};

export type InputInviteUserType = {
  /** ID of store which will send invites */
  storeId: Scalars['String'];
  /** ID of organization where contact will be added for user */
  organizationId: Scalars['String'];
  /** Optional URL suffix: you may provide here relative URL to your page which handle registration by invite */
  urlSuffix?: Maybe<Scalars['String']>;
  /** Emails which will receive invites */
  emails: Array<Scalars['String']>;
  /** Optional message to include into email with instructions which invites persons will see */
  message?: Maybe<Scalars['String']>;
};

export type InputRegisterByInvitationType = {
  /** ID of use created for invited email */
  userId: Scalars['String'];
  /** Invitation token */
  token: Scalars['String'];
  /** First name of person */
  firstName: Scalars['String'];
  /** Last name of person */
  lastName: Scalars['String'];
  /** Phone */
  phone?: Maybe<Scalars['String']>;
  /** Username */
  username: Scalars['String'];
  /** Password */
  password: Scalars['String'];
};

export type InputCreateUserType = {
  /** Application user to create */
  applicationUser: InputCreateApplicationUserType;
};

export type InputCreateApplicationUserType = {
  /** Username of the creator */
  createdBy?: Maybe<Scalars['String']>;
  /** Date of user creation */
  createdDate?: Maybe<Scalars['DateTime']>;
  /** User Email */
  email: Scalars['String'];
  /** User ID */
  id?: Maybe<Scalars['String']>;
  /** Can user be locked out */
  lockoutEnabled?: Maybe<Scalars['Boolean']>;
  /** End date of lockout */
  lockoutEnd?: Maybe<Scalars['DateTime']>;
  /** External logins */
  logins?: Maybe<Array<Maybe<InputApplicationUserLoginType>>>;
  /** Id of the associated Member */
  memberId?: Maybe<Scalars['String']>;
  /** User password (nullable, for external logins) */
  password?: Maybe<Scalars['String']>;
  /** User phone number */
  phoneNumber?: Maybe<Scalars['String']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: Maybe<Scalars['Boolean']>;
  /** User photo URL */
  photoUrl?: Maybe<Scalars['String']>;
  /** List of user roles */
  roles?: Maybe<Array<Maybe<InputAssignRoleType>>>;
  /** Associated Store Id */
  storeId?: Maybe<Scalars['String']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  /** User name */
  userName: Scalars['String'];
  /** User type (Manager, Customer) */
  userType: Scalars['String'];
  /** Password expiration date */
  passwordExpired?: Maybe<Scalars['Boolean']>;
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
  /** Application user to update */
  applicationUser: InputUpdateApplicationUserType;
};

export type InputUpdateApplicationUserType = {
  /** Failed login attempts for the current user */
  accessFailedCount?: Maybe<Scalars['Int']>;
  /** User Email */
  email: Scalars['String'];
  /** User ID */
  id: Scalars['String'];
  /** Can user be locked out */
  lockoutEnabled?: Maybe<Scalars['Boolean']>;
  /** End date of lockout */
  lockoutEnd?: Maybe<Scalars['DateTime']>;
  /** Id of the associated Memeber */
  memberId?: Maybe<Scalars['String']>;
  /** User phone number */
  phoneNumber?: Maybe<Scalars['String']>;
  /** Is user phone number confirmed */
  phoneNumberConfirmed?: Maybe<Scalars['Boolean']>;
  /** User photo URL */
  photoUrl?: Maybe<Scalars['String']>;
  /** List of user roles */
  roles?: Maybe<Array<Maybe<InputAssignRoleType>>>;
  /** Associated Store Id */
  storeId?: Maybe<Scalars['String']>;
  /** Is Two Factor Authentication enabled */
  twoFactorEnabled?: Maybe<Scalars['Boolean']>;
  /** User name */
  userName: Scalars['String'];
  /** User type (Manager, Customer) */
  userType: Scalars['String'];
  /** Password Hash */
  passwordHash?: Maybe<Scalars['String']>;
  /** SecurityStamp */
  securityStamp: Scalars['String'];
};

export type InputDeleteUserType = {
  userNames: Array<Maybe<Scalars['String']>>;
};

export type InputUpdateRoleType = {
  /** Role to update */
  role: InputUpdateRoleInnerType;
};

export type InputUpdateRoleInnerType = {
  /** Concurrency Stamp */
  concurrencyStamp?: Maybe<Scalars['String']>;
  /** Role ID */
  id: Scalars['String'];
  /** Role name */
  name: Scalars['String'];
  /** Role description */
  description?: Maybe<Scalars['String']>;
  /** List of Role permissions */
  permissions: Array<Maybe<InputAssignPermissionType>>;
};

export type InputAddItemType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  productId: Scalars['String'];
  quantity: Scalars['Int'];
  price?: Maybe<Scalars['Decimal']>;
  comment?: Maybe<Scalars['String']>;
};

export type InputAddGiftItemsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  /** Ids of gift rewards to add to cart */
  ids: Array<Maybe<Scalars['String']>>;
};

export type InputRejectGiftItemsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  /** Ids of gift lineItems to reject from cart */
  ids: Array<Maybe<Scalars['String']>>;
};

export type InputClearCartType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputChangeCommentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
};

export type InputChangeCartItemPriceType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  price: Scalars['Decimal'];
};

export type InputChangeCartItemQuantityType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  quantity: Scalars['Int'];
};

export type InputChangeCartItemCommentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  comment: Scalars['String'];
};

export type InputRemoveItemType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
};

export type InputAddCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode: Scalars['String'];
};

export type InputRemoveCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  couponCode?: Maybe<Scalars['String']>;
};

export type InputRemoveShipmentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipmentId?: Maybe<Scalars['String']>;
};

export type InputAddOrUpdateCartShipmentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipment: InputShipmentType;
};

export type InputShipmentType = {
  /** Shipment Id */
  id?: Maybe<Scalars['OptionalString']>;
  /** Fulfillment center id */
  fulfillmentCenterId?: Maybe<Scalars['OptionalString']>;
  /** Value of height */
  height?: Maybe<Scalars['OptionalNullableDecimal']>;
  /** Value of length */
  length?: Maybe<Scalars['OptionalNullableDecimal']>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars['OptionalString']>;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars['OptionalString']>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars['OptionalString']>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars['OptionalNullableDecimal']>;
  /** Value of weight */
  weight?: Maybe<Scalars['OptionalNullableDecimal']>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars['OptionalString']>;
  /** Value of width */
  width?: Maybe<Scalars['OptionalNullableDecimal']>;
  deliveryAddress?: Maybe<InputAddressType>;
  currency?: Maybe<Scalars['OptionalString']>;
  price?: Maybe<Scalars['OptionalDecimal']>;
};



export type InputAddressType = {
  /** Id */
  id?: Maybe<Scalars['String']>;
  /** City */
  city?: Maybe<Scalars['OptionalString']>;
  /** Country code */
  countryCode?: Maybe<Scalars['OptionalString']>;
  /** Country name */
  countryName?: Maybe<Scalars['OptionalString']>;
  /** Email */
  email?: Maybe<Scalars['OptionalString']>;
  /** First name */
  firstName?: Maybe<Scalars['OptionalString']>;
  /** Id */
  key?: Maybe<Scalars['OptionalString']>;
  /** Last name */
  lastName?: Maybe<Scalars['OptionalString']>;
  /** Line1 */
  line1?: Maybe<Scalars['OptionalString']>;
  /** Line2 */
  line2?: Maybe<Scalars['OptionalString']>;
  /** Middle name */
  middleName?: Maybe<Scalars['OptionalString']>;
  /** Name */
  name?: Maybe<Scalars['OptionalString']>;
  /** Company name */
  organization?: Maybe<Scalars['OptionalString']>;
  /** Phone */
  phone?: Maybe<Scalars['OptionalString']>;
  /** Postal code */
  postalCode?: Maybe<Scalars['OptionalString']>;
  /** Region id */
  regionId?: Maybe<Scalars['OptionalString']>;
  /** Region name */
  regionName?: Maybe<Scalars['OptionalString']>;
  /** Zip */
  zip?: Maybe<Scalars['OptionalString']>;
  /** Outer id */
  outerId?: Maybe<Scalars['OptionalString']>;
  addressType?: Maybe<Scalars['Int']>;
};


export type InputAddOrUpdateCartPaymentType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  payment: InputPaymentType;
};

export type InputPaymentType = {
  /** the payment id */
  id?: Maybe<Scalars['OptionalString']>;
  /** Value of payment outer id */
  outerId?: Maybe<Scalars['OptionalString']>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars['OptionalString']>;
  billingAddress?: Maybe<InputAddressType>;
  currency?: Maybe<Scalars['OptionalString']>;
  price?: Maybe<Scalars['OptionalDecimal']>;
  amount?: Maybe<Scalars['OptionalDecimal']>;
};

export type InputValidateCouponType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  coupon: Scalars['String'];
};

export type InputMergeCartType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
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
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputClearPaymentsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
};

export type InputAddOrUpdateCartAddressType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  address: InputAddressType;
};

export type InputRemoveCartAddressType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  addressId: Scalars['String'];
};

export type InputAddItemsType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  cartItems: Array<Maybe<InputNewCartItemType>>;
};

export type InputNewCartItemType = {
  /** Product Id */
  productId: Scalars['String'];
  /** Product quantity */
  quantity?: Maybe<Scalars['Int']>;
};

export type InputUpdateCartDynamicPropertiesType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateCartItemDynamicPropertiesType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  lineItemId: Scalars['String'];
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateCartPaymentDynamicPropertiesType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  paymentId: Scalars['String'];
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateCartShipmentDynamicPropertiesType = {
  cartId?: Maybe<Scalars['String']>;
  storeId: Scalars['String'];
  cartName?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  currencyCode?: Maybe<Scalars['String']>;
  cultureName?: Maybe<Scalars['String']>;
  cartType?: Maybe<Scalars['String']>;
  shipmentId: Scalars['String'];
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputCreateOrderFromCartType = {
  cartId?: Maybe<Scalars['String']>;
};

export type InputChangeOrderStatusType = {
  orderId: Scalars['String'];
  status: Scalars['String'];
};

export type ProcessPaymentRequestResultType = {
  isSuccess: Scalars['Boolean'];
  htmlForm?: Maybe<Scalars['String']>;
  newPaymentStatus?: Maybe<Scalars['String']>;
  outerId?: Maybe<Scalars['String']>;
  redirectUrl?: Maybe<Scalars['String']>;
  errorMessage?: Maybe<Scalars['String']>;
};

export type InputProcessOrderPaymentType = {
  orderId: Scalars['String'];
  paymentId: Scalars['String'];
  bankCardInfo?: Maybe<InputOrderBankCardInfoType>;
};

export type InputOrderBankCardInfoType = {
  bankCardNumber: Scalars['String'];
  bankCardType: Scalars['String'];
  bankCardMonth: Scalars['Int'];
  bankCardYear: Scalars['Int'];
  bankCardCVV2: Scalars['String'];
  cardholderName: Scalars['String'];
};

export type InputUpdateOrderDynamicPropertiesType = {
  orderId?: Maybe<Scalars['String']>;
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateOrderItemDynamicPropertiesType = {
  orderId?: Maybe<Scalars['String']>;
  lineItemId?: Maybe<Scalars['String']>;
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateOrderPaymentDynamicPropertiesType = {
  orderId?: Maybe<Scalars['String']>;
  paymentId?: Maybe<Scalars['String']>;
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type InputUpdateOrderShipmentDynamicPropertiesType = {
  orderId?: Maybe<Scalars['String']>;
  shipmentId?: Maybe<Scalars['String']>;
  dynamicProperties: Array<Maybe<InputDynamicPropertyValueType>>;
};

export type UpdatePersonalDataMutationVariables = Exact<{
  command: InputUpdatePersonalDataType;
}>;


export type UpdatePersonalDataMutation = { updatePersonalData?: Maybe<(
    Pick<IdentityResultType, 'succeeded'>
    & { errors?: Maybe<Array<Maybe<Pick<IdentityErrorType, 'code' | 'description'>>>> }
  )> };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { me?: Maybe<(
    Pick<UserType, 'id' | 'userName' | 'email' | 'emailConfirmed' | 'photoUrl' | 'phoneNumber' | 'permissions'>
    & { contact?: Maybe<Pick<ContactType, 'firstName' | 'lastName' | 'fullName'>> }
  )> };

export type GetMyAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyAddressesQuery = { me?: Maybe<{ contact?: Maybe<{ addresses?: Maybe<{ items?: Maybe<Array<Maybe<MemberAddressFieldsFragment>>> }> }> }> };

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
        & { product?: Maybe<Pick<Product, 'slug' | 'name'>>, price?: Maybe<MoneyFieldsFragment> }
      )>>, currency?: Maybe<Pick<CurrencyType, 'code'>>, total?: Maybe<MoneyFieldsFragment> }
    )>>> }
  )> };

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
    )>>> }> };

export type GetAvailShippingMethodsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
}>;


export type GetAvailShippingMethodsQuery = { cart?: Maybe<{ availableShippingMethods?: Maybe<Array<Maybe<(
      Pick<ShippingMethodType, 'id' | 'code' | 'logoUrl' | 'optionName'>
      & { price?: Maybe<MoneyFieldsFragment> }
    )>>> }> };

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
      & { deliveryAddress?: Maybe<CartAddressFieldsFragment> }
    )>>>, discounts?: Maybe<Array<Maybe<Pick<DiscountType, 'promotionId' | 'description' | 'amount' | 'coupon'>>>>, payments?: Maybe<Array<Maybe<(
      Pick<PaymentType, 'id' | 'paymentGatewayCode'>
      & { billingAddress?: Maybe<CartAddressFieldsFragment> }
    )>>>, addresses?: Maybe<Array<Maybe<CartAddressFieldsFragment>>>, items?: Maybe<Array<Maybe<LineItemFieldsFragment>>>, currency?: Maybe<CurrencyFieldsFragment>, total?: Maybe<MoneyFieldsFragment>, discountTotal?: Maybe<MoneyFieldsFragment>, subTotal?: Maybe<MoneyFieldsFragment>, shippingTotal?: Maybe<MoneyFieldsFragment>, shippingPrice?: Maybe<MoneyFieldsFragment>, taxTotal?: Maybe<MoneyFieldsFragment>, extendedPriceTotal?: Maybe<MoneyFieldsFragment>, extendedPriceTotalWithTax?: Maybe<MoneyFieldsFragment>, validationErrors?: Maybe<Array<Maybe<(
      Pick<ValidationErrorType, 'errorCode' | 'errorMessage' | 'objectId'>
      & { errorParameters?: Maybe<Array<Maybe<Pick<ErrorParameterType, 'key' | 'value'>>>> }
    )>>> }
  )> };

export type GetProductQueryVariables = Exact<{
  storeId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
}>;


export type GetProductQuery = { product?: Maybe<(
    Pick<Product, 'name' | 'id' | 'code' | 'slug' | 'outline' | 'imgSrc'>
    & { images?: Maybe<Array<Maybe<Pick<ImageType, 'url'>>>>, breadcrumbs?: Maybe<Array<Maybe<Pick<Breadcrumb, 'title' | 'seoPath'>>>>, description?: Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>, descriptions?: Maybe<Array<Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>>>, properties?: Maybe<Array<Maybe<Pick<Property, 'name' | 'value' | 'type'>>>>, variations?: Maybe<Array<Maybe<(
      Pick<VariationType, 'id' | 'code'>
      & { properties?: Maybe<Array<Maybe<Pick<Property, 'name' | 'value' | 'type'>>>>, availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>, price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
    )>>>, availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>, price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
  )> };

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
    )>>> }
  )> };

export type SearchProductsQueryVariables = Exact<{
  storeId: Scalars['String'];
  userId: Scalars['String'];
  currencyCode: Scalars['String'];
  cultureName?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  sort?: Maybe<Scalars['String']>;
}>;


export type SearchProductsQuery = { products?: Maybe<(
    Pick<ProductConnection, 'totalCount'>
    & { items?: Maybe<Array<Maybe<(
      Pick<Product, 'name' | 'id' | 'code' | 'slug' | 'outline' | 'imgSrc'>
      & { images?: Maybe<Array<Maybe<Pick<ImageType, 'url'>>>>, description?: Maybe<Pick<DescriptionType, 'content' | 'id' | 'languageCode' | 'reviewType'>>, availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>, price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
    )>>>, term_facets?: Maybe<Array<Maybe<(
      Pick<TermFacet, 'name'>
      & { terms?: Maybe<Array<Maybe<Pick<FacetTermType, 'term' | 'count' | 'isSelected'>>>> }
    )>>>, range_facets?: Maybe<Array<Maybe<(
      Pick<RangeFacet, 'name'>
      & { ranges?: Maybe<Array<Maybe<Pick<FacetRangeType, 'label' | 'count' | 'from' | 'to' | 'isSelected'>>>> }
    )>>> }
  )> };

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
          & { availabilityData?: Maybe<Pick<AvailabilityData, 'isActive' | 'isAvailable' | 'isBuyable' | 'isInStock' | 'availableQuantity'>>, price?: Maybe<{ actual?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, discountAmount?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, sale?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>>, list?: Maybe<Pick<MoneyType, 'amount' | 'formattedAmount'>> }> }
        )> }>>> }> }
  )> };

export type CartAddressFieldsFragment = Pick<CartAddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

export type CurrencyFieldsFragment = Pick<CurrencyType, 'code' | 'customFormatting' | 'exchangeRate' | 'symbol'>;

export type LineItemFieldsFragment = (
  Pick<LineItemType, 'id' | 'imageUrl' | 'inStockQuantity' | 'isGift' | 'isReadOnly' | 'isReccuring' | 'isValid' | 'name' | 'productId' | 'quantity' | 'sku' | 'thumbnailImageUrl'>
  & { validationErrors?: Maybe<Array<Maybe<(
    Pick<ValidationErrorType, 'errorCode' | 'errorMessage'>
    & { errorParameters?: Maybe<Array<Maybe<Pick<ErrorParameterType, 'key' | 'value'>>>> }
  )>>>, extendedPrice?: Maybe<MoneyFieldsFragment>, listPrice?: Maybe<MoneyFieldsFragment>, taxTotal?: Maybe<MoneyFieldsFragment> }
);

export type MemberAddressFieldsFragment = Pick<MemberAddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

export type MoneyFieldsFragment = (
  Pick<MoneyType, 'amount' | 'decimalDigits' | 'formattedAmount' | 'formattedAmountWithoutCurrency' | 'formattedAmountWithoutPoint' | 'formattedAmountWithoutPointAndCurrency'>
  & { currency?: Maybe<CurrencyFieldsFragment> }
);

export type OrderAddressFieldsFragment = Pick<OrderAddressType, 'id' | 'name' | 'organization' | 'firstName' | 'lastName' | 'line1' | 'line2' | 'city' | 'countryCode' | 'countryName' | 'regionId' | 'regionName' | 'postalCode' | 'zip' | 'phone' | 'email' | 'addressType'>;

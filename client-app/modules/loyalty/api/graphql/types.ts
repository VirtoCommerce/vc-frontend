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
  Long: { input: number; output: number; }
  PropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
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
  url: Scalars['String']['output'];
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
  bannerUrl?: Maybe<Scalars['String']['output']>;
  /** Brand property name. */
  brandPropertyName?: Maybe<Scalars['String']['output']>;
  /** Unlocalized brand name. */
  brandPropertyValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** Indicates if the brand is featured. */
  featured?: Maybe<Scalars['Boolean']['output']>;
  /** Brand ID. */
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
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
  imgSrc?: Maybe<Scalars['String']['output']>;
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
  url: Scalars['String']['output'];
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

/** Represents the result of a loyalty balance operation. */
export type LoyaltyBalanceResult = {
  /** The current balance of the loyalty account. */
  currentBalance: Scalars['Decimal']['output'];
  /** The resulting balance after applying the operation. */
  resultBalance: Scalars['Decimal']['output'];
};

/** Per-SKU accumulation for a PerSku mission. */
export type LoyaltyMissionProgressItem = {
  /** The accumulated quantity. */
  currentQuantity: Scalars['Int']['output'];
  product?: Maybe<Product>;
  /** The SKU product id. */
  productId?: Maybe<Scalars['String']['output']>;
  /** The target quantity. */
  targetQuantity: Scalars['Int']['output'];
};

/** Represents a log entry for a loyalty program operation. */
export type LoyaltyOperationLog = {
  /** The amount involved in the operation. */
  amount: Scalars['Decimal']['output'];
  /** The date and time when the log entry was created. */
  createdDate: Scalars['DateTime']['output'];
  /** The unique identifier of the log entry. */
  id: Scalars['String']['output'];
  object?: Maybe<LoyaltyOperationLogObject>;
  /** The type of operation (e.g., Earned, Redeemed). */
  operationType: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `LoyaltyOperationLog`. */
export type LoyaltyOperationLogConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<LoyaltyOperationLogEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<LoyaltyOperationLog>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `LoyaltyOperationLog`. */
export type LoyaltyOperationLogEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<LoyaltyOperationLog>;
};

/** Represents the object associated with a loyalty program operation log entry. */
export type LoyaltyOperationLogObject = {
  /** The identifier of the order associated with the operation, if applicable. */
  orderId?: Maybe<Scalars['String']['output']>;
  /** The number of the order associated with the operation, if applicable. */
  orderNumber?: Maybe<Scalars['String']['output']>;
  /** The type of the object associated with the operation. */
  type: Scalars['String']['output'];
};

/** Represents a loyalty mission together with the current user's progress. */
export type LoyaltyUserMission = {
  /** The mission banner image URL. */
  bannerUrl?: Maybe<Scalars['String']['output']>;
  /** The date and time when the mission was completed. */
  completedDate?: Maybe<Scalars['DateTime']['output']>;
  /** The accumulated value towards the mission target. */
  currentValue?: Maybe<Scalars['Decimal']['output']>;
  /** Whole days left until the mission ends. Null when the mission has no end date. */
  daysRemaining?: Maybe<Scalars['Int']['output']>;
  /** The localized mission description. */
  description?: Maybe<Scalars['String']['output']>;
  /** The mission end date. */
  endDate?: Maybe<Scalars['DateTime']['output']>;
  /** Whether the user has started the mission. */
  isStarted?: Maybe<Scalars['Boolean']['output']>;
  /** Per-SKU progress items for PerSku missions. */
  items?: Maybe<Array<Maybe<LoyaltyMissionProgressItem>>>;
  /** The localized mission name. */
  localizedName?: Maybe<Scalars['String']['output']>;
  /** The store main currency used to format the target/current money values. */
  missionCurrency?: Maybe<CurrencyType>;
  /** The mission identifier. */
  missionId?: Maybe<Scalars['String']['output']>;
  /** The mission type: OrderValue, OrderCount, PerSkuAny or PerSkuAll. */
  missionType?: Maybe<Scalars['String']['output']>;
  /** The internal mission name. */
  name?: Maybe<Scalars['String']['output']>;
  /** The completion percentage (0-100). */
  percentage?: Maybe<Scalars['Decimal']['output']>;
  /** The end of the mission occurrence window. */
  periodEnd?: Maybe<Scalars['DateTime']['output']>;
  /** The start of the mission occurrence window. */
  periodStart?: Maybe<Scalars['DateTime']['output']>;
  /** The progress identifier. Null when the user has not started the mission yet. */
  progressId?: Maybe<Scalars['String']['output']>;
  /** The loyalty points granted on completion. */
  rewardPoints?: Maybe<MoneyType>;
  /** The mission start date. */
  startDate?: Maybe<Scalars['DateTime']['output']>;
  /** The progress status (InProgress, Completed, Expired). */
  status?: Maybe<Scalars['String']['output']>;
  /** The mission target value. */
  targetValue?: Maybe<Scalars['Decimal']['output']>;
};

/** A connection from an object to a list of objects of type `LoyaltyUserMission`. */
export type LoyaltyUserMissionConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<LoyaltyUserMissionEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<LoyaltyUserMission>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `LoyaltyUserMission`. */
export type LoyaltyUserMissionEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<LoyaltyUserMission>;
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
  imgSrc?: Maybe<Scalars['String']['output']>;
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
  loyaltyBalance?: Maybe<LoyaltyBalanceResult>;
  loyaltyMissionProgress?: Maybe<LoyaltyUserMissionConnection>;
  loyaltyPointsHistory?: Maybe<LoyaltyOperationLogConnection>;
};


export type QueryLoyaltyBalanceArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLoyaltyMissionProgressArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  completedEndDate?: InputMaybe<Scalars['DateTime']['input']>;
  completedStartDate?: InputMaybe<Scalars['DateTime']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isStarted?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLoyaltyPointsHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  operationType?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type Rating = {
  /** Total count of customer reviews */
  reviewCount: Scalars['Int']['output'];
  /** Average rating */
  value: Scalars['Decimal']['output'];
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

export type GetLoyaltyBalanceQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyBalanceQuery = { loyaltyBalance?: { currentBalance: number, resultBalance: number } };

export type GetLoyaltyMissionProgressQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  isStarted?: InputMaybe<Scalars['Boolean']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
}>;


export type GetLoyaltyMissionProgressQuery = { loyaltyMissionProgress?: { totalCount?: number, items?: Array<{ missionId?: string, progressId?: string, name?: string, localizedName?: string, description?: string, bannerUrl?: string, missionType?: string, status?: string, isStarted?: boolean, percentage?: number, currentValue?: number, targetValue?: number, startDate?: any, endDate?: any, periodStart?: any, periodEnd?: any, completedDate?: any, daysRemaining?: number, missionCurrency?: { code: string, symbol: string }, rewardPoints?: { amount: number }, items?: Array<{ productId?: string, currentQuantity: number, targetQuantity: number, product?: { id: string, name: string, slug?: string, imgSrc?: string } }> }>, pageInfo: { hasNextPage: boolean, endCursor?: string } } };

export type GetLoyaltyPointsHistoryQueryVariables = Exact<{
  sort?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  operationType?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyPointsHistoryQuery = { loyaltyPointsHistory?: { totalCount?: number, items?: Array<{ id: string, operationType: string, amount: number, createdDate: any, object?: { type: string, orderId?: string, orderNumber?: string } }> } };


export const GetLoyaltyBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentBalance"}},{"kind":"Field","name":{"kind":"Name","value":"resultBalance"}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyBalanceQuery, GetLoyaltyBalanceQueryVariables>;
export const GetLoyaltyMissionProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyMissionProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isStarted"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyMissionProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"isStarted"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isStarted"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"progressId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isStarted"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"targetValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"periodStart"}},{"kind":"Field","name":{"kind":"Name","value":"periodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"completedDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"missionCurrency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardPoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"currentQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"targetQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"imgSrc"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyMissionProgressQuery, GetLoyaltyMissionProgressQueryVariables>;
export const GetLoyaltyPointsHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyPointsHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyPointsHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"operationType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyPointsHistoryQuery, GetLoyaltyPointsHistoryQueryVariables>;
export const OperationNames = {
  Query: {
    GetLoyaltyBalance: 'GetLoyaltyBalance',
    GetLoyaltyMissionProgress: 'GetLoyaltyMissionProgress',
    GetLoyaltyPointsHistory: 'GetLoyaltyPointsHistory'
  }
}
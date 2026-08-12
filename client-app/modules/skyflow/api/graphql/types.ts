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
  Date: { input: string; output: string; }
  DateTime: { input: any; output: any; }
  Decimal: { input: number; output: number; }
  DynamicPropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
  Long: { input: number; output: number; }
  ModuleSettingValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
  OptionalDecimal: { input: number | undefined; output: number | undefined; }
  OptionalNullableDecimal: { input: number | null | undefined; output: number | null | undefined; }
  OptionalString: { input: string | undefined; output: string | undefined; }
  PropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null; }
  Seconds: { input: number; output: number; }
  StoreAssetUrl: { input: any; output: any; }
};

export type AccountCreationResultType = {
  /** The errors that occurred during the operation. */
  errors?: Maybe<Array<Maybe<RegistrationErrorType>>>;
  requireEmailVerification: Scalars['Boolean']['output'];
  succeeded: Scalars['Boolean']['output'];
};

export type ActivateBackInStockSubscriptionCommandType = {
  productId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type AddAddressToFavoritesCommandType = {
  addressId: Scalars['String']['input'];
};

export type AddQuoteAttachmentsCommandType = {
  quoteId: Scalars['String']['input'];
  urls: Array<InputMaybe<Scalars['String']['input']>>;
};

export type AddQuoteItemsCommandType = {
  newQuoteItems: Array<InputMaybe<InputNewQuoteItemType>>;
  quoteId: Scalars['String']['input'];
};

export type AddressDuplicatedResultType = {
  /** Indicates whether the address is a duplicate of an existing address. */
  isDuplicated: Scalars['Boolean']['output'];
};

export type ApproveQuoteCommandType = {
  quoteId: Scalars['String']['input'];
};

export type ApproveQuoteResultType = {
  id: Scalars['String']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
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

/** A connection from an object to a list of objects of type `BackInStockSubscription`. */
export type BackInStockSubscriptionConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<BackInStockSubscriptionEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<BackInStockSubscriptionType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `BackInStockSubscription`. */
export type BackInStockSubscriptionEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<BackInStockSubscriptionType>;
};

export type BackInStockSubscriptionType = {
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  memberId?: Maybe<Scalars['String']['output']>;
  productCode?: Maybe<Scalars['String']['output']>;
  productId: Scalars['String']['output'];
  productName?: Maybe<Scalars['String']['output']>;
  storeId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `Brand`. */
export type BrandConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<BrandEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<BrandType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Brand`. */
export type BrandEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<BrandType>;
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

export type BuilderPageItemType = {
  content?: Maybe<Scalars['String']['output']>;
  /** Page permalink */
  permalink?: Maybe<Scalars['String']['output']>;
};

export type BulkCartType = {
  /** Cart */
  cart?: Maybe<CartType>;
  /** A set of errors in case the SKUs are invalid */
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

export type CartConfigurationItemFileType = {
  /** MIME type of the file */
  contentType?: Maybe<Scalars['String']['output']>;
  /** Name of the file */
  name: Scalars['String']['output'];
  /** Size of the file */
  size: Scalars['Long']['output'];
  /** URL of the file */
  url: Scalars['String']['output'];
};

export type CartConfigurationItemType = {
  /** Configuration section that defines this configuration item */
  configurationSection?: Maybe<ConfigurationSectionType>;
  /** Custom text for 'Text' configuration item section */
  customText?: Maybe<Scalars['String']['output']>;
  /** Extended price */
  extendedPrice: MoneyType;
  /** List of files for 'File' configuration item section */
  files?: Maybe<Array<Maybe<CartConfigurationItemFileType>>>;
  /** Configuration item ID */
  id: Scalars['String']['output'];
  /** Configuration item image URL */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** List price */
  listPrice: MoneyType;
  /** Configuration item name */
  name?: Maybe<Scalars['String']['output']>;
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
  /** Whether the configuration item is selected for checkout */
  selectedForCheckout: Scalars['Boolean']['output'];
  /** Configuration item SKU */
  sku?: Maybe<Scalars['String']['output']>;
  /** Configuration item type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars['String']['output'];
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

/** A connection from an object to a list of objects of type `ProductPickupLocation`. */
export type CartPickupLocationConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductPickupLocationEdge>>>;
  /** Filter facets */
  filter_facets: Array<FilterFacet>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductPickupLocation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Range facets */
  range_facets: Array<RangeFacet>;
  /** Term facets */
  term_facets: Array<TermFacet>;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CartShipmentItemType = {
  lineItem?: Maybe<LineItemType>;
  /** Quantity */
  quantity: Scalars['Int']['output'];
};

export type CartTotalType = {
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

export type CartType = {
  /** Addresses */
  addresses: Array<CartAddressType>;
  /** Available Gifts */
  availableGifts: Array<GiftItemType>;
  /** Available payment methods */
  availablePaymentMethods: Array<PaymentMethodType>;
  availableShippingMethods: Array<ShippingMethodType>;
  /** Cart totals */
  cartTotals?: Maybe<Array<Maybe<CartTotalType>>>;
  /** Shopping cart channel ID */
  channelId?: Maybe<Scalars['String']['output']>;
  /** Cart checkout ID */
  checkoutId: Scalars['String']['output'];
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
  /** Items */
  items: Array<LineItemType>;
  /** Item count */
  itemsCount: Scalars['Int']['output'];
  /** Quantity of items */
  itemsQuantity: Scalars['Int']['output'];
  /** Get total points amount */
  loyaltyPoints?: Maybe<MoneyType>;
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


export type CartTypeValidationErrorsArgs = {
  ruleSet?: InputMaybe<Scalars['String']['input']>;
};

export type CartWithListType = {
  /** Shopping cart */
  cart?: Maybe<CartType>;
  /** Saved list */
  list?: Maybe<CartType>;
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

export type ChangeOrganizationLogoResultType = {
  errorMessage?: Maybe<Scalars['String']['output']>;
  isSuccess: Scalars['Boolean']['output'];
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

export type ConfigurableProductOptionInput = {
  /** Product ID */
  productId: Scalars['String']['input'];
  /** Quantity of product */
  quantity: Scalars['Int']['input'];
  /** Whether the configuration item is selected for checkout */
  selectedForCheckout?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConfigurableProductOptionKeyInput = {
  /** Product ID */
  productId: Scalars['String']['input'];
};

export type ConfigurationItemsResponseType = {
  /** Configuration items for configurable product */
  configurationItems?: Maybe<Array<Maybe<CartConfigurationItemType>>>;
};

export type ConfigurationLineItemType = {
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Total discount amount */
  discountAmount?: Maybe<MoneyType>;
  /** Extended price */
  extendedPrice?: Maybe<MoneyType>;
  /** The unique identifier */
  id?: Maybe<Scalars['String']['output']>;
  /** Whether the option is selected by default */
  isDefault: Scalars['Boolean']['output'];
  /** List price */
  listPrice?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  /** The quantity of the option */
  quantity: Scalars['Int']['output'];
  /** Sale price */
  salePrice?: Maybe<MoneyType>;
  /** The text of the Text-type option */
  text?: Maybe<Scalars['String']['output']>;
};

export type ConfigurationQueryResponseType = {
  configurationSections?: Maybe<Array<Maybe<ConfigurationSectionType>>>;
};

export type ConfigurationSectionInput = {
  /** Custom text for 'Text' section */
  customText?: InputMaybe<Scalars['String']['input']>;
  /** List of file links for 'File' section */
  fileUrls?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Configuration section option/product */
  option?: InputMaybe<ConfigurableProductOptionInput>;
  /** Configuration section ID */
  sectionId: Scalars['String']['input'];
  /** Configuration section type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars['String']['input'];
};

export type ConfigurationSectionKeyInput = {
  /** Identifying subset of the configuration section option (Product/Variation only) */
  option?: InputMaybe<ConfigurableProductOptionKeyInput>;
  /** Configuration section ID */
  sectionId: Scalars['String']['input'];
  /** Configuration section type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars['String']['input'];
};

export type ConfigurationSectionType = {
  /** Is custom text allowed for Text-type section */
  allowCustomText: Scalars['Boolean']['output'];
  /** Is predefined text options allowed for Text-type section */
  allowTextOptions: Scalars['Boolean']['output'];
  /** If set, this section is only shown when the referenced section has a selection made */
  dependsOnSectionId?: Maybe<Scalars['String']['output']>;
  /** Configuration section description */
  description?: Maybe<Scalars['String']['output']>;
  /** Configuration section id */
  id: Scalars['String']['output'];
  /** Is configuration section required */
  isRequired: Scalars['Boolean']['output'];
  /** Maximum text length for Text-type section */
  maxLength?: Maybe<Scalars['Int']['output']>;
  /** Configuration section name */
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ConfigurationLineItemType>>>;
  /** Configuration section type. Possible values: 'Product', 'Text', 'File' */
  type: Scalars['String']['output'];
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
  currencyCode?: Maybe<Scalars['String']['output']>;
  /** Default billing address */
  defaultBillingAddress?: Maybe<MemberAddressType>;
  defaultLanguage?: Maybe<Scalars['String']['output']>;
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
  isLockedInOrganization?: Maybe<Scalars['Boolean']['output']>;
  lastName: Scalars['String']['output'];
  /** Member type */
  memberType: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['String']['output']>;
  organizations?: Maybe<OrganizationConnection>;
  organizationsIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Outer ID */
  outerId?: Maybe<Scalars['String']['output']>;
  /** Phones */
  phones: Array<Maybe<Scalars['String']['output']>>;
  rolesInOrganization?: Maybe<Array<Maybe<RoleType>>>;
  securityAccounts?: Maybe<Array<Maybe<UserType>>>;
  /** Selected shipping address id. */
  selectedAddressId?: Maybe<Scalars['String']['output']>;
  /** Request related SEO info */
  seoInfo?: Maybe<SeoInfo>;
  /** SEO object type */
  seoObjectType: Scalars['String']['output'];
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
  /** Effective status for the current organization: the organization-specific override if set, otherwise the contact's global status. */
  statusInOrganization?: Maybe<Scalars['String']['output']>;
};


export type ContactTypeAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ContactTypeOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  /** Country regions. */
  regions: Array<CountryRegionType>;
};

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars['String']['output']>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully: Scalars['Boolean']['output'];
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

export type CreateReviewCommandType = {
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  imageUrls?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  rating: Scalars['Int']['input'];
  review: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type CreateReviewResult = {
  id?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
  /** A set of errors in case the review is invalid */
  validationErrors: Array<ReviewValidationErrorType>;
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

export type CustomIdentityResultType = {
  /** The errors that occurred during the identity operation. */
  errors?: Maybe<Array<Maybe<IdentityErrorInfoType>>>;
  succeeded: Scalars['Boolean']['output'];
};

export type CustomerCartStatistics = {
  /** Compares two periods (current vs previous). Reuses the period results, so a bucket shared with a 'period' selection is not queried again. */
  comparison?: Maybe<CustomerCartStatisticsComparison>;
  /** Currency all figures below are converted to. */
  currencyCode: Scalars['String']['output'];
  /** Cart statistics for a single date range. Omit both bounds for lifetime. */
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

export type CustomerCartStatisticsPeriod = {
  /** Average cart value in the range (amount, formatted amount and currency). */
  average: MoneyType;
  /** Number of carts in the range (the primary widget metric, e.g. 'Active Projects'). */
  count: Scalars['Int']['output'];
  /** Date of the most recent cart in the range. */
  lastCartDate?: Maybe<Scalars['DateTime']['output']>;
  /** Sum of cart totals in the range (amount, formatted amount and currency). */
  total: MoneyType;
  /** Non-null when the figures are partial because some carts were in an unconfigured currency and could not be converted; describes what was excluded. */
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

export type CustomerReview = {
  createdDate: Scalars['DateTime']['output'];
  entityId: Scalars['String']['output'];
  entityName: Scalars['String']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  images?: Maybe<Array<Maybe<CustomerReviewImage>>>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  rating: Scalars['Int']['output'];
  review: Scalars['String']['output'];
  reviewStatus?: Maybe<CustomerReviewStatus>;
  storeId: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
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

export type CustomerReviewImage = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum CustomerReviewStatus {
  Approved = 'APPROVED',
  New = 'NEW',
  Rejected = 'REJECTED'
}

export type DeactivateBackInStockSubscriptionCommandType = {
  productId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type DeclineQuoteCommandType = {
  quoteId: Scalars['String']['input'];
};

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

export type FaviconType = {
  /** Href of the favicon */
  href?: Maybe<Scalars['String']['output']>;
  /** Rel of the favicon */
  rel?: Maybe<Scalars['String']['output']>;
  /** Sizes of the favicon */
  sizes?: Maybe<Scalars['String']['output']>;
  /** Type of the favicon */
  type?: Maybe<Scalars['String']['output']>;
};

export type FcmSettingsType = {
  apiKey: Scalars['String']['output'];
  appId: Scalars['String']['output'];
  authDomain: Scalars['String']['output'];
  messagingSenderId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  storageBucket: Scalars['String']['output'];
  vapidKey: Scalars['String']['output'];
};

export type FileUploadScopeOptionsType = {
  allowAnonymousUpload: Scalars['Boolean']['output'];
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
  /** Display order of the facet. */
  order?: Maybe<Scalars['Int']['output']>;
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
  postalCode?: Maybe<Scalars['String']['output']>;
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
  /** Fulfillment Center description. */
  description?: Maybe<Scalars['String']['output']>;
  /** Fulfillment Center GEO location. */
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

export type GetRecentlyBrowsedResponseType = {
  products?: Maybe<Array<Maybe<Product>>>;
};

export type GetRecommendationsResponseType = {
  products?: Maybe<Array<Maybe<Product>>>;
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

export type InitializeCartPaymentResultType = {
  actionHtmlForm?: Maybe<Scalars['String']['output']>;
  actionRedirectUrl?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  isSuccess: Scalars['Boolean']['output'];
  paymentActionType?: Maybe<Scalars['String']['output']>;
  paymentId?: Maybe<Scalars['String']['output']>;
  paymentMethodCode?: Maybe<Scalars['String']['output']>;
  publicParameters?: Maybe<Array<Maybe<KeyValueType>>>;
  storeId?: Maybe<Scalars['String']['output']>;
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

export type InputAcceptRejectOrganizationInviteType = {
  /** ID of the organization the current user was invited to */
  organizationId: Scalars['String']['input'];
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

export type InputAddConfigurationItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration section to add */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputAddConfigurationItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** List of configuration sections to add */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
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

export type InputAddFcmTokenType = {
  token: Scalars['String']['input'];
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
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Create date. Optional, to manually control line item position in the cart if required. ISO-8601 format, for example: 2025-01-23T11:46:11Z */
  createdDate?: InputMaybe<Scalars['DateTime']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars['String']['input']>;
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
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Wish list ids */
  listIds: Array<InputMaybe<Scalars['String']['input']>>;
  /** Product id to add */
  productId: Scalars['String']['input'];
  /** Product quantity to add */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputAddWishlistItemType = {
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
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
  id?: InputMaybe<Scalars['OptionalString']['input']>;
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
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Order Id */
  orderId?: InputMaybe<Scalars['String']['input']>;
  /** Input parameters */
  parameters?: InputMaybe<Array<InputMaybe<InputKeyValueType>>>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
  /** Store Id */
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InputCartItemQuantityType = {
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** New quantity */
  quantity: Scalars['Int']['input'];
};

export type InputChangeAllCartConfigurationItemsSelectedType = {
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

export type InputChangeAllCartItemsSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartConfigurationItemSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration section that identifies the configuration item to toggle */
  configurationSection: ConfigurationSectionKeyInput;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** Is configuration item selected for checkout */
  selectedForCheckout: Scalars['Boolean']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartConfigurationItemsSelectedType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration sections that identify the configuration items to toggle */
  configurationSections: Array<ConfigurationSectionKeyInput>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartConfiguredItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item Id */
  lineItemId: Scalars['String']['input'];
  /** Quantity */
  quantity?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputChangeCartCurrencyType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Second cart currency */
  newCurrencyCode: Scalars['String']['input'];
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

export type InputChangeCartItemsQuantityType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  /** Cart items */
  cartItems: Array<InputMaybe<InputCartItemQuantityType>>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
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
  /** Contact member ID to be changed */
  memberId: Scalars['String']['input'];
  /** Role IDs or names to be assigned to the user within the organization */
  roleIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type InputChangeOrganizationLogoCommandType = {
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  organizationId: Scalars['String']['input'];
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
  /** Id of the principal the list is shared with (id space defined by scope) */
  sharedWithId?: InputMaybe<Scalars['String']['input']>;
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars['String']['input']>;
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
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars['String']['input']>;
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

export type InputCreateCartFromWishlistType = {
  /** Wishlist ID */
  listId: Scalars['String']['input'];
};

export type InputCreateConfiguredLineItemCommand = {
  configurableProductId: Scalars['String']['input'];
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InputCreateContactType = {
  about?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
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
  selectedAddressId?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type InputCreateOrderFromCartType = {
  /** Cart ID */
  cartId?: InputMaybe<Scalars['String']['input']>;
};

export type InputCreateOrganizationType = {
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  name?: InputMaybe<Scalars['String']['input']>;
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
  /** Id of the principal the list is shared with (id space defined by scope) */
  sharedWithId?: InputMaybe<Scalars['String']['input']>;
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars['String']['input']>;
  /** Store ID */
  storeId: Scalars['String']['input'];
  /** Owner ID */
  userId: Scalars['String']['input'];
};

export type InputDeleteContactType = {
  contactId: Scalars['String']['input'];
};

export type InputDeleteFcmTokenType = {
  token: Scalars['String']['input'];
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
  /** Dynamic property name */
  name: Scalars['String']['input'];
  /** Dynamic property value. ID must be passed for dictionary item */
  value?: InputMaybe<Scalars['DynamicPropertyValue']['input']>;
};

export type InputInitializeCartPaymentType = {
  cartId: Scalars['String']['input'];
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
  /** Store Id */
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InputInitializePaymentType = {
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Order Id */
  orderId?: InputMaybe<Scalars['String']['input']>;
  /** Input parameters */
  parameters?: InputMaybe<Array<InputMaybe<InputKeyValueType>>>;
  /** Payment Id */
  paymentId: Scalars['String']['input'];
  /** Store Id */
  storeId?: InputMaybe<Scalars['String']['input']>;
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
  /** Contact member ID */
  memberId: Scalars['String']['input'];
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
  /** Id */
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
  /** Comment */
  comment?: InputMaybe<Scalars['String']['input']>;
  /** Configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Line item created date override */
  createdDate?: InputMaybe<Scalars['DateTime']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Price */
  price?: InputMaybe<Scalars['Decimal']['input']>;
  /** Product Id */
  productId: Scalars['String']['input'];
  /** Product quantity */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type InputNewQuoteItemType = {
  comment?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Decimal']['input']>;
  productId?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Int']['input'];
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
  id?: InputMaybe<Scalars['OptionalString']['input']>;
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

export type InputPushHistoricalEventType = {
  eventType?: InputMaybe<Scalars['String']['input']>;
  productId?: InputMaybe<Scalars['String']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InputQuoteAddressType = {
  addressType?: InputMaybe<Scalars['Int']['input']>;
  city: Scalars['String']['input'];
  countryCode?: InputMaybe<Scalars['String']['input']>;
  countryName: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
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
  /** ID of the organization this invite was for. Only this organization's pending invite is approved on registration. */
  organizationId?: InputMaybe<Scalars['String']['input']>;
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
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  name: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
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

export type InputRemoveConfigurationItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration section to remove */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputRemoveConfigurationItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** List of configuration sections to remove */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
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

export type InputResendOrganizationInviteType = {
  /** Contact member ID */
  memberId: Scalars['String']['input'];
  /** Optional message to include into the invitation email */
  message?: InputMaybe<Scalars['String']['input']>;
  /** Optional URL suffix: relative URL to the page which handles registration by invite */
  urlSuffix?: InputMaybe<Scalars['String']['input']>;
};

export type InputResetPasswordByTokenType = {
  /** New password according with system security policy */
  newPassword: Scalars['String']['input'];
  /** User password reset token */
  token: Scalars['String']['input'];
  /** User identifier */
  userId: Scalars['String']['input'];
};

export type InputRevokeOrganizationInviteType = {
  /** Contact member ID */
  memberId: Scalars['String']['input'];
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

export type InputSaveForLaterType = {
  /** Source Cart ID */
  cartId: Scalars['String']['input'];
  /** Culture name */
  cultureName?: InputMaybe<Scalars['String']['input']>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item IDs to save for later */
  lineItemIds: Array<InputMaybe<Scalars['String']['input']>>;
  /** Store ID */
  storeId: Scalars['String']['input'];
  /** Owner ID */
  userId: Scalars['String']['input'];
};

export type InputSaveSearchQueryType = {
  query: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
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
  /** Pickup location Id when shipment is Pickup */
  pickupLocationId?: InputMaybe<Scalars['OptionalString']['input']>;
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
  /** Id of the associated Member */
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

export type InputUpdateCartQuantity = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<InputMaybe<InputUpdateCartQuantityItem>>>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateCartQuantityItem = {
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Product ID */
  productId: Scalars['String']['input'];
  /** Quantity */
  quantity: Scalars['Int']['input'];
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

export type InputUpdateConfigurationItemType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** Configuration section with updated quantity */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateConfigurationItemsType = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  /** List of configuration sections to update */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** Line item ID */
  lineItemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputUpdateContactType = {
  about?: InputMaybe<Scalars['String']['input']>;
  addresses?: InputMaybe<Array<InputMaybe<InputMemberAddressType>>>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
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
  selectedAddressId?: InputMaybe<Scalars['String']['input']>;
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
  /** Configuration items for configurable product */
  configurationItems?: Maybe<Array<Maybe<CartConfigurationItemType>>>;
  /** Line item create date */
  createdDate: Scalars['DateTime']['output'];
  /** Line item currency code */
  currencyCode?: Maybe<Scalars['String']['output']>;
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
  /** List total */
  listTotal: MoneyType;
  /** List total with tax */
  listTotalWithTax: MoneyType;
  /** Get points amount */
  loyaltyPoints?: Maybe<MoneyType>;
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
  /** Indicates whether the PlacedPrice should be visible to the customer */
  showPlacedPrice: Scalars['Boolean']['output'];
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

export type LocalizedSettingResponseType = {
  items?: Maybe<Array<Maybe<KeyValueType>>>;
};

/** Represents the result of a loyalty balance operation. */
export type LoyaltyBalanceResult = {
  /** The current balance of the loyalty account. */
  currentBalance: Scalars['Decimal']['output'];
  /** The resulting balance after applying the operation. */
  resultBalance: Scalars['Decimal']['output'];
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

/** A connection from an object to a list of objects of type `MemberAddress`. */
export type MemberAddressConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<MemberAddressEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<MemberAddressType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Term facets */
  term_facets: Array<TermFacet>;
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
  version: Scalars['String']['output'];
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
  acceptOrganizationInvite?: Maybe<ContactType>;
  activateBackInStockSubscription?: Maybe<BackInStockSubscriptionType>;
  addAddressToFavorites?: Maybe<Scalars['Boolean']['output']>;
  addBulkItemsCart?: Maybe<BulkCartType>;
  addCartAddress?: Maybe<CartType>;
  addConfigurationItem?: Maybe<CartType>;
  addConfigurationItems?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  addFcmToken?: Maybe<Scalars['Boolean']['output']>;
  addGiftItems?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  addOrUpdateOrderPayment?: Maybe<CustomerOrderType>;
  addQuoteAttachments?: Maybe<QuoteType>;
  addQuoteItems?: Maybe<QuoteType>;
  addWishlistBulkItem?: Maybe<BulkWishlistType>;
  addWishlistItem?: Maybe<WishlistType>;
  addWishlistItems?: Maybe<WishlistType>;
  approveQuoteRequest?: Maybe<ApproveQuoteResultType>;
  authorizePayment?: Maybe<AuthorizePaymentResultType>;
  cancelQuoteRequest?: Maybe<QuoteType>;
  changeCartConfigurationItemSelected?: Maybe<CartType>;
  changeCartConfiguredItem?: Maybe<CartType>;
  changeCartCurrency?: Maybe<CartType>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeCartItemSelected?: Maybe<CartType>;
  changeCartItemsQuantity?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changeOrderStatus?: Maybe<Scalars['Boolean']['output']>;
  changeOrganizationContactRole?: Maybe<CustomIdentityResultType>;
  changeOrganizationLogo?: Maybe<ChangeOrganizationLogoResultType>;
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
  createCartFromWishlist?: Maybe<CartType>;
  createConfiguredLineItem?: Maybe<ConfigurationLineItemType>;
  createContact?: Maybe<ContactType>;
  createOrderFromCart?: Maybe<CustomerOrderType>;
  createOrganization?: Maybe<Organization>;
  createQuote?: Maybe<QuoteType>;
  createQuoteFromCart?: Maybe<QuoteType>;
  createReview?: Maybe<CreateReviewResult>;
  createUser?: Maybe<IdentityResultType>;
  createWishlist?: Maybe<WishlistType>;
  deactivateBackInStockSubscription?: Maybe<BackInStockSubscriptionType>;
  declineQuoteRequest?: Maybe<QuoteType>;
  deleteContact?: Maybe<Scalars['Boolean']['output']>;
  deleteFcmToken?: Maybe<Scalars['Boolean']['output']>;
  deleteFile?: Maybe<Scalars['Boolean']['output']>;
  deleteMemberAddresses?: Maybe<MemberType>;
  deleteQuoteAttachments?: Maybe<QuoteType>;
  deleteSkyflowCard?: Maybe<Scalars['Boolean']['output']>;
  deleteUsers?: Maybe<IdentityResultType>;
  initializeCartPayment?: Maybe<InitializeCartPaymentResultType>;
  initializePayment?: Maybe<InitializePaymentResultType>;
  inviteUser?: Maybe<CustomIdentityResultType>;
  lockOrganizationContact?: Maybe<ContactType>;
  markAllPushMessagesRead?: Maybe<Scalars['Boolean']['output']>;
  markAllPushMessagesUnread?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageRead?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageUnread?: Maybe<Scalars['Boolean']['output']>;
  mergeCart?: Maybe<CartType>;
  moveFromSavedForLater?: Maybe<CartWithListType>;
  moveToSavedForLater?: Maybe<CartWithListType>;
  moveWishlistItem?: Maybe<WishlistType>;
  pushHistoricalEvent?: Maybe<Scalars['Boolean']['output']>;
  refreshCart?: Maybe<CartType>;
  registerByInvitation?: Maybe<CustomIdentityResultType>;
  rejectGiftItems?: Maybe<CartType>;
  rejectOrganizationInvite?: Maybe<ContactType>;
  rejectTask?: Maybe<WorkTaskType>;
  removeAddressFromFavorites?: Maybe<Scalars['Boolean']['output']>;
  removeCart?: Maybe<Scalars['Boolean']['output']>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCartItems?: Maybe<CartType>;
  removeConfigurationItem?: Maybe<CartType>;
  removeConfigurationItems?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeMemberFromOrganization?: Maybe<ContactType>;
  removeQuoteItem?: Maybe<QuoteType>;
  removeShipment?: Maybe<CartType>;
  removeWishlist?: Maybe<Scalars['Boolean']['output']>;
  removeWishlistItem?: Maybe<WishlistType>;
  removeWishlistItems?: Maybe<WishlistType>;
  requestRegistration?: Maybe<RequestRegistrationType>;
  resendOrganizationInvite?: Maybe<CustomIdentityResultType>;
  resetPasswordByToken?: Maybe<CustomIdentityResultType>;
  revokeOrganizationInvite?: Maybe<ContactType>;
  saveSalesRepLayout?: Maybe<SalesRepLayout>;
  saveSearchQuery?: Maybe<Scalars['Boolean']['output']>;
  selectAllCartConfigurationItems?: Maybe<CartType>;
  selectAllCartItems?: Maybe<CartType>;
  selectCartConfigurationItems?: Maybe<CartType>;
  selectCartItems?: Maybe<CartType>;
  sendCustomerCommunication?: Maybe<SalesRepCommunicationResult>;
  sendPasswordResetEmail?: Maybe<Scalars['Boolean']['output']>;
  sendVerifyEmail?: Maybe<Scalars['Boolean']['output']>;
  submitQuoteRequest?: Maybe<QuoteType>;
  unSelectAllCartConfigurationItems?: Maybe<CartType>;
  unSelectAllCartItems?: Maybe<CartType>;
  unSelectCartConfigurationItems?: Maybe<CartType>;
  unSelectCartItems?: Maybe<CartType>;
  unlockOrganizationContact?: Maybe<ContactType>;
  updateCartDynamicProperties?: Maybe<CartType>;
  updateCartItemDynamicProperties?: Maybe<CartType>;
  updateCartPaymentDynamicProperties?: Maybe<CartType>;
  updateCartQuantity?: Maybe<CartType>;
  updateCartShipmentDynamicProperties?: Maybe<CartType>;
  updateConfigurationItem?: Maybe<CartType>;
  updateConfigurationItems?: Maybe<CartType>;
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
  updateQuoteDynamicProperties?: Maybe<QuoteType>;
  updateRole?: Maybe<IdentityResultType>;
  updateUser?: Maybe<IdentityResultType>;
  updateWishListItems?: Maybe<WishlistType>;
};


export type MutationsAcceptOrganizationInviteArgs = {
  command: InputAcceptRejectOrganizationInviteType;
};


export type MutationsActivateBackInStockSubscriptionArgs = {
  command: ActivateBackInStockSubscriptionCommandType;
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


export type MutationsAddConfigurationItemArgs = {
  command: InputAddConfigurationItemType;
};


export type MutationsAddConfigurationItemsArgs = {
  command: InputAddConfigurationItemsType;
};


export type MutationsAddCouponArgs = {
  command: InputAddCouponType;
};


export type MutationsAddFcmTokenArgs = {
  command: InputAddFcmTokenType;
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


export type MutationsAddQuoteItemsArgs = {
  command: AddQuoteItemsCommandType;
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


export type MutationsApproveQuoteRequestArgs = {
  command: ApproveQuoteCommandType;
};


export type MutationsAuthorizePaymentArgs = {
  command: InputAuthorizePaymentType;
};


export type MutationsCancelQuoteRequestArgs = {
  command: CancelQuoteCommandType;
};


export type MutationsChangeCartConfigurationItemSelectedArgs = {
  command: InputChangeCartConfigurationItemSelectedType;
};


export type MutationsChangeCartConfiguredItemArgs = {
  command: InputChangeCartConfiguredItemType;
};


export type MutationsChangeCartCurrencyArgs = {
  command: InputChangeCartCurrencyType;
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


export type MutationsChangeCartItemsQuantityArgs = {
  command: InputChangeCartItemsQuantityType;
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


export type MutationsChangeOrganizationLogoArgs = {
  command: InputChangeOrganizationLogoCommandType;
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


export type MutationsCreateCartFromWishlistArgs = {
  command: InputCreateCartFromWishlistType;
};


export type MutationsCreateConfiguredLineItemArgs = {
  command: InputCreateConfiguredLineItemCommand;
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


export type MutationsCreateQuoteArgs = {
  command: CreateQuoteCommandType;
};


export type MutationsCreateQuoteFromCartArgs = {
  command: CreateQuoteFromCartCommandType;
};


export type MutationsCreateReviewArgs = {
  command: CreateReviewCommandType;
};


export type MutationsCreateUserArgs = {
  command: InputCreateUserType;
};


export type MutationsCreateWishlistArgs = {
  command: InputCreateWishlistType;
};


export type MutationsDeactivateBackInStockSubscriptionArgs = {
  command: DeactivateBackInStockSubscriptionCommandType;
};


export type MutationsDeclineQuoteRequestArgs = {
  command: DeclineQuoteCommandType;
};


export type MutationsDeleteContactArgs = {
  command: InputDeleteContactType;
};


export type MutationsDeleteFcmTokenArgs = {
  command: InputDeleteFcmTokenType;
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


export type MutationsInitializeCartPaymentArgs = {
  command: InputInitializeCartPaymentType;
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


export type MutationsMoveFromSavedForLaterArgs = {
  command: InputSaveForLaterType;
};


export type MutationsMoveToSavedForLaterArgs = {
  command: InputSaveForLaterType;
};


export type MutationsMoveWishlistItemArgs = {
  command: InputMoveWishlistItemType;
};


export type MutationsPushHistoricalEventArgs = {
  command: InputPushHistoricalEventType;
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


export type MutationsRejectOrganizationInviteArgs = {
  command: InputAcceptRejectOrganizationInviteType;
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


export type MutationsRemoveConfigurationItemArgs = {
  command: InputRemoveConfigurationItemType;
};


export type MutationsRemoveConfigurationItemsArgs = {
  command: InputRemoveConfigurationItemsType;
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


export type MutationsRequestRegistrationArgs = {
  command: InputRequestRegistrationType;
};


export type MutationsResendOrganizationInviteArgs = {
  command: InputResendOrganizationInviteType;
};


export type MutationsResetPasswordByTokenArgs = {
  command?: InputMaybe<InputResetPasswordByTokenType>;
};


export type MutationsRevokeOrganizationInviteArgs = {
  command: InputRevokeOrganizationInviteType;
};


export type MutationsSaveSalesRepLayoutArgs = {
  command: InputSalesRepLayout;
};


export type MutationsSaveSearchQueryArgs = {
  command: InputSaveSearchQueryType;
};


export type MutationsSelectAllCartConfigurationItemsArgs = {
  command: InputChangeAllCartConfigurationItemsSelectedType;
};


export type MutationsSelectAllCartItemsArgs = {
  command?: InputMaybe<InputChangeAllCartItemsSelectedType>;
};


export type MutationsSelectCartConfigurationItemsArgs = {
  command: InputChangeCartConfigurationItemsSelectedType;
};


export type MutationsSelectCartItemsArgs = {
  command?: InputMaybe<InputChangeCartItemsSelectedType>;
};


export type MutationsSendCustomerCommunicationArgs = {
  command: InputSendCustomerCommunicationType;
};


export type MutationsSendPasswordResetEmailArgs = {
  command: SendPasswordResetEmailCommandType;
};


export type MutationsSendVerifyEmailArgs = {
  command?: InputMaybe<InputSendVerifyEmailType>;
};


export type MutationsSubmitQuoteRequestArgs = {
  command: SubmitQuoteCommandType;
};


export type MutationsUnSelectAllCartConfigurationItemsArgs = {
  command: InputChangeAllCartConfigurationItemsSelectedType;
};


export type MutationsUnSelectAllCartItemsArgs = {
  command?: InputMaybe<InputChangeAllCartItemsSelectedType>;
};


export type MutationsUnSelectCartConfigurationItemsArgs = {
  command: InputChangeCartConfigurationItemsSelectedType;
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


export type MutationsUpdateCartQuantityArgs = {
  command: InputUpdateCartQuantity;
};


export type MutationsUpdateCartShipmentDynamicPropertiesArgs = {
  command: InputUpdateCartShipmentDynamicPropertiesType;
};


export type MutationsUpdateConfigurationItemArgs = {
  command: InputUpdateConfigurationItemType;
};


export type MutationsUpdateConfigurationItemsArgs = {
  command: InputUpdateConfigurationItemsType;
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


export type MutationsUpdateQuoteDynamicPropertiesArgs = {
  command: UpdateQuoteDynamicPropertiesCommandType;
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

export type NewsArticleAuthor = {
  iconUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type NewsArticleContent = {
  author?: Maybe<NewsArticleAuthor>;
  content?: Maybe<Scalars['String']['output']>;
  contentPreview?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  listPreview?: Maybe<Scalars['String']['output']>;
  listTitle?: Maybe<Scalars['String']['output']>;
  publishDate?: Maybe<Scalars['DateTime']['output']>;
  seoInfo: SeoInfo;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title?: Maybe<Scalars['String']['output']>;
};

/** A connection from an object to a list of objects of type `NewsArticleContent`. */
export type NewsArticleContentConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<NewsArticleContentEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<NewsArticleContent>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `NewsArticleContent`. */
export type NewsArticleContentEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<NewsArticleContent>;
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
  /** Current user's effective status in this organization: the organization-specific override if set, otherwise the contact's global status. */
  myStatusInOrganization?: Maybe<Scalars['String']['output']>;
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
  roleIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  searchPhrase?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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

export type PageContextResponseType = {
  slugInfo?: Maybe<SlugInfoResponseType>;
  store?: Maybe<StoreResponseType>;
  /** User info */
  user?: Maybe<UserType>;
  whiteLabelingSettings?: Maybe<WhiteLabelingSettingsType>;
};

/** A connection from an object to a list of objects of type `PageDocument`. */
export type PageDocumentConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PageDocumentEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PageDocumentType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PageDocument`. */
export type PageDocumentEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PageDocumentType>;
};

export type PageDocumentType = {
  content: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** Page permalink */
  permalink?: Maybe<Scalars['String']['output']>;
  /** Page source */
  source?: Maybe<Scalars['String']['output']>;
  /** Page title */
  title?: Maybe<Scalars['String']['output']>;
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

export type PaymentMethodType = {
  /** Is payment method available for cart payment */
  allowCartPayment: Scalars['Boolean']['output'];
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
  /** Localized name of payment method. */
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

export type PickupLocationAddressType = {
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

/** A connection from an object to a list of objects of type `PickupLocation`. */
export type PickupLocationConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PickupLocationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PickupLocationType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PickupLocation`. */
export type PickupLocationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PickupLocationType>;
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

export type PricesSumType = {
  /** Total discount amount */
  discountTotal: MoneyType;
  /** Total price */
  total: MoneyType;
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

/** A connection from an object to a list of objects of type `Product`. */
export type ProductConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductEdge>>>;
  /** Filter facets */
  filter_facets: Array<FilterFacet>;
  /** Parsed filters */
  filters?: Maybe<Array<SearchProductFilterResult>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<Product>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Range facets */
  range_facets: Array<RangeFacet>;
  /** Available product sortings ("sort by" options) for the store */
  sortings: Array<ProductSortingType>;
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

export enum ProductPickupAvailabilityType {
  /** Available via global transfer (within weeks) */
  GlobalTransfer = 'GlobalTransfer',
  /** Available today (within hours) */
  Today = 'Today',
  /** Available via transfer (within days) */
  Transfer = 'Transfer'
}

export type ProductPickupLocation = {
  /** Address */
  address?: Maybe<PickupLocationAddressType>;
  availabilityNote?: Maybe<Scalars['String']['output']>;
  availabilityType?: Maybe<ProductPickupAvailabilityType>;
  availableQuantity?: Maybe<Scalars['Long']['output']>;
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

/** A connection from an object to a list of objects of type `ProductPickupLocation`. */
export type ProductPickupLocationConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ProductPickupLocationEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ProductPickupLocation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `ProductPickupLocation`. */
export type ProductPickupLocationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ProductPickupLocation>;
};

export type ProductSortingType = {
  /** Stable sort code, used as the ?sort=<id> value. */
  id: Scalars['String']['output'];
  /** Whether this is the store default ordering. */
  isDefault: Scalars['Boolean']['output'];
  /** Localized display name. */
  name?: Maybe<Scalars['String']['output']>;
  /** Whether this ordering is applied to the current result. */
  selected: Scalars['Boolean']['output'];
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

/** A connection from an object to a list of objects of type `PromotionCoupon`. */
export type PromotionCouponConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PromotionCouponEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PromotionCouponType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PromotionCoupon`. */
export type PromotionCouponEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PromotionCouponType>;
};

export type PromotionCouponType = {
  couponCode?: Maybe<Scalars['String']['output']>;
  /** Localized description of the promotion. */
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  /** Localized label of the promotion. */
  label?: Maybe<Scalars['String']['output']>;
  /** Localized name of the promotion. */
  name?: Maybe<Scalars['String']['output']>;
  systemName?: Maybe<Scalars['String']['output']>;
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

/** An edge in a connection from an object to another object of type `Property`. */
export type PropertyEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<Property>;
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
  backInStockSubscriptions?: Maybe<BackInStockSubscriptionConnection>;
  brand?: Maybe<BrandType>;
  brands?: Maybe<BrandConnection>;
  builderPage?: Maybe<BuilderPageItemType>;
  canLeaveFeedback?: Maybe<Scalars['Boolean']['output']>;
  cart?: Maybe<CartType>;
  cartPickupLocations?: Maybe<CartPickupLocationConnection>;
  carts?: Maybe<CartConnection>;
  categories?: Maybe<CategoryConnection>;
  category?: Maybe<Category>;
  checkDuplicateAddress?: Maybe<AddressDuplicatedResultType>;
  checkEmailUniqueness?: Maybe<Scalars['Boolean']['output']>;
  checkUsernameUniqueness?: Maybe<Scalars['Boolean']['output']>;
  childCategories?: Maybe<ChildCategoriesQueryResponseType>;
  configurationItems?: Maybe<ConfigurationItemsResponseType>;
  contact?: Maybe<ContactType>;
  contacts?: Maybe<ContactConnection>;
  contract?: Maybe<ContractType>;
  countries: Array<CountryType>;
  currentCustomerAddresses?: Maybe<MemberAddressConnection>;
  currentOrganizationAddresses?: Maybe<MemberAddressConnection>;
  customerReviews?: Maybe<CustomerReviewConnection>;
  customerSalesReps?: Maybe<SalesRepContactConnection>;
  dynamicProperties?: Maybe<DynamicPropertyConnection>;
  dynamicProperty?: Maybe<DynamicPropertyType>;
  evaluateDynamicContent?: Maybe<EvaluateDynamicContentResultType>;
  fcmSettings?: Maybe<FcmSettingsType>;
  fileUploadOptions?: Maybe<FileUploadScopeOptionsType>;
  fulfillmentCenter?: Maybe<FulfillmentCenterType>;
  fulfillmentCenters?: Maybe<FulfillmentCenterConnection>;
  getSavedForLater?: Maybe<CartType>;
  loyaltyBalance?: Maybe<LoyaltyBalanceResult>;
  loyaltyPointsHistory?: Maybe<LoyaltyOperationLogConnection>;
  me?: Maybe<UserType>;
  menu?: Maybe<MenuLinkListType>;
  menus: Array<MenuLinkListType>;
  newsArticle?: Maybe<NewsArticleContent>;
  newsArticleAuthor?: Maybe<NewsArticleAuthor>;
  newsArticleTags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  newsArticles?: Maybe<NewsArticleContentConnection>;
  order?: Maybe<CustomerOrderType>;
  orderLineItemStatuses?: Maybe<LocalizedSettingResponseType>;
  orderStatuses?: Maybe<LocalizedSettingResponseType>;
  orders?: Maybe<CustomerOrderConnection>;
  organization?: Maybe<Organization>;
  organizationContracts?: Maybe<ContractConnection>;
  organizationOrders?: Maybe<CustomerOrderConnection>;
  organizations?: Maybe<OrganizationConnection>;
  page?: Maybe<PageType>;
  pageContext?: Maybe<PageContextResponseType>;
  pageDocument?: Maybe<PageDocumentType>;
  pageDocuments?: Maybe<PageDocumentConnection>;
  pages?: Maybe<PageConnection>;
  paymentStatuses?: Maybe<LocalizedSettingResponseType>;
  payments?: Maybe<PaymentInConnection>;
  pickupLocations?: Maybe<PickupLocationConnection>;
  pricesSum?: Maybe<PricesSumType>;
  product?: Maybe<Product>;
  productConfiguration?: Maybe<ConfigurationQueryResponseType>;
  productPickupLocations?: Maybe<ProductPickupLocationConnection>;
  productSuggestions?: Maybe<ProductSuggestionsQueryResponseType>;
  products?: Maybe<ProductConnection>;
  promotionCoupons?: Maybe<PromotionCouponConnection>;
  properties?: Maybe<PropertyConnection>;
  property?: Maybe<Property>;
  pushMessages?: Maybe<PushMessageConnection>;
  quote?: Maybe<QuoteType>;
  quoteAttachmentOptions?: Maybe<FileUploadScopeOptionsType>;
  quotes?: Maybe<QuoteConnection>;
  recentlyBrowsed?: Maybe<GetRecentlyBrowsedResponseType>;
  recommendations?: Maybe<GetRecommendationsResponseType>;
  regions: Array<CountryRegionType>;
  /** @deprecated Deprecated. Use sendPasswordResetEmail command. */
  requestPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  role?: Maybe<RoleType>;
  salesRepCartFilterRules?: Maybe<Array<Maybe<SalesRepCartFilterRule>>>;
  salesRepCustomer?: Maybe<SalesRepCustomerDetails>;
  salesRepCustomerCartStatistics?: Maybe<CustomerCartStatistics>;
  salesRepCustomerCounts?: Maybe<SalesRepCustomerCounts>;
  salesRepCustomerFilterRules?: Maybe<Array<Maybe<SalesRepCustomerFilterRule>>>;
  salesRepCustomerOrderStatistics?: Maybe<CustomerOrderStatistics>;
  salesRepCustomerSortRules?: Maybe<Array<Maybe<SalesRepCustomerSortRule>>>;
  salesRepCustomers?: Maybe<SalesRepCustomerConnection>;
  salesRepLayout?: Maybe<SalesRepLayout>;
  salesRepOrderFilterRules?: Maybe<Array<Maybe<SalesRepOrderFilterRule>>>;
  salesRepOrderSortRules?: Maybe<Array<Maybe<SalesRepOrderSortRule>>>;
  salesRepOrders?: Maybe<SalesRepOrderConnection>;
  salesRepTopSellerFilterRules?: Maybe<Array<Maybe<SalesRepTopSellerFilterRule>>>;
  salesRepTopSellerSortRules?: Maybe<Array<Maybe<SalesRepTopSellerSortRule>>>;
  salesRepTopSellers?: Maybe<Array<Maybe<SalesRepTopSeller>>>;
  searchHistory?: Maybe<SearchHistoryResultType>;
  sharedWishlist?: Maybe<WishlistType>;
  shipmentStatuses?: Maybe<LocalizedSettingResponseType>;
  skyflowCards?: Maybe<SkyflowCardResponseType>;
  slugInfo?: Maybe<SlugInfoResponseType>;
  store?: Maybe<StoreResponseType>;
  tasks?: Maybe<WorkTaskConnection>;
  user?: Maybe<UserType>;
  validateCoupon?: Maybe<Scalars['Boolean']['output']>;
  validatePassword?: Maybe<CustomIdentityResultType>;
  vendor?: Maybe<Vendor>;
  whiteLabelingSettings?: Maybe<WhiteLabelingSettingsType>;
  wishlist?: Maybe<WishlistType>;
  wishlists?: Maybe<WishlistConnection>;
};


export type QueryBackInStockSubscriptionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBrandArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryBrandsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBuilderPageArgs = {
  pageId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryCanLeaveFeedbackArgs = {
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryCartArgs = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCartPickupLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cartId: Scalars['String']['input'];
  cultureName: Scalars['String']['input'];
  facet?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
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
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoryArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckDuplicateAddressArgs = {
  address: InputMemberAddressType;
  memberId: Scalars['String']['input'];
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
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  productFilter?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryConfigurationItemsArgs = {
  cartId?: InputMaybe<Scalars['String']['input']>;
  cartName?: InputMaybe<Scalars['String']['input']>;
  cartType?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode: Scalars['String']['input'];
  lineItemId: Scalars['String']['input'];
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


export type QueryCurrentCustomerAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  countryCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCurrentOrganizationAddressesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  countryCodes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  regionIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sort?: InputMaybe<Scalars['String']['input']>;
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


export type QueryCustomerSalesRepsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
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


export type QueryGetSavedForLaterArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryLoyaltyBalanceArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
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


export type QueryMeArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
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


export type QueryNewsArticleArgs = {
  id: Scalars['String']['input'];
  languageCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryNewsArticleAuthorArgs = {
  authorId: Scalars['String']['input'];
};


export type QueryNewsArticleTagsArgs = {
  languageCode: Scalars['String']['input'];
};


export type QueryNewsArticlesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  authorId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  languageCode: Scalars['String']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userId?: InputMaybe<Scalars['String']['input']>;
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


export type QueryPageContextArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  permalink?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPageDocumentArgs = {
  id: Scalars['String']['input'];
};


export type QueryPageDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword: Scalars['String']['input'];
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


export type QueryPickupLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPricesSumArgs = {
  cartId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode: Scalars['String']['input'];
  lineItemIds: Array<InputMaybe<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  custom?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductConfigurationArgs = {
  configurableProductId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductPickupLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  productId: Scalars['String']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
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
  preserveUserQuery?: InputMaybe<Scalars['Boolean']['input']>;
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  query?: InputMaybe<Scalars['String']['input']>;
  selectedAddress?: InputMaybe<Scalars['String']['input']>;
  selectedAddressId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPromotionCouponsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
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


export type QueryRecentlyBrowsedArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  maxProducts?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryRecommendationsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  fallbackProductsFilter?: InputMaybe<Scalars['String']['input']>;
  maxRecommendations?: InputMaybe<Scalars['Int']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  previousOutline?: InputMaybe<Scalars['String']['input']>;
  productId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRegionsArgs = {
  countryId: Scalars['String']['input'];
};


export type QueryRequestPasswordResetArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  loginOrEmail: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
  urlSuffix?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRoleArgs = {
  roleName: Scalars['String']['input'];
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


export type QuerySalesRepCustomerOrderStatisticsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
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


export type QuerySalesRepLayoutArgs = {
  scope: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesRepOrderFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
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


export type QuerySalesRepTopSellerFilterRulesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
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


export type QuerySearchHistoryArgs = {
  maxCount: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
};


export type QuerySharedWishlistArgs = {
  sharingKey: Scalars['String']['input'];
};


export type QueryShipmentStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySkyflowCardsArgs = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySlugInfoArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  permalink?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStoreArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
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


export type QueryWhiteLabelingSettingsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
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
  firstName?: Maybe<Scalars['String']['output']>;
  /** ID */
  id?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
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
  name: Scalars['String']['output'];
  size: Scalars['Long']['output'];
  url: Scalars['String']['output'];
};

export type QuoteConfigurationItemFileType = {
  /** MIME type of the file */
  contentType?: Maybe<Scalars['String']['output']>;
  /** Name of the file */
  name: Scalars['String']['output'];
  /** Size of the file */
  size: Scalars['Long']['output'];
  /** URL of the file */
  url: Scalars['String']['output'];
};

export type QuoteConfigurationItemType = {
  /** Configuration item custom text */
  customText?: Maybe<Scalars['String']['output']>;
  /** List of files for 'File' configuration item section */
  files?: Maybe<Array<Maybe<QuoteConfigurationItemFileType>>>;
  /** Configuration item ID */
  id: Scalars['String']['output'];
  /** Configuration item name */
  name?: Maybe<Scalars['String']['output']>;
  /** Configuration item type. Possible values: 'Product', 'Text', 'File' */
  type: Scalars['String']['output'];
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
  catalogId?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  /** Configuration items for configurable product */
  configurationItems?: Maybe<Array<Maybe<QuoteConfigurationItemType>>>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  listPrice: MoneyType;
  name: Scalars['String']['output'];
  product?: Maybe<Product>;
  productId?: Maybe<Scalars['String']['output']>;
  proposalPrices: Array<QuoteTierPriceType>;
  quantity: Scalars['Int']['output'];
  salePrice: MoneyType;
  selectedTierPrice?: Maybe<QuoteTierPriceType>;
  sku?: Maybe<Scalars['String']['output']>;
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

export type RegisterOrganizationType = {
  /**
   * Returns first organization address.
   * @deprecated Use addresses field instead.
   */
  address?: Maybe<MemberAddressType>;
  /** Organization's addresses */
  addresses?: Maybe<Array<Maybe<MemberAddressType>>>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** Contact's dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
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

export type ReviewValidationErrorType = {
  /** Error code */
  errorCode?: Maybe<Scalars['String']['output']>;
  /** Error message */
  errorMessage?: Maybe<Scalars['String']['output']>;
};

export type RoleType = {
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  normalizedName: Scalars['String']['output'];
  /** Permissions in Role */
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
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
  /** Inclusive lower bound on the created date (null = no lower bound). */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** Inclusive upper bound on the created date (null = no upper bound). */
  to?: InputMaybe<Scalars['DateTime']['input']>;
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

export type SearchHistoryResultType = {
  queries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

/** Represents a range value in a product search filter */
export type SearchProductFilterRangeValue = {
  /** Indicates if the starting bound is included in the range */
  includeLowerBound: Scalars['Boolean']['output'];
  /** Indicates if the ending bound is included in the range */
  includeUpperBound: Scalars['Boolean']['output'];
  /** The starting value of the range */
  lower?: Maybe<Scalars['String']['output']>;
  /** The ending value of the range */
  upper?: Maybe<Scalars['String']['output']>;
};

/** Represents a filter result for product search */
export type SearchProductFilterResult = {
  /** The type of the filter, e.g., 'term' or 'range' */
  filterType: Scalars['String']['output'];
  /** Indicates whether the filter was generated automatically */
  isGenerated: Scalars['Boolean']['output'];
  /** Localized name of the filter (if available) */
  label?: Maybe<Scalars['String']['output']>;
  /** The name of the filter */
  name: Scalars['String']['output'];
  /** List of range values in the filter */
  rangeValues?: Maybe<Array<Maybe<SearchProductFilterRangeValue>>>;
  /** List of term values in the filter */
  termValues?: Maybe<Array<Maybe<SearchProductFilterValue>>>;
};

/** Represents a term value in a product search filter */
export type SearchProductFilterValue = {
  /** The label of the term in the filter, used for display purposes */
  label?: Maybe<Scalars['String']['output']>;
  /** The value of the term in the filter */
  value: Scalars['String']['output'];
};

export type SendPasswordResetEmailCommandType = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  loginOrEmail: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
  urlSuffix?: InputMaybe<Scalars['String']['input']>;
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

export type SharingSettingType = {
  /** Access (read or write) */
  access?: Maybe<WishlistAccessType>;
  /** Id (sharing key) */
  id: Scalars['String']['output'];
  /** Created by current user */
  isOwner: Scalars['Boolean']['output'];
  /** Scope (private, organization, etc.) */
  scope?: Maybe<WishlistScopeType>;
  /** Id of the principal the list is shared with (id space defined by scope); null for non-targeted scopes */
  sharedWithId?: Maybe<Scalars['String']['output']>;
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
  pickupLocation?: Maybe<PickupLocationType>;
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
  active: Scalars['Boolean']['output'];
  cardExpiration?: Maybe<Scalars['String']['output']>;
  cardNumber: Scalars['String']['output'];
  cardScheme?: Maybe<Scalars['String']['output']>;
  cardType?: Maybe<Scalars['String']['output']>;
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
  /** Target URL when SEO is null */
  redirectUrl?: Maybe<Scalars['String']['output']>;
};

export type StorePluginFileType = {
  /** Cache-busting hash derived from the file's last-write time */
  hash?: Maybe<Scalars['String']['output']>;
  /** Public URL of the asset */
  path?: Maybe<Scalars['String']['output']>;
  /** Asset kind, e.g. 'script' or 'style' */
  type?: Maybe<Scalars['String']['output']>;
};

export type StorePluginRemoteType = {
  /** Exposed module path, e.g. './Module' */
  exposed?: Maybe<Scalars['String']['output']>;
  /** Module Federation remote name */
  name?: Maybe<Scalars['String']['output']>;
};

export type StorePluginType = {
  /** Additional assets the plugin ships */
  contentFiles: Array<StorePluginFileType>;
  /** The plugin's entry asset (its remoteEntry.js) */
  entry?: Maybe<StorePluginFileType>;
  /** Plugin ID */
  id: Scalars['String']['output'];
  /** Permission the consuming SPA evaluates before loading the plugin */
  permission?: Maybe<Scalars['String']['output']>;
  /** Module Federation remote coordinates */
  remote?: Maybe<StorePluginRemoteType>;
  /** Plugin version */
  version?: Maybe<Scalars['String']['output']>;
};

export type StoreResponseType = {
  /** Base URL used to serve this store's public asset (image) URLs. Overrides the global asset CDN. */
  assetPublicUrl?: Maybe<Scalars['String']['output']>;
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
  /** Store dynamic property values */
  dynamicProperties?: Maybe<Array<Maybe<DynamicPropertyValueType>>>;
  /** GraphQL settings */
  graphQLSettings: GraphQlSettingsType;
  plugins: Array<StorePluginType>;
  /** Store settings */
  settings: StoreSettingsType;
  /** Store ID */
  storeId: Scalars['String']['output'];
  /** Store name */
  storeName: Scalars['String']['output'];
  /** Store URL */
  storeUrl?: Maybe<Scalars['String']['output']>;
};


export type StoreResponseTypePluginsArgs = {
  appId?: InputMaybe<Scalars['String']['input']>;
};

export type StoreSettingsType = {
  /** Allow anonymous users to visit the store  */
  anonymousUsersAllowed: Scalars['Boolean']['output'];
  authenticationTypes: Array<Maybe<Scalars['String']['output']>>;
  /**
   * Allow anonymous users to create orders (XAPI)
   * @deprecated Use XOrder.CreateAnonymousOrderEnabled public property instead.
   */
  createAnonymousOrderEnabled: Scalars['Boolean']['output'];
  /**
   * Default "Selected for checkout" state for new line items and gifts
   * @deprecated Use XPurchase.IsSelectedForCheckout public property instead.
   */
  defaultSelectedForCheckout: Scalars['Boolean']['output'];
  /** Email address verification enabled */
  emailVerificationEnabled: Scalars['Boolean']['output'];
  /** Email address verification required */
  emailVerificationRequired: Scalars['Boolean']['output'];
  /** Environment name */
  environmentName: Scalars['String']['output'];
  /**
   * SPA
   * @deprecated Client application should use own business logic for SPA detection.
   */
  isSpa: Scalars['Boolean']['output'];
  modules: Array<ModuleSettingsType>;
  /** Password requirements */
  passwordRequirements?: Maybe<PasswordOptionsType>;
  /**
   * Quotes enabled
   * @deprecated Use Quotes.EnableQuotes public property instead.
   */
  quotesEnabled: Scalars['Boolean']['output'];
  /** SEO links */
  seoLinkType: Scalars['String']['output'];
  /**
   * Subscription enabled
   * @deprecated Use Subscription.EnableSubscriptions public property instead.
   */
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

export type UpdateQuoteAddressesCommandType = {
  addresses: Array<InputMaybe<InputQuoteAddressType>>;
  quoteId: Scalars['String']['input'];
};

export type UpdateQuoteAttachmentsCommandType = {
  quoteId: Scalars['String']['input'];
  urls: Array<InputMaybe<Scalars['String']['input']>>;
};

export type UpdateQuoteDynamicPropertiesCommandType = {
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  quoteId: Scalars['String']['input'];
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
  /** Error message */
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

export type WhiteLabelingSettingsType = {
  /** Master favicon URL */
  faviconUrl?: Maybe<Scalars['String']['output']>;
  favicons?: Maybe<Array<Maybe<FaviconType>>>;
  footerLinks?: Maybe<Array<Maybe<MenuLinkType>>>;
  /** If true then FaviconUrl contains Organization favicon */
  isOrganizationFaviconUploaded?: Maybe<Scalars['Boolean']['output']>;
  /** If true then LogoUrl contains Organization logo */
  isOrganizationLogoUploaded?: Maybe<Scalars['Boolean']['output']>;
  /** If true then SecondaryLogoUrl contains Organization logo */
  isOrganizationSecondaryLogoUploaded?: Maybe<Scalars['Boolean']['output']>;
  /** Logo URL */
  logoUrl?: Maybe<Scalars['String']['output']>;
  mainMenuLinks?: Maybe<Array<Maybe<MenuLinkType>>>;
  /** Organization ID */
  organizationId?: Maybe<Scalars['String']['output']>;
  /** Logo URL for footer */
  secondaryLogoUrl?: Maybe<Scalars['String']['output']>;
  /** Store ID */
  storeId?: Maybe<Scalars['String']['output']>;
  /** Theme preset name */
  themePresetName?: Maybe<Scalars['String']['output']>;
  /** User ID */
  userId?: Maybe<Scalars['String']['output']>;
};

export enum WishlistAccessType {
  /** Readonly access */
  Read = 'Read',
  /** Write access */
  Write = 'Write'
}

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
  /** Anyone (anonymous) scope */
  AnyoneAnonymous = 'AnyoneAnonymous',
  /** Anyone (authorized) scope */
  AnyoneAuthorized = 'AnyoneAuthorized',
  /** Customer scope (shared by a Sales Rep with specific customer organizations) */
  Customer = 'Customer',
  /** Organization scope */
  Organization = 'Organization',
  /** Private scope */
  Private = 'Private',
  /** User scope */
  User = 'User'
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
  /**
   * Wishlist scope
   * @deprecated Use SharingSetting.Scope instead
   */
  scope?: Maybe<WishlistScopeType>;
  /** Sharing settings */
  sharingSetting?: Maybe<SharingSettingType>;
  /** Shopping cart store ID */
  storeId?: Maybe<Scalars['String']['output']>;
  /** Wishlist subtotal */
  subTotal: MoneyType;
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

export type DeleteSkyFlowCardMutationVariables = Exact<{
  command: DeleteSkyflowCardCommandType;
}>;


export type DeleteSkyFlowCardMutation = { deleteSkyflowCard?: boolean };

export type GetSkyflowCardsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSkyflowCardsQuery = { skyflowCards?: { cards?: Array<{ cardNumber: string, cardExpiration?: string, skyflowId: string, active: boolean, cardScheme?: string, cardType?: string }> } };


export const DeleteSkyFlowCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSkyFlowCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteSkyflowCardCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSkyflowCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteSkyFlowCardMutation, DeleteSkyFlowCardMutationVariables>;
export const GetSkyflowCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSkyflowCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skyflowCards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cardExpiration"}},{"kind":"Field","name":{"kind":"Name","value":"skyflowId"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"cardScheme"}},{"kind":"Field","name":{"kind":"Name","value":"cardType"}}]}}]}}]}}]} as unknown as DocumentNode<GetSkyflowCardsQuery, GetSkyflowCardsQueryVariables>;
export const OperationNames = {
  Query: {
    GetSkyflowCards: 'GetSkyflowCards'
  },
  Mutation: {
    DeleteSkyFlowCard: 'DeleteSkyFlowCard'
  }
}
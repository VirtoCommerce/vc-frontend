// This file is auto-generated. Do not edit manually.

import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
  Decimal: { input: number; output: number };
  DynamicPropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null };
  Long: { input: number; output: number };
  OptionalDecimal: { input: number | undefined; output: number | undefined };
  OptionalNullableDecimal: { input: number | null | undefined; output: number | null | undefined };
  OptionalString: { input: string | undefined; output: string | undefined };
  PropertyValue: { input: string | number | boolean | null; output: string | number | boolean | null };
  StoreAssetUrl: { input: any; output: any };
};

export type Asset = {
  /** Culture name */
  cultureName?: Maybe<Scalars["String"]["output"]>;
  /** The description of the asset. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** The group of the asset. */
  group?: Maybe<Scalars["String"]["output"]>;
  /** The unique ID of the asset. */
  id: Scalars["String"]["output"];
  /** The MIME type of the asset. */
  mimeType?: Maybe<Scalars["String"]["output"]>;
  /** The name of the asset. */
  name?: Maybe<Scalars["String"]["output"]>;
  /** The relative URL of the asset. */
  relativeUrl?: Maybe<Scalars["String"]["output"]>;
  /** The size of the asset in bytes. */
  size: Scalars["Long"]["output"];
  /** The type ID of the asset. */
  typeId: Scalars["String"]["output"];
  /** The URL of the asset. */
  url: Scalars["StoreAssetUrl"]["output"];
};

export type AvailabilityData = {
  /** Available quantity */
  availableQuantity: Scalars["Long"]["output"];
  /** Inventories */
  inventories: Array<InventoryInfo>;
  /** Is active */
  isActive: Scalars["Boolean"]["output"];
  /** Is available */
  isAvailable: Scalars["Boolean"]["output"];
  /** Is buyable */
  isBuyable: Scalars["Boolean"]["output"];
  /** Is estimated */
  isEstimated: Scalars["Boolean"]["output"];
  /** Is in stock */
  isInStock: Scalars["Boolean"]["output"];
  /** Is track inventory */
  isTrackInventory: Scalars["Boolean"]["output"];
};

export type BrandType = {
  bannerUrl?: Maybe<Scalars["StoreAssetUrl"]["output"]>;
  /** Brand property name. */
  brandPropertyName?: Maybe<Scalars["String"]["output"]>;
  /** Unlocalized brand name. */
  brandPropertyValue?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  /** Indicates if the brand is featured. */
  featured?: Maybe<Scalars["Boolean"]["output"]>;
  /** Brand ID. */
  id: Scalars["String"]["output"];
  logoUrl?: Maybe<Scalars["StoreAssetUrl"]["output"]>;
  /** Brand name. */
  name?: Maybe<Scalars["String"]["output"]>;
  permalink: Scalars["String"]["output"];
};

export type BrandTypeDescriptionArgs = {
  type?: InputMaybe<Scalars["String"]["input"]>;
};

export type Breadcrumb = {
  /** Id of item the breadcrumb calculated for */
  itemId: Scalars["String"]["output"];
  /** Semantic URL keyword */
  semanticUrl?: Maybe<Scalars["String"]["output"]>;
  /** Full path from catalog */
  seoPath?: Maybe<Scalars["String"]["output"]>;
  /** Name of current breadcrumb */
  title: Scalars["String"]["output"];
  /** Catalog, category or product */
  typeName: Scalars["String"]["output"];
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

/** A payment method that can save cards, with the public parameters its card form needs. */
export type CardPaymentMethod = {
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  paymentMethodCode: Scalars["String"]["output"];
  publicParameters: Array<CardPaymentMethodParameter>;
};

export type CardPaymentMethodParameter = {
  key: Scalars["String"]["output"];
  value?: Maybe<Scalars["String"]["output"]>;
};

export type CartAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars["Int"]["output"]>;
  /** City */
  city?: Maybe<Scalars["String"]["output"]>;
  /** Country code */
  countryCode?: Maybe<Scalars["String"]["output"]>;
  /** Country name */
  countryName?: Maybe<Scalars["String"]["output"]>;
  /** Description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Email */
  email?: Maybe<Scalars["String"]["output"]>;
  /** First name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** Id */
  id?: Maybe<Scalars["String"]["output"]>;
  /** Id */
  key?: Maybe<Scalars["String"]["output"]>;
  /** Last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
  /** Line1 */
  line1?: Maybe<Scalars["String"]["output"]>;
  /** Line2 */
  line2?: Maybe<Scalars["String"]["output"]>;
  /** Middle name */
  middleName?: Maybe<Scalars["String"]["output"]>;
  /** Name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Company name */
  organization?: Maybe<Scalars["String"]["output"]>;
  /** Outer id */
  outerId?: Maybe<Scalars["String"]["output"]>;
  /** Phone */
  phone?: Maybe<Scalars["String"]["output"]>;
  /** Postal code */
  postalCode: Scalars["String"]["output"];
  /** Region id */
  regionId?: Maybe<Scalars["String"]["output"]>;
  /** Region name */
  regionName?: Maybe<Scalars["String"]["output"]>;
  /** Zip */
  zip?: Maybe<Scalars["String"]["output"]>;
};

export type CartConfigurationItemFileType = {
  /** MIME type of the file */
  contentType?: Maybe<Scalars["String"]["output"]>;
  /** Name of the file */
  name: Scalars["String"]["output"];
  /** Size of the file */
  size: Scalars["Long"]["output"];
  /** URL of the file */
  url: Scalars["String"]["output"];
};

export type CartConfigurationItemType = {
  /** Configuration section that defines this configuration item */
  configurationSection?: Maybe<ConfigurationSectionType>;
  /** Custom text for 'Text' configuration item section */
  customText?: Maybe<Scalars["String"]["output"]>;
  /** Extended price */
  extendedPrice: MoneyType;
  /** List of files for 'File' configuration item section */
  files?: Maybe<Array<Maybe<CartConfigurationItemFileType>>>;
  /** Configuration item ID */
  id: Scalars["String"]["output"];
  /** Configuration item image URL */
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  /** List price */
  listPrice: MoneyType;
  /** Configuration item name */
  name?: Maybe<Scalars["String"]["output"]>;
  product?: Maybe<Product>;
  /** Configuration item product ID */
  productId?: Maybe<Scalars["String"]["output"]>;
  /** Configuration item product quantity */
  quantity?: Maybe<Scalars["Int"]["output"]>;
  /** Sale price */
  salePrice: MoneyType;
  /** Configuration item section ID */
  sectionId: Scalars["String"]["output"];
  /** Configuration item section name */
  sectionName?: Maybe<Scalars["String"]["output"]>;
  /** Whether the configuration item is selected for checkout */
  selectedForCheckout: Scalars["Boolean"]["output"];
  /** Configuration item SKU */
  sku?: Maybe<Scalars["String"]["output"]>;
  /** Configuration item type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars["String"]["output"];
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `Cart`. */
export type CartEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<CartType>;
};

export type CartShipmentItemType = {
  lineItem?: Maybe<LineItemType>;
  /** Quantity */
  quantity: Scalars["Int"]["output"];
};

export type CartTotalType = {
  /** Total discount */
  discountTotal: MoneyType;
  /** Is current total in default total currency */
  isDefaultTotalCurrency: Scalars["Boolean"]["output"];
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
  channelId?: Maybe<Scalars["String"]["output"]>;
  /** Cart checkout ID */
  checkoutId: Scalars["String"]["output"];
  /** Shopping cart text comment */
  comment?: Maybe<Scalars["String"]["output"]>;
  /** Coupons */
  coupons: Array<CouponType>;
  /** Currency */
  currency: CurrencyType;
  /** Shopping cart user ID */
  customerId: Scalars["String"]["output"];
  /** Shopping cart user name */
  customerName?: Maybe<Scalars["String"]["output"]>;
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
  hasPhysicalProducts?: Maybe<Scalars["Boolean"]["output"]>;
  /** Shopping cart ID */
  id: Scalars["String"]["output"];
  /** Displays whether the shopping cart is anonymous */
  isAnonymous: Scalars["Boolean"]["output"];
  /** Displays whether the shopping cart is recurring */
  isRecuring?: Maybe<Scalars["Boolean"]["output"]>;
  /** Items */
  items: Array<LineItemType>;
  /** Item count */
  itemsCount: Scalars["Int"]["output"];
  /** Quantity of items */
  itemsQuantity: Scalars["Int"]["output"];
  /** Shopping cart name */
  name: Scalars["String"]["output"];
  /** Shopping cart organization ID */
  organizationId?: Maybe<Scalars["String"]["output"]>;
  /** Shopping cart organization name */
  organizationName?: Maybe<Scalars["String"]["output"]>;
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
  purchaseOrderNumber?: Maybe<Scalars["String"]["output"]>;
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
  status?: Maybe<Scalars["String"]["output"]>;
  /** Shopping cart store ID */
  storeId: Scalars["String"]["output"];
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
  taxPercentRate: Scalars["Decimal"]["output"];
  /** Total tax */
  taxTotal: MoneyType;
  /** Shipping tax type */
  taxType: Scalars["String"]["output"];
  /** Shopping cart total */
  total: MoneyType;
  /** Shopping cart type */
  type?: Maybe<Scalars["String"]["output"]>;
  /** A set of errors in case the cart is invalid */
  validationErrors: Array<ValidationErrorType>;
  /** Shopping cart volumetric weight value */
  volumetricWeight?: Maybe<Scalars["Decimal"]["output"]>;
  /** A set of temporary warnings for a cart user */
  warnings: Array<ValidationErrorType>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Shopping cart weight unit value */
  weightUnit?: Maybe<Scalars["String"]["output"]>;
};

export type CartTypeValidationErrorsArgs = {
  ruleSet?: InputMaybe<Scalars["String"]["input"]>;
};

export type CartWithListType = {
  /** Shopping cart */
  cart?: Maybe<CartType>;
  /** Saved list */
  list?: Maybe<CartType>;
};

export type CatalogDiscountType = {
  /** Discount amount */
  amount: Scalars["Decimal"]["output"];
  /** Discount amount with tax */
  amountWithTax: Scalars["Decimal"]["output"];
  /** Coupon */
  coupon?: Maybe<Scalars["String"]["output"]>;
  /** Value of discount description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Discount amount in the specified currency */
  moneyAmount: MoneyType;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax: MoneyType;
  promotion?: Maybe<Promotion>;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars["String"]["output"]>;
};

export type Category = {
  /** Assets */
  assets: Array<Asset>;
  /** Breadcrumbs */
  breadcrumbs: Array<Breadcrumb>;
  childCategories: Array<Category>;
  /** SKU of category. */
  code: Scalars["String"]["output"];
  description?: Maybe<CategoryDescriptionType>;
  descriptions: Array<CategoryDescriptionType>;
  /** Have a parent */
  hasParent: Scalars["Boolean"]["output"];
  /** Id of category. */
  id: Scalars["String"]["output"];
  /** Images */
  images: Array<ImageType>;
  /** The category image. */
  imgSrc?: Maybe<Scalars["StoreAssetUrl"]["output"]>;
  /** Level in hierarchy */
  level: Scalars["Int"]["output"];
  /** The name of the category. */
  name: Scalars["String"]["output"];
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars["String"]["output"]>;
  /** Outlines */
  outlines: Array<OutlineType>;
  parent?: Maybe<Category>;
  /** Category path in to the requested catalog  (all parent categories names concatenated. E.g. (parent1/parent2)) */
  path?: Maybe<Scalars["String"]["output"]>;
  /** The category priority. */
  priority: Scalars["Int"]["output"];
  properties: Array<Property>;
  /** Category relevance score */
  relevanceScore?: Maybe<Scalars["Float"]["output"]>;
  /** Request related SEO info */
  seoInfo: SeoInfo;
  /** Request related slug for category */
  slug?: Maybe<Scalars["String"]["output"]>;
};

export type CategoryDescriptionArgs = {
  type?: InputMaybe<Scalars["String"]["input"]>;
};

export type CategoryDescriptionsArgs = {
  type?: InputMaybe<Scalars["String"]["input"]>;
};

export type CategoryPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

export type CategoryDescriptionType = {
  /** Description text. */
  content?: Maybe<Scalars["String"]["output"]>;
  /** Description type. */
  descriptionType?: Maybe<Scalars["String"]["output"]>;
  /** Description ID. */
  id: Scalars["String"]["output"];
  /** Description language code. */
  languageCode?: Maybe<Scalars["String"]["output"]>;
};

export type CommonVendor = {
  /** Vendor ID */
  id: Scalars["String"]["output"];
  /** Vendor name */
  name: Scalars["String"]["output"];
  /** Vendor rating */
  rating?: Maybe<Rating>;
};

export type ConfigurableProductOptionInput = {
  /** Product ID */
  productId: Scalars["String"]["input"];
  /** Quantity of product */
  quantity: Scalars["Int"]["input"];
  /** Whether the configuration item is selected for checkout */
  selectedForCheckout?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ConfigurableProductOptionKeyInput = {
  /** Product ID */
  productId: Scalars["String"]["input"];
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
  id?: Maybe<Scalars["String"]["output"]>;
  /** Whether the option is selected by default */
  isDefault: Scalars["Boolean"]["output"];
  /** List price */
  listPrice?: Maybe<MoneyType>;
  product?: Maybe<Product>;
  /** The quantity of the option */
  quantity: Scalars["Int"]["output"];
  /** Sale price */
  salePrice?: Maybe<MoneyType>;
  /** The text of the Text-type option */
  text?: Maybe<Scalars["String"]["output"]>;
};

export type ConfigurationQueryResponseType = {
  configurationSections?: Maybe<Array<Maybe<ConfigurationSectionType>>>;
};

export type ConfigurationSectionInput = {
  /** Custom text for 'Text' section */
  customText?: InputMaybe<Scalars["String"]["input"]>;
  /** List of file links for 'File' section */
  fileUrls?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  /** Configuration section option/product */
  option?: InputMaybe<ConfigurableProductOptionInput>;
  /** Configuration section ID */
  sectionId: Scalars["String"]["input"];
  /** Configuration section type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars["String"]["input"];
};

export type ConfigurationSectionKeyInput = {
  /** Identifying subset of the configuration section option (Product/Variation only) */
  option?: InputMaybe<ConfigurableProductOptionKeyInput>;
  /** Configuration section ID */
  sectionId: Scalars["String"]["input"];
  /** Configuration section type. Possible values: 'Product', 'Variation', 'Text', 'File' */
  type: Scalars["String"]["input"];
};

export type ConfigurationSectionType = {
  /** Is custom text allowed for Text-type section */
  allowCustomText: Scalars["Boolean"]["output"];
  /** Is predefined text options allowed for Text-type section */
  allowTextOptions: Scalars["Boolean"]["output"];
  /** If set, this section is only shown when the referenced section has a selection made */
  dependsOnSectionId?: Maybe<Scalars["String"]["output"]>;
  /** Configuration section description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Configuration section id */
  id: Scalars["String"]["output"];
  /** Is configuration section required */
  isRequired: Scalars["Boolean"]["output"];
  /** Maximum text length for Text-type section */
  maxLength?: Maybe<Scalars["Int"]["output"]>;
  /** Configuration section name */
  name?: Maybe<Scalars["String"]["output"]>;
  options?: Maybe<Array<Maybe<ConfigurationLineItemType>>>;
  /** Configuration section type. Possible values: 'Product', 'Text', 'File' */
  type: Scalars["String"]["output"];
};

export type CouponType = {
  /** Coupon code */
  code?: Maybe<Scalars["String"]["output"]>;
  /** Is coupon was applied successfully */
  isAppliedSuccessfully: Scalars["Boolean"]["output"];
};

export type CurrencyType = {
  /** Currency code may be used ISO 4217 */
  code: Scalars["String"]["output"];
  /** Currency culture name */
  cultureName: Scalars["String"]["output"];
  /** Currency custom formatting */
  customFormatting?: Maybe<Scalars["String"]["output"]>;
  /** Currency english name */
  englishName: Scalars["String"]["output"];
  /** Exchange rate */
  exchangeRate: Scalars["Decimal"]["output"];
  /** Currency name */
  name: Scalars["String"]["output"];
  /** Symbol */
  symbol: Scalars["String"]["output"];
};

export type DescriptionType = {
  /** Description text. */
  content?: Maybe<Scalars["String"]["output"]>;
  /** Description ID. */
  id: Scalars["String"]["output"];
  /** Description language code. */
  languageCode?: Maybe<Scalars["String"]["output"]>;
  /** Description type. */
  reviewType?: Maybe<Scalars["String"]["output"]>;
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `DictionaryItem`. */
export type DictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<DictionaryItemType>;
};

export type DictionaryItemType = {
  /** Id */
  id: Scalars["String"]["output"];
  /** Localized dictionary item value */
  label?: Maybe<Scalars["String"]["output"]>;
  /** Name */
  name: Scalars["String"]["output"];
};

export type DiscountType = {
  /** Discount amount */
  amount: Scalars["Decimal"]["output"];
  /** Discount amount with tax */
  amountWithTax: Scalars["Decimal"]["output"];
  /** Coupon */
  coupon?: Maybe<Scalars["String"]["output"]>;
  /** Value of discount description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Discount amount in the specified currency */
  moneyAmount: MoneyType;
  /** Discount amount with tax in the specified currency */
  moneyAmountWithTax: MoneyType;
  /** Value of promotion id */
  promotionId?: Maybe<Scalars["String"]["output"]>;
};

export type DynamicPropertyType = {
  dictionaryItems?: Maybe<DictionaryItemConnection>;
  /** The order for the dynamic property to display */
  displayOrder?: Maybe<Scalars["Int"]["output"]>;
  /** Value type */
  dynamicPropertyValueType: DynamicPropertyValueTypes;
  /** Id */
  id: Scalars["String"]["output"];
  /** Is dynamic property value an array */
  isArray: Scalars["Boolean"]["output"];
  /** Is dynamic property value a dictionary */
  isDictionary: Scalars["Boolean"]["output"];
  /** Is dynamic property value multilingual */
  isMultilingual: Scalars["Boolean"]["output"];
  /** Is dynamic property value required */
  isRequired: Scalars["Boolean"]["output"];
  /** Localized property name */
  label?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  /** Object type */
  objectType: Scalars["String"]["output"];
};

export type DynamicPropertyTypeDictionaryItemsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  sort?: InputMaybe<Scalars["String"]["input"]>;
};

export type DynamicPropertyValueType = {
  /** Associated dictionary item */
  dictionaryItem?: Maybe<DictionaryItemType>;
  /** Associated dynamic property */
  dynamicProperty?: Maybe<DynamicPropertyType>;
  /** Value type */
  dynamicPropertyValueType: DynamicPropertyValueTypes;
  /** Property name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Property value */
  value?: Maybe<Scalars["DynamicPropertyValue"]["output"]>;
  /** Value type */
  valueType: Scalars["String"]["output"];
};

/** Dynamic property value type */
export enum DynamicPropertyValueTypes {
  Boolean = "BOOLEAN",
  DateTime = "DATE_TIME",
  Decimal = "DECIMAL",
  Html = "HTML",
  Image = "IMAGE",
  Integer = "INTEGER",
  LongText = "LONG_TEXT",
  ShortText = "SHORT_TEXT",
  Undefined = "UNDEFINED",
}

export type ErrorParameterType = {
  /** key */
  key: Scalars["String"]["output"];
  /** Value */
  value: Scalars["String"]["output"];
};

export type GiftItemType = {
  /** Product category ID */
  categoryId?: Maybe<Scalars["String"]["output"]>;
  /** Artificial ID for this value object */
  id: Scalars["String"]["output"];
  /** Value of reward image absolute URL */
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  /** Line item ID in case there is a gift in the cart. If there is no gift, it stays null */
  lineItemId?: Maybe<Scalars["String"]["output"]>;
  /** Measurement unit */
  measureUnit?: Maybe<Scalars["String"]["output"]>;
  /** Name of the reward */
  name: Scalars["String"]["output"];
  product?: Maybe<Product>;
  /** Product ID */
  productId?: Maybe<Scalars["String"]["output"]>;
  /** Promotion ID */
  promotionId: Scalars["String"]["output"];
  /** Number of gifts in the reward */
  quantity: Scalars["Int"]["output"];
};

export type ImageType = {
  /** Culture name */
  cultureName?: Maybe<Scalars["String"]["output"]>;
  /** The description of the image */
  description?: Maybe<Scalars["String"]["output"]>;
  /** The group of the image */
  group?: Maybe<Scalars["String"]["output"]>;
  /** The unique ID of the image */
  id: Scalars["String"]["output"];
  /** The name of the image */
  name?: Maybe<Scalars["String"]["output"]>;
  /** The relative URL of the image */
  relativeUrl?: Maybe<Scalars["String"]["output"]>;
  /** Sort order */
  sortOrder: Scalars["Int"]["output"];
  /** The URL of the image */
  url: Scalars["StoreAssetUrl"]["output"];
};

export type InitializeCartPaymentResultType = {
  actionHtmlForm?: Maybe<Scalars["String"]["output"]>;
  actionRedirectUrl?: Maybe<Scalars["String"]["output"]>;
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  isSuccess: Scalars["Boolean"]["output"];
  paymentActionType?: Maybe<Scalars["String"]["output"]>;
  paymentId?: Maybe<Scalars["String"]["output"]>;
  paymentMethodCode?: Maybe<Scalars["String"]["output"]>;
  publicParameters?: Maybe<Array<Maybe<KeyValueType>>>;
  storeId?: Maybe<Scalars["String"]["output"]>;
};

export type InputAddBulkItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  /** Bulk cart items */
  cartItems: Array<InputMaybe<InputNewBulkItemType>>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddConfigurationItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration section to add */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddConfigurationItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** List of configuration sections to add */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddCouponType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon code */
  couponCode: Scalars["String"]["input"];
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddGiftItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** IDs of gift rewards to add to the cart */
  ids: Array<InputMaybe<Scalars["String"]["input"]>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Create date. Optional, to manually control line item position in the cart if required. ISO-8601 format, for example: 2025-01-23T11:46:11Z */
  createdDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Price */
  price?: InputMaybe<Scalars["Decimal"]["input"]>;
  /** Product ID */
  productId: Scalars["String"]["input"];
  /** Quantity */
  quantity: Scalars["Int"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  /** Cart items */
  cartItems: Array<InputMaybe<InputNewCartItemType>>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddOrUpdateCartAddressType = {
  /** Address */
  address: InputAddressType;
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddOrUpdateCartPaymentType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Payment */
  payment: InputPaymentType;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddOrUpdateCartShipmentType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Shipment */
  shipment: InputShipmentType;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputAddSavedPaymentMethod = {
  /** What the payment provider's card form posted: tokens, nonces, billing address. */
  parameters?: InputMaybe<Array<InputMaybe<InputKeyValueType>>>;
  paymentMethodCode: Scalars["String"]["input"];
  setDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  storeId: Scalars["String"]["input"];
};

export type InputAddWishlistBulkItemType = {
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Wish list ids */
  listIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  /** Product id to add */
  productId: Scalars["String"]["input"];
  /** Product quantity to add */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type InputAddWishlistItemType = {
  /** Configurable product support. List of configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Wish list id */
  listId: Scalars["String"]["input"];
  /** Product id to add */
  productId: Scalars["String"]["input"];
  /** Product quantity to add */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type InputAddWishlistItemsType = {
  listId: Scalars["String"]["input"];
  /** List items */
  listItems: Array<InputNewWishlistItemType>;
};

export type InputAddressType = {
  addressType?: InputMaybe<Scalars["Int"]["input"]>;
  /** City */
  city?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Country code */
  countryCode?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Country */
  countryName?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Description */
  description?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Email */
  email?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** First name */
  firstName?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** ID */
  id?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** ID */
  key?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Last name */
  lastName?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Line1 */
  line1?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Line2 */
  line2?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Middle name */
  middleName?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Name */
  name?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Company name */
  organization?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Outer ID */
  outerId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Phone */
  phone?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Region ID */
  regionId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Region */
  regionName?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Zip */
  zip?: InputMaybe<Scalars["OptionalString"]["input"]>;
};

export type InputCartItemQuantityType = {
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** New quantity */
  quantity: Scalars["Int"]["input"];
};

export type InputChangeAllCartConfigurationItemsSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeAllCartItemsSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartConfigurationItemSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration section that identifies the configuration item to toggle */
  configurationSection: ConfigurationSectionKeyInput;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** Is configuration item selected for checkout */
  selectedForCheckout: Scalars["Boolean"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartConfigurationItemsSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration sections that identify the configuration items to toggle */
  configurationSections: Array<ConfigurationSectionKeyInput>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartConfiguredItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** Quantity */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartCurrencyType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Second cart currency */
  newCurrencyCode: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemCommentType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment */
  comment: Scalars["String"]["input"];
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemPriceType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** Price */
  price: Scalars["Decimal"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemQuantityType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** Quantity */
  quantity: Scalars["Int"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  /** Is item selected for checkout */
  selectedForCheckout: Scalars["Boolean"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemsQuantityType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  /** Cart items */
  cartItems: Array<InputMaybe<InputCartItemQuantityType>>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCartItemsSelectedType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** List of line item Ids */
  lineItemIds?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeCommentType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Comment */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangePurchaseOrderNumber = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Purchase Order Number */
  purchaseOrderNumber?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputChangeWishlistType = {
  /** Ids to share the list with (id space defined by scope); ids already shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  addSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Culture name */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** List description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** List ID */
  listId: Scalars["String"]["input"];
  /** New List name */
  listName?: InputMaybe<Scalars["String"]["input"]>;
  /** Message saved with the share (one for all targets), max 1024 characters; null leaves it unchanged, an empty or whitespace-only string clears it; requires scope in the same write; ignored by scopes without targets */
  message?: InputMaybe<Scalars["String"]["input"]>;
  /** Ids to stop sharing the list with; ids not shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  removeSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars["String"]["input"]>;
  /** The single recipient the list is shared with (id space defined by scope): replaces the one it currently has, and is refused when the list has several; requires scope in the same write; ignored by scopes without targets */
  sharedWithId?: InputMaybe<Scalars["String"]["input"]>;
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars["String"]["input"]>;
};

export type InputClearCartType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputClearPaymentsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputClearShipmentsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputCloneWishlistType = {
  /** Ids to share the list with (id space defined by scope); ids already shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  addSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Culture name */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** List description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Source List ID */
  listId: Scalars["String"]["input"];
  /** List name */
  listName?: InputMaybe<Scalars["String"]["input"]>;
  /** Message saved with the share (one for all targets), max 1024 characters; null leaves it unchanged, an empty or whitespace-only string clears it; requires scope in the same write; ignored by scopes without targets */
  message?: InputMaybe<Scalars["String"]["input"]>;
  /** Ids to stop sharing the list with; ids not shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  removeSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars["String"]["input"]>;
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars["String"]["input"]>;
  /** Store ID */
  storeId: Scalars["String"]["input"];
  /** Owner ID */
  userId: Scalars["String"]["input"];
};

export type InputCreateCartFromWishlistType = {
  /** Wishlist ID */
  listId: Scalars["String"]["input"];
};

export type InputCreateConfiguredLineItemCommand = {
  configurableProductId: Scalars["String"]["input"];
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId?: InputMaybe<Scalars["String"]["input"]>;
};

export type InputCreateWishlistType = {
  /** Ids to share the list with (id space defined by scope); ids already shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  addSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Culture name */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** List description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** List name */
  listName?: InputMaybe<Scalars["String"]["input"]>;
  /** Message saved with the share (one for all targets), max 1024 characters; null leaves it unchanged, an empty or whitespace-only string clears it; requires scope in the same write; ignored by scopes without targets */
  message?: InputMaybe<Scalars["String"]["input"]>;
  /** Ids to stop sharing the list with; ids not shared with are ignored; requires scope in the same write; ignored by scopes without targets */
  removeSharedWithIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** List scope (private or organization) */
  scope?: InputMaybe<Scalars["String"]["input"]>;
  /** The single recipient the list is shared with (id space defined by scope): replaces the one it currently has, and is refused when the list has several; requires scope in the same write; ignored by scopes without targets */
  sharedWithId?: InputMaybe<Scalars["String"]["input"]>;
  /** Sharing key (URL argument) */
  sharingKey?: InputMaybe<Scalars["String"]["input"]>;
  /** Store ID */
  storeId: Scalars["String"]["input"];
  /** Owner ID */
  userId: Scalars["String"]["input"];
};

export type InputDynamicPropertyValueType = {
  /** Culture name ("en-US") for multilingual property */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** Dynamic property name */
  name: Scalars["String"]["input"];
  /** Dynamic property value. ID must be passed for dictionary item */
  value?: InputMaybe<Scalars["DynamicPropertyValue"]["input"]>;
};

export type InputInitializeCartPaymentType = {
  cartId: Scalars["String"]["input"];
  /** Culture name */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** Payment Id */
  paymentId: Scalars["String"]["input"];
  /** Store Id */
  storeId?: InputMaybe<Scalars["String"]["input"]>;
};

export type InputKeyValueType = {
  /** Dictionary key */
  key: Scalars["String"]["input"];
  /** Dictionary value */
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type InputMergeCartType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Delete second cart after merge */
  deleteAfterMerge?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Second cart Id */
  secondCartId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputMoveWishlistItemType = {
  /** Destination List ID */
  destinationListId: Scalars["String"]["input"];
  /** Line item ID to move */
  lineItemId: Scalars["String"]["input"];
  /** Source List ID */
  listId: Scalars["String"]["input"];
};

export type InputNewBulkItemType = {
  /** Product SKU */
  productSku: Scalars["String"]["input"];
  /** Product quantity */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type InputNewCartItemType = {
  /** Comment */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** Configurable product sections */
  configurationSections?: InputMaybe<Array<InputMaybe<ConfigurationSectionInput>>>;
  /** Line item created date override */
  createdDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Price */
  price?: InputMaybe<Scalars["Decimal"]["input"]>;
  /** Product Id */
  productId: Scalars["String"]["input"];
  /** Product quantity */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type InputNewWishlistItemType = {
  /** Product Id */
  productId: Scalars["String"]["input"];
  /** Product quantity */
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type InputPaymentType = {
  amount?: InputMaybe<Scalars["OptionalDecimal"]["input"]>;
  billingAddress?: InputMaybe<InputAddressType>;
  /** Text comment */
  comment?: InputMaybe<Scalars["OptionalString"]["input"]>;
  currency?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Payment ID */
  id?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Payment outer ID value */
  outerId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Payment gateway code value */
  paymentGatewayCode?: InputMaybe<Scalars["OptionalString"]["input"]>;
  price?: InputMaybe<Scalars["OptionalDecimal"]["input"]>;
  purpose?: InputMaybe<Scalars["OptionalString"]["input"]>;
  vendorId?: InputMaybe<Scalars["OptionalString"]["input"]>;
};

export type InputRejectGiftItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Ids of gift lineItems to reject from cart */
  ids: Array<InputMaybe<Scalars["String"]["input"]>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveCartAddressType = {
  /** Address Id */
  addressId: Scalars["String"]["input"];
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveCartType = {
  /** Cart Id */
  cartId: Scalars["String"]["input"];
  /** User Id */
  userId: Scalars["String"]["input"];
};

export type InputRemoveConfigurationItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration section to remove */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveConfigurationItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** List of configuration sections to remove */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveCouponType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon code */
  couponCode?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Array of line item Id */
  lineItemIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveShipmentType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Shipment Id */
  shipmentId?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputRemoveWishlistItemType = {
  /** Line item ID to remove */
  lineItemId?: InputMaybe<Scalars["String"]["input"]>;
  /** List ID */
  listId: Scalars["String"]["input"];
  /** Line item product ID to remove */
  productId?: InputMaybe<Scalars["String"]["input"]>;
};

export type InputRemoveWishlistItemsType = {
  /** Line item IDs to remove */
  lineItemIds: Array<Scalars["String"]["input"]>;
  /** List ID */
  listId: Scalars["String"]["input"];
};

export type InputRemoveWishlistType = {
  /** List ID */
  listId: Scalars["String"]["input"];
};

export type InputSaveForLaterType = {
  /** Source Cart ID */
  cartId: Scalars["String"]["input"];
  /** Culture name */
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  /** Currency code */
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item IDs to save for later */
  lineItemIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  /** Store ID */
  storeId: Scalars["String"]["input"];
  /** Owner ID */
  userId: Scalars["String"]["input"];
};

export type InputSavedPaymentMethodId = {
  id: Scalars["String"]["input"];
};

export type InputShipmentType = {
  /** Text comment */
  comment?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Currency value */
  currency?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Delivery address */
  deliveryAddress?: InputMaybe<InputAddressType>;
  /** Dynamic properties */
  dynamicProperties?: InputMaybe<Array<InputMaybe<InputDynamicPropertyValueType>>>;
  /** Fulfillment center iD */
  fulfillmentCenterId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Height value */
  height?: InputMaybe<Scalars["OptionalNullableDecimal"]["input"]>;
  /** Shipment ID */
  id?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Length value */
  length?: InputMaybe<Scalars["OptionalNullableDecimal"]["input"]>;
  /** Measurement unit value */
  measureUnit?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Pickup location Id when shipment is Pickup */
  pickupLocationId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Price value */
  price?: InputMaybe<Scalars["OptionalDecimal"]["input"]>;
  /** Shipping method code */
  shipmentMethodCode?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Shipping method option */
  shipmentMethodOption?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Vendor ID */
  vendorId?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Volumetric weight value */
  volumetricWeight?: InputMaybe<Scalars["OptionalNullableDecimal"]["input"]>;
  /** Weight value */
  weight?: InputMaybe<Scalars["OptionalNullableDecimal"]["input"]>;
  /** Weight unit value */
  weightUnit?: InputMaybe<Scalars["OptionalString"]["input"]>;
  /** Width value */
  width?: InputMaybe<Scalars["OptionalNullableDecimal"]["input"]>;
};

export type InputUpdateCartDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateCartItemDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Line item Id */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateCartPaymentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Payment Id */
  paymentId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateCartQuantity = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  items?: InputMaybe<Array<InputMaybe<InputUpdateCartQuantityItem>>>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateCartQuantityItem = {
  /** Add the product in a different currency */
  itemCurrencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Product ID */
  productId: Scalars["String"]["input"];
  /** Quantity */
  quantity: Scalars["Int"]["input"];
};

export type InputUpdateCartShipmentDynamicPropertiesType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Dynamic properties */
  dynamicProperties: Array<InputMaybe<InputDynamicPropertyValueType>>;
  /** Shipment Id */
  shipmentId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateConfigurationItemType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** Configuration section with updated quantity */
  configurationSection: ConfigurationSectionInput;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateConfigurationItemsType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  /** List of configuration sections to update */
  configurationSections: Array<ConfigurationSectionInput>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Line item ID */
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type InputUpdateWishlistItemsType = {
  /** Bulk wishlist items */
  items: Array<InputMaybe<InputUpdateWishlistLineItemType>>;
  /** Wish list id */
  listId: Scalars["String"]["input"];
};

export type InputUpdateWishlistLineItemType = {
  /** Line Item Id to update */
  lineItemId: Scalars["String"]["input"];
  /** Product quantity to add */
  quantity: Scalars["Int"]["input"];
};

export type InventoryInfo = {
  /** Allow backorder */
  allowBackorder: Scalars["Boolean"]["output"];
  /** Allow preorder */
  allowPreorder: Scalars["Boolean"]["output"];
  /** Backorder availability date */
  backorderAvailabilityDate?: Maybe<Scalars["DateTime"]["output"]>;
  fulfillmentCenterId: Scalars["String"]["output"];
  fulfillmentCenterName: Scalars["String"]["output"];
  /** Inventory in stock quantity */
  inStockQuantity: Scalars["Long"]["output"];
  /** Preorder availability date */
  preorderAvailabilityDate?: Maybe<Scalars["DateTime"]["output"]>;
  /** Inventory reserved quantity */
  reservedQuantity: Scalars["Long"]["output"];
};

export type KeyValueType = {
  /** Dictionary key */
  key: Scalars["String"]["output"];
  /** Dictionary value */
  value?: Maybe<Scalars["String"]["output"]>;
};

export type LineItemType = {
  /** Catalog ID value */
  catalogId: Scalars["String"]["output"];
  /** Category ID value */
  categoryId?: Maybe<Scalars["String"]["output"]>;
  /** Configuration items for configurable product */
  configurationItems?: Maybe<Array<Maybe<CartConfigurationItemType>>>;
  /** Line item create date */
  createdDate: Scalars["DateTime"]["output"];
  /** Line item currency code */
  currencyCode?: Maybe<Scalars["String"]["output"]>;
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
  fulfillmentCenterId?: Maybe<Scalars["String"]["output"]>;
  /** Line item fulfillment center name value */
  fulfillmentCenterName?: Maybe<Scalars["String"]["output"]>;
  /** Height value */
  height?: Maybe<Scalars["Decimal"]["output"]>;
  /** Line item ID */
  id: Scalars["String"]["output"];
  /** Value of line item image absolute URL */
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  /** In stock quantity */
  inStockQuantity: Scalars["Int"]["output"];
  /** flag of line item is a gift */
  isGift: Scalars["Boolean"]["output"];
  /** Shows whether this is read-only */
  isReadOnly: Scalars["Boolean"]["output"];
  /** Shows whether the line item is recurring */
  isReccuring: Scalars["Boolean"]["output"];
  /** Shows whether this is valid */
  isValid: Scalars["Boolean"]["output"];
  /** Culture name in the ISO 3166-1 alpha-3 format */
  languageCode?: Maybe<Scalars["String"]["output"]>;
  /** Length value */
  length?: Maybe<Scalars["Decimal"]["output"]>;
  /** List price */
  listPrice: MoneyType;
  /** List price with tax */
  listPriceWithTax: MoneyType;
  /** List total */
  listTotal: MoneyType;
  /** List total with tax */
  listTotalWithTax: MoneyType;
  /** Measurement unit value */
  measureUnit?: Maybe<Scalars["String"]["output"]>;
  /** Line item name value */
  name: Scalars["String"]["output"];
  /** Line item comment */
  note?: Maybe<Scalars["String"]["output"]>;
  /** Line item quantity value */
  objectType: Scalars["String"]["output"];
  /** Placed price */
  placedPrice: MoneyType;
  /** Placed price with tax */
  placedPriceWithTax: MoneyType;
  product?: Maybe<Product>;
  /** Product ID value */
  productId: Scalars["String"]["output"];
  /** Product outer Id */
  productOuterId?: Maybe<Scalars["String"]["output"]>;
  /** Product type: Physical, Digital, or Subscription */
  productType?: Maybe<Scalars["String"]["output"]>;
  /** Line item quantity value */
  quantity: Scalars["Int"]["output"];
  /** Requirement for line item shipping */
  requiredShipping: Scalars["Boolean"]["output"];
  /** Sale price */
  salePrice: MoneyType;
  /** Sale price with tax */
  salePriceWithTax: MoneyType;
  /** Shows whether the line item is selected for buying */
  selectedForCheckout: Scalars["Boolean"]["output"];
  /** Line item shipping method code value */
  shipmentMethodCode?: Maybe<Scalars["String"]["output"]>;
  /** Indicates whether the PlacedPrice should be visible to the customer */
  showPlacedPrice: Scalars["Boolean"]["output"];
  /** Product SKU value */
  sku: Scalars["String"]["output"];
  /** Subscription chosen for this cart line, if any */
  subscription?: Maybe<SubscriptionCartItem>;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Total shipping tax amount value */
  taxPercentRate: Scalars["Decimal"]["output"];
  /** Tax total */
  taxTotal: MoneyType;
  /** Shipping tax type value */
  taxType?: Maybe<Scalars["String"]["output"]>;
  /** Value of line item thumbnail image absolute URL */
  thumbnailImageUrl?: Maybe<Scalars["String"]["output"]>;
  /** Validation errors */
  validationErrors: Array<ValidationErrorType>;
  vendor?: Maybe<CommonVendor>;
  /** Volumetric weight value */
  volumetricWeight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Warehouse location */
  warehouseLocation?: Maybe<Scalars["String"]["output"]>;
  /** Shopping cart weight value */
  weight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Weight unit value */
  weightUnit?: Maybe<Scalars["String"]["output"]>;
  /** Width value */
  width?: Maybe<Scalars["Decimal"]["output"]>;
};

export type MoneyType = {
  /** A decimal with the amount rounded to the significant number of decimal digits. */
  amount: Scalars["Decimal"]["output"];
  /** Currency type */
  currency: CurrencyType;
  /** Number of decimal digits for the associated currency. */
  decimalDigits: Scalars["Int"]["output"];
  /** Formatted amount. */
  formattedAmount: Scalars["String"]["output"];
  /** Formatted amount without currency. */
  formattedAmountWithoutCurrency: Scalars["String"]["output"];
  /** Formatted amount without point. */
  formattedAmountWithoutPoint: Scalars["String"]["output"];
  /** Formatted amount without point and currency. */
  formattedAmountWithoutPointAndCurrency: Scalars["String"]["output"];
};

export type Mutations = {
  addBulkItemsCart?: Maybe<BulkCartType>;
  addCartAddress?: Maybe<CartType>;
  addConfigurationItem?: Maybe<CartType>;
  addConfigurationItems?: Maybe<CartType>;
  addCoupon?: Maybe<CartType>;
  addGiftItems?: Maybe<CartType>;
  addItem?: Maybe<CartType>;
  addItemsCart?: Maybe<CartType>;
  addOrUpdateCartAddress?: Maybe<CartType>;
  addOrUpdateCartPayment?: Maybe<CartType>;
  addOrUpdateCartShipment?: Maybe<CartType>;
  addSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  addWishlistBulkItem?: Maybe<BulkWishlistType>;
  addWishlistItem?: Maybe<WishlistType>;
  addWishlistItems?: Maybe<WishlistType>;
  changeCartConfigurationItemSelected?: Maybe<CartType>;
  changeCartConfiguredItem?: Maybe<CartType>;
  changeCartCurrency?: Maybe<CartType>;
  changeCartItemComment?: Maybe<CartType>;
  changeCartItemPrice?: Maybe<CartType>;
  changeCartItemQuantity?: Maybe<CartType>;
  changeCartItemSelected?: Maybe<CartType>;
  changeCartItemsQuantity?: Maybe<CartType>;
  changeComment?: Maybe<CartType>;
  changePurchaseOrderNumber?: Maybe<CartType>;
  changeWishlist?: Maybe<WishlistType>;
  clearCart?: Maybe<CartType>;
  clearPayments?: Maybe<CartType>;
  clearShipments?: Maybe<CartType>;
  cloneWishlist?: Maybe<WishlistType>;
  createCartFromWishlist?: Maybe<CartType>;
  createConfiguredLineItem?: Maybe<ConfigurationLineItemType>;
  createWishlist?: Maybe<WishlistType>;
  initializeCartPayment?: Maybe<InitializeCartPaymentResultType>;
  mergeCart?: Maybe<CartType>;
  moveFromSavedForLater?: Maybe<CartWithListType>;
  moveToSavedForLater?: Maybe<CartWithListType>;
  moveWishlistItem?: Maybe<WishlistType>;
  refreshCart?: Maybe<CartType>;
  rejectGiftItems?: Maybe<CartType>;
  removeCart?: Maybe<Scalars["Boolean"]["output"]>;
  removeCartAddress?: Maybe<CartType>;
  removeCartItem?: Maybe<CartType>;
  removeCartItems?: Maybe<CartType>;
  removeConfigurationItem?: Maybe<CartType>;
  removeConfigurationItems?: Maybe<CartType>;
  removeCoupon?: Maybe<CartType>;
  removeSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  removeShipment?: Maybe<CartType>;
  removeWishlist?: Maybe<Scalars["Boolean"]["output"]>;
  removeWishlistItem?: Maybe<WishlistType>;
  removeWishlistItems?: Maybe<WishlistType>;
  selectAllCartConfigurationItems?: Maybe<CartType>;
  selectAllCartItems?: Maybe<CartType>;
  selectCartConfigurationItems?: Maybe<CartType>;
  selectCartItems?: Maybe<CartType>;
  setDefaultSavedPaymentMethod?: Maybe<SavedPaymentMethod>;
  unSelectAllCartConfigurationItems?: Maybe<CartType>;
  unSelectAllCartItems?: Maybe<CartType>;
  unSelectCartConfigurationItems?: Maybe<CartType>;
  unSelectCartItems?: Maybe<CartType>;
  updateCartDynamicProperties?: Maybe<CartType>;
  updateCartItemDynamicProperties?: Maybe<CartType>;
  updateCartPaymentDynamicProperties?: Maybe<CartType>;
  updateCartQuantity?: Maybe<CartType>;
  updateCartShipmentDynamicProperties?: Maybe<CartType>;
  updateConfigurationItem?: Maybe<CartType>;
  updateConfigurationItems?: Maybe<CartType>;
  updateWishListItems?: Maybe<WishlistType>;
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

export type MutationsAddSavedPaymentMethodArgs = {
  command: InputAddSavedPaymentMethod;
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

export type MutationsChangePurchaseOrderNumberArgs = {
  command?: InputMaybe<InputChangePurchaseOrderNumber>;
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

export type MutationsCreateCartFromWishlistArgs = {
  command: InputCreateCartFromWishlistType;
};

export type MutationsCreateConfiguredLineItemArgs = {
  command: InputCreateConfiguredLineItemCommand;
};

export type MutationsCreateWishlistArgs = {
  command: InputCreateWishlistType;
};

export type MutationsInitializeCartPaymentArgs = {
  command: InputInitializeCartPaymentType;
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

export type MutationsRefreshCartArgs = {
  command: RefreshCartType;
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

export type MutationsRemoveSavedPaymentMethodArgs = {
  command: InputSavedPaymentMethodId;
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

export type MutationsSetDefaultSavedPaymentMethodArgs = {
  command: InputSavedPaymentMethodId;
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

export type MutationsUpdateWishListItemsArgs = {
  command: InputUpdateWishlistItemsType;
};

export type OutlineItemType = {
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  /** SEO info */
  seoInfos?: Maybe<Array<SeoInfo>>;
  seoObjectType: Scalars["String"]["output"];
};

export type OutlineType = {
  /** Outline items */
  items?: Maybe<Array<OutlineItemType>>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars["String"]["output"]>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

export type PaymentMethodType = {
  /** Is payment method available for cart payment */
  allowCartPayment: Scalars["Boolean"]["output"];
  /** Value of payment gateway code */
  code: Scalars["String"]["output"];
  /** Currency */
  currency: CurrencyType;
  /** Payment method description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  /** Is payment method available for partial payments */
  isAvailableForPartial: Scalars["Boolean"]["output"];
  /** Value of payment method logo absolute URL */
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  /** Localized name of payment method. */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Value of payment group type */
  paymentMethodGroupType: Scalars["String"]["output"];
  /** Value of payment method type */
  paymentMethodType: Scalars["String"]["output"];
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Value of payment method priority */
  priority: Scalars["Int"]["output"];
  /** Tax details */
  taxDetails?: Maybe<Array<TaxDetailType>>;
  /** Tax percent rate */
  taxPercentRate: Scalars["Decimal"]["output"];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars["String"]["output"]>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
};

export type PaymentType = {
  /** Amount */
  amount: MoneyType;
  /** Billing address */
  billingAddress?: Maybe<CartAddressType>;
  /** Text comment */
  comment?: Maybe<Scalars["String"]["output"]>;
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
  id: Scalars["String"]["output"];
  /** Value of payment outer id */
  outerId?: Maybe<Scalars["String"]["output"]>;
  /** Value of payment gateway code */
  paymentGatewayCode?: Maybe<Scalars["String"]["output"]>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  purpose?: Maybe<Scalars["String"]["output"]>;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Tax percent rate */
  taxPercentRate: Scalars["Decimal"]["output"];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars["String"]["output"]>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
  vendor?: Maybe<CommonVendor>;
};

export type PickupAddressType = {
  /** Address type */
  addressType?: Maybe<Scalars["Int"]["output"]>;
  /** City */
  city?: Maybe<Scalars["String"]["output"]>;
  /** Country code */
  countryCode?: Maybe<Scalars["String"]["output"]>;
  /** Country name */
  countryName?: Maybe<Scalars["String"]["output"]>;
  /** Description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Email */
  email?: Maybe<Scalars["String"]["output"]>;
  /** Id */
  id: Scalars["String"]["output"];
  /** Key */
  key?: Maybe<Scalars["String"]["output"]>;
  /** Line1 */
  line1?: Maybe<Scalars["String"]["output"]>;
  /** Line2 */
  line2?: Maybe<Scalars["String"]["output"]>;
  /** Name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Company name */
  organization?: Maybe<Scalars["String"]["output"]>;
  /** Outer id */
  outerId?: Maybe<Scalars["String"]["output"]>;
  /** Phone */
  phone?: Maybe<Scalars["String"]["output"]>;
  /** Postal code */
  postalCode?: Maybe<Scalars["String"]["output"]>;
  /** Region id */
  regionId?: Maybe<Scalars["String"]["output"]>;
  /** Region name */
  regionName?: Maybe<Scalars["String"]["output"]>;
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `PickupLocation`. */
export type PickupLocationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<PickupLocationType>;
};

export type PickupLocationType = {
  /** Address */
  address?: Maybe<PickupAddressType>;
  /** ContactEmail */
  contactEmail?: Maybe<Scalars["String"]["output"]>;
  /** ContactPhone */
  contactPhone?: Maybe<Scalars["String"]["output"]>;
  /** Days until ready for pickup */
  deliveryDays?: Maybe<Scalars["Int"]["output"]>;
  /** Description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** GeoLocation */
  geoLocation?: Maybe<Scalars["String"]["output"]>;
  /** Id */
  id: Scalars["String"]["output"];
  /** IsActive */
  isActive: Scalars["Boolean"]["output"];
  /** Name */
  name: Scalars["String"]["output"];
  /** How long an order will be stored at a pickup point */
  storageDays?: Maybe<Scalars["Int"]["output"]>;
  /** WorkingHours */
  workingHours?: Maybe<Scalars["String"]["output"]>;
};

export type PriceType = {
  /** Actual price */
  actual: MoneyType;
  /** Actual price with tax */
  actualWithTax: MoneyType;
  /** Currency */
  currency: Scalars["String"]["output"];
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  discountPercent: Scalars["Decimal"]["output"];
  /** Discounts */
  discounts: Array<CatalogDiscountType>;
  /** End date */
  endDate?: Maybe<Scalars["DateTime"]["output"]>;
  /** Price list */
  list: MoneyType;
  /** Price list with tax */
  listWithTax: MoneyType;
  /** The product min qty */
  minQuantity?: Maybe<Scalars["Int"]["output"]>;
  /** The product price list */
  pricelistId?: Maybe<Scalars["String"]["output"]>;
  /** The product price list name */
  pricelistName?: Maybe<Scalars["String"]["output"]>;
  /** Sale price */
  sale: MoneyType;
  /** Sale price with tax */
  saleWithTax: MoneyType;
  /** Start date */
  startDate?: Maybe<Scalars["DateTime"]["output"]>;
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
  brandName?: Maybe<Scalars["String"]["output"]>;
  /** Breadcrumbs */
  breadcrumbs: Array<Breadcrumb>;
  /** The unique ID of the catalog */
  catalogId?: Maybe<Scalars["String"]["output"]>;
  category?: Maybe<Category>;
  /** The product SKU. */
  code: Scalars["String"]["output"];
  description?: Maybe<DescriptionType>;
  descriptions: Array<DescriptionType>;
  /** Global Trade Item Number (GTIN) */
  gtin?: Maybe<Scalars["String"]["output"]>;
  hasVariations: Scalars["Boolean"]["output"];
  /** Height */
  height?: Maybe<Scalars["Decimal"]["output"]>;
  /** The unique ID of the product. */
  id: Scalars["String"]["output"];
  /** Product images */
  images: Array<ImageType>;
  /** The product main image URL. */
  imgSrc?: Maybe<Scalars["StoreAssetUrl"]["output"]>;
  /** Product added at least in one wishlist */
  inWishlist: Scalars["Boolean"]["output"];
  /** Product is configurable */
  isConfigurable: Scalars["Boolean"]["output"];
  /** Product was purchased */
  isPurchased: Scalars["Boolean"]["output"];
  keyProperties: Array<Property>;
  /** Length */
  length?: Maybe<Scalars["Decimal"]["output"]>;
  /** Manufacturer Part Number (MPN) */
  manufacturerPartNumber?: Maybe<Scalars["String"]["output"]>;
  masterVariation?: Maybe<VariationType>;
  /** Max. quantity */
  maxQuantity?: Maybe<Scalars["Int"]["output"]>;
  /** Measure unit */
  measureUnit?: Maybe<Scalars["String"]["output"]>;
  /** Min. quantity */
  minQuantity?: Maybe<Scalars["Int"]["output"]>;
  /** Minimum product variation price */
  minVariationPrice?: Maybe<PriceType>;
  /** The name of the product. */
  name: Scalars["String"]["output"];
  /** The outer identifier */
  outerId?: Maybe<Scalars["String"]["output"]>;
  /** All parent categories ids relative to the requested catalog and concatenated with \ . E.g. (1/21/344) */
  outline?: Maybe<Scalars["String"]["output"]>;
  /** Outlines */
  outlines: Array<OutlineType>;
  /** Defines the number of items in a package. Quantity step for your product's. */
  packSize: Scalars["Int"]["output"];
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars["String"]["output"]>;
  properties: Array<Property>;
  /** Product rating */
  rating?: Maybe<Rating>;
  /** Product relevance score */
  relevanceScore?: Maybe<Scalars["Float"]["output"]>;
  /** Request related SEO info */
  seoInfo: SeoInfo;
  /** Request related slug for product */
  slug?: Maybe<Scalars["String"]["output"]>;
  /** Subscribe & Save offer for this product, if any */
  subscriptionOffer?: Maybe<SubscriptionOffer>;
  variations: Array<VariationType>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
  videos?: Maybe<VideoConnection>;
  /** Weight */
  weight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Weight unit */
  weightUnit?: Maybe<Scalars["String"]["output"]>;
  /** Width */
  width?: Maybe<Scalars["Decimal"]["output"]>;
  /** List of wishlist ID with this product */
  wishlistIds: Array<Maybe<Scalars["String"]["output"]>>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductAssociationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  group?: InputMaybe<Scalars["String"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionArgs = {
  type?: InputMaybe<Scalars["String"]["input"]>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductDescriptionsArgs = {
  type?: InputMaybe<Scalars["String"]["input"]>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductKeyPropertiesArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductPropertiesArgs = {
  names?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Products are the sellable goods in an e-commerce project. */
export type ProductVideosArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

/** product association. */
export type ProductAssociation = {
  associatedObjectId?: Maybe<Scalars["String"]["output"]>;
  associatedObjectType?: Maybe<Scalars["String"]["output"]>;
  priority: Scalars["Int"]["output"];
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
  tags: Array<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `ProductAssociation`. */
export type ProductAssociationEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<ProductAssociation>;
};

/** Represents promotion object */
export type Promotion = {
  /** Promotion description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** The unique ID of the promotion. */
  id: Scalars["String"]["output"];
  /** The name of the promotion */
  name: Scalars["String"]["output"];
  /** Promotion type */
  type?: Maybe<Scalars["String"]["output"]>;
};

/** Products attributes. */
export type Property = {
  /** Color code in CSS format. */
  colorCode?: Maybe<Scalars["String"]["output"]>;
  /** The display order of the property. */
  displayOrder?: Maybe<Scalars["Int"]["output"]>;
  group?: Maybe<PropertyGroup>;
  /** Is property hidden. */
  hidden: Scalars["Boolean"]["output"];
  /** The unique ID of the property. */
  id: Scalars["String"]["output"];
  label: Scalars["String"]["output"];
  /** Is property has multiple values. */
  multivalue: Scalars["Boolean"]["output"];
  /** The name of the property. */
  name: Scalars["String"]["output"];
  propertyDictionaryItems?: Maybe<PropertyDictionaryItemConnection>;
  propertyType: PropertyType;
  /** ValueType of the property. */
  propertyValueType: PropertyValueTypes;
  value?: Maybe<Scalars["PropertyValue"]["output"]>;
  /** The display order of the value. */
  valueDisplayOrder?: Maybe<Scalars["Int"]["output"]>;
  valueId?: Maybe<Scalars["String"]["output"]>;
};

/** Products attributes. */
export type PropertyPropertyDictionaryItemsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Represents property dictionary item */
export type PropertyDictionaryItem = {
  /** Color code in CSS format. */
  colorCode: Scalars["String"]["output"];
  /** The unique ID of the property dictionary item. */
  id: Scalars["String"]["output"];
  /** Value order. */
  sortOrder: Scalars["Int"]["output"];
  /** Value alias. */
  value?: Maybe<Scalars["String"]["output"]>;
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `PropertyDictionaryItem`. */
export type PropertyDictionaryItemEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<PropertyDictionaryItem>;
};

/** Property group. */
export type PropertyGroup = {
  /** The localized description of the property group. */
  description?: Maybe<Scalars["String"]["output"]>;
  /** The display order of the property group. */
  displayOrder?: Maybe<Scalars["Int"]["output"]>;
  /** The unique ID of the property group. */
  id: Scalars["String"]["output"];
  /** The localized name of the property group. */
  name?: Maybe<Scalars["String"]["output"]>;
};

/** The type of catalog property. */
export enum PropertyType {
  Catalog = "CATALOG",
  Category = "CATEGORY",
  Product = "PRODUCT",
  Variation = "VARIATION",
}

/** The type of catalog property value. */
export enum PropertyValueTypes {
  Boolean = "BOOLEAN",
  Color = "COLOR",
  DateTime = "DATE_TIME",
  GeoPoint = "GEO_POINT",
  Html = "HTML",
  Integer = "INTEGER",
  LongText = "LONG_TEXT",
  Measure = "MEASURE",
  Number = "NUMBER",
  ShortText = "SHORT_TEXT",
}

export type Query = {
  cardPaymentMethods: Array<CardPaymentMethod>;
  cart?: Maybe<CartType>;
  carts?: Maybe<CartConnection>;
  configurationItems?: Maybe<ConfigurationItemsResponseType>;
  getSavedForLater?: Maybe<CartType>;
  pickupLocations?: Maybe<PickupLocationConnection>;
  pricesSum?: Maybe<PricesSumType>;
  productConfiguration?: Maybe<ConfigurationQueryResponseType>;
  savedPaymentMethods: Array<SavedPaymentMethod>;
  sharedWishlist?: Maybe<WishlistType>;
  validateCoupon?: Maybe<Scalars["Boolean"]["output"]>;
  wishlist?: Maybe<WishlistType>;
  wishlists?: Maybe<WishlistConnection>;
};

export type QueryCardPaymentMethodsArgs = {
  storeId: Scalars["String"]["input"];
};

export type QueryCartArgs = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryCartsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  sort?: InputMaybe<Scalars["String"]["input"]>;
  storeId?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryConfigurationItemsArgs = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode: Scalars["String"]["input"];
  lineItemId: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetSavedForLaterArgs = {
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  organizationId?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type QueryPickupLocationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  keyword?: InputMaybe<Scalars["String"]["input"]>;
  sort?: InputMaybe<Scalars["String"]["input"]>;
  storeId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryPricesSumArgs = {
  cartId: Scalars["String"]["input"];
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode: Scalars["String"]["input"];
  lineItemIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  storeId: Scalars["String"]["input"];
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryProductConfigurationArgs = {
  configurableProductId: Scalars["String"]["input"];
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySavedPaymentMethodsArgs = {
  storeId: Scalars["String"]["input"];
};

export type QuerySharedWishlistArgs = {
  sharingKey: Scalars["String"]["input"];
};

export type QueryValidateCouponArgs = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  coupon: Scalars["String"]["input"];
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode: Scalars["String"]["input"];
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type QueryWishlistArgs = {
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  listId: Scalars["String"]["input"];
};

export type QueryWishlistsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  scope?: InputMaybe<Scalars["String"]["input"]>;
  sort?: InputMaybe<Scalars["String"]["input"]>;
  storeId?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["String"]["input"]>;
};

export type Rating = {
  /** Total count of customer reviews */
  reviewCount: Scalars["Int"]["output"];
  /** Average rating */
  value: Scalars["Decimal"]["output"];
};

export type RefreshCartType = {
  cartId?: InputMaybe<Scalars["String"]["input"]>;
  cartName?: InputMaybe<Scalars["String"]["input"]>;
  cartType?: InputMaybe<Scalars["String"]["input"]>;
  cultureName?: InputMaybe<Scalars["String"]["input"]>;
  currencyCode?: InputMaybe<Scalars["String"]["input"]>;
  storeId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

/** A card saved at the payment provider. Never contains the card number, CVV or provider token. */
export type SavedPaymentMethod = {
  brand?: Maybe<Scalars["String"]["output"]>;
  cardholderName?: Maybe<Scalars["String"]["output"]>;
  createdDate: Scalars["DateTime"]["output"];
  expirationMonth?: Maybe<Scalars["Int"]["output"]>;
  expirationYear?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["String"]["output"];
  isDefault: Scalars["Boolean"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  last4?: Maybe<Scalars["String"]["output"]>;
  paymentMethodCode: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
};

export type SeoInfo = {
  id: Scalars["String"]["output"];
  imageAltDescription?: Maybe<Scalars["String"]["output"]>;
  isActive: Scalars["Boolean"]["output"];
  languageCode?: Maybe<Scalars["String"]["output"]>;
  metaDescription?: Maybe<Scalars["String"]["output"]>;
  metaKeywords?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  objectId: Scalars["String"]["output"];
  objectType: Scalars["String"]["output"];
  outline?: Maybe<Scalars["String"]["output"]>;
  pageTitle?: Maybe<Scalars["String"]["output"]>;
  semanticUrl: Scalars["String"]["output"];
  storeId?: Maybe<Scalars["String"]["output"]>;
};

export type SharingSettingType = {
  /** Access (read or write) */
  access?: Maybe<WishlistAccessType>;
  /** Id (sharing key) */
  id: Scalars["String"]["output"];
  /** Created by current user */
  isOwner: Scalars["Boolean"]["output"];
  /** Message saved with the share (one for all targets) */
  message?: Maybe<Scalars["String"]["output"]>;
  /** Scope (private, organization, etc.) */
  scope?: Maybe<WishlistScopeType>;
  /**
   * Id of the first target the list is shared with; owner only, null for non-targeted scopes
   * @deprecated Use targets
   */
  sharedWithId?: Maybe<Scalars["String"]["output"]>;
  /** Targets the list is shared with (id space defined by scope); owner only, empty for other viewers and for non-targeted scopes */
  targets: Array<SharingTargetType>;
};

export type SharingTargetType = {
  /** Id the list is shared with (id space defined by scope) */
  id: Scalars["String"]["output"];
  /** Image URL of the target, when resolved */
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  /** Display name of the target, when the module owning the scope resolves it */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Secondary display line of the target (e.g. city and region), when resolved */
  subtitle?: Maybe<Scalars["String"]["output"]>;
};

export type ShipmentType = {
  /** Text comment */
  comment?: Maybe<Scalars["String"]["output"]>;
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
  fulfillmentCenterId?: Maybe<Scalars["String"]["output"]>;
  /** Value of height */
  height?: Maybe<Scalars["Decimal"]["output"]>;
  /** Shipment Id */
  id: Scalars["String"]["output"];
  /** Items */
  items: Array<CartShipmentItemType>;
  /** Value of length */
  length?: Maybe<Scalars["Decimal"]["output"]>;
  /** Value of measurement units */
  measureUnit?: Maybe<Scalars["String"]["output"]>;
  pickupLocation?: Maybe<PickupLocationType>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Shipment method code */
  shipmentMethodCode?: Maybe<Scalars["String"]["output"]>;
  /** Shipment method option */
  shipmentMethodOption?: Maybe<Scalars["String"]["output"]>;
  shippingMethod?: Maybe<ShippingMethodType>;
  /** Tax details */
  taxDetails: Array<TaxDetailType>;
  /** Tax percent rate */
  taxPercentRate: Scalars["Decimal"]["output"];
  /** Tax total */
  taxTotal: MoneyType;
  /** Tax type */
  taxType?: Maybe<Scalars["String"]["output"]>;
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
  vendor?: Maybe<CommonVendor>;
  /** Value of volumetric weight */
  volumetricWeight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Value of weight */
  weight?: Maybe<Scalars["Decimal"]["output"]>;
  /** Value of weight unit */
  weightUnit?: Maybe<Scalars["String"]["output"]>;
  /** Value of width */
  width?: Maybe<Scalars["Decimal"]["output"]>;
};

export type ShippingMethodType = {
  /** Value of shipping gateway code */
  code: Scalars["String"]["output"];
  /** Currency */
  currency: CurrencyType;
  /** Shipping method description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Discount amount */
  discountAmount: MoneyType;
  /** Discount amount with tax */
  discountAmountWithTax: MoneyType;
  id: Scalars["String"]["output"];
  /** Value of shipping method logo absolute URL */
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  /** Shipping method name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Value of shipping method option description */
  optionDescription?: Maybe<Scalars["String"]["output"]>;
  /** Value of shipping method option name */
  optionName?: Maybe<Scalars["String"]["output"]>;
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Value of shipping method priority */
  priority: Scalars["Int"]["output"];
  /** Total */
  total: MoneyType;
  /** Total with tax */
  totalWithTax: MoneyType;
};

/** The customer's choice to subscribe to a cart line. */
export type SubscriptionCartItem = {
  cartId: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  intervalCount: Scalars["Int"]["output"];
  intervalLabel: Scalars["String"]["output"];
  intervalUnit: SubscriptionIntervalUnit;
  lineItemId: Scalars["String"]["output"];
  planId: Scalars["String"]["output"];
  productId: Scalars["String"]["output"];
};

/** How a subscription plan discounts the price: no discount, a percent, or a fixed amount per item. */
export enum SubscriptionDiscountType {
  FixedAmount = "FIXED_AMOUNT",
  None = "NONE",
  Percent = "PERCENT",
}

/** A delivery frequency offered for a product, e.g. every 2 weeks. */
export type SubscriptionInterval = {
  /** Number of units between deliveries */
  count: Scalars["Int"]["output"];
  /** Preselected frequency */
  isDefault: Scalars["Boolean"]["output"];
  label: Scalars["String"]["output"];
  unit: SubscriptionIntervalUnit;
};

/** The unit of a delivery frequency: every N days, weeks, months or years. */
export enum SubscriptionIntervalUnit {
  Day = "DAY",
  Month = "MONTH",
  Week = "WEEK",
  Year = "YEAR",
}

/** Subscribe & Save offer for a product. */
export type SubscriptionOffer = {
  description?: Maybe<Scalars["String"]["output"]>;
  discountType: SubscriptionDiscountType;
  discountValue: Scalars["Decimal"]["output"];
  intervals: Array<SubscriptionInterval>;
  planId: Scalars["String"]["output"];
  planName: Scalars["String"]["output"];
  productId: Scalars["String"]["output"];
};

export type TaxDetailType = {
  /** Amount */
  amount: MoneyType;
  /** Name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Price */
  price: MoneyType;
  /** Rate */
  rate: MoneyType;
};

export type TierPriceType = {
  /** Price */
  price: MoneyType;
  /** Price with tax */
  priceWithTax: MoneyType;
  /** Quantity */
  quantity: Scalars["Long"]["output"];
};

export type ValidationErrorType = {
  /** Error code */
  errorCode?: Maybe<Scalars["String"]["output"]>;
  /** Error message */
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  errorParameters?: Maybe<Array<Maybe<ErrorParameterType>>>;
  /** Object id */
  objectId?: Maybe<Scalars["String"]["output"]>;
  /** Object type */
  objectType?: Maybe<Scalars["String"]["output"]>;
};

export type VariationType = {
  /** Assets */
  assets: Array<Asset>;
  associations?: Maybe<ProductAssociationConnection>;
  /** Availability data */
  availabilityData: AvailabilityData;
  /** SKU of variation. */
  code: Scalars["String"]["output"];
  /** Id of variation. */
  id: Scalars["String"]["output"];
  /** Product images */
  images: Array<ImageType>;
  /** Max. quantity. */
  maxQuantity?: Maybe<Scalars["Int"]["output"]>;
  /** Min. quantity. */
  minQuantity?: Maybe<Scalars["Int"]["output"]>;
  /** Name of variation. */
  name: Scalars["String"]["output"];
  /** Outlines */
  outlines?: Maybe<Array<OutlineType>>;
  /** Defines the number of items in a package. Quantity step for your product's. */
  packSize?: Maybe<Scalars["Int"]["output"]>;
  /** Product price */
  price: PriceType;
  /** Product prices */
  prices: Array<PriceType>;
  /** The type of product */
  productType?: Maybe<Scalars["String"]["output"]>;
  properties: Array<Property>;
  /** Product rating */
  rating?: Maybe<Rating>;
  /** Request related slug for product */
  slug?: Maybe<Scalars["String"]["output"]>;
  /** Product vendor */
  vendor?: Maybe<CommonVendor>;
};

export type VariationTypeAssociationsArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  group?: InputMaybe<Scalars["String"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `Video`. */
export type VideoEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<VideoType>;
};

export type VideoType = {
  /** Video URL */
  contentUrl: Scalars["String"]["output"];
  /** Culture name */
  cultureName?: Maybe<Scalars["String"]["output"]>;
  /** Video description */
  description: Scalars["String"]["output"];
  /** Video duration */
  duration?: Maybe<Scalars["String"]["output"]>;
  /** Embedded video URL */
  embedUrl?: Maybe<Scalars["String"]["output"]>;
  /** Video name */
  name: Scalars["String"]["output"];
  /** ID of the object video is attached to */
  ownerId: Scalars["String"]["output"];
  /** Type of the object video is attached to (Product, Category) */
  ownerType: Scalars["String"]["output"];
  /** Sort order */
  sortOrder: Scalars["Int"]["output"];
  /** Video thumbnail URL */
  thumbnailUrl: Scalars["String"]["output"];
  /** Video upload date */
  uploadDate?: Maybe<Scalars["DateTime"]["output"]>;
};

export enum WishlistAccessType {
  /** Readonly access */
  Read = "Read",
  /** Write access */
  Write = "Write",
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
  totalCount?: Maybe<Scalars["Int"]["output"]>;
};

/** An edge in a connection from an object to another object of type `Wishlist`. */
export type WishlistEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<WishlistType>;
};

export enum WishlistScopeType {
  /** Anyone (anonymous) scope */
  AnyoneAnonymous = "AnyoneAnonymous",
  /** Anyone (authorized) scope */
  AnyoneAuthorized = "AnyoneAuthorized",
  /** Organization scope */
  Organization = "Organization",
  /** Private scope */
  Private = "Private",
  /** User scope */
  User = "User",
}

export type WishlistType = {
  /** Currency */
  currency?: Maybe<CurrencyType>;
  /** Shopping cart user ID */
  customerId?: Maybe<Scalars["String"]["output"]>;
  /** Shopping cart user name */
  customerName?: Maybe<Scalars["String"]["output"]>;
  /** Wishlist description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Shopping cart ID */
  id: Scalars["String"]["output"];
  /** Items */
  items?: Maybe<Array<Maybe<LineItemType>>>;
  /** Item count */
  itemsCount?: Maybe<Scalars["Int"]["output"]>;
  /** Wishlist modified date */
  modifiedDate?: Maybe<Scalars["DateTime"]["output"]>;
  /** Shopping cart name */
  name: Scalars["String"]["output"];
  /**
   * Wishlist scope
   * @deprecated Use SharingSetting.Scope instead
   */
  scope?: Maybe<WishlistScopeType>;
  /** Sharing settings */
  sharingSetting?: Maybe<SharingSettingType>;
  /** Shopping cart store ID */
  storeId?: Maybe<Scalars["String"]["output"]>;
  /** Wishlist subtotal */
  subTotal: MoneyType;
};

export type SavedPaymentMethodFieldsFragment = {
  id: string;
  paymentMethodCode: string;
  brand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
  cardholderName?: string;
  status: string;
  isDefault: boolean;
  isExpired: boolean;
  createdDate: any;
};

export type AddSavedPaymentMethodMutationVariables = Exact<{
  command: InputAddSavedPaymentMethod;
}>;

export type AddSavedPaymentMethodMutation = {
  addSavedPaymentMethod?: {
    id: string;
    paymentMethodCode: string;
    brand?: string;
    last4?: string;
    expirationMonth?: number;
    expirationYear?: number;
    cardholderName?: string;
    status: string;
    isDefault: boolean;
    isExpired: boolean;
    createdDate: any;
  };
};

export type RemoveSavedPaymentMethodMutationVariables = Exact<{
  command: InputSavedPaymentMethodId;
}>;

export type RemoveSavedPaymentMethodMutation = {
  removeSavedPaymentMethod?: {
    id: string;
    paymentMethodCode: string;
    brand?: string;
    last4?: string;
    expirationMonth?: number;
    expirationYear?: number;
    cardholderName?: string;
    status: string;
    isDefault: boolean;
    isExpired: boolean;
    createdDate: any;
  };
};

export type SetDefaultSavedPaymentMethodMutationVariables = Exact<{
  command: InputSavedPaymentMethodId;
}>;

export type SetDefaultSavedPaymentMethodMutation = {
  setDefaultSavedPaymentMethod?: {
    id: string;
    paymentMethodCode: string;
    brand?: string;
    last4?: string;
    expirationMonth?: number;
    expirationYear?: number;
    cardholderName?: string;
    status: string;
    isDefault: boolean;
    isExpired: boolean;
    createdDate: any;
  };
};

export type GetCardPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars["String"]["input"];
}>;

export type GetCardPaymentMethodsQuery = {
  cardPaymentMethods: Array<{
    paymentMethodCode: string;
    name?: string;
    logoUrl?: string;
    publicParameters: Array<{ key: string; value?: string }>;
  }>;
};

export type GetSavedPaymentMethodsQueryVariables = Exact<{
  storeId: Scalars["String"]["input"];
}>;

export type GetSavedPaymentMethodsQuery = {
  savedPaymentMethods: Array<{
    id: string;
    paymentMethodCode: string;
    brand?: string;
    last4?: string;
    expirationMonth?: number;
    expirationYear?: number;
    cardholderName?: string;
    status: string;
    isDefault: boolean;
    isExpired: boolean;
    createdDate: any;
  }>;
};

export const SavedPaymentMethodFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "savedPaymentMethodFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "SavedPaymentMethod" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
          { kind: "Field", name: { kind: "Name", value: "brand" } },
          { kind: "Field", name: { kind: "Name", value: "last4" } },
          { kind: "Field", name: { kind: "Name", value: "expirationMonth" } },
          { kind: "Field", name: { kind: "Name", value: "expirationYear" } },
          { kind: "Field", name: { kind: "Name", value: "cardholderName" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "isExpired" } },
          { kind: "Field", name: { kind: "Name", value: "createdDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SavedPaymentMethodFieldsFragment, unknown>;
export const AddSavedPaymentMethodDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddSavedPaymentMethod" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "command" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "InputAddSavedPaymentMethod" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addSavedPaymentMethod" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "command" },
                value: { kind: "Variable", name: { kind: "Name", value: "command" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "savedPaymentMethodFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "savedPaymentMethodFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "SavedPaymentMethod" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
          { kind: "Field", name: { kind: "Name", value: "brand" } },
          { kind: "Field", name: { kind: "Name", value: "last4" } },
          { kind: "Field", name: { kind: "Name", value: "expirationMonth" } },
          { kind: "Field", name: { kind: "Name", value: "expirationYear" } },
          { kind: "Field", name: { kind: "Name", value: "cardholderName" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "isExpired" } },
          { kind: "Field", name: { kind: "Name", value: "createdDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddSavedPaymentMethodMutation, AddSavedPaymentMethodMutationVariables>;
export const RemoveSavedPaymentMethodDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveSavedPaymentMethod" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "command" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "InputSavedPaymentMethodId" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeSavedPaymentMethod" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "command" },
                value: { kind: "Variable", name: { kind: "Name", value: "command" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "savedPaymentMethodFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "savedPaymentMethodFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "SavedPaymentMethod" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
          { kind: "Field", name: { kind: "Name", value: "brand" } },
          { kind: "Field", name: { kind: "Name", value: "last4" } },
          { kind: "Field", name: { kind: "Name", value: "expirationMonth" } },
          { kind: "Field", name: { kind: "Name", value: "expirationYear" } },
          { kind: "Field", name: { kind: "Name", value: "cardholderName" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "isExpired" } },
          { kind: "Field", name: { kind: "Name", value: "createdDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveSavedPaymentMethodMutation, RemoveSavedPaymentMethodMutationVariables>;
export const SetDefaultSavedPaymentMethodDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetDefaultSavedPaymentMethod" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "command" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "InputSavedPaymentMethodId" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setDefaultSavedPaymentMethod" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "command" },
                value: { kind: "Variable", name: { kind: "Name", value: "command" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "savedPaymentMethodFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "savedPaymentMethodFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "SavedPaymentMethod" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
          { kind: "Field", name: { kind: "Name", value: "brand" } },
          { kind: "Field", name: { kind: "Name", value: "last4" } },
          { kind: "Field", name: { kind: "Name", value: "expirationMonth" } },
          { kind: "Field", name: { kind: "Name", value: "expirationYear" } },
          { kind: "Field", name: { kind: "Name", value: "cardholderName" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "isExpired" } },
          { kind: "Field", name: { kind: "Name", value: "createdDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetDefaultSavedPaymentMethodMutation, SetDefaultSavedPaymentMethodMutationVariables>;
export const GetCardPaymentMethodsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCardPaymentMethods" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "storeId" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "cardPaymentMethods" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "storeId" },
                value: { kind: "Variable", name: { kind: "Name", value: "storeId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "publicParameters" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCardPaymentMethodsQuery, GetCardPaymentMethodsQueryVariables>;
export const GetSavedPaymentMethodsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetSavedPaymentMethods" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "storeId" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "savedPaymentMethods" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "storeId" },
                value: { kind: "Variable", name: { kind: "Name", value: "storeId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "savedPaymentMethodFields" } }],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "savedPaymentMethodFields" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "SavedPaymentMethod" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "paymentMethodCode" } },
          { kind: "Field", name: { kind: "Name", value: "brand" } },
          { kind: "Field", name: { kind: "Name", value: "last4" } },
          { kind: "Field", name: { kind: "Name", value: "expirationMonth" } },
          { kind: "Field", name: { kind: "Name", value: "expirationYear" } },
          { kind: "Field", name: { kind: "Name", value: "cardholderName" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "isDefault" } },
          { kind: "Field", name: { kind: "Name", value: "isExpired" } },
          { kind: "Field", name: { kind: "Name", value: "createdDate" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSavedPaymentMethodsQuery, GetSavedPaymentMethodsQueryVariables>;
export const OperationNames = {
  Query: {
    GetCardPaymentMethods: "GetCardPaymentMethods",
    GetSavedPaymentMethods: "GetSavedPaymentMethods",
  },
  Mutation: {
    AddSavedPaymentMethod: "AddSavedPaymentMethod",
    RemoveSavedPaymentMethod: "RemoveSavedPaymentMethod",
    SetDefaultSavedPaymentMethod: "SetDefaultSavedPaymentMethod",
  },
  Fragment: {
    savedPaymentMethodFields: "savedPaymentMethodFields",
  },
};

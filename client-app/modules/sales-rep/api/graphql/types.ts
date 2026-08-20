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
  saveSalesRepLayout?: Maybe<SalesRepLayout>;
  sendCustomerCommunication?: Maybe<SalesRepCommunicationResult>;
};


export type MutationsSaveSalesRepLayoutArgs = {
  command: InputSalesRepLayout;
};


export type MutationsSendCustomerCommunicationArgs = {
  command: InputSendCustomerCommunicationType;
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

export type Query = {
  customerSalesReps?: Maybe<SalesRepContactConnection>;
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

export type SaveSalesRepLayoutMutationVariables = Exact<{
  command: InputSalesRepLayout;
}>;


export type SaveSalesRepLayoutMutation = { saveSalesRepLayout?: { regions: Array<{ id: string, blocks: Array<{ id: string, type: string, hidden: boolean, settings: Array<{ key: string, value?: any }> }> }> } };

export type SendCustomerCommunicationMutationVariables = Exact<{
  command: InputSendCustomerCommunicationType;
}>;


export type SendCustomerCommunicationMutation = { sendCustomerCommunication?: { succeeded: boolean, pushSent: boolean, emailSent: boolean, warnings: Array<string> } };

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
  cultureName?: InputMaybe<Scalars['String']['input']>;
  cartFilter?: InputMaybe<Scalars['String']['input']>;
  weekFrom?: InputMaybe<Scalars['DateTime']['input']>;
  weekTo?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type SalesRepCustomerCartStatisticsQuery = { salesRepCustomerCartStatistics?: { currencyCode: string, activeCarts?: { count: number, total: { amount: number, formattedAmount: string } }, newCartsThisWeek?: { count: number } } };

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
}>;


export type SalesRepCustomerOrderStatisticsQuery = { salesRepCustomerOrderStatistics?: { currencyCode: string, mtd?: { count: number, total: { amount: number, formattedAmount: string }, average: { amount: number, formattedAmount: string } }, ytd?: { count: number, total: { amount: number, formattedAmount: string }, average: { amount: number, formattedAmount: string } }, week?: { count: number, total: { amount: number, formattedAmount: string } }, newOrders?: { count: number, total: { amount: number, formattedAmount: string } }, recentOrders?: { count: number }, weekVsPrevWeek?: { totalChangePercent?: number, countChange: number, countChangePercent?: number, totalChange: { amount: number, formattedAmount: string } }, mtdVsPrevMonth?: { totalChangePercent?: number, countChange: number, countChangePercent?: number, totalChange: { amount: number, formattedAmount: string } }, ytdVsLastYear?: { totalChangePercent?: number, countChange: number, countChangePercent?: number, totalChange: { amount: number, formattedAmount: string } } } };

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


export const SaveSalesRepLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveSalesRepLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSalesRepLayout"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveSalesRepLayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SaveSalesRepLayoutMutation, SaveSalesRepLayoutMutationVariables>;
export const SendCustomerCommunicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendCustomerCommunication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSendCustomerCommunicationType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendCustomerCommunication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"pushSent"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<SendCustomerCommunicationMutation, SendCustomerCommunicationMutationVariables>;
export const CustomerSalesRepsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerSalesReps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerSalesReps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"emails"}},{"kind":"Field","name":{"kind":"Name","value":"phones"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerSalesRepsQuery, CustomerSalesRepsQueryVariables>;
export const SalesRepCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"iconUrl"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerQuery, SalesRepCustomerQueryVariables>;
export const SalesRepCustomerCartStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerCartStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerCartStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","alias":{"kind":"Name","value":"activeCarts"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"newCartsThisWeek"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerCartStatisticsQuery, SalesRepCustomerCartStatisticsQueryVariables>;
export const SalesRepCustomerCountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerCounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerCounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignedCustomers"}},{"kind":"Field","alias":{"kind":"Name","value":"thisMonth"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderingCustomers"}},{"kind":"Field","name":{"kind":"Name","value":"newCustomers"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerCountsQuery, SalesRepCustomerCountsQueryVariables>;
export const SalesRepCustomerFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerFilterRulesQuery, SalesRepCustomerFilterRulesQueryVariables>;
export const SalesRepCustomerOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOptionsQuery, SalesRepCustomerOptionsQueryVariables>;
export const SalesRepCustomerOrderStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerOrderStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newOrdersFilter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerOrderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencyCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","alias":{"kind":"Name","value":"mtd"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"average"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytd"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"average"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"week"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"newOrders"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newOrdersFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"recentOrders"},"name":{"kind":"Name","value":"period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recentTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"weekVsPrevWeek"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevWeekTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalChangePercent"}},{"kind":"Field","name":{"kind":"Name","value":"countChange"}},{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mtdVsPrevMonth"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mtdTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prevTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalChangePercent"}},{"kind":"Field","name":{"kind":"Name","value":"countChange"}},{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytdVsLastYear"},"name":{"kind":"Name","value":"comparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"current"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"previous"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalChangePercent"}},{"kind":"Field","name":{"kind":"Name","value":"countChange"}},{"kind":"Field","name":{"kind":"Name","value":"countChangePercent"}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerOrderStatisticsQuery, SalesRepCustomerOrderStatisticsQueryVariables>;
export const SalesRepCustomerSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomerSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomerSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomerSortRulesQuery, SalesRepCustomerSortRulesQueryVariables>;
export const SalesRepCustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"regionName"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ytd"},"name":{"kind":"Name","value":"orderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ytdTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"lastYear"},"name":{"kind":"Name","value":"orderStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastYearTo"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomersQuery, SalesRepCustomersQueryVariables>;
export const SalesRepCustomersCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepCustomersCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepCustomers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<SalesRepCustomersCountQuery, SalesRepCustomersCountQueryVariables>;
export const SalesRepLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepLayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepLayoutQuery, SalesRepLayoutQueryVariables>;
export const SalesRepOrderFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrderFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrderFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"localizedName"},"arguments":[],"directives":[]}]}}]}}]} as unknown as DocumentNode<SalesRepOrderFilterRulesQuery, SalesRepOrderFilterRulesQueryVariables>;
export const SalesRepOrderSortRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrderSortRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrderSortRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDirection"}},{"kind":"Field","name":{"kind":"Name","value":"supportsDirection"}}]}}]}}]} as unknown as DocumentNode<SalesRepOrderSortRulesQuery, SalesRepOrderSortRulesQueryVariables>;
export const SalesRepOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationName"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"}},{"kind":"Field","name":{"kind":"Name","value":"itemsCount"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"formattedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SalesRepOrdersQuery, SalesRepOrdersQueryVariables>;
export const SalesRepTopSellerFilterRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SalesRepTopSellerFilterRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}},"directives":[]},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesRepTopSellerFilterRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodTo"}}}]}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"localizedName"},"arguments":[],"directives":[]}]}}]}}]} as unknown as DocumentNode<SalesRepTopSellerFilterRulesQuery, SalesRepTopSellerFilterRulesQueryVariables>;
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
    SalesRepCustomerOrderStatistics: 'SalesRepCustomerOrderStatistics',
    SalesRepCustomerSortRules: 'SalesRepCustomerSortRules',
    SalesRepCustomers: 'SalesRepCustomers',
    SalesRepCustomersCount: 'SalesRepCustomersCount',
    SalesRepLayout: 'SalesRepLayout',
    SalesRepOrderFilterRules: 'SalesRepOrderFilterRules',
    SalesRepOrderSortRules: 'SalesRepOrderSortRules',
    SalesRepOrders: 'SalesRepOrders',
    SalesRepTopSellerFilterRules: 'SalesRepTopSellerFilterRules',
    SalesRepTopSellerSortRules: 'SalesRepTopSellerSortRules',
    SalesRepTopSellers: 'SalesRepTopSellers'
  },
  Mutation: {
    SaveSalesRepLayout: 'SaveSalesRepLayout',
    SendCustomerCommunication: 'SendCustomerCommunication'
  }
}
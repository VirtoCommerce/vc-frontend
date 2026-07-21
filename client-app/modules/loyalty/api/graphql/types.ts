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
  /** The mission type: OrderValue, OrderCount or PerSku. */
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
  storeId?: InputMaybe<Scalars['String']['input']>;
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
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyMissionProgressQuery = { loyaltyMissionProgress?: { totalCount?: number, items?: Array<{ missionId?: string, progressId?: string, name?: string, localizedName?: string, description?: string, bannerUrl?: string, missionType?: string, status?: string, isStarted?: boolean, percentage?: number, currentValue?: number, targetValue?: number, startDate?: any, endDate?: any, periodStart?: any, periodEnd?: any, completedDate?: any, daysRemaining?: number, missionCurrency?: { code: string, symbol: string }, rewardPoints?: { amount: number }, items?: Array<{ productId?: string, currentQuantity: number, targetQuantity: number }> }>, pageInfo: { hasNextPage: boolean, endCursor?: string } } };

export type GetLoyaltyPointsHistoryQueryVariables = Exact<{
  sort?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  operationType?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyPointsHistoryQuery = { loyaltyPointsHistory?: { totalCount?: number, items?: Array<{ id: string, operationType: string, amount: number, createdDate: any, object?: { type: string, orderId?: string, orderNumber?: string } }> } };


export const GetLoyaltyBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentBalance"}},{"kind":"Field","name":{"kind":"Name","value":"resultBalance"}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyBalanceQuery, GetLoyaltyBalanceQueryVariables>;
export const GetLoyaltyMissionProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyMissionProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isStarted"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyMissionProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"isStarted"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isStarted"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"progressId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isStarted"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"currentValue"}},{"kind":"Field","name":{"kind":"Name","value":"targetValue"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"periodStart"}},{"kind":"Field","name":{"kind":"Name","value":"periodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"completedDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"missionCurrency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardPoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"currentQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"targetQuantity"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyMissionProgressQuery, GetLoyaltyMissionProgressQueryVariables>;
export const GetLoyaltyPointsHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyPointsHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyPointsHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"operationType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyPointsHistoryQuery, GetLoyaltyPointsHistoryQueryVariables>;
export const OperationNames = {
  Query: {
    GetLoyaltyBalance: 'GetLoyaltyBalance',
    GetLoyaltyMissionProgress: 'GetLoyaltyMissionProgress',
    GetLoyaltyPointsHistory: 'GetLoyaltyPointsHistory'
  }
}
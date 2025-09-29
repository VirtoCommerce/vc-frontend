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
  loyaltyPointsHistory?: Maybe<LoyaltyOperationLogConnection>;
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

export type GetLoyaltyBalanceQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyBalanceQuery = { loyaltyBalance?: { currentBalance: number, resultBalance: number } };

export type GetLoyaltyPointsHistoryQueryVariables = Exact<{
  sort?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  operationType?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLoyaltyPointsHistoryQuery = { loyaltyPointsHistory?: { totalCount?: number, items?: Array<{ id: string, operationType: string, amount: number, createdDate: any, object?: { type: string, orderId?: string, orderNumber?: string } }> } };


export const GetLoyaltyBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentBalance"}},{"kind":"Field","name":{"kind":"Name","value":"resultBalance"}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyBalanceQuery, GetLoyaltyBalanceQueryVariables>;
export const GetLoyaltyPointsHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLoyaltyPointsHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loyaltyPointsHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"operationType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operationType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}}]}}]}}]}}]} as unknown as DocumentNode<GetLoyaltyPointsHistoryQuery, GetLoyaltyPointsHistoryQueryVariables>;
export const OperationNames = {
  Query: {
    GetLoyaltyBalance: 'GetLoyaltyBalance',
    GetLoyaltyPointsHistory: 'GetLoyaltyPointsHistory'
  }
}
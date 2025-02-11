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
};

export type ActivateBackInStockSubscriptionCommandType = {
  productId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
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

export type DeactivateBackInStockSubscriptionCommandType = {
  productId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type Mutations = {
  activateBackInStockSubscription?: Maybe<BackInStockSubscriptionType>;
  deactivateBackInStockSubscription?: Maybe<BackInStockSubscriptionType>;
};


export type MutationsActivateBackInStockSubscriptionArgs = {
  command: ActivateBackInStockSubscriptionCommandType;
};


export type MutationsDeactivateBackInStockSubscriptionArgs = {
  command: DeactivateBackInStockSubscriptionCommandType;
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
  backInStockSubscriptions?: Maybe<BackInStockSubscriptionConnection>;
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

export type ActivateBackInStockSubscriptionMutationVariables = Exact<{
  command: ActivateBackInStockSubscriptionCommandType;
}>;


export type ActivateBackInStockSubscriptionMutation = { activateBackInStockSubscription?: { id: string, isActive: boolean, productId: string } };

export type DeactivateBackInStockSubscriptionMutationVariables = Exact<{
  command: DeactivateBackInStockSubscriptionCommandType;
}>;


export type DeactivateBackInStockSubscriptionMutation = { deactivateBackInStockSubscription?: { id: string, isActive: boolean, productId: string } };

export type GetBackInStockSubscriptionsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetBackInStockSubscriptionsQuery = { backInStockSubscriptions?: { totalCount?: number, items?: Array<{ id: string, isActive: boolean, productId: string }> } };


export const ActivateBackInStockSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"activateBackInStockSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivateBackInStockSubscriptionCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateBackInStockSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}}]}}]}}]} as unknown as DocumentNode<ActivateBackInStockSubscriptionMutation, ActivateBackInStockSubscriptionMutationVariables>;
export const DeactivateBackInStockSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deactivateBackInStockSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeactivateBackInStockSubscriptionCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateBackInStockSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}}]}}]}}]} as unknown as DocumentNode<DeactivateBackInStockSubscriptionMutation, DeactivateBackInStockSubscriptionMutationVariables>;
export const GetBackInStockSubscriptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBackInStockSubscriptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backInStockSubscriptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"productIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetBackInStockSubscriptionsQuery, GetBackInStockSubscriptionsQueryVariables>;
export const OperationNames = {
  Query: {
    GetBackInStockSubscriptions: 'GetBackInStockSubscriptions'
  },
  Mutation: {
    activateBackInStockSubscription: 'activateBackInStockSubscription',
    deactivateBackInStockSubscription: 'deactivateBackInStockSubscription'
  }
}
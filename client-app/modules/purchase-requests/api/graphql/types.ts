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
  Long: { input: number; output: number; }
};

export type InputAddPurchaseRequestSourceType = {
  documentUrls: Array<Scalars['String']['input']>;
  purchaseRequestId: Scalars['String']['input'];
};

export type InputCreatePurchaseRequestFromDocumentsType = {
  cultureName: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  documentUrls: Array<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputCreatePurchaseRequestType = {
  cultureName: Scalars['String']['input'];
  currencyCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type InputExtractDataFromPurchaseRequestSourcesType = {
  purchaseRequestId: Scalars['String']['input'];
};

export type InputPostProcessPurchaseRequestSourcesType = {
  purchaseRequestId: Scalars['String']['input'];
};

export type InputUpdatePurchaseRequestByDocumentsType = {
  documentUrls: Array<Scalars['String']['input']>;
  purchaseRequestId: Scalars['String']['input'];
};

export type Mutations = {
  addPurchaseRequestSource?: Maybe<PurchaseRequestType>;
  createPurchaseRequest?: Maybe<PurchaseRequestType>;
  createPurchaseRequestFromDocuments?: Maybe<PurchaseRequestType>;
  extractPurchaseRequestSourcesData?: Maybe<PurchaseRequestType>;
  postProcessPurchaseRequestSources?: Maybe<PurchaseRequestType>;
  updatePurchaseRequestByDocuments?: Maybe<PurchaseRequestType>;
};


export type MutationsAddPurchaseRequestSourceArgs = {
  command: InputAddPurchaseRequestSourceType;
};


export type MutationsCreatePurchaseRequestArgs = {
  command: InputCreatePurchaseRequestType;
};


export type MutationsCreatePurchaseRequestFromDocumentsArgs = {
  command: InputCreatePurchaseRequestFromDocumentsType;
};


export type MutationsExtractPurchaseRequestSourcesDataArgs = {
  command: InputExtractDataFromPurchaseRequestSourcesType;
};


export type MutationsPostProcessPurchaseRequestSourcesArgs = {
  command: InputPostProcessPurchaseRequestSourcesType;
};


export type MutationsUpdatePurchaseRequestByDocumentsArgs = {
  command: InputUpdatePurchaseRequestByDocumentsType;
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

/** A connection from an object to a list of objects of type `PurchaseRequest`. */
export type PurchaseRequestConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<PurchaseRequestEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<PurchaseRequestType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `PurchaseRequest`. */
export type PurchaseRequestEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<PurchaseRequestType>;
};

export type PurchaseRequestSourceType = {
  contentType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  size: Scalars['Long']['output'];
  url: Scalars['String']['output'];
};

export type PurchaseRequestType = {
  createdBy: Scalars['String']['output'];
  createdDate: Scalars['DateTime']['output'];
  customerId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  modifiedBy?: Maybe<Scalars['String']['output']>;
  modifiedDate?: Maybe<Scalars['DateTime']['output']>;
  number: Scalars['String']['output'];
  quoteId?: Maybe<Scalars['String']['output']>;
  sources: Array<PurchaseRequestSourceType>;
  storeId: Scalars['String']['output'];
};

export type Query = {
  purchaseRequest?: Maybe<PurchaseRequestType>;
  purchaseRequests?: Maybe<PurchaseRequestConnection>;
};


export type QueryPurchaseRequestArgs = {
  purchaseRequestId: Scalars['String']['input'];
};


export type QueryPurchaseRequestsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseRequestFragment = { id: string, number: string, quoteId?: string, sources: Array<{ name: string, url: string, contentType: string, size: number }> };

export type CreatePurchaseRequestFromDocumentsMutationVariables = Exact<{
  command: InputCreatePurchaseRequestFromDocumentsType;
}>;


export type CreatePurchaseRequestFromDocumentsMutation = { createPurchaseRequestFromDocuments?: { id: string } };

export type UpdatePurchaseRequestByDocumentsMutationVariables = Exact<{
  command: InputUpdatePurchaseRequestByDocumentsType;
}>;


export type UpdatePurchaseRequestByDocumentsMutation = { updatePurchaseRequestByDocuments?: { id: string, number: string, quoteId?: string, sources: Array<{ name: string, url: string, contentType: string, size: number }> } };

export type GetPurchaseRequestQueryVariables = Exact<{
  purchaseRequestId: Scalars['String']['input'];
}>;


export type GetPurchaseRequestQuery = { purchaseRequest?: { id: string, number: string, quoteId?: string, sources: Array<{ name: string, url: string, contentType: string, size: number }> } };

export type GetPurchaseRequestsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPurchaseRequestsQuery = { purchaseRequests?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, number: string }> } };

export const PurchaseRequestFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"purchaseRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PurchaseRequestType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<PurchaseRequestFragment, unknown>;
export const CreatePurchaseRequestFromDocumentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePurchaseRequestFromDocuments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputCreatePurchaseRequestFromDocumentsType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPurchaseRequestFromDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreatePurchaseRequestFromDocumentsMutation, CreatePurchaseRequestFromDocumentsMutationVariables>;
export const UpdatePurchaseRequestByDocumentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePurchaseRequestByDocuments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdatePurchaseRequestByDocumentsType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePurchaseRequestByDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"purchaseRequest"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"purchaseRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PurchaseRequestType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<UpdatePurchaseRequestByDocumentsMutation, UpdatePurchaseRequestByDocumentsMutationVariables>;
export const GetPurchaseRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPurchaseRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purchaseRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"purchaseRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purchaseRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"purchaseRequest"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"purchaseRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PurchaseRequestType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"quoteId"}},{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<GetPurchaseRequestQuery, GetPurchaseRequestQueryVariables>;
export const GetPurchaseRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPurchaseRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]} as unknown as DocumentNode<GetPurchaseRequestsQuery, GetPurchaseRequestsQueryVariables>;
export const OperationNames = {
  Query: {
    GetPurchaseRequest: 'GetPurchaseRequest',
    GetPurchaseRequests: 'GetPurchaseRequests'
  },
  Mutation: {
    CreatePurchaseRequestFromDocuments: 'CreatePurchaseRequestFromDocuments',
    UpdatePurchaseRequestByDocuments: 'UpdatePurchaseRequestByDocuments'
  },
  Fragment: {
    purchaseRequest: 'purchaseRequest'
  }
}
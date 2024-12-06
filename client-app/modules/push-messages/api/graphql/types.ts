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

export type InputAddFcmTokenType = {
  token: Scalars['String']['input'];
};

export type InputDeleteFcmTokenType = {
  token: Scalars['String']['input'];
};

export type InputMarkPushMessageReadType = {
  messageId: Scalars['String']['input'];
};

export type InputMarkPushMessageUnreadType = {
  messageId: Scalars['String']['input'];
};

export type Mutations = {
  addFcmToken?: Maybe<Scalars['Boolean']['output']>;
  clearAllPushMessages?: Maybe<Scalars['Boolean']['output']>;
  deleteFcmToken?: Maybe<Scalars['Boolean']['output']>;
  markAllPushMessagesRead?: Maybe<Scalars['Boolean']['output']>;
  markAllPushMessagesUnread?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageRead?: Maybe<Scalars['Boolean']['output']>;
  markPushMessageUnread?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationsAddFcmTokenArgs = {
  command: InputAddFcmTokenType;
};


export type MutationsDeleteFcmTokenArgs = {
  command: InputDeleteFcmTokenType;
};


export type MutationsMarkPushMessageReadArgs = {
  command: InputMarkPushMessageReadType;
};


export type MutationsMarkPushMessageUnreadArgs = {
  command: InputMarkPushMessageUnreadType;
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
  fcmSettings?: Maybe<FcmSettingsType>;
  pushMessages?: Maybe<PushMessageConnection>;
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

export type Subscriptions = {
  pushMessageCreated: PushMessageType;
};

export type PushMessageFragment = { id: string, createdDate: any, shortMessage: string, isRead: boolean, isHidden: boolean };

export type AddFcmTokenMutationVariables = Exact<{
  command: InputAddFcmTokenType;
}>;


export type AddFcmTokenMutation = { addFcmToken?: boolean };

export type ClearAllPushMessagesMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearAllPushMessagesMutation = { clearAllPushMessages?: boolean };

export type DeleteFcmTokenMutationVariables = Exact<{
  command: InputDeleteFcmTokenType;
}>;


export type DeleteFcmTokenMutation = { deleteFcmToken?: boolean };

export type MarkAllPushMessagesReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesReadMutation = { markAllPushMessagesRead?: boolean };

export type MarkAllPushMessagesUnreadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllPushMessagesUnreadMutation = { markAllPushMessagesUnread?: boolean };

export type MarkPushMessageReadMutationVariables = Exact<{
  command: InputMarkPushMessageReadType;
}>;


export type MarkPushMessageReadMutation = { markPushMessageRead?: boolean };

export type MarkPushMessageUnreadMutationVariables = Exact<{
  command: InputMarkPushMessageUnreadType;
}>;


export type MarkPushMessageUnreadMutation = { markPushMessageUnread?: boolean };

export type GetPushMessagesQueryVariables = Exact<{
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  withHidden?: InputMaybe<Scalars['Boolean']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPushMessagesQuery = { pushMessages?: { totalCount?: number, items?: Array<{ id: string, createdDate: any, shortMessage: string, isRead: boolean, isHidden: boolean }> }, unreadCount?: { totalCount?: number }, unreadCountWithHidden?: { totalCount?: number } };

export type OnPushMessageCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnPushMessageCreatedSubscription = { pushMessageCreated: { id: string, createdDate: any, shortMessage: string, isRead: boolean, isHidden: boolean } };

export const PushMessageFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}}]}}]} as unknown as DocumentNode<PushMessageFragment, unknown>;
export const AddFcmTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddFcmToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddFcmTokenType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addFcmToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<AddFcmTokenMutation, AddFcmTokenMutationVariables>;
export const ClearAllPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearAllPushMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearAllPushMessages"}}]}}]} as unknown as DocumentNode<ClearAllPushMessagesMutation, ClearAllPushMessagesMutationVariables>;
export const DeleteFcmTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFcmToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputDeleteFcmTokenType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteFcmToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteFcmTokenMutation, DeleteFcmTokenMutationVariables>;
export const MarkAllPushMessagesReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesRead"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesReadMutation, MarkAllPushMessagesReadMutationVariables>;
export const MarkAllPushMessagesUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllPushMessagesUnread"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllPushMessagesUnread"}}]}}]} as unknown as DocumentNode<MarkAllPushMessagesUnreadMutation, MarkAllPushMessagesUnreadMutationVariables>;
export const MarkPushMessageReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkPushMessageRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMarkPushMessageReadType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPushMessageRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<MarkPushMessageReadMutation, MarkPushMessageReadMutationVariables>;
export const MarkPushMessageUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkPushMessageUnread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputMarkPushMessageUnreadType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPushMessageUnread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<MarkPushMessageUnreadMutation, MarkPushMessageUnreadMutationVariables>;
export const GetPushMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPushMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withHidden"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"withHidden"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withHidden"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"unreadCount"},"name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"unreadCountWithHidden"},"name":{"kind":"Name","value":"pushMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"withHidden"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}}]}}]} as unknown as DocumentNode<GetPushMessagesQuery, GetPushMessagesQueryVariables>;
export const OnPushMessageCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnPushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushMessageCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"pushMessage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"pushMessage"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PushMessageType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"shortMessage"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"isHidden"}}]}}]} as unknown as DocumentNode<OnPushMessageCreatedSubscription, OnPushMessageCreatedSubscriptionVariables>;
export const OperationNames = {
  Query: {
    GetPushMessages: 'GetPushMessages'
  },
  Mutation: {
    AddFcmToken: 'AddFcmToken',
    ClearAllPushMessages: 'ClearAllPushMessages',
    DeleteFcmToken: 'DeleteFcmToken',
    MarkAllPushMessagesRead: 'MarkAllPushMessagesRead',
    MarkAllPushMessagesUnread: 'MarkAllPushMessagesUnread',
    MarkPushMessageRead: 'MarkPushMessageRead',
    MarkPushMessageUnread: 'MarkPushMessageUnread'
  },
  Subscription: {
    OnPushMessageCreated: 'OnPushMessageCreated'
  },
  Fragment: {
    pushMessage: 'pushMessage'
  }
}
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

export type InputAnalyticsEvent = {
  /** A JSON object describing the page and the visit: url, referrer, campaign. */
  context?: InputMaybe<Scalars['String']['input']>;
  /** Assigned once by the sender and kept on every retry: an event delivered twice is stored once. */
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  occurredAt: Scalars['DateTime']['input'];
  /** The organization that was current when the action happened. */
  organizationId?: InputMaybe<Scalars['String']['input']>;
  /** A JSON object with the event's own properties. */
  properties?: InputMaybe<Scalars['String']['input']>;
  /** Who was signed in when the action happened; empty for a signed-out visitor. An event whose user or organization differs from the caller's token is dropped: the session changed between the action and the delivery. */
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type InputPushAnalyticsEvents = {
  /** The visitor's own id while signed out. Stored as reported, never used as an identity. */
  anonymousId?: InputMaybe<Scalars['String']['input']>;
  /** At most 50 events; the rest of a longer batch is ignored. */
  events: Array<InputAnalyticsEvent>;
  /** The browser session the events belong to. */
  sessionId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type Mutations = {
  pushAnalyticsEvents?: Maybe<Scalars['Int']['output']>;
};


export type MutationsPushAnalyticsEventsArgs = {
  command: InputPushAnalyticsEvents;
};

export type Query = {
  isAnalyticsAvailable?: Maybe<Scalars['Boolean']['output']>;
};


export type QueryIsAnalyticsAvailableArgs = {
  storeId: Scalars['String']['input'];
};

export type PushAnalyticsEventsMutationVariables = Exact<{
  command: InputPushAnalyticsEvents;
}>;


export type PushAnalyticsEventsMutation = { pushAnalyticsEvents?: number };


export const PushAnalyticsEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PushAnalyticsEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputPushAnalyticsEvents"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pushAnalyticsEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<PushAnalyticsEventsMutation, PushAnalyticsEventsMutationVariables>;
export const OperationNames = {
  Mutation: {
    PushAnalyticsEvents: 'PushAnalyticsEvents'
  }
}
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

export type ActivatePunchoutSessionCommandType = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  sessionToken: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type Mutations = {
  activatePunchoutSession?: Maybe<PunchoutSessonActivationResultType>;
};


export type MutationsActivatePunchoutSessionArgs = {
  command: ActivatePunchoutSessionCommandType;
};

export type PunchoutResultType = {
  success: Scalars['Boolean']['output'];
};

export type PunchoutSessonActivationResultType = {
  /** Error code of a failed activation. Empty when the session was activated. */
  error?: Maybe<Scalars['String']['output']>;
  /** The cart the punchout session works with. Empty when the session uses the default cart. */
  punchoutCartId?: Maybe<Scalars['String']['output']>;
  /** The name of the cart the punchout session works with. */
  punchoutCartName?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  punchoutMockQuery?: Maybe<PunchoutResultType>;
};

export type ActivatePunchoutSessionMutationVariables = Exact<{
  command: ActivatePunchoutSessionCommandType;
}>;


export type ActivatePunchoutSessionMutation = { activatePunchoutSession?: { error?: string, punchoutCartId?: string, punchoutCartName?: string } };


export const ActivatePunchoutSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"activatePunchoutSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivatePunchoutSessionCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activatePunchoutSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"punchoutCartId"}},{"kind":"Field","name":{"kind":"Name","value":"punchoutCartName"}}]}}]}}]} as unknown as DocumentNode<ActivatePunchoutSessionMutation, ActivatePunchoutSessionMutationVariables>;
export const OperationNames = {
  Mutation: {
    activatePunchoutSession: 'activatePunchoutSession'
  }
}
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

export type CreatePunchoutRequisitionCommandType = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type Mutations = {
  createPunchoutRequisition?: Maybe<PunchoutCheckoutType>;
};


export type MutationsCreatePunchoutRequisitionArgs = {
  command: CreatePunchoutRequisitionCommandType;
};

export type PunchoutCheckoutType = {
  cxml?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  formField?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type PunchoutResultType = {
  success: Scalars['Boolean']['output'];
};

export type Query = {
  punchoutMockQuery?: Maybe<PunchoutResultType>;
};

export type CreatePunchoutRequisitionMutationVariables = Exact<{
  command: CreatePunchoutRequisitionCommandType;
}>;


export type CreatePunchoutRequisitionMutation = { createPunchoutRequisition?: { url?: string, formField?: string, cxml?: string, errorCode?: string } };


export const CreatePunchoutRequisitionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePunchoutRequisition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePunchoutRequisitionCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPunchoutRequisition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"formField"}},{"kind":"Field","name":{"kind":"Name","value":"cxml"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}}]}}]}}]} as unknown as DocumentNode<CreatePunchoutRequisitionMutation, CreatePunchoutRequisitionMutationVariables>;
export const OperationNames = {
  Mutation: {
    CreatePunchoutRequisition: 'CreatePunchoutRequisition'
  }
}
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

export type DeleteSkyflowCardCommandType = {
  /** Skyflow card id */
  skyflowId: Scalars['String']['input'];
  /** Store id */
  storeId: Scalars['String']['input'];
};

export type Mutations = {
  deleteSkyflowCard?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationsDeleteSkyflowCardArgs = {
  command: DeleteSkyflowCardCommandType;
};

export type Query = {
  skyflowCards?: Maybe<SkyflowCardResponseType>;
};


export type QuerySkyflowCardsArgs = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type SkyflowCardResponseType = {
  cards?: Maybe<Array<Maybe<SkyflowCardType>>>;
};

export type SkyflowCardType = {
  active: Scalars['Boolean']['output'];
  cardExpiration?: Maybe<Scalars['String']['output']>;
  cardNumber: Scalars['String']['output'];
  cardScheme?: Maybe<Scalars['String']['output']>;
  cardType?: Maybe<Scalars['String']['output']>;
  cardholderName?: Maybe<Scalars['String']['output']>;
  cvv?: Maybe<Scalars['String']['output']>;
  expiryMonth?: Maybe<Scalars['String']['output']>;
  expiryYear?: Maybe<Scalars['String']['output']>;
  skyflowId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type DeleteSkyFlowCardMutationVariables = Exact<{
  command: DeleteSkyflowCardCommandType;
}>;


export type DeleteSkyFlowCardMutation = { deleteSkyflowCard?: boolean };

export type GetSkyflowCardsQueryVariables = Exact<{
  storeId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSkyflowCardsQuery = { skyflowCards?: { cards?: Array<{ cardNumber: string, cardExpiration?: string, skyflowId: string, active: boolean, cardScheme?: string, cardType?: string }> } };


export const DeleteSkyFlowCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSkyFlowCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteSkyflowCardCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSkyflowCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<DeleteSkyFlowCardMutation, DeleteSkyFlowCardMutationVariables>;
export const GetSkyflowCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSkyflowCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skyflowCards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cardNumber"}},{"kind":"Field","name":{"kind":"Name","value":"cardExpiration"}},{"kind":"Field","name":{"kind":"Name","value":"skyflowId"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"cardScheme"}},{"kind":"Field","name":{"kind":"Name","value":"cardType"}}]}}]}}]}}]} as unknown as DocumentNode<GetSkyflowCardsQuery, GetSkyflowCardsQueryVariables>;
export const OperationNames = {
  Query: {
    GetSkyflowCards: 'GetSkyflowCards'
  },
  Mutation: {
    DeleteSkyFlowCard: 'DeleteSkyFlowCard'
  }
}
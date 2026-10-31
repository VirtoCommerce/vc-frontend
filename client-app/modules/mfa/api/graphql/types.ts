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

export type InputRequestMfaChangeCodeType = {
  storeId: Scalars['String']['input'];
};

export type InputUpdateMfaOrganizationModeType = {
  /** The code sent by requestMfaChangeCode. */
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
  organizationId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  /** The two-factor token from requestMfaChangeCode. */
  twoFactorToken: Scalars['String']['input'];
};

export type InputUpdateMfaUserModeType = {
  /** The code sent by requestMfaChangeCode. */
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
  storeId: Scalars['String']['input'];
  /** The two-factor token from requestMfaChangeCode. */
  twoFactorToken: Scalars['String']['input'];
};

export type MfaChangeResponse = {
  errorCode?: Maybe<Scalars['String']['output']>;
  errorDescription?: Maybe<Scalars['String']['output']>;
  lockoutSecondsRemaining?: Maybe<Scalars['Int']['output']>;
  settings?: Maybe<MfaSettings>;
  succeeded: Scalars['Boolean']['output'];
};

export type MfaCodeChallenge = {
  destination?: Maybe<Scalars['String']['output']>;
  errorCode?: Maybe<Scalars['String']['output']>;
  errorDescription?: Maybe<Scalars['String']['output']>;
  lockoutSecondsRemaining?: Maybe<Scalars['Int']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  resendSecondsRemaining?: Maybe<Scalars['Int']['output']>;
  succeeded: Scalars['Boolean']['output'];
  twoFactorToken?: Maybe<Scalars['String']['output']>;
};

export type MfaSettings = {
  canChangeOrganizationMode: Scalars['Boolean']['output'];
  canChangeUserMode: Scalars['Boolean']['output'];
  destination?: Maybe<Scalars['String']['output']>;
  /** Whether a code can be delivered to the user, for example the email is confirmed. */
  isProviderAvailable: Scalars['Boolean']['output'];
  /** Whether the password sign-in to the store requires the code. */
  isRequired: Scalars['Boolean']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  /** Off, Enabled (by the organization maintainer) or Required (by the administrator). */
  organizationMode?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  /** None, Global, Store, Organization or User. */
  requiredBy: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  /** UseGlobalSetting, Enabled, Disabled, AdminManaged or CustomerChoice. */
  storeMode: Scalars['String']['output'];
  /** Off, Enabled (by the user) or Required (by the administrator). */
  userMode: Scalars['String']['output'];
};

export type Mutations = {
  requestMfaChangeCode?: Maybe<MfaCodeChallenge>;
  updateMfaOrganizationMode?: Maybe<MfaChangeResponse>;
  updateMfaUserMode?: Maybe<MfaChangeResponse>;
};


export type MutationsRequestMfaChangeCodeArgs = {
  command: InputRequestMfaChangeCodeType;
};


export type MutationsUpdateMfaOrganizationModeArgs = {
  command: InputUpdateMfaOrganizationModeType;
};


export type MutationsUpdateMfaUserModeArgs = {
  command: InputUpdateMfaUserModeType;
};

export type Query = {
  mfaSettings?: Maybe<MfaSettings>;
};


export type QueryMfaSettingsArgs = {
  organizationId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type RequestMfaChangeCodeMutationVariables = Exact<{
  command: InputRequestMfaChangeCodeType;
}>;


export type RequestMfaChangeCodeMutation = { requestMfaChangeCode?: { succeeded: boolean, twoFactorToken?: string, provider?: string, destination?: string, resendSecondsRemaining?: number, lockoutSecondsRemaining?: number, errorCode?: string, errorDescription?: string } };

export type UpdateMfaOrganizationModeMutationVariables = Exact<{
  command: InputUpdateMfaOrganizationModeType;
}>;


export type UpdateMfaOrganizationModeMutation = { updateMfaOrganizationMode?: { succeeded: boolean, errorCode?: string, errorDescription?: string, lockoutSecondsRemaining?: number, settings?: { storeId: string, storeMode: string, isRequired: boolean, requiredBy: string, userMode: string, canChangeUserMode: boolean, organizationId?: string, organizationMode?: string, canChangeOrganizationMode: boolean, isProviderAvailable: boolean, provider?: string, destination?: string } } };

export type UpdateMfaUserModeMutationVariables = Exact<{
  command: InputUpdateMfaUserModeType;
}>;


export type UpdateMfaUserModeMutation = { updateMfaUserMode?: { succeeded: boolean, errorCode?: string, errorDescription?: string, lockoutSecondsRemaining?: number, settings?: { storeId: string, storeMode: string, isRequired: boolean, requiredBy: string, userMode: string, canChangeUserMode: boolean, organizationId?: string, organizationMode?: string, canChangeOrganizationMode: boolean, isProviderAvailable: boolean, provider?: string, destination?: string } } };

export type GetMfaSettingsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetMfaSettingsQuery = { mfaSettings?: { storeId: string, storeMode: string, isRequired: boolean, requiredBy: string, userMode: string, canChangeUserMode: boolean, organizationId?: string, organizationMode?: string, canChangeOrganizationMode: boolean, isProviderAvailable: boolean, provider?: string, destination?: string } };


export const RequestMfaChangeCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestMfaChangeCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputRequestMfaChangeCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestMfaChangeCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"twoFactorToken"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"resendSecondsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutSecondsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorDescription"}}]}}]}}]} as unknown as DocumentNode<RequestMfaChangeCodeMutation, RequestMfaChangeCodeMutationVariables>;
export const UpdateMfaOrganizationModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMfaOrganizationMode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateMfaOrganizationModeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMfaOrganizationMode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorDescription"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutSecondsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"storeMode"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"requiredBy"}},{"kind":"Field","name":{"kind":"Name","value":"userMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeUserMode"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeOrganizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"isProviderAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMfaOrganizationModeMutation, UpdateMfaOrganizationModeMutationVariables>;
export const UpdateMfaUserModeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMfaUserMode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputUpdateMfaUserModeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMfaUserMode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"errorDescription"}},{"kind":"Field","name":{"kind":"Name","value":"lockoutSecondsRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"storeMode"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"requiredBy"}},{"kind":"Field","name":{"kind":"Name","value":"userMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeUserMode"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeOrganizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"isProviderAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMfaUserModeMutation, UpdateMfaUserModeMutationVariables>;
export const GetMfaSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMfaSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mfaSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"storeMode"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}},{"kind":"Field","name":{"kind":"Name","value":"requiredBy"}},{"kind":"Field","name":{"kind":"Name","value":"userMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeUserMode"}},{"kind":"Field","name":{"kind":"Name","value":"organizationId"}},{"kind":"Field","name":{"kind":"Name","value":"organizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"canChangeOrganizationMode"}},{"kind":"Field","name":{"kind":"Name","value":"isProviderAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}}]}}]}}]} as unknown as DocumentNode<GetMfaSettingsQuery, GetMfaSettingsQueryVariables>;
export const OperationNames = {
  Query: {
    GetMfaSettings: 'GetMfaSettings'
  },
  Mutation: {
    RequestMfaChangeCode: 'RequestMfaChangeCode',
    UpdateMfaOrganizationMode: 'UpdateMfaOrganizationMode',
    UpdateMfaUserMode: 'UpdateMfaUserMode'
  }
}
import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type RequestPasswordResetQueryVariables = Types.Exact<{
  loginOrEmail: Types.Scalars['String']['input'];
  urlSuffix: Types.Scalars['String']['input'];
}>;


export type RequestPasswordResetQuery = { requestPasswordReset?: boolean };


export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"requestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loginOrEmail"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"urlSuffix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"loginOrEmail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loginOrEmail"}}},{"kind":"Argument","name":{"kind":"Name","value":"urlSuffix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"urlSuffix"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetQuery, RequestPasswordResetQueryVariables>;
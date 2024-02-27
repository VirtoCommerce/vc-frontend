import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ResetPasswordByTokenMutationVariables = Types.Exact<{
  command?: Types.InputMaybe<Types.InputResetPasswordByTokenType>;
}>;


export type ResetPasswordByTokenMutation = { resetPasswordByToken?: { succeeded: boolean, errors?: Array<{ code: string, description?: string, parameter?: string }> } };


export const ResetPasswordByTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPasswordByToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputResetPasswordByTokenType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPasswordByToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"succeeded"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"parameter"}}]}}]}}]}}]} as unknown as DocumentNode<ResetPasswordByTokenMutation, ResetPasswordByTokenMutationVariables>;
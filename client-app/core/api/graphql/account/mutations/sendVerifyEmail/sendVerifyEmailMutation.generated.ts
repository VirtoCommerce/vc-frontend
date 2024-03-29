import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SendVerifyEmailMutationVariables = Types.Exact<{
  command?: Types.InputMaybe<Types.InputSendVerifyEmailType>;
}>;


export type SendVerifyEmailMutation = { sendVerifyEmail?: boolean };


export const SendVerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendVerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InputSendVerifyEmailType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendVerifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<SendVerifyEmailMutation, SendVerifyEmailMutationVariables>;
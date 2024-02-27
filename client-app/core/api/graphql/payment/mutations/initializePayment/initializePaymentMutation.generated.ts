import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type InitializePaymentMutationVariables = Types.Exact<{
  command: Types.InputInitializePaymentType;
}>;


export type InitializePaymentMutation = { initializePayment?: { isSuccess: boolean, errorMessage?: string, actionHtmlForm?: string, actionRedirectUrl?: string, paymentActionType?: string, publicParameters?: Array<{ key: string, value?: string }> } };


export const InitializePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InitializePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputInitializePaymentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initializePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}},{"kind":"Field","name":{"kind":"Name","value":"errorMessage"}},{"kind":"Field","name":{"kind":"Name","value":"actionHtmlForm"}},{"kind":"Field","name":{"kind":"Name","value":"actionRedirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"paymentActionType"}},{"kind":"Field","name":{"kind":"Name","value":"publicParameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<InitializePaymentMutation, InitializePaymentMutationVariables>;
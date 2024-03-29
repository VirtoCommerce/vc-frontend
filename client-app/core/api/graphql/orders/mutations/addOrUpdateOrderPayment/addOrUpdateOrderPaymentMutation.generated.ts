import type * as Types from '../../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddOrUpdateOrderPaymentMutationVariables = Types.Exact<{
  command: Types.InputAddOrUpdateOrderPaymentType;
}>;


export type AddOrUpdateOrderPaymentMutation = { addOrUpdateOrderPayment?: { id: string } };


export const AddOrUpdateOrderPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddOrUpdateOrderPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InputAddOrUpdateOrderPaymentType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addOrUpdateOrderPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddOrUpdateOrderPaymentMutation, AddOrUpdateOrderPaymentMutationVariables>;
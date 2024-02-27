import type * as Types from '../../../types/base.generated';

import type { FileUploadOptionsFragment } from '../../fragments/fileUploadOptions.generated';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFileUploadOptionsQueryVariables = Types.Exact<{
  scope?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetFileUploadOptionsQuery = { fileUploadOptions?: FileUploadOptionsFragment };


export const GetFileUploadOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFileUploadOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileUploadOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"fileUploadOptions"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fileUploadOptions"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FileUploadScopeOptionsType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxFileSize"}},{"kind":"Field","name":{"kind":"Name","value":"allowedExtensions"}}]}}]} as unknown as DocumentNode<GetFileUploadOptionsQuery, GetFileUploadOptionsQueryVariables>;
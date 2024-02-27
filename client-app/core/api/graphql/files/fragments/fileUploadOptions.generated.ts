import type * as Types from '../../types/base.generated';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type FileUploadOptionsFragment = { maxFileSize: number, allowedExtensions: Array<string> };

export const FileUploadOptionsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"fileUploadOptions"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FileUploadScopeOptionsType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxFileSize"}},{"kind":"Field","name":{"kind":"Name","value":"allowedExtensions"}}]}}]} as unknown as DocumentNode<FileUploadOptionsFragment, unknown>;
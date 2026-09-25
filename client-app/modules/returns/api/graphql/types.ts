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
  DateTime: { input: any; output: any; }
  Long: { input: number; output: number; }
};

export type CancelReturnCommandType = {
  /** Why the buyer withdrew the return. */
  reason?: InputMaybe<Scalars['String']['input']>;
  returnId: Scalars['String']['input'];
};

export type CreateReturnCommandType = {
  customerComment?: InputMaybe<Scalars['String']['input']>;
  customerReference?: InputMaybe<Scalars['String']['input']>;
  items: Array<InputReturnItemType>;
  languageCode?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
};

export type InputReturnItemType = {
  /** Files already uploaded into the return attachments scope. Omit to leave the line's files alone; pass a list to make them match it exactly. */
  attachmentUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  orderLineItemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  reasonCode?: InputMaybe<Scalars['String']['input']>;
  reasonComment?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
};

export type KeyValueType = {
  /** Dictionary key */
  key: Scalars['String']['output'];
  /** Dictionary value */
  value?: Maybe<Scalars['String']['output']>;
};

export type LocalizedSettingResponseType = {
  items?: Maybe<Array<Maybe<KeyValueType>>>;
};

export type Mutations = {
  cancelReturn?: Maybe<ReturnType>;
  createReturn?: Maybe<ReturnType>;
  submitReturn?: Maybe<ReturnType>;
  updateReturn?: Maybe<ReturnType>;
};


export type MutationsCancelReturnArgs = {
  command: CancelReturnCommandType;
};


export type MutationsCreateReturnArgs = {
  command: CreateReturnCommandType;
};


export type MutationsSubmitReturnArgs = {
  command: SubmitReturnCommandType;
};


export type MutationsUpdateReturnArgs = {
  command: UpdateReturnCommandType;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  return?: Maybe<ReturnType>;
  returnPolicy?: Maybe<ReturnPolicyType>;
  returnReasons?: Maybe<Array<Maybe<ReturnReasonType>>>;
  returnStatuses?: Maybe<LocalizedSettingResponseType>;
  returnableItems?: Maybe<Array<Maybe<ReturnableItemType>>>;
  returns?: Maybe<ReturnConnection>;
};


export type QueryReturnArgs = {
  id: Scalars['String']['input'];
};


export type QueryReturnPolicyArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryReturnReasonsArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryReturnStatusesArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReturnableItemsArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryReturnsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<ReturnScopeEnum>;
  sort?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  storeId: Scalars['String']['input'];
};

export type ReturnActionType = {
  isAvailable: Scalars['Boolean']['output'];
  /** Stable action code: edit, submit, cancel. The storefront localizes it. */
  name: Scalars['String']['output'];
  /** The code the mutation would fail with; null while the action is available. */
  unavailableReason?: Maybe<Scalars['String']['output']>;
};

export type ReturnAttachmentType = {
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  size: Scalars['Long']['output'];
  url: Scalars['String']['output'];
};

/** A connection from an object to a list of objects of type `Return`. */
export type ReturnConnection = {
  /** A list of all of the edges returned in the connection. */
  edges?: Maybe<Array<Maybe<ReturnEdge>>>;
  /** A list of all of the objects returned in the connection. This is a convenience field provided for quickly exploring the API; rather than querying for "{ edges { node } }" when no edge data is needed, this field can be used instead. Note that when clients like Relay need to fetch the "cursor" field on the edge to enable efficient pagination, this shortcut cannot be used, and the full "{ edges { node } } " version should be used instead. */
  items?: Maybe<Array<Maybe<ReturnType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A count of the total number of objects in this connection, ignoring pagination. This allows a client to fetch the first five objects by passing "5" as the argument to `first`, then fetch the total count so it could display "5 of 83", for example. In cases where we employ infinite scrolling or don't have an exact count of entries, this field will return `null`. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge in a connection from an object to another object of type `Return`. */
export type ReturnEdge = {
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node?: Maybe<ReturnType>;
};

export type ReturnLineItemType = {
  /** Quantity an agent authorized; 0 means the line was rejected. */
  approvedQuantity: Scalars['Int']['output'];
  attachments: Array<ReturnAttachmentType>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  itemState?: Maybe<Scalars['String']['output']>;
  measureUnit?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderLineItemId?: Maybe<Scalars['String']['output']>;
  /** Quantity on the order line when the return was raised. */
  orderedQuantity: Scalars['Int']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  /** Quantity the buyer asked to return. */
  quantity: Scalars['Int']['output'];
  reasonCode?: Maybe<Scalars['String']['output']>;
  reasonComment?: Maybe<Scalars['String']['output']>;
  rejectReason?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
};

export type ReturnPolicyType = {
  /** Order statuses a return may be raised from. Lets a caller skip asking for returnable items. */
  allowedOrderStatuses: Array<Scalars['String']['output']>;
  /** Whether returns are enabled for the store. */
  isEnabled: Scalars['Boolean']['output'];
  /** How long after delivery a line stays returnable, in days. */
  windowDays: Scalars['Int']['output'];
};

export type ReturnReasonType = {
  code: Scalars['String']['output'];
  /** Falls back to the code when a store added a value without a translation. */
  localizedName: Scalars['String']['output'];
  requiresComment: Scalars['Boolean']['output'];
};

/** Whose returns to list: the caller's own, or everyone's in the caller's current organization. */
export enum ReturnScopeEnum {
  Organization = 'ORGANIZATION',
  Own = 'OWN'
}

export type ReturnType = {
  /** Total quantity authorized across the return's lines. */
  approvedQuantity: Scalars['Int']['output'];
  /** Every known action, each flagged with whether it would be accepted now. */
  availableActions: Array<ReturnActionType>;
  /** Why the buyer withdrew the return. */
  cancelReason?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  customerComment?: Maybe<Scalars['String']['output']>;
  /** User who raised the return; the only one who may change it. */
  customerId?: Maybe<Scalars['String']['output']>;
  /** Who raised the return, as the order names them. */
  customerName?: Maybe<Scalars['String']['output']>;
  /** Buyer's own purchase order reference. */
  customerReference?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<ReturnLineItemType>;
  /** Total quantity requested across the return's lines. */
  itemsQuantity: Scalars['Int']['output'];
  number: Scalars['String']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  rejectReason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** Status as the Return.Status dictionary spells it in the requested culture. */
  statusDisplayValue?: Maybe<Scalars['String']['output']>;
};


export type ReturnTypeStatusDisplayValueArgs = {
  cultureName?: InputMaybe<Scalars['String']['input']>;
};

export type ReturnableItemType = {
  /** Quantity actually delivered; may be less than ordered while the order is still shipping. */
  deliveredQuantity: Scalars['Int']['output'];
  /** When the buyer received the line; the latest date when several shipments carry it. */
  deliveryDate?: Maybe<Scalars['DateTime']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Reason code to localize on the storefront; null when the line is returnable. */
  ineligibilityReason?: Maybe<Scalars['String']['output']>;
  isReturnable: Scalars['Boolean']['output'];
  measureUnit?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderLineItemId: Scalars['String']['output'];
  orderedQuantity: Scalars['Int']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  /** Still returnable right now: delivered minus what other returns already hold. */
  returnableQuantity: Scalars['Int']['output'];
  /** End of the return window — render the "N days remaining" hint from it. */
  returnableUntil?: Maybe<Scalars['DateTime']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
};

export type SubmitReturnCommandType = {
  returnId: Scalars['String']['input'];
};

export type UpdateReturnCommandType = {
  customerComment?: InputMaybe<Scalars['String']['input']>;
  customerReference?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<InputReturnItemType>>;
  returnId: Scalars['String']['input'];
};

export type CancelReturnMutationVariables = Exact<{
  command: CancelReturnCommandType;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type CancelReturnMutation = { cancelReturn?: { id: string, number: string, status?: string, statusDisplayValue?: string, cancelReason?: string, availableActions: Array<{ name: string, isAvailable: boolean, unavailableReason?: string }> } };

export type CreateReturnMutationVariables = Exact<{
  command: CreateReturnCommandType;
}>;


export type CreateReturnMutation = { createReturn?: { id: string, number: string, status?: string } };

export type SubmitReturnMutationVariables = Exact<{
  command: SubmitReturnCommandType;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type SubmitReturnMutation = { submitReturn?: { id: string, number: string, status?: string, statusDisplayValue?: string, availableActions: Array<{ name: string, isAvailable: boolean, unavailableReason?: string }> } };

export type UpdateReturnMutationVariables = Exact<{
  command: UpdateReturnCommandType;
}>;


export type UpdateReturnMutation = { updateReturn?: { id: string, number: string, status?: string, customerReference?: string, customerComment?: string, items: Array<{ id: string, orderLineItemId?: string, quantity: number, reasonCode?: string, reasonComment?: string, serialNumber?: string, attachments: Array<{ name: string, url: string, mimeType?: string, size: number }> }> } };

export type GetReturnQueryVariables = Exact<{
  id: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetReturnQuery = { return?: { id: string, number: string, status?: string, statusDisplayValue?: string, createdDate: any, orderId?: string, orderNumber?: string, customerId?: string, customerName?: string, customerReference?: string, customerComment?: string, rejectReason?: string, cancelReason?: string, itemsQuantity: number, availableActions: Array<{ name: string, isAvailable: boolean, unavailableReason?: string }>, items: Array<{ id: string, orderLineItemId?: string, sku?: string, name?: string, imageUrl?: string, measureUnit?: string, orderedQuantity: number, quantity: number, approvedQuantity: number, itemState?: string, reasonCode?: string, reasonComment?: string, rejectReason?: string, serialNumber?: string, attachments: Array<{ name: string, url: string, mimeType?: string, size: number }> }> } };

export type GetReturnPolicyQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
}>;


export type GetReturnPolicyQuery = { returnPolicy?: { isEnabled: boolean, windowDays: number, allowedOrderStatuses: Array<string> } };

export type GetReturnReasonsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetReturnReasonsQuery = { returnReasons?: Array<{ code: string, localizedName: string, requiresComment: boolean }> };

export type GetReturnStatusesQueryVariables = Exact<{
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetReturnStatusesQuery = { returnStatuses?: { items?: Array<{ key: string, value?: string }> } };

export type GetReturnableItemsQueryVariables = Exact<{
  orderId: Scalars['String']['input'];
}>;


export type GetReturnableItemsQuery = { returnableItems?: Array<{ orderLineItemId: string, productId?: string, sku?: string, name?: string, imageUrl?: string, measureUnit?: string, orderedQuantity: number, deliveredQuantity: number, returnableQuantity: number, isReturnable: boolean, ineligibilityReason?: string, deliveryDate?: any, returnableUntil?: any }> };

export type GetReturnsQueryVariables = Exact<{
  storeId: Scalars['String']['input'];
  scope?: InputMaybe<ReturnScopeEnum>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  cultureName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetReturnsQuery = { returns?: { totalCount?: number, items?: Array<{ id: string, number: string, status?: string, statusDisplayValue?: string, createdDate: any, orderId?: string, customerName?: string, itemsQuantity: number, availableActions: Array<{ name: string, isAvailable: boolean, unavailableReason?: string }> }> } };


export const CancelReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancelReturnCommandType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelReturn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}]},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"unavailableReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}}]}}]}}]} as unknown as DocumentNode<CancelReturnMutation, CancelReturnMutationVariables>;
export const CreateReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReturnCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReturn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateReturnMutation, CreateReturnMutationVariables>;
export const SubmitReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitReturnCommandType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitReturn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}]},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"unavailableReason"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitReturnMutation, SubmitReturnMutationVariables>;
export const UpdateReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateReturnCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateReturn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"customerReference"}},{"kind":"Field","name":{"kind":"Name","value":"customerComment"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderLineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonCode"}},{"kind":"Field","name":{"kind":"Name","value":"reasonComment"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateReturnMutation, UpdateReturnMutationVariables>;
export const GetReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"return"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}]},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"customerReference"}},{"kind":"Field","name":{"kind":"Name","value":"customerComment"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"unavailableReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderLineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"measureUnit"}},{"kind":"Field","name":{"kind":"Name","value":"orderedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"approvedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"itemState"}},{"kind":"Field","name":{"kind":"Name","value":"reasonCode"}},{"kind":"Field","name":{"kind":"Name","value":"reasonComment"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetReturnQuery, GetReturnQueryVariables>;
export const GetReturnPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturnPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"windowDays"}},{"kind":"Field","name":{"kind":"Name","value":"allowedOrderStatuses"}}]}}]}}]} as unknown as DocumentNode<GetReturnPolicyQuery, GetReturnPolicyQueryVariables>;
export const GetReturnReasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturnReasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnReasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"localizedName"}},{"kind":"Field","name":{"kind":"Name","value":"requiresComment"}}]}}]}}]} as unknown as DocumentNode<GetReturnReasonsQuery, GetReturnReasonsQueryVariables>;
export const GetReturnStatusesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturnStatuses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnStatuses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<GetReturnStatusesQuery, GetReturnStatusesQueryVariables>;
export const GetReturnableItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturnableItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnableItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderLineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"measureUnit"}},{"kind":"Field","name":{"kind":"Name","value":"orderedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"returnableQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"isReturnable"}},{"kind":"Field","name":{"kind":"Name","value":"ineligibilityReason"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryDate"}},{"kind":"Field","name":{"kind":"Name","value":"returnableUntil"}}]}}]}}]} as unknown as DocumentNode<GetReturnableItemsQuery, GetReturnableItemsQueryVariables>;
export const GetReturnsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReturns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scope"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReturnScopeEnum"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"scope"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scope"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"statusDisplayValue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cultureName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cultureName"}}}]},{"kind":"Field","name":{"kind":"Name","value":"createdDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"itemsQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"unavailableReason"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetReturnsQuery, GetReturnsQueryVariables>;
export const OperationNames = {
  Query: {
    GetReturn: 'GetReturn',
    GetReturnPolicy: 'GetReturnPolicy',
    GetReturnReasons: 'GetReturnReasons',
    GetReturnStatuses: 'GetReturnStatuses',
    GetReturnableItems: 'GetReturnableItems',
    GetReturns: 'GetReturns'
  },
  Mutation: {
    CancelReturn: 'CancelReturn',
    CreateReturn: 'CreateReturn',
    SubmitReturn: 'SubmitReturn',
    UpdateReturn: 'UpdateReturn'
  }
}
import { ensurePlatformApiClientConfigured } from "../client";
import { StoreService } from "../generated";
import type {
  Microsoft_AspNetCore_JsonPatch_Operations_Operation,
  VirtoCommerce_StoreModule_Core_Model_ModulePublicStoreSettings,
  VirtoCommerce_StoreModule_Core_Model_Search_StoreSearchCriteria,
  VirtoCommerce_StoreModule_Core_Model_Search_StoreSearchResult,
  VirtoCommerce_StoreModule_Core_Model_Store,
  VirtoCommerce_StoreModule_Core_Model_StoreAuthenticationScheme,
  VirtoCommerce_StoreModule_Web_Model_LoginOnBehalfInfo,
  VirtoCommerce_StoreModule_Web_Model_SendDynamicNotificationRequest,
} from "../generated";

ensurePlatformApiClientConfigured();

export type StoreSearchCriteria = VirtoCommerce_StoreModule_Core_Model_Search_StoreSearchCriteria;
export type StoreSearchResult = VirtoCommerce_StoreModule_Core_Model_Search_StoreSearchResult;
export type StoreDetails = VirtoCommerce_StoreModule_Core_Model_Store;
export type StoreAuthenticationScheme = VirtoCommerce_StoreModule_Core_Model_StoreAuthenticationScheme;
export type StorePatchOperation = Microsoft_AspNetCore_JsonPatch_Operations_Operation;
export type StorePublicSettings = VirtoCommerce_StoreModule_Core_Model_ModulePublicStoreSettings;
export type StoreLoginOnBehalfInfo = VirtoCommerce_StoreModule_Web_Model_LoginOnBehalfInfo;
export type StoreDynamicNotificationRequest = VirtoCommerce_StoreModule_Web_Model_SendDynamicNotificationRequest;

export function searchStores(criteria?: StoreSearchCriteria) {
  return StoreService.storeModuleSearchStores({ requestBody: criteria });
}

export function getStoreById(id: string, responseGroup?: string) {
  return StoreService.storeModuleGetStoreById({ id, responseGroup });
}

export function getStoreByOuterId(outerId: string, responseGroup?: string) {
  return StoreService.storeModuleGetStoreByOuterId({ outerId, responseGroup });
}

export function getUserAllowedStores(userId: string) {
  return StoreService.storeModuleGetUserAllowedStores({ userId });
}

export function getStoreAuthenticationSchemes(storeId: string) {
  return StoreService.storeAuthenticationSchemeGet({ storeId });
}

export function updateStoreAuthenticationSchemes(storeId: string, schemes: StoreAuthenticationScheme[]) {
  return StoreService.storeAuthenticationSchemeUpdate({ storeId, requestBody: schemes });
}

export function createStore(store: StoreDetails) {
  return StoreService.storeModuleCreateStore({ requestBody: store });
}

export function updateStore(store: StoreDetails) {
  return StoreService.storeModuleUpdateStore({ requestBody: store });
}

export function patchStore(id: string, operations: StorePatchOperation[]) {
  return StoreService.storeModulePatchStore({ id, requestBody: operations });
}

export function deleteStores(ids: string[]) {
  return StoreService.storeModuleDeleteStore({ ids });
}

export function sendStoreDynamicNotification(payload: StoreDynamicNotificationRequest) {
  return StoreService.storeModuleSendDynamicNotificationToStoreEmail({ requestBody: payload });
}

export function getLoginOnBehalfInfo(storeId: string, contactId: string) {
  return StoreService.storeModuleGetLoginOnBehalfInfo({ storeId, id: contactId });
}

export function getStorePublicSettings(id: string) {
  return StoreService.storeModuleGetStorePublicSettingsById({ id });
}

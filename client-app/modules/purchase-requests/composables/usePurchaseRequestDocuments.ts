import { ref } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_FILES_SCOPE, FILES_SCOPE_SETTING_NAME, MODULE_ID } from "@/modules/purchase-requests/constants";
import { useFiles } from "@/shared/files/composables/useFiles";
import { isUploadedFile } from "@/ui-kit/utilities";
import type { WatchSource } from "vue";

export function usePurchaseRequestDocuments(sourceFiles?: WatchSource<IAttachedFile[]>) {
  const { getSettingValue } = useModuleSettings(MODULE_ID);
  const filesScope = getSettingValue(FILES_SCOPE_SETTING_NAME);

  const {
    files,
    addFiles,
    validateFiles,
    uploadFiles,
    fetchOptions: fetchFileOptions,
    options: fileOptions,
  } = useFiles(filesScope ? String(filesScope) : DEFAULT_FILES_SCOPE, sourceFiles);

  const processing = ref(false);

  async function processDocuments<T>(items: INewFile[], callback: (documentUrls: string[]) => Promise<T>): Promise<T> {
    processing.value = true;

    addFiles(items);
    validateFiles();
    await uploadFiles();

    const documentUrls = files.value.filter(isUploadedFile).map((x) => x.url);
    const result = await callback(documentUrls);

    processing.value = false;

    return result;
  }

  return {
    processing,
    files,
    fileOptions,
    fetchFileOptions,
    processDocuments,
  };
}

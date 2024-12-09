import { ref } from "vue";
import { DEFAULT_FILES_SCOPE } from "@/modules/purchase-requests/constants";
import { useFiles } from "@/shared/files/composables/useFiles";
import { isUploadedFile } from "@/ui-kit/utilities";
import type { WatchSource } from "vue";

export function usePurchaseRequestDocuments(sourceFiles?: WatchSource<IAttachedFile[]>) {
  const {
    files,
    addFiles,
    validateFiles,
    uploadFiles,
    fetchOptions: fetchFileOptions,
    options: fileOptions,
  } = useFiles(/* config.purchase_requests_file_scope ?? */ DEFAULT_FILES_SCOPE, sourceFiles);

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

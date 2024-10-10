import { inject, ref } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { DEFAULT_PURCHASE_REQUEST_FILES_SCOPE } from "@/shared/bulk-order/constants";
import { useFiles } from "@/shared/files/composables/useFiles";
import type { WatchSource } from "vue";

export function usePurchaseRequestDocuments(sourceFiles?: WatchSource<IAttachedFile[]>) {
  const config = inject(configInjectionKey, {});

  const {
    files,
    addFiles,
    validateFiles,
    uploadFiles,
    fetchOptions: fetchFileOptions,
    options: fileOptions,
  } = useFiles(config.purchase_request_file_scope ?? DEFAULT_PURCHASE_REQUEST_FILES_SCOPE, sourceFiles);

  const processing = ref(false);

  async function processDocuments<T>(items: INewFile[], callback: (documentUrls: string[]) => Promise<T>): Promise<T> {
    processing.value = true;

    addFiles(items);
    validateFiles();
    await uploadFiles();

    const documentUrls = files.value.map((x) => x.url!);
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

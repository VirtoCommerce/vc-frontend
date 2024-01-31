import { computedEager, isDefined, syncRefs, toValue } from "@vueuse/core";
import { computed, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { getFileUploadOptions, deleteFile } from "@/core/api/graphql/files";
import { useErrorsTranslator, useFetch } from "@/core/composables";
import { asyncForEach } from "@/core/utilities";
import {
  getBytes,
  getFileSize,
  isAttached,
  isFailed,
  isNewfile,
  isRemoved,
  isUploaded,
  toFailed,
  toRemoved,
  toUploaded,
  toUploading,
} from "@/ui-kit";
import type { FileUploadResultType, IFileOptions } from "@/shared/files/types";
import type { MaybeRef, WatchSource } from "vue";

/**
 * File management
 * @param scope Scope files belongs to.
 * @param initialValue One way syncronization source if files is attached to some object. Files state will be reset if attachments change.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useFiles(scope: MaybeRef<string>, initialValue?: WatchSource<IAttachedFile[]>) {
  const { getTranslation: getErrorTranlation } = useErrorsTranslator("file_error");
  const { innerFetch } = useFetch();
  const { t, n } = useI18n();

  const defaultOptions = {
    maxFileCount: 5,
    maxFileSize: getBytes({ value: 1, unit: "megabyte" }),
    allowedExtensions: [],
  };

  const options = ref<IFileOptions>(defaultOptions);

  async function fetchOptions() {
    const result = await getFileUploadOptions(unref(scope));
    if (result) {
      options.value = {
        ...defaultOptions,
        ...result,
      };
    }
  }

  const files = ref<FileType[]>([]);
  if (initialValue) {
    syncRefs(initialValue, files);
  }

  const newFiles = computed(() => files.value.filter(isNewfile));
  const hasNewFiles = computedEager(() => newFiles.value.length > 0);

  const failedFiles = computed(() => files.value.filter(isFailed));
  const hasFailedFiles = computedEager(() => failedFiles.value.length > 0);

  const attachedFiles = computed(() => files.value.filter(isAttached));
  const uploadedFiles = computed(() => files.value.filter(isUploaded));

  const modifiedFiles = computed(() => files.value.filter((file) => !isAttached(file)));
  const anyFilesModified = computedEager(
    () =>
      modifiedFiles.value.length > 0 ||
      (isDefined(initialValue) && attachedFiles.value.length !== toValue(initialValue).length),
  );

  const attachedOrUploadedFiles = computed(() => [...attachedFiles.value, ...uploadedFiles.value]);
  const allFilesAttachedOrUploaded = computedEager(() =>
    files.value.every((file) => isAttached(file) || isUploaded(file)),
  );

  function addFiles(filesToAdd: INewFile[]): boolean {
    if (files.value.length + filesToAdd.length > options.value.maxFileCount) {
      return false;
    }

    files.value.push(...filesToAdd);
    return true;
  }

  function validateFiles(): void {
    if (!hasNewFiles.value) {
      return;
    }

    newFiles.value.forEach((newFile) => {
      if (files.value.some((file) => file.name === newFile.name && file !== newFile)) {
        toFailed(newFile, getErrorMessage("ALREADY_EXISTS"));
      }

      if (options.value.maxFileSize < newFile.size) {
        toFailed(newFile, getErrorMessage("INVALID_SIZE", options.value.maxFileSize));
      }

      const extension = /(\.[^.]+)?$/.exec(newFile.name)?.[1];
      if (options.value.allowedExtensions.length && extension && !options.value.allowedExtensions.includes(extension)) {
        toFailed(newFile, getErrorMessage("INVALID_EXTENSION", options.value.allowedExtensions));
      }
    });
  }

  async function uploadFiles(): Promise<void> {
    if (!hasNewFiles.value) {
      return;
    }

    const uploadingFiles = newFiles.value.map(toUploading);

    const formData = new FormData();

    uploadingFiles.forEach((file) => formData.append("file", file.file!));

    const data = await innerFetch<FileUploadResultType[]>(`/api/files/${unref(scope)}`, "POST", formData, null);

    data.forEach((result) => {
      const uploadedFile = uploadingFiles.find((fileInfo) => fileInfo.name === result.name);

      if (uploadedFile) {
        if (result.succeeded) {
          toUploaded(uploadedFile, result.id, result.url);
        } else {
          toFailed(uploadedFile, getErrorMessage(result.errorCode, result.errorParameter, result.errorMessage));
        }
      }
    });
  }

  async function removeFiles(filesToRemove: FileType[]) {
    await asyncForEach(filesToRemove, async (fileToRemove) => {
      if (isUploaded(fileToRemove) && !(await deleteFile(fileToRemove.id!))) {
        toFailed(fileToRemove, t("file_error.CANNOT_DELETE"));
      } else {
        toRemoved(fileToRemove);
      }
    });

    files.value = files.value.filter((file) => !isRemoved(file));
  }

  function getErrorMessage(errorCode: string, errorParameter?: unknown, errorMessage?: string): string | undefined {
    let parameters: string[];
    if (errorCode === "INVALID_SIZE") {
      const fileSize = getFileSize(errorParameter as number);
      parameters = [
        n(fileSize.value, {
          key: "decimal",
          notation: "compact",
          style: "unit",
          unit: fileSize.unit,
          unitDisplay: "narrow",
        }),
      ];
    } else if (errorCode === "INVALID_EXTENSION") {
      parameters = [(errorParameter as string[]).map((el) => el.replace(/^\./, "").toUpperCase()).join(", ")];
    } else {
      parameters = [errorParameter as string];
    }

    return getErrorTranlation({
      code: errorCode,
      description: errorMessage,
      parameters: parameters,
    });
  }

  return {
    files,

    failedFiles,
    hasFailedFiles,

    attachedFiles,
    uploadedFiles,

    modifiedFiles,
    anyFilesModified,

    attachedOrUploadedFiles,
    allFilesAttachedOrUploaded,

    options,

    addFiles,
    validateFiles,
    uploadFiles,
    removeFiles,

    fetchOptions,
  };
}

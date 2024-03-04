import { computedEager, isDefined, syncRefs, toValue } from "@vueuse/core";
import { computed, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useAxios } from "@/core/api/common/composables/useAxios";
import { getFileUploadOptions, deleteFile } from "@/core/api/graphql/files";
import { useErrorsTranslator } from "@/core/composables";
import { asyncForEach } from "@/core/utilities";
import { DEFAULT_FILE_MAX_COUNT, DEFAULT_FILE_MAX_SIZE } from "@/shared/files/constants";
import {
  getFileSize,
  isAttachedFile,
  isFailedFile,
  isNewfile,
  isRemovedFile,
  isUploadedFile,
  isUploadingFile,
  toFailedFile,
  toRemovedFile,
  toUploadedFile,
  toUploadingFile,
} from "@/ui-kit/utilities";
import type { FileUploadResultType, IFileOptions } from "@/shared/files/types";
import type { AxiosProgressEvent, AxiosResponse } from "axios";
import type { MaybeRef, WatchSource } from "vue";

/**
 * File management
 * @param scope Scope files belongs to.
 * @param initialValue One way syncronization source if files is attached to some object. Files state will be reset if attachments change.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useFiles(scope: MaybeRef<string>, initialValue?: WatchSource<IAttachedFile[]>) {
  const { getTranslation: getErrorTranlation } = useErrorsTranslator("file_error");
  const { t, n } = useI18n();

  const { data, execute: _uploadFiles } = useAxios<
    FileUploadResultType[],
    AxiosResponse<FileUploadResultType[]>,
    FormData
  >({
    method: "POST",
    onUploadProgress,
  });

  const defaultOptions = {
    maxFileCount: DEFAULT_FILE_MAX_COUNT,
    maxFileSize: DEFAULT_FILE_MAX_SIZE,
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

  const uploadingFiles = computed(() => files.value.filter(isUploadingFile));
  const uploadingFileSize = computed(() => uploadingFiles.value.reduce((sum, file) => sum + file.size, 0));

  const failedFiles = computed(() => files.value.filter(isFailedFile));
  const hasFailedFiles = computedEager(() => failedFiles.value.length > 0);

  const attachedFiles = computed(() => files.value.filter(isAttachedFile));
  const uploadedFiles = computed(() => files.value.filter(isUploadedFile));

  const modifiedFiles = computed(() => files.value.filter((file) => !isAttachedFile(file)));
  const anyFilesModified = computedEager(
    () =>
      modifiedFiles.value.length > 0 ||
      (isDefined(initialValue) && attachedFiles.value.length !== toValue(initialValue).length),
  );

  const attachedAndUploadedFiles = computed(() => [...attachedFiles.value, ...uploadedFiles.value]);
  const allFilesAttachedOrUploaded = computedEager(() =>
    files.value.every((file) => isAttachedFile(file) || isUploadedFile(file)),
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
        toFailedFile(newFile, getErrorMessage("ALREADY_EXISTS"));
      }

      if (options.value.maxFileSize < newFile.size) {
        toFailedFile(newFile, getErrorMessage("INVALID_SIZE", options.value.maxFileSize));
      }

      const extension = /(\.[^.]+)?$/.exec(newFile.name)?.[1]?.toLowerCase();
      if (
        options.value.allowedExtensions.length &&
        extension &&
        !options.value.allowedExtensions.map((item) => item.toLowerCase()).includes(extension)
      ) {
        toFailedFile(newFile, getErrorMessage("INVALID_EXTENSION"));
      }
    });
  }

  async function uploadFiles(): Promise<void> {
    if (!hasNewFiles.value) {
      return;
    }

    newFiles.value.forEach(toUploadingFile);

    const formData = new FormData();

    uploadingFiles.value.forEach((file) => formData.append("file", file.file));

    await _uploadFiles(`/api/files/${unref(scope)}`, { data: formData });

    data.value?.forEach((result) => {
      const uploadedFile = uploadingFiles.value.find((fileInfo) => fileInfo.name === result.name);

      if (uploadedFile) {
        if (result.succeeded) {
          toUploadedFile(uploadedFile, result.id, result.url);
        } else {
          toFailedFile(uploadedFile, getErrorMessage(result.errorCode, result.errorParameter, result.errorMessage));
        }
      }
    });
  }

  function onUploadProgress(event: AxiosProgressEvent) {
    const requestSize = event.total! - uploadingFileSize.value;
    let processedSize = requestSize;

    uploadingFiles.value.forEach((file) => {
      if (processedSize + file.size <= event.loaded) {
        file.progress = 100;
      } else if (processedSize >= event.loaded - file.size) {
        file.progress = Math.round((Math.max(event.loaded - processedSize, 0) / file.size) * 100);
      }
      processedSize += file.size;
    });
  }

  async function removeFiles(filesToRemove: FileType[]) {
    await asyncForEach(filesToRemove, async (fileToRemove) => {
      if (isUploadedFile(fileToRemove) && !(await deleteFile(fileToRemove.id))) {
        toFailedFile(fileToRemove, t("file_error.CANNOT_DELETE"));
      } else {
        toRemovedFile(fileToRemove);
      }
    });

    files.value = files.value.filter((file) => !isRemovedFile(file));
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

    attachedAndUploadedFiles,
    allFilesAttachedOrUploaded,

    options,

    addFiles,
    validateFiles,
    uploadFiles,
    removeFiles,

    fetchOptions,
  };
}

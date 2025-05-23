import { computedEager, isDefined, useMemoize } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { computed, onUnmounted, ref, unref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAxios } from "@/core/api/common/composables/useAxios";
import { deleteFile, getFileUploadOptions } from "@/core/api/graphql/files";
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

const getFileUploadOptionsMemoized = useMemoize(getFileUploadOptions);

// Maximum number of simultaneous uploads
const MAX_CONCURRENT_UPLOADS = 3;

/**
 * File management
 * @param scope Scope files belongs to.
 * @param initialValue One way syncronization source if files is attached to some object. Files state will be reset if attachments change.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useFiles(scope: MaybeRef<string>, initialValue?: WatchSource<IAttachedFile[]>) {
  const { translate } = useErrorsTranslator("file_error");
  const { t, n } = useI18n();

  // Track active upload count instead of a single flag
  const activeUploadCount = ref(0);

  // Track all active upload promises
  const activeUploadPromises = ref<Promise<void>[]>([]);

  // Create a factory function to get a new useAxios instance for each upload
  const createUploader = (batchId: string) => {
    return useAxios<FileUploadResultType[], AxiosResponse<FileUploadResultType[]>, FormData>({
      method: "POST",
      onUploadProgress: (event) => onUploadProgress(event, batchId),
    });
  };

  // Track upload batches
  const uploadBatches = ref<Map<string, INewFile[]>>(new Map());

  const defaultOptions = {
    maxFileCount: DEFAULT_FILE_MAX_COUNT,
    maxFileSize: DEFAULT_FILE_MAX_SIZE,
    allowedExtensions: [],
  };

  const options = ref<IFileOptions>(defaultOptions);

  async function fetchOptions() {
    const result = await getFileUploadOptionsMemoized(unref(scope));
    if (result) {
      options.value = {
        ...defaultOptions,
        ...result,
      };
    }
  }

  const files = ref<FileType[]>([]);
  if (initialValue) {
    watch(
      initialValue,
      (newValue) => {
        if (newValue && files.value.length === 0) {
          files.value = [...unref(newValue)];
        }
      },
      { immediate: true },
    );
  }

  const newFiles = computed(() => files.value.filter(isNewfile));
  const hasNewFiles = computedEager(() => newFiles.value.length > 0);

  const uploadingFiles = computed(() => files.value.filter(isUploadingFile));
  const failedFiles = computed(() => files.value.filter(isFailedFile));
  const hasFailedFiles = computedEager(() => failedFiles.value.length > 0);

  const attachedFiles = computed(() => files.value.filter(isAttachedFile));
  const uploadedFiles = computed(() => files.value.filter(isUploadedFile));

  const modifiedFiles = computed(() => files.value.filter((file) => !isAttachedFile(file)));
  const anyFilesModified = computedEager(
    () =>
      modifiedFiles.value.length > 0 ||
      (isDefined(initialValue) && attachedFiles.value.length !== (unref(initialValue) as IAttachedFile[]).length),
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

  // Helper function to process upload results
  function processUploadResults(results: FileUploadResultType[] | undefined, filesToProcess: IUploadingFile[]) {
    if (!results) {
      return;
    }

    results.forEach((result) => {
      const uploadedFile = filesToProcess.find((fileInfo) => fileInfo.name === result.name);
      if (uploadedFile) {
        if (result.succeeded) {
          toUploadedFile(uploadedFile, result.id, result.url);
        } else {
          toFailedFile(uploadedFile, getErrorMessage(result.errorCode, result.errorParameter, result.errorMessage));
        }
      }
    });
  }

  async function uploadFiles(): Promise<void> {
    if (!hasNewFiles.value) {
      return;
    }

    // Check if we can start more uploads
    if (activeUploadCount.value >= MAX_CONCURRENT_UPLOADS) {
      // Wait for any existing uploads to complete
      await Promise.all(activeUploadPromises.value);
      return uploadFiles();
    }

    // Calculate how many more uploads we can start
    const availableSlots = MAX_CONCURRENT_UPLOADS - activeUploadCount.value;
    if (availableSlots <= 0) {
      // Wait for any existing uploads to complete
      await Promise.all(activeUploadPromises.value);
      return uploadFiles();
    }

    // Get files that need to be uploaded
    const filesToUpload = [...newFiles.value];
    if (filesToUpload.length === 0) {
      // Wait for any existing uploads to complete
      await Promise.all(activeUploadPromises.value);
      return;
    }

    // Split files into batches for each available upload slot
    const batchSize = Math.max(1, Math.ceil(filesToUpload.length / availableSlots));

    // Start uploads for each batch
    for (let i = 0; i < availableSlots && filesToUpload.length > 0; i++) {
      const batch = filesToUpload.splice(0, batchSize);
      if (batch.length > 0) {
        const uploadPromise = uploadBatch(batch);
        activeUploadPromises.value.push(uploadPromise);
        // Remove the promise from the array when it completes
        void uploadPromise.finally(() => {
          const index = activeUploadPromises.value.indexOf(uploadPromise);
          if (index > -1) {
            void activeUploadPromises.value.splice(index, 1);
          }
        });
      }
    }

    // Wait for all current uploads to complete
    await Promise.all(activeUploadPromises.value);

    // If there are more files to upload, start another batch
    if (hasNewFiles.value) {
      return uploadFiles();
    }
  }

  // Upload a batch of files
  async function uploadBatch(filesToUpload: INewFile[]): Promise<void> {
    if (filesToUpload.length === 0) {
      return;
    }

    const batchId = uuidv4();

    try {
      activeUploadCount.value++;

      // Store the batch for progress tracking
      uploadBatches.value.set(batchId, filesToUpload);

      // Mark selected files as uploading
      filesToUpload.forEach((file) => {
        toUploadingFile(file);
      });

      const formData = new FormData();
      const filesToProcess = uploadingFiles.value.filter((file) =>
        filesToUpload.some((newFile) => newFile.name === file.name),
      );

      filesToProcess.forEach((file) => formData.append("file", file.file));

      // Create a new uploader instance for this batch
      const { data, execute: _uploadFiles } = createUploader(batchId);

      await _uploadFiles(`/api/files/${unref(scope)}`, { data: formData });

      processUploadResults(data.value, filesToProcess);
    } catch (error) {
      // Mark files as failed
      filesToUpload.forEach((file) => {
        const uploadingFile = uploadingFiles.value.find((f) => f.name === file.name);
        if (uploadingFile) {
          toFailedFile(uploadingFile, t("file_error.UPLOAD_FAILED"));
        }
      });
    } finally {
      activeUploadCount.value--;
      // Remove the batch from tracking
      uploadBatches.value.delete(batchId);
    }
  }

  function onUploadProgress(event: AxiosProgressEvent, batchId: string) {
    if (!event.total) {
      return;
    }

    // Get files associated with this specific batch
    const batchFiles = uploadBatches.value.get(batchId);
    if (!batchFiles || batchFiles.length === 0) {
      return;
    }

    // Find the corresponding uploading files
    const relevantFiles = uploadingFiles.value.filter((file) =>
      batchFiles.some((batchFile) => batchFile.name === file.name),
    );

    if (relevantFiles.length === 0) {
      return;
    }

    // Calculate total size of files in this batch
    const totalSize = relevantFiles.reduce((sum, file) => sum + file.size, 0);

    // Calculate progress for each file in this batch
    relevantFiles.forEach((file) => {
      // Calculate the weight of this file within the batch
      const fileWeight = file.size / totalSize;
      file.progress = Math.min(100, Math.round((event.loaded / (event.total || 1)) * 100 * fileWeight));
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
          notation: "compact",
          style: "unit",
          unit: fileSize.unit,
          unitDisplay: "narrow",
        }),
      ];
    } else {
      parameters = [errorParameter as string];
    }

    return translate({
      errorCode,
      errorMessage,
      errorParameters: parameters.map((item, index) => ({
        key: index.toString(),
        value: item,
      })),
    });
  }

  onUnmounted(() => {
    getFileUploadOptionsMemoized.delete(unref(scope));
  });

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

import { ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { getFileUploadOptions, deleteFile } from "@/core/api/graphql/files";
import { useErrorsTranslator, useFetch } from "@/core/composables";
import { asyncForEach } from "@/core/utilities";
import type { FileUploadResultType, IFileOptions } from "@/shared/files/types";
import type { MaybeRef, Ref } from "vue";

export function useFiles(scope: MaybeRef<string>, files: Ref<FileType[]>) {
  const { getTranslation } = useErrorsTranslator("file_error");
  const { innerFetch } = useFetch();
  const { t } = useI18n();

  const defaultOptions = {
    maxFileCount: 5,
    maxFileSize: 1 * 1024 * 1024, // 100 MB
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

  function addFiles(payload: INewFile[]): void {
    files.value.push(...payload);
  }

  function validateFiles(): void {
    const filesToValidate = files.value.filter((fileInfo) => fileInfo.status === "new");

    filesToValidate.forEach((fileToValidate) => {
      if (files.value.some((file) => file.name === fileToValidate.name)) {
        fileToValidate.progress = undefined;
        fileToValidate.errorMessage = t("file_error.ALREADY_EXISTS");
        fileToValidate.status = "error";
      }

      if (options.value.maxFileSize < fileToValidate.size) {
        fileToValidate.progress = undefined;
        fileToValidate.errorMessage = t("file_error.INVALID_SIZE", { maxSize: options.value.maxFileSize });
        fileToValidate.status = "error";
      }
    });
  }

  async function uploadFiles(): Promise<void> {
    const filesToUpload = files.value.filter((fileInfo) => fileInfo.status === "new");

    filesToUpload.forEach((fileInfo) => {
      fileInfo.status = "loading";
      fileInfo.progress = 0;
    });

    const formData = new FormData();

    filesToUpload.forEach((file) => formData.append("file", file.file!));

    const data = await innerFetch<FileUploadResultType[]>(`/api/files/${unref(scope)}`, "POST", formData, null);

    data.forEach((result) => {
      const uploadedFile = filesToUpload.find((fileInfo) => fileInfo.name === result.name);

      if (uploadedFile) {
        uploadedFile.progress = 100;

        uploadedFile.status = result.succeeded ? "success" : "error";
        if (result.succeeded) {
          uploadedFile.id = result.id;
          uploadedFile.url = result.url;
        } else {
          uploadedFile.errorMessage = getTranslation({
            code: result.errorCode,
            description: result.errorMessage,
            parameters: [result.errorParameter],
          });
        }
      }
    });
  }

  async function removeFiles(payload: FileType[]) {
    const filesToRemove = files.value.filter((file) =>
      // Because of possible duplicates
      payload.some((payloadFile) => payloadFile.name === file.name && payloadFile.status === file.status),
    );

    await asyncForEach(filesToRemove, async (fileToRemove) => {
      let succeeded: boolean | undefined = true;
      if (fileToRemove.status === "success") {
        succeeded = await deleteFile(fileToRemove.id!);
      }

      fileToRemove.status = succeeded ? "removed" : "error";
      if (!succeeded) {
        fileToRemove.errorMessage = t("file_error.CANNOT_DELETE");
      }
    });

    const f = files.value.filter((file) => file.status !== "removed");
    files.value = f;
  }

  return {
    files,
    options,
    addFiles,
    validateFiles,
    uploadFiles,
    removeFiles,
    fetchOptions,
  };
}

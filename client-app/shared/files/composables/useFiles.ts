import { ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { getFileUploadOptions, deleteFile } from "@/core/api/graphql/files";
import { useErrorsTranslator, useFetch } from "@/core/composables";
import { asyncForEach } from "@/core/utilities";
import { getFileSize } from "@/ui-kit";
import type { FileUploadResultType, IFileOptions } from "@/shared/files/types";
import type { MaybeRef, Ref } from "vue";

export function useFiles(scope: MaybeRef<string>, files: Ref<FileType[]>) {
  const { getTranslation: getErrorTranlation } = useErrorsTranslator("file_error");
  const { innerFetch } = useFetch();
  const { t, n } = useI18n();

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
      if (files.value.some((file) => file.name === fileToValidate.name && file !== fileToValidate)) {
        setError(fileToValidate, getErrorMessage("ALREADY_EXISTS"));
      }

      if (options.value.maxFileSize < fileToValidate.size) {
        setError(fileToValidate, getErrorMessage("INVALID_SIZE", options.value.maxFileSize));
      }

      const extension = fileToValidate.name.split(".").pop()!;
      if (options.value.allowedExtensions.length && !options.value.allowedExtensions.includes(extension)) {
        setError(fileToValidate, getErrorMessage("INVALID_EXTENSION", options.value.allowedExtensions));
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
        if (result.succeeded) {
          uploadedFile.id = result.id;
          uploadedFile.url = result.url;
          uploadedFile.progress = 100;
          uploadedFile.status = "success";
        } else {
          setError(uploadedFile, getErrorMessage(result.errorCode, result.errorParameter, result.errorMessage));
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

    files.value = files.value.filter((file) => file.status !== "removed");
  }

  function setError(file: FileType, errorMessage: string | undefined) {
    file.progress = undefined;
    file.errorMessage = errorMessage;
    file.status = "error";
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
    options,
    addFiles,
    validateFiles,
    uploadFiles,
    removeFiles,
    fetchOptions,
  };
}

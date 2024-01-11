import { ref, watchEffect } from "vue";
import { FileType } from "@/core/enums";
import type { Ref } from "vue";

export function useFileManager(attachments: Ref<VcFileType[] | undefined>) {
  const localFiles = ref<VcFileType[]>([]);

  watchEffect(() => {
    addAllFilesInfo(attachments.value);
  });

  function uploadFile(fileInfo: VcFileType) {
    // upload file here
    localFiles.value.push({
      ...fileInfo,
      progress: 0,
      status: fileInfo.errorMessage ? "error" : "loading",
      icon: getIcon(fileInfo),
    });
  }

  function addAllFilesInfo(filesInfo?: VcFileType[]) {
    if (!filesInfo) {
      return;
    }
    filesInfo.forEach((newEl) => {
      if (!localFiles.value.some((el) => el.url === newEl.url)) {
        addFileInfo(newEl);
      }
    });
  }

  function addFileInfo(fileInfo: VcFileType) {
    localFiles.value.push({
      ...fileInfo,
      icon: getIcon(fileInfo),
    });
  }

  function removeFile(fileInfo: VcFileType) {
    if (fileInfo.url) {
      localFiles.value = localFiles.value.filter((el) => el.url !== fileInfo.url);
    } else if (fileInfo.file) {
      localFiles.value = localFiles.value.filter((el) => el.file !== fileInfo.file);
    }
  }

  function getIcon({ mimeType, errorMessage }: Partial<Pick<VcFileType, "mimeType" | "errorMessage">>): string {
    let fileName: string;

    if (errorMessage) {
      fileName = "error";
    } else if (Object.values(FileType).includes(mimeType as FileType)) {
      fileName = mimeType || "file";
    } else {
      fileName = "file";
    }

    return `/static/icons/file/${fileName}.svg`;
  }

  return {
    localFiles,
    uploadFile,
    removeFile,
  };
}

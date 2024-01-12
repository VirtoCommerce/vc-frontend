import { ref, watchEffect } from "vue";
import { FileType } from "@/core/enums";
import type { Ref } from "vue";

type SettingsType = {
  scope: string;
  maxFileSize: number;
  allowedExtensions: string[];
};

export function useFileManager(attachments: Ref<VcFileType[] | undefined>) {
  const localFiles = ref<VcFileType[]>([]);
  const settings = ref<SettingsType>();

  watchEffect(() => {
    addAllFilesInfo(attachments.value);
  });

  async function fetchSettings() {
    const response = await fetch("/api/files/quote-attachments/options");
    settings.value = (await response.json()) as SettingsType;
  }

  function uploadFile(fileInfo: VcFileType) {
    if (fileInfo.file && !fileInfo.errorMessage) {
      const formData = new FormData();

      formData.append("file", fileInfo.file);

      fetch("/api/files/quote-attachments", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("File uploaded successfully:", data);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    }

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

    settings,
    fetchSettings,
  };
}

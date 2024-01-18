import { ref, watchEffect } from "vue";
import { getFileUploadOptions, deleteFile } from "@/core/api/graphql/files";
import { useNotifications } from "@/shared/notification";
import type { Ref } from "vue";

type SettingsType = {
  maxFileSize: number;
  allowedExtensions: string[];
};

type UploadRenounceType = {
  error: string;
  file: {
    contentType: string;
    id: string;
    name: string;
    scope: "quote-attachments";
    url: string;
  };
  succeeded: boolean;
};

export function useFileManager(attachments: Ref<VcFileType[] | undefined>) {
  const localFiles = ref<VcFileType[]>([]);
  const settings = ref<SettingsType>();
  const notifications = useNotifications();

  watchEffect(() => {
    addAllFilesInfo(attachments.value);
  });

  async function fetchSettings() {
    settings.value = await getFileUploadOptions("quote-attachments");
  }

  async function uploadFile(fileInfo: VcFileType) {
    const updatedFile: VcFileType = {
      ...fileInfo,
      progress: 0,
      status: fileInfo.errorMessage ? "error" : "loading",
    };

    localFiles.value.push(updatedFile);

    if (fileInfo.file && !fileInfo.errorMessage) {
      const formData = new FormData();

      formData.append("file", fileInfo.file);

      try {
        const response = await fetch("/api/files/quote-attachments", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as UploadRenounceType;

        const currentFile = localFiles.value.find((file) => file.file === updatedFile.file);
        if (!currentFile) {
          return;
        }

        if (data.error) {
          currentFile.errorMessage = data.error;
          return;
        }

        const { url, id } = data.file;

        currentFile.progress = 100;
        currentFile.url = url;
        currentFile.id = id;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
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
    });
  }

  async function removeFile(fileInfo: VcFileType) {
    if (fileInfo.id) {
      const res = await deleteFile(fileInfo.id);
      if (!res) {
        notifications.error({
          text: "Error removing file",
          duration: 15000,
          single: true,
        });
        return;
      }
    }
    if (fileInfo.url) {
      localFiles.value = localFiles.value.filter((el) => el.url !== fileInfo.url);
    } else if (fileInfo.file) {
      localFiles.value = localFiles.value.filter((el) => el.file !== fileInfo.file);
    }
  }

  return {
    localFiles,
    uploadFile,
    removeFile,

    settings,
    fetchSettings,
  };
}

import { computed, ref } from "vue";
import { FileType } from "@/core/enums";
import type { Ref } from "vue";

const stub: VcFileType[] = [
  {
    name: "Contract.pdf",
    mimeType: "application/pdf",
    size: 1024,
    url: "/contract.pdf",
  },
  {
    name: "Positions.zip",
    mimeType: "application/zip",
    size: 2048,
    url: "/product.zip",
  },
  {
    name: "Product_photo.jpg",
    mimeType: "image/jpeg",
    size: 4096,
    url: "https://vcst-dev-storefront.paas.govirto.com/static/images/common/logo.svg",
  },
];

export function useFileManager(attachments: Ref<VcFileType[] | undefined>) {
  setTimeout(() => {
    attachments.value?.push(...stub);
  }, 3000);
  const addedFiles = ref<VcFileType[]>([]);
  const localFiles = computed(() => {
    return addedFiles.value.concat(attachments.value || []);
  });

  function addFile(fileInfo: VcFileType) {
    const file: VcFileType = {
      ...fileInfo,
      icon: getIcon(fileInfo),
      status: fileInfo.errorMessage ? "error" : "loading",
      progress: 0,
    };
    addedFiles.value.push({
      ...file,
      icon: getIcon(file),
    });
  }

  function removeFile(index: number) {
    const file = localFiles.value.at(index);
    if (!file) {
      return;
    }
    if (file.file) {
      addedFiles.value = addedFiles.value.filter((el) => el.file !== file.file);
    } else {
      attachments.value = attachments.value?.filter((el) => el.url !== file.url);
    }
  }

  function getIcon({ mimeType, errorMessage }: Partial<Pick<VcFileType, "mimeType" | "errorMessage">>): string {
    let fileName: string;

    if (!mimeType || errorMessage) {
      fileName = "error";
    } else if (Object.values(FileType).includes(mimeType as FileType)) {
      fileName = mimeType;
    } else {
      fileName = "file";
    }

    return `/static/icons/file/${fileName}.svg`;
  }

  return {
    addFile,
    removeFile,
    localFiles,
  };
}

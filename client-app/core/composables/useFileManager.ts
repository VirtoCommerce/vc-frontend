import { ref } from "vue";
import { FileType } from "@/core/enums";

const stub: VcFileType[] = [
  {
    name: "Contract.pdf",
    type: "application/pdf",
    size: 1024,
    url: "/contract.pdf",
  },
  {
    name: "Positions.zip",
    type: "application/zip",
    size: 2048,
    url: "/product.zip",
  },
  {
    name: "Product_photo.jpg",
    type: "image/jpeg",
    size: 4096,
    url: "https://vcst-dev-storefront.paas.govirto.com/static/images/common/logo.svg",
  },
];

export function useFileManager() {
  const localFiles = ref<VcFileType[]>([]);

  function fetchFiles() {
    setTimeout(() => {
      stub.forEach((el) => {
        localFiles.value.push({
          ...el,
          icon: getIcon(el),
        });
      });
    }, 3000);
  }

  function addFile(fileInfo: VcFileType) {
    const file: VcFileType = {
      ...fileInfo,
      icon: getIcon(fileInfo),
      status: fileInfo.errorMessage ? "error" : "loading",
      progress: 0,
    };
    localFiles.value.push({
      ...file,
      icon: getIcon(file),
    });
  }

  function removeFile(index: number) {
    localFiles.value.splice(index, 1);
  }

  function getIcon({ type, errorMessage }: Partial<Pick<VcFileType, "type" | "errorMessage">>): string {
    let fileName: string;

    if (!type || errorMessage) {
      fileName = "error";
    } else if (Object.values(FileType).includes(type as FileType)) {
      fileName = type;
    } else {
      fileName = "file";
    }

    return `/static/icons/file/${fileName}.svg`;
  }

  return {
    fetchFiles,
    addFile,
    removeFile,
    localFiles,
  };
}

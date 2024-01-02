import { ref } from "vue";
import { FileType } from "@/ui-kit/components/molecules/file-uploader/file-type.enum";

type FileInfoType = {
  name: string;
  size: number;
  type: string;
};

type UploadedFileType = FileInfoType & { url: string };

const stub: UploadedFileType[] = [
  {
    name: "Contract.pdf",
    type: "pdf",
    size: 1024,
    url: "/contract.pdf",
  },
  {
    name: "Positions.xls",
    type: "xls",
    size: 2048,
    url: "/product.xls",
  },
  {
    name: "Product photo.jpg",
    type: "jpg",
    size: 4096,
    url: "/photo.jpg",
  },
];

export function useFileManager() {
  const uploadedFiles = ref<UploadedFileType[]>();
  const localFiles = ref<VcFileType[]>([]);

  function fetchFiles() {
    setTimeout(() => {
      uploadedFiles.value = stub;
    }, 3000);
  }

  function addFile(fileInfo: FileInfoType) {
    const file: VcFileType = {
      ...fileInfo,
      status: "loading",
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

  function getIcon(file: VcFileType): string {
    let fileName: string;

    if (!file.type || file.errorMessage) {
      fileName = "error";
    } else if (Object.values(FileType).includes(file.type as FileType)) {
      fileName = file.type;
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

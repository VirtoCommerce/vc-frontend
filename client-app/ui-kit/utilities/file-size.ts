import { fileSizeUnits } from "@/ui-kit/constants";

const base = 1024;

export function getFileSize(bytes?: number): IFileSize {
  let result: IFileSize = { value: 0, unit: "byte" };

  if (bytes) {
    const i = Math.floor(Math.log(bytes) / Math.log(base));
    const value = bytes / Math.pow(base, i);
    result = { value, unit: fileSizeUnits[i] };
  }

  return result;
}

export function getBytes(fileSize?: IFileSize): number {
  let result = 0;

  if (fileSize) {
    const i = fileSizeUnits.indexOf(fileSize.unit);
    result = fileSize.value * Math.pow(base, i);
  }

  return result;
}

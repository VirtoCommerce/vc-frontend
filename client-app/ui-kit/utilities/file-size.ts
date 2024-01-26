import { fileSizeUnits } from "@/ui-kit/constants";

export function getFileSize(bytes?: number): IFileSize {
  let result: IFileSize = { value: bytes ?? 0, unit: "byte" };

  if (bytes) {
    const base = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(base));
    const value = bytes / Math.pow(base, i);
    result = { value, unit: fileSizeUnits[i] };
  }

  return result;
}

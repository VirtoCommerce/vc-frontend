import { toValue } from "vue";
import { useFetch } from "@/core/api/common";
import { Logger } from "@/core/utilities";

export async function downloadFile(fileUrl: string, fileName: string) {
  try {
    const { data } = await useFetch(fileUrl).blob();
    const url = window.URL.createObjectURL(toValue(data) as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    Logger.error(downloadFile.name, error);
  }
}

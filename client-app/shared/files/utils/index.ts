import { useAuth } from "@/core/composables";

const { headers } = useAuth();
export async function downloadFile(fileUrl: string, fileName: string) {
  try {
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Authorization: headers.value?.Authorization || "",
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Request error:", response?.statusText);
    }
  } catch (error) {
    console.error("Request error:", error);
  }
}

import { toValue } from "vue";
import { useFetch } from "@/core/api/common";
import { Logger } from "@/core/utilities";

// The new tab reads the object URL asynchronously; revoking right after click() breaks it.
const OBJECT_URL_REVOKE_DELAY_MS = 60_000;

// Views a protected file in a new tab. A plain anchor navigation carries NO bearer token (the theme
// has no auth cookie), so the backend can't authenticate it — fetch through the authenticated fetch
// path instead (auth.plugin attaches the Authorization header), then open the blob's object URL.
// Same pattern as downloadFile (@/shared/files), minus the `download` attribute so the browser
// renders the blob instead of saving it.
export async function openAuthorizedFile(fileUrl: string, contentType?: string): Promise<void> {
  try {
    const { data } = await useFetch(fileUrl).blob();
    let blob = toValue(data) as Blob;

    // Re-type when needed: a typeless blob prompts a download instead of rendering.
    if (contentType && blob.type !== contentType) {
      blob = new Blob([blob], { type: contentType });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
  } catch (error) {
    Logger.error(openAuthorizedFile.name, error);
  }
}

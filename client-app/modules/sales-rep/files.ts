import { toValue } from "vue";
import { useFetch } from "@/core/api/common";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { downloadFile } from "@/shared/files";
import { useNotifications } from "@/shared/notification";

// The new tab reads the object URL asynchronously; revoking right after navigation breaks it.
const OBJECT_URL_REVOKE_DELAY_MS = 60_000;

// Content types we render inline in a same-origin blob tab. A blob URL inherits the storefront
// origin, so an .html/.svg from the library (upload only checks the platform extension allow-list)
// would execute script alongside the SPA, where the auth tokens live in localStorage["auth"]. The
// types below don't run script; anything else — or an unknown type — is downloaded, never opened.
const INLINE_RENDERABLE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "text/plain",
]);

// The single source of truth for "can this be viewed in a tab": the surfaces gate their Open button
// on it so the button never promises an in-tab view we won't give, and openAuthorizedFile guards on
// the same predicate. An unknown/empty type is not renderable.
export function isInlineRenderable(contentType?: string): boolean {
  const type = contentType?.toLowerCase();
  return !!type && INLINE_RENDERABLE_TYPES.has(type);
}

// Views a protected library file. A plain anchor navigation carries NO bearer token (the theme has
// no auth cookie), so the backend can't authenticate it — fetch through the authenticated path
// (auth.plugin attaches the Authorization header), then hand the tab the blob's object URL.
export async function openAuthorizedFile(fileUrl: string, contentType?: string, fileName?: string): Promise<void> {
  // Only known-inert types render inline; everything else is downloaded rather than opened
  // same-origin. downloadFile fetches through the same authenticated path. Callers hide Open for
  // these types, so this is a safety net for an unknown type rather than the usual path.
  if (!isInlineRenderable(contentType)) {
    await downloadFile(fileUrl, fileName ?? "");
    return;
  }

  // Open the tab synchronously, inside the click gesture: a tab opened after `await` is outside the
  // gesture and Safari/Firefox block it. It stays blank until the blob is ready.
  const tab = window.open("", "_blank");
  if (tab) {
    tab.opener = null; // sever the opener reference, as rel="noopener" would.
  }

  try {
    const { data } = await useFetch(fileUrl).blob();
    let blob = toValue(data) as Blob;

    // Re-type when needed: a typeless blob prompts a download instead of rendering.
    if (blob.type !== contentType) {
      blob = new Blob([blob], { type: contentType });
    }

    const url = URL.createObjectURL(blob);

    if (tab) {
      tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
    } else {
      // Popup blocked: fall back to a download so the click isn't silently lost.
      URL.revokeObjectURL(url);
      await downloadFile(fileUrl, fileName ?? "");
    }
  } catch (error) {
    tab?.close();
    Logger.error(openAuthorizedFile.name, error);
    useNotifications().error({ text: globals.i18n.global.t("sales_rep.documents.open_failed"), single: true });
  }
}

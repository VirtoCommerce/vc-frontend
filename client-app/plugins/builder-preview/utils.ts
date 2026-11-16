let cachedBuilderOrigin: string | undefined;

/** `undefined` outside a frame: only the designer that frames the preview may drive it. */
export function getBuilderOrigin() {
  if (cachedBuilderOrigin === undefined) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const ep = globalThis.parent === globalThis.window ? null : urlParams.get("ep");
    try {
      const endpoint = ep ? new URL(ep) : null;
      cachedBuilderOrigin =
        endpoint && (endpoint.protocol === "http:" || endpoint.protocol === "https:") ? endpoint.origin : "";
    } catch {
      cachedBuilderOrigin = "";
    }
  }

  return cachedBuilderOrigin || undefined;
}

export function getPreviewPageId(): string | undefined {
  const urlParams = new URLSearchParams(globalThis.location.search);
  return urlParams.get("pageId") ?? undefined;
}

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === "/designer-preview";
}

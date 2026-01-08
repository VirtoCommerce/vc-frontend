export function getBuilderOrigin() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const ep = urlParams.get("ep");

  return ep?.replace(/\/$/, "");
}

export function getPreviewPageId(): string | undefined {
  const urlParams = new URLSearchParams(globalThis.location.search);
  return urlParams.get("pageId") ?? undefined;
}

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === "/designer-preview";
}

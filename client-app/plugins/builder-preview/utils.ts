let cachedBuilderOrigin: string | undefined;

export function getBuilderOrigin() {
  if (cachedBuilderOrigin === undefined) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const ep = urlParams.get("ep");
    cachedBuilderOrigin = ep?.replace(/\/$/, "") ?? "";
  }

  return cachedBuilderOrigin || undefined;
}

export function getPreviewPageId(): string | undefined {
  const urlParams = new URLSearchParams(globalThis.location.search);
  return urlParams.get("pageId") ?? undefined;
}

// Culture of the page being previewed, passed by the Page Builder admin (VCST-5219).
// Used by the standalone `/designer-preview?pageId=…&cultureName=fr-FR` preview so the storefront
// renders in the page's language instead of the store default.
export function getPreviewCultureName(): string | undefined {
  const urlParams = new URLSearchParams(globalThis.location.search);
  return urlParams.get("cultureName") ?? undefined;
}

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === "/designer-preview";
}

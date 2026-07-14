import { LOCALE_ID_REGEX } from "@/core/constants/locale";

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
// The raw query value is forwarded to the pageContext request before store languages are known,
// so anything that isn't shaped like a locale identifier is dropped here.
export function getPreviewCultureName(): string | undefined {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const cultureName = urlParams.get("cultureName") || undefined;
  return cultureName && LOCALE_ID_REGEX.test(cultureName) ? cultureName : undefined;
}

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === "/designer-preview";
}

export type PreviewBootOptionsType = {
  /** Whether this document is the Page Builder designer / standalone preview. */
  isActive: boolean;
  /** Language of the previewed page, taken from `?cultureName=`; absent unless the preview is active. */
  cultureName?: string;
  /**
   * Whether the active locale may be reflected as a `/{lang}` URL prefix — `true` when the preview
   * imposes no constraint, i.e. on a normal storefront boot. The preview itself lives on a fixed
   * `/designer-preview` route, so prefixing it would stop vue-router's base from matching the
   * pathname and the preview would 404. Callers take this instead of negating `isActive` themselves,
   * so the reason stays next to the route it constrains.
   */
  useLocalePrefix: boolean;
};

/**
 * Everything storefront boot needs to know about a Page Builder preview, resolved from the URL
 * before the preview plugin is installed. Boot has to decide the locale and the router base up
 * front, so it can't wait for the plugin — this keeps the reasoning here instead of scattering
 * Page Builder branches across `app-runner` (VCST-5219).
 */
export function getPreviewBootOptions(): PreviewBootOptionsType {
  const isActive = isPreviewMode();

  return {
    isActive,
    cultureName: isActive ? getPreviewCultureName() : undefined,
    useLocalePrefix: !isActive,
  };
}

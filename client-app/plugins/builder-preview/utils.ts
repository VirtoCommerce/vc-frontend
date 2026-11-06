import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

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

/**
 * Guards a navigation inside the designer's preview. Protocol 1 shows every page on the preview route. Once the Vue
 * designer has shown a storefront page (`allowedNavigation`), the designer chooses the page: a link may change only
 * the query or hash of the page it is on, as sorting and filters do.
 */
export function guardPreviewNavigation(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  allowedNavigation: string | undefined,
): void {
  if (to.path === DESIGNER_PREVIEW_PATH || to.fullPath === allowedNavigation) {
    next();
  } else if (allowedNavigation === undefined) {
    next({ path: DESIGNER_PREVIEW_PATH, query: to.query, hash: to.hash });
  } else {
    next(to.path === from.path);
  }
}

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === "/designer-preview";
}

/**
 * Whether this document is the designer's preview: on the preview route, or framed by the designer, which also
 * renders templates on storefront pages away from that route.
 */
export function isDesignerPreview(): boolean {
  return isPreviewMode() || !!getBuilderOrigin();
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

import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { Logger } from "@/core/utilities";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const BUILDER_ORIGIN_STORAGE_KEY = "builderPreviewOrigin";

let cachedBuilderOrigin: string | undefined;

/**
 * `undefined` outside a frame: only the designer that frames the preview may drive it. The designer passes `?ep=` in
 * the frame's first URL only, so the frame keeps the origin for its session: a full reload inside the frame (language
 * switch, chunk-load recovery) comes back as the designer's preview and answers its `connect`.
 */
export function getBuilderOrigin() {
  cachedBuilderOrigin ??= globalThis.parent === globalThis.window ? "" : resolveFramedBuilderOrigin();

  return cachedBuilderOrigin || undefined;
}

function resolveFramedBuilderOrigin(): string {
  const endpoint = new URLSearchParams(globalThis.location.search).get("ep");

  if (endpoint === null) {
    return toHttpOrigin(readStoredBuilderOrigin());
  }

  const origin = toHttpOrigin(endpoint);
  storeBuilderOrigin(origin);
  return origin;
}

function toHttpOrigin(endpoint: string | null): string {
  try {
    const url = endpoint ? new URL(endpoint) : null;
    return url && (url.protocol === "http:" || url.protocol === "https:") ? url.origin : "";
  } catch (error) {
    Logger.warn("[builder-preview] Ignored a designer endpoint that is not a URL", error);
    return "";
  }
}

function readStoredBuilderOrigin(): string | null {
  try {
    return sessionStorage.getItem(BUILDER_ORIGIN_STORAGE_KEY);
  } catch (error) {
    Logger.warn("[builder-preview] Reading the designer origin failed", error);
    return null;
  }
}

/** An empty origin forgets the kept one: the frame was loaded with an endpoint that is not the designer's. */
function storeBuilderOrigin(origin: string): void {
  try {
    if (origin) {
      sessionStorage.setItem(BUILDER_ORIGIN_STORAGE_KEY, origin);
    } else {
      sessionStorage.removeItem(BUILDER_ORIGIN_STORAGE_KEY);
    }
  } catch (error) {
    Logger.warn("[builder-preview] Keeping the designer origin failed", error);
  }
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
 * Everything storefront boot needs to know about a Page Builder preview, resolved from the URL and
 * the designer origin the frame keeps, before the preview plugin is installed. Boot has to decide
 * the locale and the router base up front, so it can't wait for the plugin — this keeps the
 * reasoning here instead of scattering Page Builder branches across `app-runner` (VCST-5219).
 * A designer frame reloaded on a storefront page is still the preview: the plugin takes it back
 * to the preview route.
 */
export function getPreviewBootOptions(): PreviewBootOptionsType {
  const isActive = isDesignerPreview();

  return {
    isActive,
    cultureName: isActive ? getPreviewCultureName() : undefined,
    useLocalePrefix: !isActive,
  };
}

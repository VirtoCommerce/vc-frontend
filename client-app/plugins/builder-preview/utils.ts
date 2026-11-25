import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import { isDesignerPreview } from "@/core/theme-snapshot";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { opensNewWindow } from "@/shared/static-content/sections";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

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

/** On a storefront page the Vue designer owns navigation: links change only the query or hash (sorting, filters). */
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

const PAGE_INPUT_EVENTS = ["keydown", "keyup", "click", "submit"] as const;

/**
 * The blocker stops the pointer only: keys, and the clicks and submits they make, would reach the focused element.
 * Tab still moves through the page, so the keyboard can leave the frame.
 */
export function installPageInputGuard(blocker: HTMLElement, isPageInputAllowed: () => boolean): void {
  function stopPageInput(event: Event): void {
    const { target } = event;
    const isPageTarget =
      target instanceof Element &&
      target !== blocker &&
      target !== target.ownerDocument.body &&
      target !== target.ownerDocument.documentElement;
    const isTab = event instanceof KeyboardEvent && event.key === "Tab";

    if (!blocker.isConnected || isPageInputAllowed() || !isPageTarget || isTab) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  for (const type of PAGE_INPUT_EVENTS) {
    blocker.ownerDocument.addEventListener(type, stopPageInput, true);
  }
}

/** With the inspector off, clicks reach the page: a link the router does not take would load another document. */
export function installLeavingLinkGuard(blocker: HTMLElement): void {
  function stopLeavingLink(event: MouseEvent): void {
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;

    if (
      !blocker.isConnected ||
      event.defaultPrevented ||
      !(anchor instanceof HTMLAnchorElement) ||
      opensNewWindow(anchor.getAttribute("target"))
    ) {
      return;
    }

    const url = new URL(anchor.href);
    const { location } = globalThis;
    const isFragmentOnly =
      !!url.hash &&
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search;

    if ((url.protocol === "http:" || url.protocol === "https:") && !isFragmentOnly) {
      event.preventDefault();
    }
  }

  blocker.ownerDocument.addEventListener("click", stopLeavingLink);
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
 * Boot decides the locale and the router base before the preview plugin is installed, so it cannot wait for it.
 * A designer frame reloaded on a storefront page is still the preview: the plugin takes it back to the preview route.
 */
export function getPreviewBootOptions(): PreviewBootOptionsType {
  const isActive = isDesignerPreview();

  return {
    isActive,
    cultureName: isActive ? getPreviewCultureName() : undefined,
    useLocalePrefix: !isActive,
  };
}

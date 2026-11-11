import { LOCALE_ID_REGEX } from "@/core/constants/locale";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot/enabled";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { Logger } from "@/core/utilities";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export const SECTION_ATTRIBUTE = "data-pb-section";
export const FIELD_ATTRIBUTE = "data-pb-field";
export const PREVIEW_PROTOCOL = 2;

const DESIGNER_FRAME_STORAGE_KEY = "builderPreviewFrame";

/** What the designer passes in the frame's first URL: `?ep=` as its origin and `?protocol=`. */
interface IDesignerFrame {
  origin: string;
  protocol?: string;
}

let cachedDesignerFrame: IDesignerFrame | undefined;
let cachedIsPreviewProtocol: boolean | undefined;

/**
 * `undefined` outside a frame: only the designer that frames the preview may drive it. The designer passes `?ep=` in
 * the frame's first URL only, so the frame keeps the origin for its session: a full reload inside the frame (language
 * switch, chunk-load recovery) comes back as the designer's preview and answers its `connect`.
 */
export function getBuilderOrigin() {
  return getDesignerFrame().origin || undefined;
}

/** Read once, as the preview route drops the query; a reloaded frame takes the protocol its designer opened it with. */
export function isOpenedWithPreviewProtocol(): boolean {
  cachedIsPreviewProtocol ??=
    (new URLSearchParams(globalThis.location.search).get("protocol") ?? getDesignerFrame().protocol) ===
    String(PREVIEW_PROTOCOL);

  return cachedIsPreviewProtocol;
}

function getDesignerFrame(): IDesignerFrame {
  cachedDesignerFrame ??= globalThis.parent === globalThis.window ? { origin: "" } : resolveDesignerFrame();

  return cachedDesignerFrame;
}

function resolveDesignerFrame(): IDesignerFrame {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const endpoint = urlParams.get("ep");

  if (endpoint === null) {
    const kept = readKeptDesignerFrame();
    const origin = toHttpOrigin(kept.origin);
    return origin ? { origin, protocol: kept.protocol } : { origin };
  }

  const frame: IDesignerFrame = { origin: toHttpOrigin(endpoint), protocol: urlParams.get("protocol") ?? undefined };
  keepDesignerFrame(frame);
  return frame;
}

function toHttpOrigin(endpoint: string): string {
  try {
    const url = endpoint ? new URL(endpoint) : null;
    return url && (url.protocol === "http:" || url.protocol === "https:") ? url.origin : "";
  } catch (error) {
    Logger.warn("[builder-preview] Ignored a designer endpoint that is not a URL", error);
    return "";
  }
}

function isDesignerFrame(value: unknown): value is IDesignerFrame {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { origin, protocol } = value as Record<string, unknown>;
  return typeof origin === "string" && (protocol === undefined || typeof protocol === "string");
}

function readKeptDesignerFrame(): IDesignerFrame {
  try {
    const kept: unknown = JSON.parse(sessionStorage.getItem(DESIGNER_FRAME_STORAGE_KEY) ?? "null");
    return isDesignerFrame(kept) ? kept : { origin: "" };
  } catch (error) {
    Logger.warn("[builder-preview] Reading the designer frame failed", error);
    return { origin: "" };
  }
}

/** An empty origin forgets the kept frame: it was loaded with an endpoint that is not the designer's. */
function keepDesignerFrame(frame: IDesignerFrame): void {
  try {
    if (frame.origin) {
      sessionStorage.setItem(DESIGNER_FRAME_STORAGE_KEY, JSON.stringify(frame));
    } else {
      sessionStorage.removeItem(DESIGNER_FRAME_STORAGE_KEY);
    }
  } catch (error) {
    Logger.warn("[builder-preview] Keeping the designer frame failed", error);
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

export function isPreviewMode(): boolean {
  return globalThis.location.pathname === DESIGNER_PREVIEW_PATH;
}

/** The designer also renders templates on storefront pages, away from the preview route. */
export function isDesignerPreview(): boolean {
  return isPreviewMode() || !!getBuilderOrigin();
}

/** Only the designer that speaks the preview protocol reads the `data-pb-*` markup; elsewhere the page is unchanged. */
export function isPreviewV2Frame(): boolean {
  return !!getBuilderOrigin() && isOpenedWithPreviewProtocol() && isNewPageBuilderEnabled();
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

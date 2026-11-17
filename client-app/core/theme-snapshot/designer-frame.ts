import { isRecord, Logger } from "@/core/utilities";
import { isNewPageBuilderEnabled } from "./enabled";
import { DESIGNER_PREVIEW_PATH } from "./query";

export const SECTION_ATTRIBUTE = "data-pb-section";
export const FIELD_ATTRIBUTE = "data-pb-field";
export const PREVIEW_PROTOCOL = 2;

const DESIGNER_FRAME_STORAGE_KEY = "builderPreviewFrame";

interface IDesignerFrame {
  origin: string;
  protocol?: string;
}

let cachedDesignerFrame: IDesignerFrame | undefined;
let cachedIsPreviewProtocol: boolean | undefined;

/**
 * `undefined` outside a frame: only the designer that frames the preview may drive it. Only the frame's first URL
 * carries the designer's endpoint, so the frame keeps its origin for the session: a full reload inside the frame
 * (language switch, chunk-load recovery) comes back as the designer's preview and answers its `connect`.
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
  return (
    isRecord(value) &&
    typeof value.origin === "string" &&
    (value.protocol === undefined || typeof value.protocol === "string")
  );
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

function isPreviewMode(): boolean {
  return globalThis.location.pathname === DESIGNER_PREVIEW_PATH;
}

/** The designer also renders templates on storefront pages, away from the preview route. */
export function isDesignerPreview(): boolean {
  return isPreviewMode() || !!getBuilderOrigin();
}

/** Only the designer that speaks the preview protocol reads the preview markup; elsewhere the page is unchanged. */
export function isPreviewV2Frame(): boolean {
  return !!getBuilderOrigin() && isOpenedWithPreviewProtocol() && isNewPageBuilderEnabled();
}

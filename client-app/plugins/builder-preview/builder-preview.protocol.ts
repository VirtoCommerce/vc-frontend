import { isRecord, Logger } from "@/core/utilities";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { IThemeDraft, IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";
import type { IThemeConfig } from "@/core/types";
import type { IPageContent, IPageTemplate } from "@/shared/static-content/types";

type NullableBuilderMessageFieldsType = {
  sectionId: string | null;
  userId: string | null;
};

type PreviewModelType = Partial<IPageContent> & Pick<IPageContent, "type">;

export type TransferDataType = {
  template?: IPageTemplate;
  model?: PreviewModelType;
  templateKey?: string;
  source: "builder";
  type: string;
  url?: string;
  settings?: IThemeConfig;
  token?: { access_token?: string } | null;
  cultureName?: string;
  sharedComponentBoundaries?: unknown;
  /** The preview protocol the designer speaks, on `connect`; the Angular designer sends none. */
  protocol?: number;
} & Partial<NullableBuilderMessageFieldsType>;

const PREVIEW_UPDATE_TYPES = new Set(["changed", "update", "remove", "add", "reload", "page", "swap", "preview"]);

export interface IRenderMessage {
  type: "render";
  document: IThemePageDocument;
  templateKey?: string;
  url?: string;
  page?: { permalink: string; objectType: "Pages" | "ContentFile" };
  cultureName: string;
  selection?: { sectionId: string; blockId?: string; scroll: boolean };
  model?: PreviewModelType;
  sectionLabels?: Record<string, string>;
  sharedComponentBoundaries?: unknown;
}

export type PreviewV2MessageType =
  | IRenderMessage
  | { type: "draft"; theme: IThemeDraft }
  | { type: "inspector"; enabled: boolean }
  | { type: "colorScheme"; scheme: "light" | "dark" };

/** Sent after every render and whenever the page's data changes the template choice. */
export interface IResolvedData {
  url: string;
  pageType: ThemePageType;
  template: string;
  /** `null` when no rule chose it: an open template, the page's own, the page type's or a built-in one. */
  ruleId: string | null;
  /** What the rules pick for the page, whichever template is open in `template`. */
  rules: { template: string; ruleId: string | null };
  /** Theme fields white-labeling sets for this visitor: the theme's values for them have no effect. */
  overriddenByWhiteLabeling: string[];
}

const PREVIEW_V2_TYPES = new Set(["render", "draft", "inspector", "colorScheme"]);

export function isPreviewV2Type(type: string): boolean {
  return PREVIEW_V2_TYPES.has(type);
}

export function isPreviewV2Message(value: unknown): value is PreviewV2MessageType & { source: "builder" } {
  if (!isRecord(value) || value.source !== "builder" || !PREVIEW_V2_TYPES.has(value.type as string)) {
    return false;
  }

  switch (value.type) {
    case "render":
      return (
        isPageTemplate(value.document) &&
        typeof value.cultureName === "string" &&
        isOptionalString(value.templateKey) &&
        isOptionalString(value.url) &&
        (value.url === undefined || (typeof value.url === "string" && value.url.startsWith("/"))) &&
        (value.page === undefined || (isRecord(value.page) && typeof value.page.permalink === "string")) &&
        (value.selection === undefined || (isRecord(value.selection) && isNonEmptyString(value.selection.sectionId))) &&
        (value.model === undefined || isPreviewModel(value.model)) &&
        (value.sectionLabels === undefined || isRecord(value.sectionLabels))
      );
    case "draft":
      return isRecord(value.theme);
    case "inspector":
      return typeof value.enabled === "boolean";
    default:
      return value.scheme === "light" || value.scheme === "dark";
  }
}

export function isBuilderMessage(value: unknown): value is TransferDataType {
  if (!isRecord(value) || value.source !== "builder" || typeof value.type !== "string") {
    return false;
  }

  if (PREVIEW_UPDATE_TYPES.has(value.type)) {
    return (
      isPageTemplate(value.template) &&
      (value.model === undefined || isPreviewModel(value.model)) &&
      isOptionalString(value.templateKey) &&
      isOptionalString(value.cultureName) &&
      isOptionalSelection(value.sectionId) &&
      (value.sharedComponentBoundaries === undefined || Array.isArray(value.sharedComponentBoundaries))
    );
  }

  switch (value.type) {
    case "connect":
      return true;
    case "hover":
      return value.sectionId === null || isNonEmptyString(value.sectionId);
    case "select":
      return isNonEmptyString(value.sectionId);
    case "navigate":
      return typeof value.url === "string";
    case "settings":
      return isRecord(value.settings);
    case "auth":
      return isAuthToken(value.token) && (value.userId === null || isOptionalString(value.userId));
    default:
      return false;
  }
}

export function addBuilderMessageListener(
  targetWindow: Window,
  builderOrigin: string,
  parentWindow: Window,
  onMessage: (message: TransferDataType | PreviewV2MessageType) => void,
): () => void {
  const listener = (event: MessageEvent<unknown>) => {
    if (event.origin !== builderOrigin || event.source !== parentWindow) {
      // Not addressed to us. Foreign frames post to this window routinely, so stay quiet here.
      return;
    }

    if (!isBuilderMessage(event.data) && !isPreviewV2Message(event.data)) {
      // The designer is the only sender that reaches this point, so a rejected payload means the two
      // sides disagree about the protocol. Without this line "the preview does not update" leaves no trace.
      Logger.warn("[builder-preview] Rejected a designer message that does not match the preview protocol", {
        type: isRecord(event.data) ? event.data.type : typeof event.data,
      });
      return;
    }

    onMessage(event.data);
  };

  targetWindow.addEventListener("message", listener);
  return () => targetWindow.removeEventListener("message", listener);
}

export function createPreviewLoadedNotifier(targetWindow: Window, targetOrigin: string) {
  let data: PageBuilderSchemaType | Record<string, unknown> | undefined;

  const announce = () => {
    if (data) {
      targetWindow.postMessage({ source: "preview", type: "loaded", data }, targetOrigin);
    }
  };

  return {
    announce,
    setData(value: PageBuilderSchemaType | Record<string, unknown>) {
      data = value;
      announce();
    },
  };
}

function isPageTemplate(value: unknown): value is IPageTemplate {
  return (
    isRecord(value) && isRecord(value.settings) && Array.isArray(value.content) && value.content.every(isPageContent)
  );
}

function isPageContent(value: unknown): value is IPageContent {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.type);
}

function isPreviewModel(value: unknown): value is PreviewModelType {
  return isRecord(value) && isNonEmptyString(value.type) && (value.id === undefined || isNonEmptyString(value.id));
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isOptionalSelection(value: unknown): boolean {
  return value === undefined || value === "" || isNonEmptyString(value);
}

function isNonEmptyString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return String(value).trim().length > 0;
}

function isAuthToken(value: unknown): boolean {
  return (
    value === null || (isRecord(value) && (value.access_token === undefined || typeof value.access_token === "string"))
  );
}

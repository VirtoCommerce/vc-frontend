import { Logger } from "@/core/utilities";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { IThemeConfig } from "@/core/types";
import type { IPageContent, IPageTemplate } from "@/shared/static-content/types";

type NullableBuilderMessageFieldsType = {
  sectionId: string | null;
  userId: string | null;
};

export type TransferDataType = {
  template?: IPageTemplate;
  model?: IPageContent;
  templateKey?: string;
  source: "builder";
  type: string;
  url?: string;
  settings?: IThemeConfig;
  token?: { access_token?: string } | null;
  cultureName?: string;
  sharedComponentBoundaries?: unknown;
} & Partial<NullableBuilderMessageFieldsType>;

const PREVIEW_UPDATE_TYPES = new Set(["changed", "update", "remove", "add", "reload", "page", "swap", "preview"]);

export function isBuilderMessage(value: unknown): value is TransferDataType {
  if (!isRecord(value) || value.source !== "builder" || typeof value.type !== "string") {
    return false;
  }

  if (PREVIEW_UPDATE_TYPES.has(value.type)) {
    return (
      isPageTemplate(value.template) &&
      (value.model === undefined || isPageContent(value.model)) &&
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
      return isAuthToken(value.token) && (value.userId === null || typeof value.userId === "string");
    default:
      return false;
  }
}

export function addBuilderMessageListener(
  targetWindow: Window,
  builderOrigin: string,
  parentWindow: Window,
  onMessage: (message: TransferDataType) => void,
): () => void {
  const listener = (event: MessageEvent<unknown>) => {
    if (event.origin !== builderOrigin || event.source !== parentWindow) {
      // Not addressed to us. Foreign frames post to this window routinely, so stay quiet here.
      return;
    }

    if (!isBuilderMessage(event.data)) {
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
  let data: PageBuilderSchemaType | undefined;

  const announce = () => {
    if (data) {
      targetWindow.postMessage({ source: "preview", type: "loaded", data }, targetOrigin);
    }
  };

  return {
    announce,
    setData(value: PageBuilderSchemaType) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

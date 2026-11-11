import { isRecord, Logger } from "@/core/utilities";
import { THEME_SNAPSHOT_GLOBAL, THEME_SNAPSHOT_OPERATION, THEME_SNAPSHOT_QUERY } from "./query";
import type { IPublishedTheme, IThemeMenu, IThemeSlug, IThemeSlugPage, IThemeSnapshot } from "./types";

export interface IThemeSnapshotVariables {
  domain?: string;
  storeId?: string;
  cultureName?: string;
  /** Without its language prefix. */
  permalink?: string;
}

export interface IThemeSnapshotRequest {
  variables: IThemeSnapshotVariables;
  response: Promise<unknown>;
}

const SUPPORTED_FORMAT = 1;

const LOG_SCOPE = "[theme-snapshot]";

const REJECTED_REQUEST_MESSAGE = "HTTP 400";

class ThemeSnapshotRejectedError extends Error {}

export function takeBootThemeSnapshotRequest(): IThemeSnapshotRequest | undefined {
  const holder = globalThis as unknown as Record<string, unknown>;
  const request = holder[THEME_SNAPSHOT_GLOBAL];
  delete holder[THEME_SNAPSHOT_GLOBAL];

  return isRecord(request) && request.response instanceof Promise && isRecord(request.variables)
    ? { variables: request.variables, response: request.response }
    : undefined;
}

/** Skips the Apollo client: the snapshot is the same for every visitor, so the request carries no token. */
export function requestThemeSnapshot(variables: IThemeSnapshotVariables): IThemeSnapshotRequest {
  const response = fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operationName: THEME_SNAPSHOT_OPERATION, query: THEME_SNAPSHOT_QUERY, variables }),
  }).then(async (result) => {
    if (!result.ok) {
      throw new Error(`HTTP ${result.status}`);
    }

    return (await result.json()) as unknown;
  });

  return { variables, response };
}

/** `null` means no usable theme: the store setting is off or the format is unsupported. Throws on a GraphQL error. */
export function readThemeSnapshotResponse(
  body: unknown,
  requestedCultureName?: string,
  requestedPermalink?: string,
): IPublishedTheme | null {
  if (!isRecord(body)) {
    throw new Error("The theme snapshot response is not an object");
  }

  if (Array.isArray(body.errors) && body.errors.length) {
    const message = `The theme snapshot request failed: ${JSON.stringify(body.errors)}`;
    throw isRecord(body.data) ? new Error(message) : new ThemeSnapshotRejectedError(message);
  }

  const field = isRecord(body.data) ? body.data.themeSnapshot : undefined;

  if (!isRecord(field)) {
    return null;
  }

  const snapshot = parseSnapshotContent(field.content);

  if (!snapshot || typeof field.storeId !== "string" || typeof field.cultureName !== "string") {
    return null;
  }

  return {
    storeId: field.storeId,
    cultureName: field.cultureName,
    requestedCultureName,
    publication: typeof field.publication === "number" ? field.publication : snapshot.publication,
    snapshot,
    menus: Array.isArray(field.menus) ? field.menus.filter(isMenu) : [],
    slug: requestedPermalink === undefined ? undefined : readSlug(field.slug, requestedPermalink),
  };
}

/**
 * The backend refused the query itself, as one whose x-cms has no `themeSnapshot` field does: asking again gets the
 * same. The inline script and `requestThemeSnapshot` both reject an HTTP error with `HTTP <status>`.
 */
export function isThemeSnapshotRejected(error: unknown): boolean {
  return (
    error instanceof ThemeSnapshotRejectedError ||
    (error instanceof Error && error.message === REJECTED_REQUEST_MESSAGE)
  );
}

type LanguageCheckedThemeType = Pick<IPublishedTheme, "cultureName" | "requestedCultureName">;

/**
 * The server answers a language with no file in its default language, which still counts as that language.
 * A language part (`fr`, a URL prefix) counts only when another language was served: a culture of that language
 * served for it may not be the one pageContext resolved.
 */
export function isThemeForLanguage(theme: LanguageCheckedThemeType, cultureName: string): boolean {
  return isSameLanguage(theme.cultureName, cultureName) || isAskedLanguage(theme, cultureName);
}

function isAskedLanguage(theme: LanguageCheckedThemeType, cultureName: string): boolean {
  const requested = theme.requestedCultureName?.toLowerCase();
  const expected = cultureName.toLowerCase();

  if (!requested) {
    return false;
  }

  if (requested === expected) {
    return true;
  }

  return (
    !requested.includes("-") &&
    expected.split("-")[0] === requested &&
    theme.cultureName.toLowerCase().split("-")[0] !== requested
  );
}

function isSameLanguage(name: string | undefined, cultureName: string): boolean {
  if (!name) {
    return false;
  }

  const value = name.toLowerCase();
  const expected = cultureName.toLowerCase();

  return value === expected || (!value.includes("-") && expected.split("-")[0] === value);
}

function parseSnapshotContent(content: unknown): IThemeSnapshot | undefined {
  if (typeof content !== "string") {
    return undefined;
  }

  try {
    const value: unknown = JSON.parse(content);

    if (!isRecord(value) || value.format !== SUPPORTED_FORMAT) {
      Logger.warn(`${LOG_SCOPE} Ignored a snapshot in a format this storefront does not read`, {
        format: isRecord(value) ? value.format : undefined,
      });
      return undefined;
    }

    return {
      ...(value as unknown as IThemeSnapshot),
      templates: isRecord(value.templates) ? (value.templates as IThemeSnapshot["templates"]) : {},
    };
  } catch (error) {
    Logger.warn(`${LOG_SCOPE} Ignored a snapshot that is not valid JSON`, error);
    return undefined;
  }
}

function isMenu(value: unknown): value is IThemeMenu {
  return isRecord(value) && typeof value.name === "string" && Array.isArray(value.items);
}

function readSlug(value: unknown, permalink: string): IThemeSlug | undefined {
  if (!isRecord(value) || typeof value.objectType !== "string" || typeof value.objectId !== "string") {
    return undefined;
  }

  return {
    permalink,
    objectType: value.objectType,
    objectId: value.objectId,
    page: isRecord(value.page) ? readSlugPage(value.page) : undefined,
  };
}

function readSlugPage(value: Record<string, unknown>): IThemeSlugPage {
  return {
    source: typeof value.source === "string" ? value.source : undefined,
    permalink: typeof value.permalink === "string" ? value.permalink : undefined,
    settings: parseSettings(value.settings),
  };
}

function parseSettings(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    const settings: unknown = JSON.parse(value);
    return isRecord(settings) ? settings : undefined;
  } catch {
    return undefined;
  }
}

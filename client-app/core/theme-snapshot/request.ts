import { isRecord, Logger } from "@/core/utilities";
import { THEME_SNAPSHOT_GLOBAL, THEME_SNAPSHOT_OPERATION, THEME_SNAPSHOT_QUERY } from "./query";
import type { IPublishedTheme, IThemeMenu, IThemeSlug, IThemeSlugPage, IThemeSnapshot } from "./types";

export interface IThemeSnapshotVariables {
  domain?: string;
  storeId?: string;
  cultureName?: string;
  /** The page the visitor landed on, without its language prefix: the response says what is there. */
  permalink?: string;
}

/** The request the inline script in `index.html` left on `window`. */
export interface IThemeSnapshotRequest {
  variables: IThemeSnapshotVariables;
  response: Promise<unknown>;
}

/** The only snapshot format this storefront reads. */
const SUPPORTED_FORMAT = 1;

const LOG_SCOPE = "[theme-snapshot]";

/** Takes the request the inline script sent, once: a second call returns nothing. */
export function takeBootThemeSnapshotRequest(): IThemeSnapshotRequest | undefined {
  const holder = globalThis as unknown as Record<string, unknown>;
  const request = holder[THEME_SNAPSHOT_GLOBAL];
  delete holder[THEME_SNAPSHOT_GLOBAL];

  return isRecord(request) && request.response instanceof Promise && isRecord(request.variables)
    ? { variables: request.variables, response: request.response }
    : undefined;
}

/**
 * Sends the snapshot request the inline script sends. It is a plain `fetch` rather than an Apollo query: the snapshot
 * is the same for every visitor, so the request carries no token, as the one sent before the application loaded.
 */
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

/**
 * Reads a GraphQL response of the snapshot request: `null` when the store has no theme (the New Page Builder store
 * setting is off, or the snapshot is in a format this storefront does not read). Throws on a GraphQL error.
 */
export function readThemeSnapshotResponse(
  body: unknown,
  requestedCultureName?: string,
  requestedPermalink?: string,
): IPublishedTheme | null {
  if (!isRecord(body)) {
    throw new Error("The theme snapshot response is not an object");
  }

  if (Array.isArray(body.errors) && body.errors.length) {
    throw new Error(`The theme snapshot request failed: ${JSON.stringify(body.errors)}`);
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
 * Whether the theme answers for the language: it is in that language, or it was asked for it and the server served
 * its default language because the publication has no file in that one. A language part (`fr`, a URL prefix) stands
 * for the store's only language of it, as the storefront's short locales do.
 */
export function isThemeForLanguage(
  theme: Pick<IPublishedTheme, "cultureName" | "requestedCultureName">,
  cultureName: string,
): boolean {
  return [theme.cultureName, theme.requestedCultureName].some((name) => isSameLanguage(name, cultureName));
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

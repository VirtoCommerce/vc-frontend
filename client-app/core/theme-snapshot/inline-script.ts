import {
  DESIGNER_PREVIEW_PATH,
  PINNED_LOCALE_KEY,
  THEME_SNAPSHOT_GLOBAL,
  THEME_SNAPSHOT_OPERATION,
  THEME_SNAPSHOT_QUERY,
  URL_LOCALE_PATTERN,
} from "./query.js";

export interface IThemeSnapshotScriptOptions {
  domain?: string;
}

/**
 * Runs before the application loads, unbundled, so it must work as written in every browser the storefront supports.
 * Its permalink must match the slug route's: segments decoded and joined, `/` for none.
 */
export function buildThemeSnapshotScript(options: IThemeSnapshotScriptOptions = {}): string {
  const constants = JSON.stringify({
    global: THEME_SNAPSHOT_GLOBAL,
    operation: THEME_SNAPSHOT_OPERATION,
    query: THEME_SNAPSHOT_QUERY,
    previewPath: DESIGNER_PREVIEW_PATH,
    localePattern: URL_LOCALE_PATTERN,
    pinnedLocaleKey: PINNED_LOCALE_KEY,
    domain: options.domain ?? "",
  });

  return `(function () {
  var c = ${constants};
  function decodeSegment(segment) {
    try {
      return decodeURIComponent(segment);
    } catch (e) {
      return segment;
    }
  }
  function readPinnedLocale() {
    try {
      return localStorage.getItem(c.pinnedLocaleKey) || undefined;
    } catch (e) {
      return undefined;
    }
  }
  try {
    var path = location.pathname;
    var cultureName;
    var permalink;
    if (path === c.previewPath) {
      cultureName = new URLSearchParams(location.search).get("cultureName") || undefined;
    } else {
      var match = new RegExp(c.localePattern, "i").exec(path);
      cultureName = match ? match[1] : readPinnedLocale();
      var segments = path.slice(match ? match[0].length : 0).split("/").filter(Boolean).map(decodeSegment);
      permalink = segments.join("/") || "/";
    }
    if (cultureName && !/^[a-zA-Z0-9-]+$/.test(cultureName)) {
      cultureName = undefined;
    }
    var variables = { domain: c.domain || location.hostname, cultureName: cultureName, permalink: permalink };
    var response = fetch("/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operationName: c.operation, query: c.query, variables: variables })
    }).then(function (result) {
      if (!result.ok) {
        throw new Error("HTTP " + result.status);
      }
      return result.json();
    });
    response.catch(function () {});
    window[c.global] = { variables: variables, response: response };
  } catch (e) {}
})();`;
}

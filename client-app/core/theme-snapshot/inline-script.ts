import {
  DESIGNER_PREVIEW_PATH,
  PINNED_LOCALE_KEY,
  THEME_SNAPSHOT_GLOBAL,
  THEME_SNAPSHOT_OPERATION,
  THEME_SNAPSHOT_QUERY,
  URL_LOCALE_PATTERN,
} from "./query.js";

export interface IThemeSnapshotScriptOptions {
  /** The domain the store is resolved by; the page's host name when absent. Development passes the backend's. */
  domain?: string;
}

/**
 * The inline script `index.html` carries when the storefront is built with `new_page_builder_enabled`: it sends the
 * theme snapshot request before the application JavaScript loads and leaves the request on `window`, so the snapshot
 * is usually there before the first render. Written for every browser the storefront supports, without a bundler.
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
    if (path === c.previewPath) {
      cultureName = new URLSearchParams(location.search).get("cultureName") || undefined;
    } else {
      var match = new RegExp(c.localePattern, "i").exec(path);
      cultureName = match ? match[1] : readPinnedLocale();
    }
    if (cultureName && !/^[a-zA-Z0-9-]+$/.test(cultureName)) {
      cultureName = undefined;
    }
    var variables = { domain: c.domain || location.hostname, cultureName: cultureName };
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

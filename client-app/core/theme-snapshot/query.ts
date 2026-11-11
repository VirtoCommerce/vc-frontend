/** Import-free, because the Vite config loads it under Node to build the inline script. */

export const THEME_SNAPSHOT_GLOBAL = "__vcThemeSnapshot";

export const THEME_SNAPSHOT_OPERATION = "ThemeSnapshot";

export const THEME_SNAPSHOT_QUERY = `query ThemeSnapshot($domain: String, $storeId: String, $cultureName: String, $permalink: String) {
  themeSnapshot(domain: $domain, storeId: $storeId, cultureName: $cultureName, permalink: $permalink) {
    storeId
    cultureName
    publication
    content
    menus {
      name
      items {
        title
        url
        priority
        childItems {
          title
          url
          priority
        }
      }
    }
    slug {
      objectType
      objectId
      page {
        source
        permalink
        settings
      }
    }
  }
}`;

export const DESIGNER_PREVIEW_PATH = "/designer-preview";

/** Must match the app's URL locale pattern, which this file cannot import. */
export const URL_LOCALE_PATTERN = String.raw`^\/?([a-z]{2}(?:-[A-Z]{2})?)(\/|$)`;

/** Must match the key the app pins the locale under, which this file cannot import. */
export const PINNED_LOCALE_KEY = "pinnedLocale";

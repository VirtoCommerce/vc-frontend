/** Constants shared by the app and the inline script; import-free, because the Vite config loads it under Node to build that script. */

export const THEME_SNAPSHOT_GLOBAL = "__vcThemeSnapshot";

export const THEME_SNAPSHOT_LOG_SCOPE = "[theme-snapshot]";

export const HTTP_ERROR_MESSAGE_PREFIX = "HTTP ";

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

export const URL_LOCALE_PATTERN = String.raw`^\/?(?<locale>[a-z]{2}(?:-[A-Z]{2})?)(\/|$)`;

export const PINNED_LOCALE_KEY = "pinnedLocale";

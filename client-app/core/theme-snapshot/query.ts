/**
 * The theme snapshot request, shared by the inline script in `index.html` and the application. Import-free, because
 * the Vite config loads it under Node to build that script.
 */

/** The window property the inline script leaves its request on, for the application to pick up. */
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

/** The route the Page Builder designer previews pages on; its language comes from `?cultureName=`. */
export const DESIGNER_PREVIEW_PATH = "/designer-preview";

/** The same pattern the storefront reads a language prefix of the URL with (`useLanguages`). */
export const URL_LOCALE_PATTERN = String.raw`^\/?([a-z]{2}(?:-[A-Z]{2})?)(\/|$)`;

/** The localStorage key of the language a visitor pinned (`useLanguages`). */
export const PINNED_LOCALE_KEY = "pinnedLocale";

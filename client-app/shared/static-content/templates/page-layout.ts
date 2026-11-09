import { useLanguages } from "@/core/composables/useLanguages";
import { isNewPageBuilderEnabled, useThemeSnapshot } from "@/core/theme-snapshot";
import {
  getSlugRoutePermalink,
  isOwnLayoutSlugPage,
  isPageLayout,
  usePageLayout,
} from "@/shared/layout/composables/usePageLayout";
import { useThemeTemplates } from "./useThemeTemplates";
import type { ITemplateSubject } from "./conditions";
import type { ITemplateResolution } from "./rules";
import type { IThemeSlug, ThemePageType } from "@/core/theme-snapshot";
import type { PageLayoutType } from "@/shared/layout/composables/usePageLayout";
import type { Router } from "vue-router";

const DEFAULT_LAYOUT: PageLayoutType = "full";

/** The object the visitor's own slug lookup found at the landing permalink (`pageContext`). */
export interface ISlugEntity {
  objectType?: string;
  objectId?: string;
}

export interface ILandingLayoutOptions {
  /** What the snapshot request found at the permalink it asked for. */
  slug: IThemeSlug | undefined;
  /** The permalink the landing route's page looks up; `undefined` when the route is not a slug route. */
  permalink: string | undefined;
  entity: ISlugEntity | null | undefined;
  /** The landing route's path: a file page's permalink for the template rules. */
  path: string;
  language: string | undefined;
  resolveTemplate: (pageType: ThemePageType, subject: ITemplateSubject, ownTemplate?: unknown) => ITemplateResolution;
}

/** A content page's settings over its template's; one the page left empty (the designer's "Empty") keeps the template's. */
export function mergePageSettings(
  templateSettings: Record<string, unknown> | undefined,
  pageSettings: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return {
    ...templateSettings,
    ...Object.fromEntries(Object.entries(pageSettings ?? {}).filter(([, value]) => value != null)),
  };
}

/** The layout merged settings name; `full` for none. */
export function getSettingsLayout(settings: Record<string, unknown>): PageLayoutType {
  return isPageLayout(settings.layout) ? settings.layout : DEFAULT_LAYOUT;
}

/**
 * The layout of the page the visitor lands on, known before the page loads: chosen with the template rules from what
 * the snapshot request found at the landing permalink, as the page chooses it once it is there. `undefined` when that
 * is not known, and the page reports its layout once it loads: the snapshot request asked for another permalink, the
 * visitor's own lookup found another object, or a content page was not read or has no settings to choose by.
 */
export function chooseLandingPageLayout(options: ILandingLayoutOptions): PageLayoutType | undefined {
  const { slug, permalink, entity, path, language, resolveTemplate } = options;

  if (
    !slug ||
    permalink === undefined ||
    slug.permalink !== permalink ||
    slug.objectType !== entity?.objectType ||
    slug.objectId !== entity?.objectId
  ) {
    return undefined;
  }

  const isPage = slug.objectType === "Pages";

  if (isPage && !slug.page) {
    return undefined;
  }

  if (!isOwnLayoutSlugPage({ objectType: slug.objectType, document: slug.page, isMarkdown: false })) {
    return DEFAULT_LAYOUT;
  }

  const settings = slug.page?.settings;

  if (!settings) {
    return undefined;
  }

  const subject: ITemplateSubject = {
    permalink: isPage ? slug.page?.permalink : path,
    language,
    settings,
    objectType: slug.objectType,
  };
  const template = resolveTemplate("page", subject, settings.template);

  return getSettingsLayout(mergePageSettings(template.document.settings, settings));
}

/**
 * Sets the layout of the page the visitor lands on before the application mounts, so the header and footer do not
 * wait for the page. Without a snapshot accepted at boot nothing is set, and the page reports its layout once it loads.
 */
export function setLandingPageLayout(router: Router, entity: ISlugEntity | null | undefined): void {
  if (!isNewPageBuilderEnabled()) {
    return;
  }

  const slug = useThemeSnapshot().published.value?.slug;

  if (!slug) {
    return;
  }

  const route = router.resolve(router.options.history.location);
  const layout = chooseLandingPageLayout({
    slug,
    permalink: getSlugRoutePermalink(route),
    entity,
    path: route.path,
    language: useLanguages().currentLanguage.value?.cultureName,
    resolveTemplate: useThemeTemplates().resolveTemplate,
  });

  if (layout) {
    usePageLayout().setPageLayout(layout);
  }
}

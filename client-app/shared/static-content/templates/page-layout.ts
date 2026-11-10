import { useLanguages } from "@/core/composables/useLanguages";
import { isNewPageBuilderEnabled, useThemeSnapshot } from "@/core/theme-snapshot";
import {
  getSlugRoutePermalink,
  isOwnLayoutSlugPage,
  isPageLayout,
  PAGES_OBJECT_TYPE,
  usePageLayout,
} from "@/shared/layout/composables/usePageLayout";
import { useThemeTemplates } from "../composables/useThemeTemplates";
import type { ITemplateSubject } from "./conditions";
import type { ITemplateResolution } from "./rules";
import type { IThemeSlug, ThemePageType } from "@/core/theme-snapshot";
import type { PageLayoutType } from "@/shared/layout/composables/usePageLayout";
import type { Router } from "vue-router";

const DEFAULT_LAYOUT: PageLayoutType = "full";

export interface ISlugEntity {
  objectType?: string;
  objectId?: string;
}

export interface ILandingLayoutOptions {
  slug: IThemeSlug | undefined;
  permalink: string | undefined;
  entity: ISlugEntity | null | undefined;
  path: string;
  language: string | undefined;
  resolveTemplate: (pageType: ThemePageType, subject: ITemplateSubject, ownTemplate?: unknown) => ITemplateResolution;
}

/** A setting the page left empty (the designer's "Empty") keeps the template's value. */
export function mergePageSettings(
  templateSettings: Record<string, unknown> | undefined,
  pageSettings: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return {
    ...templateSettings,
    ...Object.fromEntries(Object.entries(pageSettings ?? {}).filter(([, value]) => value != null)),
  };
}

export function getSettingsLayout(settings: Record<string, unknown>): PageLayoutType {
  return isPageLayout(settings.layout) ? settings.layout : DEFAULT_LAYOUT;
}

/** `undefined` leaves the layout to the page once it loads: the snapshot's slug did not match or has no settings. */
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

  const isPage = slug.objectType === PAGES_OBJECT_TYPE;

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

/** Runs before mount so the header and footer do not wait for the page to report its layout. */
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

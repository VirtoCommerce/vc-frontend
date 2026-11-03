import { createGlobalState } from "@vueuse/core";
import { computed, readonly, shallowRef, toValue, watch } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { resolveTranslatableValues, useThemeSnapshot } from "@/core/theme-snapshot";
import { BUILT_IN_TEMPLATES, withMainSection } from "./built-in";
import { useTemplateConditions } from "./conditions";
import { chooseTemplate, getTemplatePageType, normalizeTemplateRules } from "./rules";
import type { ITemplateSubject } from "./conditions";
import type { ITemplateResolution } from "./rules";
import type { IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";
import type { MaybeRefOrGetter } from "vue";

/**
 * The theme's templates for product, category and content pages, chosen synchronously from the snapshot in memory
 * (or the designer's draft over it), with the storefront's built-in templates under them.
 */
export const useThemeTemplates = createGlobalState(() => {
  const { theme } = useThemeSnapshot();
  const { getTemplateCondition } = useTemplateConditions();
  const { currentLanguage, defaultStoreCulture } = useLanguages();

  /** The template the designer has open: pages of its type show it in its place. */
  const openTemplate = shallowRef<{ key: string; document: IThemePageDocument }>();
  /** The last choice a page made, which the preview reports to the designer. */
  const lastResolution = shallowRef<ITemplateResolution>();

  const templates = computed(() => ({ ...BUILT_IN_TEMPLATES, ...theme.value?.templates }));
  const rules = computed(() => normalizeTemplateRules(theme.value?.rules));

  function localize(document: IThemePageDocument): IThemePageDocument {
    // Only the designer's draft can hold translatable dictionaries; a published snapshot has one language.
    return theme.value?.isDraft
      ? resolveTranslatableValues(document, currentLanguage.value?.cultureName ?? "", defaultStoreCulture.value)
      : document;
  }

  function resolveTemplate(
    pageType: ThemePageType,
    subject: ITemplateSubject,
    ownTemplate?: unknown,
  ): ITemplateResolution {
    const open = openTemplate.value;
    const resolution: ITemplateResolution =
      open && getTemplatePageType(open.key) === pageType
        ? { pageType, template: open.key, ruleId: null, document: open.document }
        : (chooseTemplate({
            pageType,
            subject,
            rules: rules.value,
            templates: templates.value,
            getCondition: getTemplateCondition,
            ownTemplate,
          }) ?? { pageType, template: pageType, ruleId: null, document: BUILT_IN_TEMPLATES[pageType] });

    return { ...resolution, document: withMainSection(localize(resolution.document), pageType) };
  }

  function setOpenTemplate(key: string | undefined, document?: IThemePageDocument): void {
    openTemplate.value = key && document ? { key, document } : undefined;
  }

  function setLastResolution(resolution: ITemplateResolution): void {
    lastResolution.value = resolution;
  }

  return {
    lastResolution: readonly(lastResolution),
    resolveTemplate,
    setOpenTemplate,
    setLastResolution,
  };
});

/**
 * The template of the page being shown, recomputed when its data, the theme or the designer's draft change. The
 * choice is reported for the designer's `resolved` message. Without a subject yet (the entity is still loading), no
 * template is chosen.
 */
export function useTemplateResolution(
  pageType: ThemePageType,
  subject: MaybeRefOrGetter<ITemplateSubject | undefined>,
  ownTemplate?: MaybeRefOrGetter<unknown>,
) {
  const { resolveTemplate, setLastResolution } = useThemeTemplates();

  const resolution = computed(() => {
    const value = toValue(subject);
    return value ? resolveTemplate(pageType, value, toValue(ownTemplate)) : undefined;
  });

  watch(
    resolution,
    (value) => {
      if (value) {
        setLastResolution(value);
      }
    },
    { immediate: true },
  );

  return resolution;
}

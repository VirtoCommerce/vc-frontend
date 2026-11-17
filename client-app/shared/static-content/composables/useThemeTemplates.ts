import { createGlobalState } from "@vueuse/core";
import { computed, readonly, shallowRef, toValue, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { BUILT_IN_TEMPLATES, withMainSection } from "../templates/built-in";
import { getTemplateCondition } from "../templates/conditions";
import { chooseTemplate, getTemplatePageType, normalizeTemplateRules } from "../templates/rules";
import type { ITemplateSubject } from "../templates/conditions";
import type { ITemplateResolution, TemplateChoiceType } from "../templates/rules";
import type { IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";
import type { MaybeRefOrGetter } from "vue";

export const useThemeTemplates = createGlobalState(() => {
  const { theme, localizeThemeDraft } = useThemeSnapshot();

  const openTemplate = shallowRef<{ key: string; document: IThemePageDocument }>();
  const lastResolution = shallowRef<ITemplateResolution>();

  const templates = computed(() => ({ ...BUILT_IN_TEMPLATES, ...theme.value?.templates }));
  const rules = computed(() => normalizeTemplateRules(theme.value?.rules));

  function resolveTemplate(
    pageType: ThemePageType,
    subject: ITemplateSubject,
    ownTemplate?: unknown,
  ): ITemplateResolution {
    const open = openTemplate.value;
    const choice: TemplateChoiceType = chooseTemplate({
      pageType,
      subject,
      rules: rules.value,
      templates: templates.value,
      getCondition: getTemplateCondition,
      ownTemplate,
    });
    const shown: TemplateChoiceType =
      open && getTemplatePageType(open.key) === pageType
        ? { pageType, template: open.key, ruleId: null, document: open.document }
        : choice;

    return {
      ...shown,
      document: withMainSection(localizeThemeDraft(shown.document), pageType, shown.template),
      rules: { template: choice.template, ruleId: choice.ruleId },
    };
  }

  function setOpenTemplate(key: string | undefined, document?: IThemePageDocument): void {
    openTemplate.value = key && document ? { key, document } : undefined;
  }

  function setLastResolution(resolution: ITemplateResolution | undefined): void {
    lastResolution.value = resolution;
  }

  return {
    lastResolution: readonly(lastResolution),
    resolveTemplate,
    setOpenTemplate,
    setLastResolution,
  };
});

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
    // Synchronous, so a choice this page makes for a change cannot land after the caller has cleared it.
    { immediate: true, flush: "sync" },
  );

  return resolution;
}

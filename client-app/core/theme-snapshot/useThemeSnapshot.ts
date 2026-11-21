import { createGlobalState } from "@vueuse/core";
import { computed, readonly, ref, shallowRef } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { isSiteBuilderEnabled } from "./enabled";
import { resolveTranslatableValues } from "./translatable";
import type { IPublishedTheme, IThemeDraft, IThemeView } from "./types";

/** `theme` is `undefined` while the storefront renders its built-in templates. */
function _useThemeSnapshot() {
  const { currentLanguage, defaultStoreCulture } = useLanguages();
  const published = shallowRef<IPublishedTheme>();
  const late = shallowRef<IPublishedTheme | null>();
  const draft = shallowRef<IThemeDraft>();
  const hasFailed = ref(false);
  const isRejected = ref(false);
  const isNull = ref(false);

  const theme = computed<IThemeView | undefined>(() => {
    const snapshot = published.value?.snapshot;
    const parts = draft.value;

    if (!snapshot && !parts) {
      return undefined;
    }

    return {
      rules: parts?.rules ?? snapshot?.rules,
      templates: parts?.templates ?? snapshot?.templates ?? {},
      header: parts?.header ?? snapshot?.header,
      footer: parts?.footer ?? snapshot?.footer,
      brand: parts?.brand ?? snapshot?.brand ?? {},
      palette: parts?.palette === undefined ? snapshot?.palette : (parts.palette ?? undefined),
      customSections: parts?.customSections ?? snapshot?.customSections ?? {},
      assetsBaseUrl: parts?.assetsBaseUrl ?? snapshot?.assetsBaseUrl,
      menus: published.value?.menus ?? [],
      isDraft: !!parts,
    };
  });

  function localizeThemeDraft<T>(value: T): T {
    // Only the designer's draft can hold translatable dictionaries; a published snapshot has one language.
    return theme.value?.isDraft
      ? resolveTranslatableValues(value, currentLanguage.value?.cultureName ?? "", defaultStoreCulture.value)
      : value;
  }

  function setPublished(value: IPublishedTheme | null): void {
    published.value = value ?? undefined;
    isNull.value = value === null;
    late.value = undefined;
    hasFailed.value = false;
    isRejected.value = false;
  }

  function setLate(value: IPublishedTheme | null): void {
    late.value = value;
    hasFailed.value = false;
    isRejected.value = false;
  }

  function promoteLate(): boolean {
    if (late.value === undefined) {
      return false;
    }

    setPublished(late.value);
    return true;
  }

  function setFailed(isRequestRejected = false): void {
    hasFailed.value = true;
    isRejected.value ||= isRequestRejected;
  }

  function setDraft(value: IThemeDraft | undefined): void {
    draft.value = value;
  }

  const hasNoTheme = computed(() => isNull.value && !draft.value);

  /** Off for a store without a theme too: its storefront looks as without Site Builder. */
  function isThemeApplied(): boolean {
    return isSiteBuilderEnabled() && !hasNoTheme.value;
  }

  return {
    theme,
    localizeThemeDraft,
    published: readonly(published),
    draft: readonly(draft),
    hasFailed: readonly(hasFailed),
    /** The backend refused the request itself, so it is not asked again until a snapshot is accepted. */
    isRejected: readonly(isRejected),
    /** `false` until a snapshot is accepted, and after a failed request. */
    hasNoTheme,
    isThemeApplied,
    setPublished,
    setLate,
    promoteLate,
    setFailed,
    setDraft,
  };
}

export const useThemeSnapshot = createGlobalState(_useThemeSnapshot);

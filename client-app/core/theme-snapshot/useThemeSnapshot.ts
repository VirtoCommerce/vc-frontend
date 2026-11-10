import { createGlobalState } from "@vueuse/core";
import { computed, readonly, ref, shallowRef } from "vue";
import { isNewPageBuilderEnabled } from "./enabled";
import type { IPublishedTheme, IThemeDraft, IThemeView } from "./types";

/** `theme` is `undefined` while the storefront renders its built-in templates. */
function _useThemeSnapshot() {
  const published = shallowRef<IPublishedTheme>();
  const late = shallowRef<IPublishedTheme | null>();
  const draft = shallowRef<IThemeDraft>();
  const hasFailed = ref(false);
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
      menus: published.value?.menus ?? [],
      isDraft: !!parts,
    };
  });

  function setPublished(value: IPublishedTheme | null): void {
    published.value = value ?? undefined;
    isNull.value = value === null;
    late.value = undefined;
    hasFailed.value = false;
  }

  function setLate(value: IPublishedTheme | null): void {
    late.value = value;
    hasFailed.value = false;
  }

  function promoteLate(): boolean {
    if (late.value === undefined) {
      return false;
    }

    setPublished(late.value);
    return true;
  }

  function setFailed(): void {
    hasFailed.value = true;
  }

  function setDraft(value: IThemeDraft | undefined): void {
    draft.value = value;
  }

  const hasNoTheme = computed(() => isNull.value && !draft.value);

  /** Off for a store without a theme too: its storefront looks as without the new Page Builder. */
  function isNewPageBuilderOn(): boolean {
    return isNewPageBuilderEnabled() && !hasNoTheme.value;
  }

  return {
    theme,
    published: readonly(published),
    draft: readonly(draft),
    hasFailed: readonly(hasFailed),
    /** `false` until a snapshot is accepted, and after a failed request. */
    hasNoTheme,
    isNewPageBuilderOn,
    setPublished,
    setLate,
    promoteLate,
    setFailed,
    setDraft,
  };
}

export const useThemeSnapshot = createGlobalState(_useThemeSnapshot);

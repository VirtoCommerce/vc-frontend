import { createGlobalState } from "@vueuse/core";
import { computed, readonly, ref, shallowRef } from "vue";
import type { IPublishedTheme, IThemeDraft, IThemeView } from "./types";

/**
 * The store's Page Builder theme: the published snapshot the storefront accepted, and the designer's unsaved draft
 * over it in the preview. `theme` is `undefined` while the storefront renders its built-in templates.
 */
function _useThemeSnapshot() {
  const published = shallowRef<IPublishedTheme>();
  /** A snapshot that arrived after the first render: it takes over on the next navigation inside the site. */
  const late = shallowRef<IPublishedTheme | null>();
  const draft = shallowRef<IThemeDraft>();
  /** The last request failed: the next navigation inside the site asks again. */
  const hasFailed = ref(false);

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
      palette: parts?.palette ?? snapshot?.palette,
      menus: published.value?.menus ?? [],
      isDraft: !!parts,
    };
  });

  function setPublished(value: IPublishedTheme | null): void {
    published.value = value ?? undefined;
    late.value = undefined;
    hasFailed.value = false;
  }

  function setLate(value: IPublishedTheme | null): void {
    late.value = value;
    hasFailed.value = false;
  }

  /** Puts a snapshot that arrived late in place; returns whether there was one. */
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

  return {
    theme,
    published: readonly(published),
    draft: readonly(draft),
    hasFailed: readonly(hasFailed),
    setPublished,
    setLate,
    promoteLate,
    setFailed,
    setDraft,
  };
}

export const useThemeSnapshot = createGlobalState(_useThemeSnapshot);

<template>
  <PageBuilderSection
    v-for="item in templateParts.before"
    :key="item.id"
    :item="item"
    :id="getAnchorId(item)"
    :model="item"
    :settings="settings"
  />

  <slot />

  <PageBuilderSection
    v-for="item in templateParts.after"
    :key="item.id"
    :item="item"
    :id="getAnchorId(item)"
    :model="item"
    :settings="settings"
  />
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { isPageLayout, usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { getAnchorId } from "../anchors";
import { usePermalinkSeo } from "../composables/usePermalinkSeo";
import { MAIN_SECTION_TYPES, splitTemplate, useTemplateResolution } from "../templates";
import PageBuilderSection from "./page-builder-section.vue";

interface IProps {
  /** The page's own settings: its `template` and `layout` choose over its template's. */
  pageSettings?: Record<string, unknown>;
  permalink?: string;
  /** The slug's `objectType`: `Pages` for a page from the database, `ContentFile` for a file page. */
  objectType?: string;
}

const props = defineProps<IProps>();

const DEFAULT_LAYOUT = "full";

const { currentLanguage } = useLanguages();
const { setPageLayout } = usePageLayout();

const templateResolution = useTemplateResolution(
  "page",
  () => ({
    permalink: props.permalink,
    language: currentLanguage.value?.cultureName,
    settings: props.pageSettings,
    objectType: props.objectType,
  }),
  () => props.pageSettings?.template,
);

/** The page template's sections around the page, which stands where the template's `page-content` section is. */
const templateParts = computed(() =>
  splitTemplate(templateResolution.value?.document.content ?? [], MAIN_SECTION_TYPES.page),
);

/** The page's settings over its template's. */
const settings = computed(() => ({ ...templateResolution.value?.document.settings, ...props.pageSettings }));

watchEffect(() => {
  const { layout } = settings.value;
  setPageLayout(isPageLayout(layout) ? layout : DEFAULT_LAYOUT);
});

// With the new Page Builder the page's address for search engines comes from its permalink, never the visited URL.
usePermalinkSeo(() => props.permalink, isNewPageBuilderEnabled);
</script>

<template>
  <PageBuilderSection
    v-for="item in templateParts.before"
    :key="item.id"
    :item="item"
    :id="getAnchorId(item)"
    :context="sectionContext"
  />

  <slot />

  <PageBuilderSection
    v-for="item in templateParts.after"
    :key="item.id"
    :item="item"
    :id="getAnchorId(item)"
    :context="sectionContext"
  />
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { getAnchorId } from "../anchors";
import { usePermalinkSeo } from "../composables/usePermalinkSeo";
import {
  getSettingsLayout,
  MAIN_SECTION_TYPES,
  mergePageSettings,
  splitTemplate,
  useTemplateResolution,
} from "../templates";
import PageBuilderSection from "./page-builder-section.vue";

interface IProps {
  /** The page's own settings: its `template` and `layout` choose over its template's. */
  pageSettings?: Record<string, unknown>;
  permalink?: string;
  /** The slug's `objectType`: `Pages` for a page from the database, `ContentFile` for a file page. */
  objectType?: string;
}

const props = defineProps<IProps>();

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

const settings = computed(() => mergePageSettings(templateResolution.value?.document.settings, props.pageSettings));

/** The page's settings, for the template's sections that declare them. */
const sectionContext = computed(() => ({ settings: settings.value }));

watchEffect(() => {
  setPageLayout(getSettingsLayout(settings.value));
});

// With the new Page Builder the page's address for search engines comes from its permalink, never the visited URL.
usePermalinkSeo(() => props.permalink, isNewPageBuilderEnabled);
</script>

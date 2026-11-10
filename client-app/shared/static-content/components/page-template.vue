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
import { useTemplateResolution } from "../composables/useThemeTemplates";
import { getSettingsLayout, MAIN_SECTION_TYPES, mergePageSettings, splitTemplate } from "../templates";
import PageBuilderSection from "./page-builder-section.vue";

interface IProps {
  pageSettings?: Record<string, unknown>;
  permalink?: string;
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

const templateParts = computed(() =>
  splitTemplate(templateResolution.value?.document.content ?? [], MAIN_SECTION_TYPES.page),
);

const settings = computed(() => mergePageSettings(templateResolution.value?.document.settings, props.pageSettings));

const sectionContext = computed(() => ({ settings: settings.value }));

watchEffect(() => {
  setPageLayout(getSettingsLayout(settings.value));
});

usePermalinkSeo(() => props.permalink, isNewPageBuilderEnabled);
</script>

<template>
  <div v-if="template" ref="staticPageAnchor">
    <PageBuilderPage
      :settings="template.settings"
      :content="template.content"
      :title="templateName"
      :permalink="previewSubject?.permalink ?? permalink ?? route.path"
      :object-type="previewSubject?.objectType ?? CONTENT_FILE_OBJECT_TYPE"
    />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, shallowRef, unref } from "vue";
import { useRoute } from "vue-router";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { humanizeName } from "@/core/utilities/common";
import { CONTENT_FILE_OBJECT_TYPE } from "@/shared/common/constants/slug-object-types";
import { PageBuilderPage, useAnchorScroll, usePageSeoInfo, useStaticPage } from "@/shared/static-content";

interface IProps {
  /** The page's own permalink; without it, the visited path, which can differ from it in case or a trailing slash. */
  permalink?: string;
}

defineProps<IProps>();

const route = useRoute();

const { staticPage: template, staticPagePreviewSubject: previewSubject } = useStaticPage();

// VCST-5274: the live page name is injected into `settings.name` upstream (useSlugInfo), so the
// breadcrumb follows renames. Humanize here as well to keep the leaf friendly for the fallback
// cases (a stored name that still has underscores, or `settings.header`).
const templateName = computed(() =>
  humanizeName(unref(template)?.settings?.name || unref(template)?.settings?.header || ""),
);

useAnchorScroll(() => template.value);

// Wraps the template's sections too, so the page keeps its meta while any part of it is on screen.
const staticPageAnchor = shallowRef<HTMLElement | null>(null);
const staticPageAnchorVisible = useElementVisibility(staticPageAnchor);

usePageSeoInfo(() => template.value?.settings?.seoInfo, templateName, staticPageAnchorVisible);

useSeoMeta({
  // With the new Page Builder the page template sets it from the permalink, without the visited URL's query.
  ogUrl: () => (staticPageAnchorVisible.value && !isNewPageBuilderEnabled() ? window.location.toString() : undefined),
});
</script>

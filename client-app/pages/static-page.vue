<template>
  <div v-if="template" ref="staticPageAnchor">
    <PageTemplate
      :page-settings="template.settings"
      :permalink="previewSubject?.permalink ?? permalink ?? route.path"
      :object-type="previewSubject?.objectType ?? CONTENT_FILE_OBJECT_TYPE"
    >
      <div
        v-if="!template.settings?.hideBreadcrumbs || template.settings?.header"
        class="mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10"
      >
        <VcBreadcrumbs v-if="!template.settings?.hideBreadcrumbs" class="mb-3" :items="breadcrumbs"></VcBreadcrumbs>

        <VcTypography v-if="template.settings?.header" tag="h1">
          {{ template.settings.header }}
        </VcTypography>
      </div>

      <template v-for="item in template.content">
        <PageBuilderSection
          v-if="!item.hidden"
          :key="item.id"
          :item="item"
          :id="getAnchorId(item)"
          :context="sectionContext"
        />
      </template>
    </PageTemplate>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, shallowRef, unref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbs } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { humanizeName } from "@/core/utilities/common";
import { CONTENT_FILE_OBJECT_TYPE } from "@/shared/layout/composables/usePageLayout";
import {
  getAnchorId,
  PageBuilderSection,
  PageTemplate,
  useAnchorScroll,
  usePageSeoInfo,
  useStaticPage,
} from "@/shared/static-content";

interface IProps {
  /** The page's own permalink; without it, the visited path, which can differ from it in case or a trailing slash. */
  permalink?: string;
}

defineProps<IProps>();

const route = useRoute();

const { staticPage: template, staticPagePreviewSubject: previewSubject } = useStaticPage();

const sectionContext = computed(() => ({ settings: template.value?.settings }));

// VCST-5274: the live page name is injected into `settings.name` upstream (useSlugInfo), so the
// breadcrumb follows renames. Humanize here as well to keep the leaf friendly for the fallback
// cases (a stored name that still has underscores, or `settings.header`).
const templateName = computed(() =>
  humanizeName(unref(template)?.settings?.name || unref(template)?.settings?.header || ""),
);

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);

useAnchorScroll(() => template.value);

// Wraps the template's sections too, so the page keeps its meta while any part of it is on screen.
const staticPageAnchor = shallowRef<HTMLElement | null>(null);
const staticPageAnchorVisible = useElementVisibility(staticPageAnchor);

usePageSeoInfo(
  () => template.value?.settings?.seoInfo,
  () => template.value?.settings?.name,
  staticPageAnchorVisible,
);

useSeoMeta({
  // With the new Page Builder the page template sets it from the permalink, without the visited URL's query.
  ogUrl: () => (staticPageAnchorVisible.value && !isNewPageBuilderEnabled() ? window.location.toString() : undefined),
});
</script>

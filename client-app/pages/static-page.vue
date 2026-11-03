<template>
  <PageTemplate
    v-if="template"
    :page-settings="template.settings"
    :permalink="permalink ?? previewSubject?.permalink ?? route.path"
    :object-type="previewSubject?.objectType ?? objectType"
  >
    <div ref="staticPageAnchor">
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
        <!-- @deprecated. TODO Keep only the item props. Remove settings and model from all components -->
        <PageBuilderSection
          v-if="!item.hidden"
          :key="item.id"
          :item="item"
          :id="getAnchorId(item)"
          :model="item"
          :settings="template.settings"
        />
      </template>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, shallowRef, unref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbs } from "@/core/composables";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { useSeoKeywords } from "@/core/composables/useSeoKeywords";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { humanizeName } from "@/core/utilities/common";
import { getAnchorId, PageBuilderSection, PageTemplate, useAnchorScroll, useStaticPage } from "@/shared/static-content";

interface IProps {
  /** What the page's template rules see; the route's path when absent. */
  permalink?: string;
  /** `ContentFile` for a file page, `Pages` for a page from the database. */
  objectType?: string;
}

withDefaults(defineProps<IProps>(), { objectType: "ContentFile" });

const route = useRoute();

const { staticPage: template, staticPagePreviewSubject: previewSubject } = useStaticPage();

// VCST-5274: the live page name is injected into `settings.name` upstream (useSlugInfo), so the
// breadcrumb follows renames. Humanize here as well to keep the leaf friendly for the fallback
// cases (a stored name that still has underscores, or `settings.header`).
const templateName = computed(() =>
  humanizeName(unref(template)?.settings?.name || unref(template)?.settings?.header || ""),
);

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);

useAnchorScroll(() => template.value);

const staticPageAnchor = shallowRef<HTMLElement | null>(null);
const staticPageAnchorVisible = useElementVisibility(staticPageAnchor);

const { title: pageTitle } = usePageTitle(
  template.value?.settings?.seoInfo?.pageTitle || template.value?.settings?.name,
);

useSeoMeta({
  title: () => (staticPageAnchorVisible.value ? pageTitle.value : undefined),
  description: () => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaDescription : undefined),
  // With the new Page Builder the page template sets it from the permalink, without the visited URL's query.
  ogUrl: () => (staticPageAnchorVisible.value && !isNewPageBuilderEnabled() ? window.location.toString() : undefined),
  ogTitle: () => (staticPageAnchorVisible.value ? pageTitle.value : undefined),
  ogDescription: () => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaDescription : undefined),
  ogType: () => (staticPageAnchorVisible.value ? "website" : undefined),
});

useSeoKeywords(() => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaKeywords : undefined));
</script>

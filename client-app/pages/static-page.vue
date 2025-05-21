<template>
  <div v-if="template" ref="staticPageAnchor">
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
      <!-- @deprecated. TODO Keep only v-bind="item". Remove settings and model from all components -->
      <component
        :is="getBlockType(item.type)"
        v-if="!item.hidden"
        :key="item.id"
        v-bind="item"
        :model="item"
        :settings="template.settings"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, shallowRef, unref } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { useStaticPage } from "@/shared/static-content";

const { staticPage: template } = useStaticPage();

const templateName = computed(() => unref(template)?.settings?.name || unref(template)?.settings?.header || "");

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);

const staticPageAnchor = shallowRef<HTMLElement | null>(null);
const staticPageAnchorVisible = useElementVisibility(staticPageAnchor);

const { title: pageTitle } = usePageTitle(
  template.value?.settings?.seoInfo?.pageTitle || template.value?.settings?.name,
);

useSeoMeta({
  title: () => (staticPageAnchorVisible.value ? pageTitle.value : undefined),
  description: () => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaDescription : undefined),
  keywords: () => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaKeywords : undefined),
  ogUrl: () => (staticPageAnchorVisible.value ? window.location.toString() : undefined),
  ogTitle: () => (staticPageAnchorVisible.value ? pageTitle.value : undefined),
  ogDescription: () => (staticPageAnchorVisible.value ? template.value?.settings?.seoInfo?.metaDescription : undefined),
  ogType: () => (staticPageAnchorVisible.value ? "website" : undefined),
});

function getBlockType(type: string): string {
  switch (type) {
    case "text":
      return "text-block";
    case "image":
      return "image-block";
    case "title":
      return "title-block";
    default:
      return type;
  }
}
</script>

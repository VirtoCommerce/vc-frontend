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
import { computed, shallowRef, unref, watchEffect } from "vue";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useStaticPage } from "@/shared/static-content";

const { staticPage: template } = useStaticPage();
const templateName = computed(() => unref(template)?.settings?.name || unref(template)?.settings?.header || "");

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);

const staticPageAnchor = shallowRef<HTMLElement | null>(null);
const staticPageAnchorIsVisible = useElementVisibility(staticPageAnchor);

watchEffect(() => {
  if (staticPageAnchorIsVisible.value) {
    const pageTitle = unref(template)?.settings?.seoInfo?.pageTitle || unref(template)?.settings?.name;
    const pageDescription = unref(template)?.settings?.seoInfo?.metaDescription;
    const pageKeywords = unref(template)?.settings?.seoInfo?.metaKeywords;

    usePageHead({
      title: computed(() => pageTitle),
      meta: {
        keywords: computed(() => pageKeywords),
        description: computed(() => pageDescription),
      },
    });

    useSeoMeta({
      ogUrl: window.location.toString(),
      ogTitle: pageTitle,
      ogDescription: pageDescription,
      ogType: "website",
    });
  }
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

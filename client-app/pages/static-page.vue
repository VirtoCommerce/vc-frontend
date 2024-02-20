<template>
  <div v-if="template">
    <div
      v-if="!template.settings?.hideBreadcrumbs || template.settings?.header"
      class="mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10"
    >
      <VcBreadcrumbs v-if="!template.settings?.hideBreadcrumbs" class="mb-3" :items="breadcrumbs"></VcBreadcrumbs>
      <h1 v-if="template.settings?.header" class="text-2xl font-bold uppercase md:text-4xl">
        {{ template.settings.header }}
      </h1>
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
import { computed, unref } from "vue";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useStaticPage } from "@/shared/static-content";

const { staticPage: template } = useStaticPage();
const templateName = computed(() => unref(template)?.settings?.name || unref(template)?.settings?.header || "");

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }]);

usePageHead({
  title: computed(() => unref(template)?.settings?.seoInfo?.pageTitle || unref(template)?.settings?.name),
  meta: {
    keywords: computed(() => unref(template)?.settings?.seoInfo?.metaKeywords),
    description: computed(() => unref(template)?.settings?.seoInfo?.metaDescription),
  },
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

<template>
  <div v-if="!loading">
    <div v-if="currentPage">
      <div
        v-if="!currentPage.settings?.hideBreadcrumbs || currentPage.settings?.header"
        class="mx-auto w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10"
      >
        <VcBreadcrumbs class="mb-3" :items="breadcrumbs"></VcBreadcrumbs>
        <h1 v-if="currentPage.settings?.header" class="text-3xl font-bold uppercase text-gray-900 lg:text-4xl">
          {{ currentPage.settings.header }}
        </h1>
      </div>
      <template v-for="item in currentPage.content">
        <component
          :is="getBlockType(item.type)"
          v-if="!item.hidden"
          :key="item.id"
          :model="item"
          :settings="currentPage.settings"
        />
      </template>
    </div>
    <slot v-if="!currentPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from "vue";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useStaticPage } from "@/shared/static-content";

const props = defineProps<{
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staticTemplate: any;
}>();

const template = useStaticPage();
const templateName = computed(() => unref(template)?.settings?.name || unref(template)?.settings?.header || "");

const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }]);

usePageHead({
  title: computed(() => unref(template)?.settings?.seoInfo?.pageTitle || unref(template)?.settings?.name),
  meta: {
    keywords: computed(() => unref(template)?.settings?.seoInfo?.metaKeywords),
    description: computed(() => unref(template)?.settings?.seoInfo?.metaDescription),
  },
});

const currentPage = computed(() => {
  return props.staticTemplate || template;
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

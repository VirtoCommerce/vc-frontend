<template>
  <div v-if="template" class="pt-7">
    <div class="w-full max-w-screen-2xl mx-auto pb-5 lg:pb-10 px-5 md:px-12">
      <VcBreadcrumbs v-if="!template.settings?.hideBreadcrumbs" class="mb-3" :items="breadcrumbs"></VcBreadcrumbs>
      <h1 v-if="template.settings?.header" class="font-bold text-gray-900 text-3xl lg:text-4xl uppercase">
        {{ template.settings.header }}
      </h1>
    </div>
    <component
      v-for="item in template.content"
      :key="item.id"
      :is="item.type"
      :model="item"
      :settings="template.settings"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from "vue";
import { usePageHead, useStaticPage } from "@/core/composables";

const template = useStaticPage();

usePageHead({
  title: computed(() => unref(template)?.settings?.seoInfo?.pageTitle || unref(template)?.settings?.name),
  meta: {
    keywords: computed(() => unref(template)?.settings?.seoInfo?.metaKeywords),
    description: computed(() => unref(template)?.settings?.seoInfo?.metaDescription),
  },
});
</script>

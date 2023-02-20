<template>
  <div>
    <div class="max-w-screen-2xl px-5 pt-7 md:px-12">
      <VcBreadcrumbs v-if="breadcrumbs.length" :items="breadcrumbs" class="mb-3" />

      <slot name="title">
        <h1 v-if="title" class="text-black-800 mb-8 text-2xl font-bold uppercase md:text-4xl">
          {{ title }}
        </h1>
      </slot>
    </div>

    <TwoColumn class="max-w-screen-lg">
      <template #left>
        <div class="flex h-full flex-col items-center justify-center lg:items-start">
          <VcImage v-if="mobileImage" :src="mobileImage" class="mb-8 lg:hidden" lazy />

          <slot name="description">
            <h2 class="text-black-800 mb-8 text-center text-2xl font-semibold lg:text-left">
              {{ description }}
            </h2>
          </slot>

          <slot name="actions" />
        </div>
      </template>

      <template #right>
        <VcImage :src="image" lazy />
      </template>
    </TwoColumn>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { TwoColumn } from "@/shared/layout";

defineProps({
  title: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
  },

  image: {
    type: String,
    default: "",
  },

  mobileImage: {
    type: String,
    default: "",
  },

  breadcrumbs: {
    type: Array as PropType<IBreadcrumb[]>,
    default: () => [],
  },
});
</script>

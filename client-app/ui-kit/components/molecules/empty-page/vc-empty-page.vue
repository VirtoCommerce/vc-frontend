<template>
  <div>
    <div class="max-w-screen-2xl px-5 md:px-12 pt-7">
      <VcBreadcrumbs v-if="breadcrumbs.length" :items="breadcrumbs" class="mb-3" />

      <slot name="title">
        <h1 v-if="title" class="text-black-800 text-2xl md:text-4xl font-bold mb-8 uppercase">
          {{ title }}
        </h1>
      </slot>
    </div>

    <TwoColumn class="max-w-screen-lg">
      <template #left>
        <div class="flex flex-col h-full justify-center items-center lg:items-start">
          <VcImage v-if="mobileImage" :src="mobileImage" class="lg:hidden mb-8" lazy />

          <slot name="description">
            <h2 class="text-black-800 text-center lg:text-left text-2xl font-semibold mb-8">
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

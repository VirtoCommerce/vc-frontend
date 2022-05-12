<template>
  <slot>
    <div class="max-w-screen-2xl px-5 md:px-12 pt-7">
      <VcBreadcrumbs :items="breadcrumbs" class="mb-3" />

      <slot name="title">
        <h1 class="text-black-800 text-2xl md:text-4xl font-bold mb-8 uppercase">{{ title }}</h1>
      </slot>
    </div>

    <VcTwoColumnPage class="max-w-screen-lg">
      <template #left>
        <div class="flex flex-col h-full justify-center items-center lg:items-start">
          <VcImage v-if="mobileImage" :src="mobileImage" class="lg:hidden mb-8" is-lazy />

          <slot name="description">
            <h2 class="text-black-800 text-center lg:text-left text-2xl font-semibold mb-8">
              {{ description }}
            </h2>
          </slot>

          <slot name="actions"></slot>
        </div>
      </template>

      <template #right>
        <VcImage :src="image" class="w-full max-w-md" is-lazy />
      </template>
    </VcTwoColumnPage>
  </slot>
</template>

<script setup lang="ts">
/**
 * Empty page layout.
 */

import { PropType } from "vue";
import { VcImage, IBreadcrumbs, VcBreadcrumbs, VcTwoColumnPage } from "@/components";

defineProps({
  /**
   * Page title.
   */
  title: {
    type: String,
    default: "",
  },

  /**
   * Page description.
   */
  description: {
    type: String,
    default: "",
  },

  /**
   * Image source.
   */
  image: {
    type: String,
    default: "",
  },

  /**
   * Mobile image source.
   */
  mobileImage: {
    type: String,
    default: "",
  },

  /**
   * Breadcrumbs.
   */
  breadcrumbs: {
    type: Array as PropType<IBreadcrumbs[]>,
    default: null,
  },
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

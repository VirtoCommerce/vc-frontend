<template>
  <div class="bg-white lg:mb-6 lg:rounded" :class="$attrs.class">
    <slot name="title">
      <div class="flex items-center px-5 py-7">
        <VcImage v-if="icon" :src="icon" :alt="title" class="mr-5 lg:mr-8" is-lazy />
        <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ title }}</h3>
      </div>
    </slot>

    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Generic content section with title and optional icon.
 */

import { VcImage } from "@/components";

defineProps({
  /**
   * Section title.
   */
  title: {
    type: String,
    default: "",
  },

  /**
   * Section icon.
   */
  icon: {
    type: String,
    default: "",
  },
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

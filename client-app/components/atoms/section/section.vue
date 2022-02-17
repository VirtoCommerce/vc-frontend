<template>
  <div class="bg-white lg:mb-6 lg:rounded">
    <div class="flex items-center px-5 py-7">
      <VcImage :src="iconUrl" :alt="title" class="mr-5 lg:mr-8" />
      <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ title }}</h3>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";

defineProps({
  title: {
    type: String,
    required: true,
  },

  iconUrl: {
    type: String,
    required: true,
  },
});
</script>

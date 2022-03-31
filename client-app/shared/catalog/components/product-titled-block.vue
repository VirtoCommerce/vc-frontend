<template>
  <div class="flex flex-col">
    <div class="flex items-center mb-4">
      <VcImage :src="imageSrc" :alt="title" />
      <h2 class="text-xl font-extrabold uppercase ml-2">{{ title }}</h2>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";

defineProps({
  imageSrc: { type: String, required: true },
  title: { type: String, required: true },
});
</script>

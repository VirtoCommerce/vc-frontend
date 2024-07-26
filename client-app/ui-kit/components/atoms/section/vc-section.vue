<template>
  <div class="bg-additional-50 lg:mb-6 lg:rounded">
    <slot name="title">
      <div class="flex items-center px-5 py-7">
        <VcImage :src="iconUrl" :alt="title" class="mr-5 lg:mr-8" lazy />
        <h3 class="text-2xl font-bold uppercase text-neutral-800 lg:text-3xl">{{ title }}</h3>
      </div>
    </slot>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "",
  },

  iconUrl: {
    type: String,
    default: "",
  },
});

console.warn("[UIKit][warn] VcSection is deprecated, use VcWidget instead.");
</script>

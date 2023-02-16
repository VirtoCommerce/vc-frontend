<template>
  <div class="flex flex-col">
    <div class="mb-4 flex items-center">
      <VcImage :src="imageSrc" :alt="title" lazy />
      <h2 class="ml-2 text-xl font-extrabold uppercase">{{ title }}</h2>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  imageSrc: { type: String, required: true },
  title: { type: String, required: true },
});
</script>

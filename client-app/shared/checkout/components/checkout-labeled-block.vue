<template>
  <p class="font-extrabold text-base mb-1">{{ label }}</p>
  <div class="rounded border mb-6">
    <div class="p-5 flex flex-col space-y-2 lg:space-y-0 text-sm lg:flex-row lg:justify-between lg:items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
});
</script>

<style scoped></style>

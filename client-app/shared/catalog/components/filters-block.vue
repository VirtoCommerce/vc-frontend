<template>
  <div class="bg-white rounded border shadow-sm">
    <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">
      <div class="flex">
        <div class="flex-grow">{{ title }}</div>
        <div v-if="isCollapsible" class="ml-3"><i class="fas fa-chevron-down"></i></div>
      </div>
    </div>
    <div class="p-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },

  isCollapsible: {
    type: Boolean,
    default: false,
  },
});
</script>

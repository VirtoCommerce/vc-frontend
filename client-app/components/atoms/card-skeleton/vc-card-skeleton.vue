<template>
  <div class="bg-white rounded border shadow-sm">
    <div class="px-6 py-3 border-b">
      <div class="flex items-center">
        <div class="flex-grow text-xl bg-gray-100">&nbsp;</div>
        <div v-if="isCollapsible" class="ml-6 bg-gray-100 w-3.5 h-3">&nbsp;</div>
      </div>
    </div>

    <div class="px-6 py-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isCollapsible: {
    type: Boolean,
    default: false,
  },
});
</script>

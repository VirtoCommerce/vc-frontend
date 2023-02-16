<template>
  <div class="rounded border bg-white shadow-sm">
    <div class="border-b px-6 py-3">
      <div class="flex items-center">
        <div class="grow bg-gray-100 text-xl">&nbsp;</div>
        <div v-if="isCollapsible" class="ml-6 h-3 w-3.5 bg-gray-100">&nbsp;</div>
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

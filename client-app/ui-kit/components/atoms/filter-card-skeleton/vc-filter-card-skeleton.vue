<template>
  <div class="rounded shadow-sm">
    <div class="px-3.5 pt-2 pb-1.5 border rounded-t bg-white">
      <div class="flex items-center pb-px">
        <div class="flex-grow h-5 bg-gray-100">&nbsp;</div>
        <div v-if="isCollapsible" class="ml-3 bg-gray-100 w-3.5 h-3">&nbsp;</div>
      </div>
    </div>
    <div class="px-4 py-3.5 bg-white rounded-b border-l border-r border-b">
      <slot />
      <template v-if="!$slots.default">
        <div v-for="i in 5" :key="i" class="flex mt-3 first:mt-1 last:mb-2">
          <div class="w-5 h-5 bg-gray-100 inline-block"></div>
          <div class="flex-grow ml-2 text-sm bg-gray-100">&nbsp;</div>
        </div>
      </template>
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

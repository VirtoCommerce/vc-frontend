<template>
  <div class="rounded shadow-sm">
    <div class="rounded-t border bg-white px-3.5 pb-1.5 pt-2">
      <div class="flex items-center pb-px">
        <div class="h-5 grow bg-gray-100">&nbsp;</div>
        <div v-if="isCollapsible" class="ml-3 h-3 w-3.5 bg-gray-100">&nbsp;</div>
      </div>
    </div>
    <div class="rounded-b border-x border-b bg-white px-4 py-3.5">
      <slot />
      <template v-if="!$slots.default">
        <div v-for="i in 5" :key="i" class="mt-3 flex first:mt-1 last:mb-2">
          <div class="inline-block h-5 w-5 bg-gray-100"></div>
          <div class="ml-2 grow bg-gray-100 text-sm">&nbsp;</div>
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

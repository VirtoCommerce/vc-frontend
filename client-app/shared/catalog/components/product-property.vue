<template>
  <div class="flex gap-x-3">
    <div class="flex w-1/2 gap-x-3">
      <div class="shrink text-gray-500">
        {{ label }}
      </div>

      <div class="border-grey-100 h-5 flex-1 border-b border-dotted"></div>
    </div>

    <div class="w-1/2 font-bold line-clamp-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: "",
    required: true,
  },
});
</script>

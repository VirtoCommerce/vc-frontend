<template>
  <div class="flex gap-x-3">
    <div class="flex w-1/3 gap-x-3">
      <div class="flex-shrink text-gray-500">
        {{ label }}
      </div>

      <div class="flex-1 border-b border-grey-100 border-dotted h-5"></div>
    </div>

    <div class="w-2/3 font-bold line-clamp-3">
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

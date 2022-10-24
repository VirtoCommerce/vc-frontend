<template>
  <div class="flex gap-x-3 text-13">
    <div class="w-1/2 text-gray-500">
      {{ label }}
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

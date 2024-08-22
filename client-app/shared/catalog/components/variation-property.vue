<template>
  <div class="flex gap-x-3 text-sm">
    <div class="w-1/2 text-neutral xl:w-2/5">
      {{ label }}
    </div>

    <div class="line-clamp-3 w-1/2 font-bold xl:w-3/5">
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

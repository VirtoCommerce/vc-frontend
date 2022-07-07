<template>
  <div
    class="absolute flex items-center h-5 rounded-xl bg-white border border-[color:var(--color-primary)] px-1.5 font-bold text-xs"
    :class="position"
  >
    {{ count }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  count: {
    type: Number,
    default: undefined,
  },
  position: {
    type: String,
    default: "",
  },
});
</script>

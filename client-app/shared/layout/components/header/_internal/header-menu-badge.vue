<template>
  <div
    class="absolute -top-[8px] left-[1.2rem] flex items-center h-5 rounded-xl bg-white border border-[color:var(--color-primary)] px-1.5 font-bold text-xs"
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
});
</script>

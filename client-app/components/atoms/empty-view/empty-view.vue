<template>
  <div class="flex flex-col items-center justify-center space-y-5">
    <slot name="icon"></slot>
    <p class="text-xl">
      {{ text }}
    </p>
    <slot name="button"></slot>
  </div>
</template>
<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: "",
  },
});
</script>

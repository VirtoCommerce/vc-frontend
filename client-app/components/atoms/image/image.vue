<template>
  <img :src="src" :alt="alt" @error="setFallbackSrc" />
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    required: true,
  },

  alt: {
    type: String,
    default: undefined,
  },

  fallbackSrc: {
    type: String,
    default: "/static/images/no-image.png",
  },
});

/**
 * Set fallback source when image loading error occures.
 * @param event Generic event
 */
function setFallbackSrc(event: Event): void {
  (event.target as HTMLImageElement).src = props.fallbackSrc;
}
</script>

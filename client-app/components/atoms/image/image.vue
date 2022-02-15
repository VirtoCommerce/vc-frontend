<template>
  <img :src="src || fallbackSrc" :alt="alt" :class="additionalClass" @error="setFallbackSrc" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: undefined,
  },

  alt: {
    type: String,
    default: undefined,
  },

  fallbackSrc: {
    type: String,
    default: "/static/images/common/no-image.svg",
  },
});

const additionalClass = ref("");

/**
 * Set fallback source when image loading error occures.
 * @param event Generic event
 */
function setFallbackSrc(event: Event): void {
  (event.target as HTMLImageElement).src = props.fallbackSrc;
  additionalClass.value = "object-scale-down object-center";
}
</script>

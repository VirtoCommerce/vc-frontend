<template>
  <img
    :src="preparedSrc"
    :alt="alt"
    :loading="isLazy ? 'lazy' : null"
    :class="[$attrs.class, { [fallbackClass]: preparedSrc === fallbackSrc }]"
    @click="!isDisabled && $emit('click', $event)"
    @error="setFallbackSrc"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { appendSuffixToFilename } from "@core/utilities";

const props = defineProps({
  /**
   * Image source.
   */
  src: {
    type: String,
    default: "",
  },

  /**
   * Image fallback source.
   */
  fallbackSrc: {
    type: String,
    default: "/static/images/common/no-image.svg",
  },

  /**
   * Additional classes added to fallback image.
   */
  fallbackClass: {
    type: String,
    default: "!object-scale-down !object-center",
  },

  /**
   * Image alt text.
   */
  alt: {
    type: String,
    default: undefined,
  },

  /**
   * Image lazy loading.
   */
  isLazy: {
    type: Boolean,
    default: false,
  },

  /**
   * Image size passed to previewer service.
   * First you need to generate thumbnails in admin panel, section "Thumbnails" (vc-module-image-tools).
   * You can also set up suffixes there.
   * @see https://github.com/VirtoCommerce/vc-module-image-tools
   */
  sizeSuffix: {
    type: String,
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
    default: undefined,
  },

  /**
   * Image disabled state. Prevents click event emission.
   */
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click", "error"]);

const preparedSrc = computed<string>(() => {
  const result = props.sizeSuffix ? appendSuffixToFilename(props.src, `_${props.sizeSuffix}`) : props.src;
  return result || props.fallbackSrc;
});

/**
 * Set fallback source when image loading error occures.
 * @param event Generic event.
 */
function setFallbackSrc(event: Event): void {
  if ((event.target as HTMLImageElement).src !== props.fallbackSrc) {
    (event.target as HTMLImageElement).src = props.fallbackSrc;
    emit("error", event);
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

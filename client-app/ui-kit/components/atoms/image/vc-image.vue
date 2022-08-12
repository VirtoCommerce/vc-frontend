<template>
  <img :src="preparedSrc" :alt="alt" :loading="lazy ? 'lazy' : null" :class="additionalClass" @error="setFallbackSrc" />
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import { appendSuffixToFilename } from "@/core/utilities";
import { configInjectionKey } from "@/core/constants";

const props = defineProps({
  lazy: Boolean,

  src: {
    type: String,
    default: "",
  },

  alt: {
    type: String,
    default: null,
  },

  fallbackSrc: {
    type: String,
    default: "/static/images/common/no-image.svg",
  },

  /**
   * First you need to generate thumbnails in admin panel, section "Thumbnails" (vc-module-image-tools).
   * You can also set up suffixes there.
   * @see https://github.com/VirtoCommerce/vc-module-image-tools
   */
  sizeSuffix: {
    type: String,
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
  },
});

const cfg = inject(configInjectionKey);

const additionalClass = ref("");

const preparedSrc = computed<string>(() => {
  const result =
    cfg?.image_tools_enabled && props.sizeSuffix
      ? appendSuffixToFilename(props.src, `_${props.sizeSuffix}`)
      : props.src;
  return result || props.fallbackSrc;
});

/**
 * Set fallback source when image loading error occures.
 * @param event Generic event
 */
function setFallbackSrc(event: Event): void {
  (event.target as HTMLImageElement).src = props.fallbackSrc;
  additionalClass.value = "object-scale-down object-center";
}

watch(preparedSrc, () => (additionalClass.value = ""));
</script>

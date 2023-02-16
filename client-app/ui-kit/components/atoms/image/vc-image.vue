<template>
  <img
    :src="preparedSrc"
    :alt="alt"
    :loading="lazy ? 'lazy' : null"
    :data-src="fallbackEnabled ? src : null"
    :data-size-suffix="fallbackEnabled || originalEnabled ? sizeSuffix : null"
    :class="{ 'object-scale-down object-center': preparedSrc === fallbackSrc }"
    @error="setFallback"
  />
</template>

<script setup lang="ts">
import { computed, inject, PropType, ref, watch } from "vue";
import { configInjectionKey } from "@/core/constants";
import { appendSuffixToFilename } from "@/core/utilities";

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
   * You can also set suffixes there.
   * @see https://github.com/VirtoCommerce/vc-module-image-tools
   */
  sizeSuffix: {
    type: String as PropType<"sm" | "md" | "lg">,
    validator: (value: string) => ["sm", "md", "lg"].includes(value),
  },
});

const cfg = inject(configInjectionKey);

const fallbackEnabled = ref(false);
const originalEnabled = ref(false);

const preparedSrc = computed<string>(() => {
  if (fallbackEnabled.value || !props.src) {
    return props.fallbackSrc;
  }

  const sizeSuffix = props.sizeSuffix ? cfg?.image_thumbnails_suffixes?.[props.sizeSuffix] : "";

  if (originalEnabled.value || !cfg?.image_thumbnails_enabled || !sizeSuffix) {
    return props.src;
  }

  return appendSuffixToFilename(props.src, `_${sizeSuffix}`);
});

/**
 * Set fallback source when image loading error occurs.
 */
function setFallback(): void {
  if (
    !originalEnabled.value &&
    props.sizeSuffix &&
    cfg?.image_thumbnails_enabled &&
    cfg?.image_thumbnails_original_fallback_enabled
  ) {
    originalEnabled.value = true;
  } else if (!fallbackEnabled.value) {
    fallbackEnabled.value = true;
    originalEnabled.value = false;
  }
}

watch(
  () => props.src + props.sizeSuffix + props.fallbackSrc,
  () => {
    fallbackEnabled.value = false;
    originalEnabled.value = false;
  }
);
</script>

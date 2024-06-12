<template>
  <img
    :src="addVersion(preparedSrc)"
    :alt="alt"
    :loading="lazy ? 'lazy' : 'eager'"
    :data-src="fallbackEnabled ? src : null"
    :data-size-suffix="fallbackEnabled || originalEnabled ? sizeSuffix : null"
    :class="{ 'object-scale-down object-center': preparedSrc === fallbackSrc }"
    @error="setFallback"
  />
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import { NO_IMAGE_URL } from "@/core/constants";
import { configInjectionKey } from "@/core/injection-keys";
import { appendSuffixToFilename } from "@/core/utilities";
import pkg from "../../../../../package.json";

export interface IProps {
  lazy?: boolean;
  src?: string;
  alt?: string;
  fallbackSrc?: string;
  cacheBusting?: boolean;
  /**
   * First you need to generate thumbnails in admin panel, section "Thumbnails" (vc-module-image-tools).
   * You can also set suffixes there.
   * @see https://github.com/VirtoCommerce/vc-module-image-tools
   */
  sizeSuffix?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  src: "",
  fallbackSrc: NO_IMAGE_URL,
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

const { version } = pkg;

function addVersion(src: string) {
  if (props.cacheBusting) {
    return `${src}?v=${version}`;
  }
  return src;
}

watch(
  () => props.src + props.sizeSuffix + props.fallbackSrc,
  () => {
    fallbackEnabled.value = false;
    originalEnabled.value = false;
  },
);
</script>

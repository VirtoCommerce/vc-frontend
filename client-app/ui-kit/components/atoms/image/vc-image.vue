<template>
  <img
    :src="preparedSrc"
    :alt="alt"
    :loading="lazy ? 'lazy' : 'eager'"
    :data-src="fallbackEnabled ? src : null"
    :data-size-suffix="fallbackEnabled || originalEnabled ? sizeSuffix : null"
    :class="['vc-image', { 'vc-image--fallback': fallbackEnabled || !src }]"
    @error="setFallback"
  />
</template>

<script setup lang="ts">
import { computed, ref, toValue, watch } from "vue";
import { useUiKitOptions } from "../../../composables/useUiKitOptions";
import { NO_IMAGE_URL } from "../../../constants";
import { appendSuffixToFilename, isFilenameOnly } from "../../../utilities";

export interface IProps {
  lazy?: boolean;
  src?: string;
  alt?: string;
  /** Shown when `src` is empty or fails to load. Default: the `uiKit` plugin's `image.fallbackSrc`, then ui-kit's `no-image.svg`. */
  fallbackSrc?: string;
  /**
   * First you need to generate thumbnails in admin panel, section "Thumbnails" (vc-module-image-tools).
   * You can also set suffixes there.
   * @see https://github.com/VirtoCommerce/vc-module-image-tools
   */
  sizeSuffix?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<IProps>(), {
  src: "",
});

const { image } = useUiKitOptions();
const thumbnails = computed(() => toValue(image?.thumbnails));
const fallbackSrc = computed(() => props.fallbackSrc || toValue(image?.fallbackSrc) || NO_IMAGE_URL);

const fallbackEnabled = ref(false);
const originalEnabled = ref(false);

const preparedSrc = computed<string>(() => {
  if (fallbackEnabled.value || !props.src) {
    return resolveFileName(fallbackSrc.value);
  }

  if (isFilenameOnly(props.src)) {
    return resolveFileName(props.src);
  }

  const sizeSuffix = props.sizeSuffix ? thumbnails.value?.suffixes?.[props.sizeSuffix] : "";

  if (originalEnabled.value || !thumbnails.value?.enabled || !sizeSuffix) {
    return props.src;
  }

  return appendSuffixToFilename(props.src, `_${sizeSuffix}`);
});

function resolveFileName(value: string): string {
  return isFilenameOnly(value) ? (image?.resolveFileName?.(value) ?? value) : value;
}

/**
 * Set fallback source when image loading error occurs.
 */
function setFallback(): void {
  if (
    !originalEnabled.value &&
    props.sizeSuffix &&
    thumbnails.value?.enabled &&
    thumbnails.value.originalFallbackEnabled
  ) {
    originalEnabled.value = true;
  } else if (!fallbackEnabled.value) {
    fallbackEnabled.value = true;
    originalEnabled.value = false;
  }
}

watch(
  () => props.src + props.sizeSuffix + fallbackSrc.value,
  () => {
    fallbackEnabled.value = false;
    originalEnabled.value = false;
  },
);
</script>

<style lang="scss">
.vc-image {
  object-fit: var(--vc-image-object-fit, fill);
  object-position: var(--vc-image-object-position, 50% 50%);

  &--fallback {
    object-fit: var(--vc-image-fallback-object-fit, var(--vc-image-object-fit, scale-down));
  }
}
</style>

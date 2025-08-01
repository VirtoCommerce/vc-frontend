<template>
  <img
    :src="preparedSrc"
    :alt="alt"
    :loading="lazy ? 'lazy' : 'eager'"
    :data-src="fallbackEnabled ? src : null"
    :data-size-suffix="fallbackEnabled || originalEnabled ? sizeSuffix : null"
    :class="{ 'object-scale-down object-center': fallbackEnabled || !src }"
    @error="setFallback"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useThemeContext } from "@/core/composables";
import { NO_IMAGE_URL } from "@/core/constants";
import { appendSuffixToFilename } from "@/core/utilities";
import { getImageUrl, isFilenameOnly } from "../../../utilities";

export interface IProps {
  lazy?: boolean;
  src?: string;
  alt?: string;
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
  fallbackSrc: NO_IMAGE_URL,
});

const { themeContext } = useThemeContext();

const fallbackEnabled = ref(false);
const originalEnabled = ref(false);

const preparedSrc = computed<string>(() => {
  if (fallbackEnabled.value || !props.src) {
    return isFilenameOnly(props.fallbackSrc) ? getImageUrl(props.fallbackSrc) : props.fallbackSrc;
  }

  if (isFilenameOnly(props.src)) {
    return getImageUrl(props.src);
  }

  const sizeSuffix =
    props.sizeSuffix && !!themeContext.value
      ? themeContext.value?.settings?.image_thumbnails_suffixes?.[props.sizeSuffix]
      : "";

  if (originalEnabled.value || !themeContext.value?.settings?.image_thumbnails_enabled || !sizeSuffix) {
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
    themeContext.value?.settings?.image_thumbnails_enabled &&
    themeContext.value?.settings?.image_thumbnails_original_fallback_enabled
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
  },
);
</script>

<template>
  <Slider class="image-carousel" :slides="slides" :title="title" :subtitle="subtitle" :height="height" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import Slider from "./slider.vue";

// synced with Page builder module config/schemas/sections/image-carousel.json
// The images control stores plain URLs or asset objects, depending on its configuration.
type ImageValueType = string | { url?: string };

interface IProps {
  images?: ImageValueType[];
  title?: string;
  subtitle?: string;
  height?: "small" | "medium" | "large" | "auto";
}

const props = withDefaults(defineProps<IProps>(), {
  images: () => [],
  height: "auto",
});

const slides = computed(() =>
  props.images
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter((image): image is string => !!image)
    .map((image) => ({ image })),
);
</script>

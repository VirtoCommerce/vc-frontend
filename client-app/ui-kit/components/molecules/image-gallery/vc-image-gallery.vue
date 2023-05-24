<template>
  <div
    ref="mainImageElement"
    class="square relative flex flex-col items-center justify-center overflow-hidden rounded-sm border border-gray-100"
  >
    <VcImage
      :src="activeSrc"
      size-suffix="md"
      class="absolute top-0 h-full w-full rounded-sm object-cover object-center"
      lazy
    />

    <slot name="badges" />
  </div>

  <div v-if="isMobile && images.length > 1" class="mt-4 flex flex-row justify-center space-x-2.5">
    <button
      v-for="(image, i) in images"
      :key="image.url || i"
      :class="{ 'bg-[color:var(--color-primary)]': image.url === activeSrc }"
      type="button"
      class="h-4 w-4 cursor-pointer rounded-full border border-[color:var(--color-primary)]"
      @click="setActiveImage(image.url)"
      @keyup.enter="setActiveImage(image.url)"
    />
  </div>

  <div v-if="!isMobile && images.length > 1" class="mt-6 grid grid-cols-3 gap-5">
    <button
      v-for="(image, i) in images"
      :key="image.url || i"
      type="button"
      @click="setActiveImage(image.url)"
      @keyup.enter="setActiveImage(image.url)"
    >
      <span
        class="square relative flex cursor-pointer flex-col items-center justify-center rounded-sm border border-gray-100 hover:ring hover:ring-[color:var(--color-primary-hover)]"
        :class="{
          'ring ring-[color:var(--color-primary)]': image.url === activeSrc,
        }"
      >
        <VcImage
          :src="image.url"
          :alt="image.name"
          size-suffix="sm"
          class="absolute top-0 h-full w-full rounded-sm object-cover object-center"
          lazy
        />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useSwipe } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import type { ImageType, Product } from "@/xapi/types";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const mainImageElement = ref<HTMLElement | null>(null);
const activeSrc = ref("");

const images = computed<ImageType[]>(() => props.product.images ?? []);

function setActiveImage(url?: string) {
  activeSrc.value = url || "";
}

useSwipe(mainImageElement, {
  onSwipeEnd: (e, direction) => {
    if (direction !== "left" && direction !== "right" && images.value.length < 2) {
      return;
    }

    const activeImageIndex = images.value.findIndex((x) => x.url === activeSrc.value);

    if (direction === "left" && activeImageIndex < images.value.length - 1) {
      const newActiveImageIndex = activeImageIndex + 1;
      activeSrc.value = images.value[newActiveImageIndex]?.url ?? "";
    }

    if (direction === "right" && activeImageIndex > 0) {
      const newActiveImageIndex = activeImageIndex - 1;
      activeSrc.value = images.value[newActiveImageIndex]?.url ?? "";
    }
  },
});

watchEffect(() => {
  activeSrc.value = props.product.imgSrc ?? "";
});
</script>

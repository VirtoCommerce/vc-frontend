<template>
  <div
    ref="mainImageElement"
    class="vc-image-gallery square relative flex flex-col overflow-hidden rounded-sm border border-gray-100"
    data-te-lightbox-init
  >
    <template v-if="images.length > 1">
      <VcImage
        v-for="(image, i) in images"
        :key="image.url || i"
        :src="image.url"
        size-suffix="md"
        class="vc-image-gallery__main-image absolute top-0 h-full w-full cursor-zoom-in rounded-sm object-cover object-center data-[te-lightbox-disabled]:cursor-auto"
        :class="{ hidden: image.url !== activeSrc }"
        lazy
      />
    </template>

    <VcImage
      v-else
      :src="activeSrc"
      :data-te-img="activeSrc"
      size-suffix="md"
      class="vc-image-gallery__main-image absolute top-0 h-full w-full cursor-pointer rounded-sm object-cover object-center"
    />

    <div
      class="vc-image-gallery__hover-bg absolute top-0 h-full w-full cursor-pointer rounded-sm object-cover object-center"
      :data-te-img="activeSrc"
      :src="activeSrc"
    >
      <VcIcon class="vc-image-gallery__hover-bg__icon text-[--color-accent-950]" name="search" size="xxl" />
    </div>

    <slot name="badges" />
  </div>

  <template v-if="images.length > 1">
    <div class="mt-3 flex flex-wrap justify-center gap-x-2.5 gap-y-1 print:hidden lg:hidden">
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

    <div class="mt-6 hidden grid-cols-3 gap-5 print:grid print:ps-1 lg:grid">
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
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useSwipe } from "@vueuse/core";
import { Lightbox, initTE } from "tw-elements";
import { computed, ref, watchEffect, onMounted } from "vue";
import type { ImageType, Product } from "@/core/api/graphql/types";

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

onMounted(() => {
  initTE({ Lightbox });
});
</script>

<style scoped lang="scss">
.vc-image-gallery {
  $hover: "";

  &:hover {
    $hover: &;
  }

  &__main-image {
    z-index: 2;
    opacity: 1;
    transition: 0.5s ease;
    backface-visibility: hidden;

    #{$hover} & {
      opacity: 0.5;
    }
  }

  &__hover-bg {
    z-index: 1;
    transition: 0.3s ease;
    opacity: 0;

    #{$hover} & {
      opacity: 1;
    }

    &__icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      text-align: center;
    }
  }
}
</style>

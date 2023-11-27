<template>
  <div ref="mainImageElement" class="vc-image-gallery" data-te-lightbox-init>
    <template v-if="images.length > 1">
      <VcImage
        v-for="(image, i) in images"
        :key="image.url || i"
        :src="image.url"
        size-suffix="md"
        class="vc-image-gallery__main-image"
        :class="{ hidden: image.url !== activeSrc }"
        lazy
      />
    </template>

    <VcImage v-else :src="activeSrc" :data-te-img="activeSrc" size-suffix="md" class="vc-image-gallery__main-image" />

    <div class="vc-image-gallery__hover-bg" :data-te-img="activeSrc" :src="activeSrc">
      <VcIcon class="vc-image-gallery__search-icon" name="search" size="xxl" />
    </div>

    <slot name="badges" />
  </div>

  <template v-if="images.length > 1">
    <div class="vc-image-gallery__mobile-dots">
      <button
        v-for="(image, i) in images"
        :key="image.url || i"
        type="button"
        class="vc-image-gallery__mobile-dot"
        :class="{ 'vc-image-gallery__mobile-dot--active': image.url === activeSrc }"
        @click="setActiveImage(image.url)"
        @keyup.enter="setActiveImage(image.url)"
      />
    </div>

    <div class="vc-image-gallery__images">
      <button
        v-for="(image, i) in images"
        :key="image.url || i"
        type="button"
        @click="setActiveImage(image.url)"
        @keyup.enter="setActiveImage(image.url)"
      >
        <span
          class="vc-image-gallery__image-wrapper"
          :class="{ 'vc-image-gallery__image-wrapper--active': image.url === activeSrc }"
        >
          <VcImage :src="image.url" :alt="image.name" size-suffix="sm" class="vc-image-gallery__image" lazy />
        </span>
      </button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useSwipe } from "@vueuse/core";
import { computed, ref, watchEffect, onMounted } from "vue";
import type { ImageType, Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

console.warn("[UIKit][warn] VcImageGallery is deprecated, use Swiper instead.");

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

onMounted(async () => {
  // Dynamic import is required to avoid SSR errors
  // SSR is used to generate routes.json
  // https://virtocommerce.atlassian.net/browse/ST-5051
  const twElements = await import("tw-elements");
  twElements.initTE({ Lightbox: twElements.Lightbox });
});
</script>

<style scoped lang="scss">
.vc-image-gallery {
  $hover: "";

  @apply pb-[100%] relative flex flex-col overflow-hidden rounded-sm border border-gray-100;

  &:hover {
    $hover: &;
  }

  &__main-image {
    @apply duration-300 ease-linear z-[2] opacity-100 absolute top-0 h-full w-full cursor-zoom-in rounded-sm object-cover object-center;

    #{$hover} & {
      @apply opacity-50;
    }
  }

  &__hover-bg {
    @apply z-[1] duration-300 ease-linear opacity-0 absolute top-0 h-full w-full cursor-pointer rounded-sm object-cover object-center;
    opacity: 0;

    #{$hover} & {
      @apply opacity-100;
    }
  }

  &__search-icon {
    @apply top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]  absolute text-[--color-accent-950] text-center;
  }

  &__mobile-dots {
    @apply mt-3 flex flex-wrap justify-center gap-x-2.5 gap-y-1 print:hidden lg:hidden;
  }

  &__mobile-dot {
    @apply h-4 w-4 cursor-pointer rounded-full border border-[color:var(--color-primary)];

    &--active {
      @apply bg-[color:var(--color-primary)];
    }
  }

  &__images {
    @apply mt-6 hidden grid-cols-3 gap-5 print:grid print:ps-1 lg:grid;
  }

  &__image-wrapper {
    @apply pb-[100%] relative flex cursor-pointer flex-col items-center justify-center rounded-sm border border-gray-100 hover:ring hover:ring-[color:var(--color-primary-hover)];

    &--active {
      @apply ring ring-[color:var(--color-primary)];
    }
  }

  &__image {
    @apply absolute top-0 h-full w-full rounded-sm object-cover object-center;
  }
}
</style>

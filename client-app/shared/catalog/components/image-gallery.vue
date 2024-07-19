<template>
  <div :id="componentId" class="image-gallery">
    <div class="image-gallery__images-container">
      <template v-if="images?.length">
        <div class="image-gallery__bg">
          <VcIcon class="image-gallery__icon" name="search" size="xxl" />
        </div>

        <Swiper
          class="image-gallery__images"
          :modules="modules"
          :thumbs="{ swiper: thumbsSwiper }"
          :breakpoints="{
            [xlScreenWidth]: {
              pagination: false,
            },
          }"
          :loop="images.length > 1"
          :pagination="{
            clickable: true,
            el: `#${componentId} [data-nav-pagination]`,
          }"
          data-te-lightbox-init
          @swiper="setImagesSwiper"
          @slide-change="setActiveIndex"
        >
          <SwiperSlide v-for="(image, i) in images" :key="image.url || i">
            <VcImage
              class="image-gallery__img"
              :src="image.url"
              :alt="image.name"
              :data-te-img="image.url"
              size-suffix="md"
              lazy
            />
          </SwiperSlide>
        </Swiper>
      </template>

      <!-- no-image -->
      <VcImage v-else class="image-gallery__img" />

      <div class="image-gallery__badges">
        <slot name="badges" />
      </div>
    </div>

    <VcCarouselPagination v-if="showPagination" class="image-gallery__pagination" data-nav-pagination size="sm" />

    <div v-show="showThumbs" class="image-gallery__thumbs-container">
      <VcNavButton :label="$t('common.buttons.previous')" size="xs" direction="left" data-nav-prev />

      <Swiper
        class="image-gallery__thumbs"
        :slides-per-view="THUMBS_PER_VIEW"
        :slides-per-group="THUMBS_PER_VIEW"
        :modules="modules"
        :navigation="{
          prevEl: `#${componentId} [data-nav-prev]`,
          nextEl: `#${componentId} [data-nav-next]`,
        }"
        :loop="showThumbs && images.length > THUMBS_PER_VIEW"
        watch-slides-progress
        @swiper="setThumbsSwiper"
      >
        <SwiperSlide v-for="(image, index) in images" :key="index" class="image-gallery__thumb">
          <VcImage
            :class="[
              'image-gallery__thumb-img',
              {
                'image-gallery__thumb-img--active': activeIndex === index,
              },
            ]"
            :src="image.url"
            size-suffix="sm"
            lazy
          />
        </SwiperSlide>
      </Swiper>

      <VcNavButton :label="$t('common.buttons.next')" size="xs" direction="right" data-nav-next />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { Pagination, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { ref, onMounted, computed, getCurrentInstance } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import { extractNumberFromString } from "@/core/utilities";
import type { ImageType } from "@/core/api/graphql/types";
import type SwiperCore from "swiper";

interface IProps {
  images?: ImageType[];
}

const props = withDefaults(defineProps<IProps>(), {
  images: () => [],
});

const componentId = `image-gallery_${getCurrentInstance()!.uid}`;

const THUMBS_PER_VIEW = 4;

const breakpoints = useBreakpoints(BREAKPOINTS);
const isDesktop = breakpoints.greaterOrEqual("xl");
const xlScreenWidth = extractNumberFromString(BREAKPOINTS.xl);

const activeIndex = ref(0);

const imagesSwiper = ref<SwiperCore | null>(null);
const setImagesSwiper = (swiper: SwiperCore) => {
  imagesSwiper.value = swiper;
};

const thumbsSwiper = ref<SwiperCore | null>(null);
const setThumbsSwiper = (swiper: SwiperCore) => {
  thumbsSwiper.value = swiper;
};

const modules = [Pagination, Navigation, Thumbs];

const showThumbs = computed(() => isDesktop.value && props.images?.length > 1);

const showPagination = computed(() => !isDesktop.value && props.images?.length > 1);

function setActiveIndex() {
  activeIndex.value = imagesSwiper.value?.realIndex ?? 0;
}

onMounted(async () => {
  // Dynamic import is required to avoid SSR errors
  // SSR is used to generate routes.json
  // https://virtocommerce.atlassian.net/browse/ST-5051
  const { initTE, Lightbox } = await import("tw-elements");
  initTE({ Lightbox });
});
</script>

<style scoped lang="scss">
.image-gallery {
  @apply select-none;

  &__images-container {
    @apply relative border rounded aspect-square;
  }

  &__bg {
    @apply absolute inset-0 flex items-center justify-center object-cover object-center;
  }

  &__images {
    @apply w-full h-full bg-[--color-additional-50] rounded duration-300 ease-linear;

    &:hover {
      @apply opacity-50;
    }
  }

  &__img {
    @apply relative w-full h-full rounded object-center object-contain cursor-zoom-in;
  }

  &__badges {
    @apply absolute inset-0;
  }

  &__pagination {
    @apply mt-5;
  }

  &__thumbs-container {
    @apply flex justify-between items-center mt-3.5;
  }

  &__thumbs {
    @apply p-px w-[77%];
  }

  &__thumb {
    @apply p-1.5 aspect-square cursor-pointer;
  }

  &__thumb-img {
    @apply border rounded-sm w-full h-full object-center object-contain;

    &--active {
      @apply border-[--color-primary-500] outline outline-1 outline-[--color-primary-500];
    }
  }
}
</style>

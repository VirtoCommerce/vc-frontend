<template>
  <div class="vc-product-image">
    <Swiper
      v-if="images?.length > 1"
      :modules="[Pagination, Navigation]"
      :navigation="{
        nextEl: '[data-btn=btn-next]',
        prevEl: '[data-btn=btn-prev]',
        lockClass: '!hidden',
      }"
      class="vc-product-image__carousel"
      rewind
      @swiper="swiperInstance = $event"
      @slide-change="slideChanged"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index">
        <VcImage
          :src="image.url"
          :alt="alt"
          size-suffix="md"
          :class="{ 'cursor-pointer': swiperInstance?.allowSlideNext }"
          class="vc-product-image__carousel-img"
          :lazy="lazy || index > 0"
          @click="swiperInstance?.slideNext()"
        />
      </SwiperSlide>

      <template #container-end>
        <!-- Prev button -->
        <button
          type="button"
          class="vc-product-image__carousel-btn vc-product-image__carousel-btn--prev"
          data-btn="btn-prev"
        >
          <span class="vc-product-image__carousel-arrow">
            <VcIcon class="fill-neutral-400" name="chevron-left" size="xs" />
          </span>
        </button>

        <!-- Next button -->
        <button
          type="button"
          class="vc-product-image__carousel-btn vc-product-image__carousel-btn--next"
          data-btn="btn-next"
        >
          <span class="vc-product-image__carousel-arrow">
            <VcIcon class="fill-neutral-400" name="chevron-right" size="xs" />
          </span>
        </button>

        <!-- Bullets -->
        <div v-if="images.length > 1" class="vc-product-image__carousel-bullets">
          <template v-for="(state, index) in swiperBulletsState" :key="index">
            <span
              v-if="index !== 1 || images.length !== 2"
              :class="[
                'vc-product-image__carousel-bullet',
                {
                  'vc-product-image__carousel-bullet--active': state,
                },
              ]"
            />
          </template>
        </div>
      </template>
    </Swiper>

    <component :is="to ? 'router-link' : 'div'" v-else :to="to" class="contents">
      <VcImage :src="images[0]?.url ?? imgSrc" :alt="alt" size-suffix="md" class="vc-product-image__img" :lazy="lazy" />
    </component>

    <span v-if="!!$slots.default" class="vc-product-image__slot">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { ref } from "vue";
import type { ImageType } from "@/core/api/graphql/types";
import type { Swiper as SwiperInstance } from "swiper/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  images?: ImageType[];
  alt?: string;
  imgSrc?: string;
  lazy?: boolean;
  to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<IProps>(), {
  images: () => [],
  lazy: true,
  to: "",
});

const swiperInstance = ref<SwiperInstance>();
const swiperBulletsState = ref<boolean[]>([true, false, false]);

function slideChanged(swiper: SwiperInstance) {
  const activeIndex: number = swiper.activeIndex;
  const lastIndex: number = props.images?.length ? props.images.length - 1 : 0;

  if (!activeIndex) {
    // first bullet active
    swiperBulletsState.value = [true, false, false];
  } else if (activeIndex === lastIndex) {
    // last bullet active
    swiperBulletsState.value = [false, false, true];
  } else {
    // middle bullet active
    swiperBulletsState.value = [false, true, false];
  }
}
</script>

<style lang="scss">
.vc-product-image {
  $self: &;
  $carouselImg: "";
  $img: "";

  @apply relative z-0 max-w-full aspect-square border border-neutral-200 rounded;

  &__carousel {
    @apply h-full w-full;
  }

  &__carousel-img {
    $carouselImg: &;

    @apply w-full aspect-square select-none rounded object-contain object-center;
  }

  &__carousel-btn {
    @apply absolute top-0 z-[2] hidden h-full cursor-pointer items-center opacity-0 transition-opacity hover:opacity-100 md:flex;

    &--prev {
      @apply left-0 pl-1 pr-5;
    }

    &--next {
      @apply right-0 pr-1 pl-5;
    }
  }

  &__carousel-arrow {
    @apply flex h-6 w-6 items-center justify-center rounded-full bg-additional-50;
  }

  &__carousel-bullets {
    @apply absolute bottom-0 left-0 z-[1] flex w-full justify-center gap-1 py-2;
  }

  &__carousel-bullet {
    @apply inline-block h-2 w-2 rounded-full border box-border border-neutral-400 bg-additional-50;

    &--active {
      @apply border-neutral-400 bg-neutral-400 outline outline-[1px] outline-additional-50;
    }
  }

  &__img {
    $img: &;
    @apply w-full aspect-square rounded object-contain object-center;
  }

  &__slot {
    @apply absolute inset-0;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: image;

      @apply self-start place-content-stretch;
    }

    &--view-mode {
      &--grid {
        #{$self} {
          @apply mb-4 aspect-[220/196];
        }

        #{$carouselImg} {
          @apply aspect-[220/196];
        }

        #{$img} {
          @apply aspect-[220/196];
        }
      }

      &--list #{$self} {
        @apply size-[4.5rem];

        @container (min-width: theme("containers.xl")) {
          @apply me-3 size-[5.375rem];
        }
      }

      &--item #{$self} {
        @apply size-[4.5rem];

        @container (min-width: theme("containers.2xl")) {
          @apply me-3 size-16;
        }
      }
    }
  }
}
</style>

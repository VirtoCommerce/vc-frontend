<template>
  <div class="vc-carousel">
    <div class="vc-carousel__wrapper" :class="{ 'px-12': navigation }">
      <Swiper
        :modules="modules"
        :navigation="navigationParams"
        :pagination="paginationParams"
        v-bind="attrs"
        v-on="listeners"
        class="w-full"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <slot name="slide" v-bind="{ slide, index }">
            {{ slide }}
          </slot>
        </SwiperSlide>
      </Swiper>

      <!-- Navigation buttons-->
      <div class="vc-carousel__navigation" v-show="navigation">
        <div class="vc-carousel__btn vc-carousel__btn--prev">
          <i class="fas fa-chevron-left -ml-px text-xl" />
        </div>

        <div class="vc-carousel__btn vc-carousel__btn--next">
          <i class="fas fa-chevron-right -mr-px text-xl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable import/no-unresolved */
import { computed, PropType } from "vue";
import { Pagination, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { NavigationOptions, PaginationOptions } from "swiper/types";
import { CarouselOptions } from "@/components";
import _ from "lodash";

const props = defineProps({
  slides: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  options: {
    type: Object as PropType<CarouselOptions>,
    default: () => ({}),
  },

  navigation: {
    type: Boolean,
    default: false,
  },

  pagination: {
    type: Boolean,
    default: false,
  },
});

const modules = [Pagination, Navigation];

const listeners = computed(() => props.options.on ?? {});

const attrs = computed(() => {
  const options = _.clone(props.options);
  delete options.on;
  return options;
});

const navigationParams = computed<NavigationOptions | boolean>(() =>
  props.navigation
    ? {
        prevEl: ".vc-carousel__btn--prev",
        nextEl: ".vc-carousel__btn--next",
        lockClass: "vc-carousel__btn--lock",
        hiddenClass: "vc-carousel__btn--hidden",
        disabledClass: "vc-carousel__btn--disabled",
      }
    : false
);

const paginationParams = computed<PaginationOptions | boolean>(() =>
  props.pagination
    ? {
        clickable: true,
      }
    : false
);
</script>

<style lang="scss">
@import "swiper/scss";
@import "swiper/scss/pagination";

.vc-carousel {
  --navigation-size: 36px;
  --navigation-offset: 0px;
  --pagination-offset: -5px;

  --swiper-theme-color: var(--color-primary);
  --swiper-pagination-bullet-size: 13px;
  --swiper-pagination-bullet-inactive-color: transparent;
  --swiper-pagination-bullet-inactive-opacity: 1;

  &__wrapper {
    @apply relative w-full grid grid-cols-1;
  }

  &__navigation {
    @apply absolute w-full h-full;
  }

  &__btn {
    @apply absolute flex items-center justify-center text-primary rounded border-2 border-primary cursor-pointer;

    top: 50%;
    z-index: 10;
    width: var(--navigation-size);
    height: var(--navigation-size);
    margin-top: calc(0px - (var(--navigation-size) / 2) - var(--navigation-offset));

    &--prev {
      left: 0;
    }

    &--next {
      right: 0;
    }

    &--disabled {
      @apply cursor-auto pointer-events-none opacity-30;
    }

    &--lock {
      display: none;
    }
  }

  .swiper-pagination-fraction,
  .swiper-pagination-custom,
  .swiper-horizontal > .swiper-pagination-bullets,
  .swiper-pagination-bullets.swiper-pagination-horizontal {
    bottom: var(--pagination-offset);
  }

  .swiper-pagination-bullet {
    @apply border-2 border-primary;
  }
}
</style>

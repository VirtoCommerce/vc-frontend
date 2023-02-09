<template>
  <div :id="componentId" :class="['vc-carousel', { 'vc-carousel--navigation': navigation }]">
    <div class="vc-carousel__wrapper">
      <Swiper
        :modules="modules"
        :navigation="navigationParams"
        :pagination="paginationParams"
        v-bind="attrs"
        class="w-full"
        v-on="listeners"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <slot name="slide" v-bind="{ slide, index }">
            {{ slide }}
          </slot>
        </SwiperSlide>
      </Swiper>

      <!-- Navigation buttons-->
      <div v-if="navigation" class="vc-carousel__navigation">
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
import { computed, getCurrentInstance, PropType } from "vue";
import { Pagination, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue"; // eslint-disable-line import/no-unresolved
import { NavigationOptions, PaginationOptions } from "swiper/types";
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

const componentId = `vc-carousel_${getCurrentInstance()!.uid}`;
const modules = [Pagination, Navigation];

const listeners = computed(() => props.options.on ?? {});

const attrs = computed<Omit<CarouselOptions, "on">>(() => {
  const options = _.clone(props.options);
  delete options.on;
  return options;
});

const navigationParams = computed<NavigationOptions | boolean>(() =>
  props.navigation
    ? {
        prevEl: `#${componentId} .vc-carousel__btn--prev`,
        nextEl: `#${componentId} .vc-carousel__btn--next`,
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
.vc-carousel {
  $self: &;

  --navigation-size: 36px;
  --navigation-offset: 0px;
  --pagination-offset: -5px;

  --swiper-pagination-bullet-size: 13px;
  --swiper-pagination-bullet-inactive-color: transparent;
  --swiper-pagination-bullet-inactive-opacity: 1;

  &__wrapper {
    @apply relative w-full;
  }

  &--navigation {
    #{$self}__wrapper {
      @apply px-12;
    }
  }

  &__navigation {
    @apply absolute w-full h-full top-0 -mx-12;
  }

  &__btn {
    @apply absolute top-1/2 z-10 w-[var(--navigation-size)] h-[var(--navigation-size)]
    flex items-center justify-center text-[color:var(--color-primary)] rounded
    border-2 border-[color:var(--color-primary)] cursor-pointer;

    margin-top: calc(0px - (var(--navigation-size) / 2) - var(--navigation-offset));

    &--prev {
      @apply left-0;
    }

    &--next {
      @apply right-0;
    }

    &--disabled {
      @apply cursor-auto pointer-events-none opacity-30;
    }

    &--lock {
      @apply hidden;
    }
  }

  .swiper-pagination-fraction,
  .swiper-pagination-custom,
  .swiper-horizontal > .swiper-pagination-bullets,
  .swiper-pagination-bullets.swiper-pagination-horizontal {
    bottom: var(--pagination-offset, 0);
  }

  .swiper-pagination-bullet {
    @apply border-2 border-[color:var(--color-primary)];
  }
}
</style>

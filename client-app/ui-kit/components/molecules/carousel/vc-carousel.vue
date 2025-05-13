<template>
  <div :id="componentId" :class="['vc-carousel', { 'vc-carousel--navigation': navigation }]">
    <div class="vc-carousel__wrapper">
      <Swiper
        :modules="modules"
        :navigation="navigationParams"
        :pagination="paginationParams"
        v-bind="attrs"
        v-on="listeners"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index" class="!h-auto">
          <slot name="slide" v-bind="{ slide, index }">
            {{ slide }}
          </slot>
        </SwiperSlide>
      </Swiper>

      <!-- Navigation buttons-->
      <template v-if="navigation">
        <div class="vc-carousel__btn vc-carousel__btn--prev">
          <VcIcon name="chevron-left" data-nav="next" :size="24" />
        </div>

        <div class="vc-carousel__btn vc-carousel__btn--next">
          <VcIcon name="chevron-right" :size="24" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import _ from "lodash";
import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, getCurrentInstance } from "vue";
import type { NavigationOptions, PaginationOptions, SwiperEvents } from "swiper/types";

const props = withDefaults(
  defineProps<{
    slides?: T[];
    options?: CarouselOptions;
    navigation?: boolean;
    pagination?: boolean;
  }>(),
  {
    slides: () => [],
    options: () => ({}),
  },
);

const componentId = `vc-carousel_${getCurrentInstance()!.uid}`;
const modules = [Pagination, Navigation];

const listeners = computed<SwiperEvents>(() => props.options.on ?? ({} as SwiperEvents));

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
    : false,
);

const paginationParams = computed<PaginationOptions | boolean>(() =>
  props.pagination
    ? {
        clickable: true,
      }
    : false,
);
</script>

<style lang="scss">
.vc-carousel {
  --pagination-offset: -5px;

  --swiper-pagination-bullet-size: 13px;
  --swiper-pagination-bullet-inactive-color: transparent;
  --swiper-pagination-bullet-inactive-opacity: 1;

  &__wrapper {
    @apply relative max-w-full;
  }

  &__btn {
    @apply z-10 absolute flex items-center justify-center w-14 h-14 rounded-full bg-additional-50 text-primary shadow-xl cursor-pointer;

    top: calc(50% - 1.75rem);

    &--prev {
      @apply -left-5;
    }

    &--next {
      @apply -right-5;
    }

    &--disabled {
      @apply text-neutral-300 cursor-auto pointer-events-none;
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
    @apply border-2 border-primary;
  }
}
</style>

<template>
  <div :id="componentId" :class="wrapperClasses">
    <div class="relative mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div v-if="model.title" class="mb-6 text-center text-2xl font-bold lg:text-5xl">{{ model.title }}</div>
      <div v-if="model.subtitle" class="text-center text-base">{{ model.subtitle }}</div>
      <Swiper :slides-per-view="1" class="w-full" :modules="modules" :navigation="navigationOptions">
        <SwiperSlide v-for="(item, index) in model.slides" :key="index" class="text-center">
          <div>
            <VcImage :src="item.image" class="place-items-center" lazy />
            <div v-if="item.title" class="mb-3 font-roboto-condensed text-2xl font-bold uppercase">
              {{ item.title }}
            </div>
            <div v-if="item.text" class="text-sm">{{ item.text }}</div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div class="vc-slider__navigation">
        <div class="vc-slider__btn vc-slider__btn--prev">
          <i class="fas fa-chevron-left -ml-px text-xl" />
        </div>

        <div class="vc-slider__btn vc-slider__btn--next">
          <i class="fas fa-chevron-right -mr-px text-xl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue"; // eslint-disable-line import/no-unresolved
import { computed, getCurrentInstance } from "vue";

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}>();

const componentId = `vc-slider_${getCurrentInstance()!.uid}`;

const navigationOptions = {
  prevEl: `#${componentId} .vc-slider__btn--prev`,
  nextEl: `#${componentId} .vc-slider__btn--next`,
  lockClass: "vc-slider__btn--lock",
  hiddenClass: "vc-slider__btn--hidden",
  disabledClass: "vc-slider__btn--disabled",
};

const modules = [Navigation];

const wrapperClasses = computed(() => {
  return {
    [props.model.background]: true,
    "py-10 lg:py-24": props.model.title || props.model.subtitle,
  };
});
</script>

<style lang="scss" scoped>
.vc-slider {
  $self: &;

  --navigation-size: 36px;
  --navigation-offset: 0px;

  &__navigation {
    @apply absolute w-full h-full top-0 -mx-12;
  }

  &__btn {
    @apply absolute top-1/2 z-10 w-[var(--navigation-size)] h-[var(--navigation-size)]
    flex items-center justify-center text-[color:var(--color-primary)] cursor-pointer;

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
}
</style>

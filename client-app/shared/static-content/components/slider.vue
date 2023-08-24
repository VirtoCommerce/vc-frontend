<template>
  <div :id="componentId" :class="wrapperClasses">
    <div class="relative mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div v-if="modelWithDefaults.title" class="mb-6 text-center text-2xl font-bold lg:text-5xl">
        {{ modelWithDefaults.title }}
      </div>
      <div v-if="modelWithDefaults.subtitle" class="text-center text-base">{{ modelWithDefaults.subtitle }}</div>
      <Swiper :slides-per-view="1" class="w-full" :modules="modules" :navigation="navigationOptions">
        <SwiperSlide v-for="(item, index) in modelWithDefaults.slides" :key="index" class="text-center">
          <div :style="{ height: imageHeight }">
            <VcImage :src="item.image" class="vc-slider__image" :lazy="index > 0" />
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
import { useBreakpoints } from "@vueuse/core/index";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, getCurrentInstance } from "vue";
import { BREAKPOINTS } from "@/core/constants";

type BreakpointsType = keyof typeof BREAKPOINTS;

// synced with config/schemas/sections/slider.json
type SlideHeightType = "small" | "medium" | "large" | "auto";

type FixedHeightsType = { [K in Exclude<SlideHeightType, "auto">]: { [V in BreakpointsType]: number } };
type SlideType = {
  image: string;
  text: string;
  title: string;
};

type ModelType = {
  height: SlideHeightType;
  background: string;
  slides?: SlideType[];
  title?: string;
  subtitle?: string;
};
interface IProps {
  model?: ModelType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>;
}

const props = defineProps<IProps>();

const DEFAULT_MODEL: ModelType = {
  height: "small",
  background: "bg-gray-100",
};

// props withDefaults not working. props.model totally replaced by object from page builder and defaults erased
const modelWithDefaults = computed(() => {
  return Object.assign(DEFAULT_MODEL, props.model);
});

const breakpoints = useBreakpoints(BREAKPOINTS);

const FIXED_HEIGHTS: FixedHeightsType = {
  small: { xs: 250, sm: 250, md: 400, lg: 400, xl: 450, "2xl": 450 },
  medium: { xs: 300, sm: 300, md: 450, lg: 450, xl: 500, "2xl": 500 },
  large: { xs: 350, sm: 350, md: 500, lg: 500, xl: 550, "2xl": 550 },
};

const imageHeight = computed(() => {
  const currentBreakpoint = (breakpoints.current().value.at(-1) || "xs") as BreakpointsType;
  const slideHeight = modelWithDefaults.value.height;

  return slideHeight === "auto" ? "auto" : `${FIXED_HEIGHTS[slideHeight][currentBreakpoint]}px`;
});

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
    [modelWithDefaults.value.background]: true,
    "py-10 lg:py-24": modelWithDefaults.value.title || modelWithDefaults.value.subtitle,
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

  &__image {
    @apply w-full h-full object-cover object-left;
  }
}
</style>

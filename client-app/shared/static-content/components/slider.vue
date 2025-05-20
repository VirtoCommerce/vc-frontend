<template>
  <div :data-component-id="componentId" :class="wrapperClasses">
    <div class="relative mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div v-if="title" class="mb-6 text-center text-2xl font-bold lg:text-5xl">
        {{ title }}
      </div>
      <div v-if="subtitle" class="mb-7 text-center text-base">{{ subtitle }}</div>
      <div class="relative">
        <Swiper
          :slides-per-view="1"
          :space-between="1"
          class="w-full"
          :modules="modules"
          :navigation="navigationOptions"
        >
          <SwiperSlide v-for="(item, index) in slides" :key="index" class="text-center">
            <component
              :is="item.url ? getLinkTag(item.url) : 'div'"
              class="vc-slider__image-wrap"
              v-bind="getLinkAttr(item)"
            >
              <VcImage
                :src="item.image"
                :aria-label="item.title ?? $t('common.labels.slider_image')"
                :lazy="index > 0"
                class="vc-slider__image"
              />
            </component>
            <div v-if="item.title" class="my-3 text-2xl font-bold uppercase">
              {{ item.title }}
            </div>
            <div v-if="item.text" class="text-sm">{{ item.text }}</div>
          </SwiperSlide>
        </Swiper>
        <div class="vc-slider__navigation">
          <div class="vc-slider__btn vc-slider__btn--prev">
            <VcIcon class="-ml-px" name="chevron-left" />
          </div>

          <div class="vc-slider__btn vc-slider__btn--next">
            <VcIcon class="-mr-px" name="chevron-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, getCurrentInstance } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import type { BreakpointsType } from "@/core/constants";

// synced with Page builder module config/schemas/sections/slider.json and builder.io builderIOComponents
type SlideHeightType = "small" | "medium" | "large" | "auto";

type SlideType = {
  image: string;
  text?: string;
  title?: string;
  url?: string;
};
interface IProps {
  id?: string;
  height?: SlideHeightType;
  background?: string;
  slides?: SlideType[];
  title?: string;
  subtitle?: string;
  isTransparent?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  height: "auto",
  background: "bg-neutral-100",
});

const breakpoints = useBreakpoints(BREAKPOINTS);

type FixedHeightsType = { [K in Exclude<SlideHeightType, "auto">]: { [V in BreakpointsType]: number } };

const FIXED_HEIGHTS: FixedHeightsType = {
  small: { xs: 250, sm: 250, md: 400, lg: 400, xl: 450, "2xl": 450 },
  medium: { xs: 300, sm: 300, md: 450, lg: 450, xl: 500, "2xl": 500 },
  large: { xs: 350, sm: 350, md: 500, lg: 500, xl: 550, "2xl": 550 },
};

const imageHeight = computed(() => {
  const currentBreakpoint = breakpoints.current().value.at(-1) || "xs";

  return props.height === "auto" ? "auto" : `${FIXED_HEIGHTS[props.height][currentBreakpoint]}px`;
});

const componentId = computed(() => {
  return getCurrentInstance()?.uid;
});

const navigationOptions = computed(() => {
  return {
    prevEl: `[data-component-id="${componentId.value}"] .vc-slider__btn--prev`,
    nextEl: `[data-component-id="${componentId.value}"] .vc-slider__btn--next`,
    lockClass: "vc-slider__btn--lock",
    hiddenClass: "vc-slider__btn--hidden",
    disabledClass: "vc-slider__btn--disabled",
  };
});

const modules = [Navigation];

const wrapperClasses = computed(() => {
  return {
    [props.background]: !props.isTransparent,
    "py-10 lg:py-24": props.title || props.subtitle,
  };
});

function getLinkTag(url: string) {
  if (url.startsWith("/")) {
    return "router-link";
  } else {
    return "a";
  }
}

function getLinkAttr(item: SlideType) {
  if (!item.url) {
    return {};
  }
  if (item.url.startsWith("/")) {
    return { to: item.url, title: item.title };
  } else {
    return { href: item.url, title: item.title, target: "_blank" };
  }
}
</script>

<style lang="scss" scoped>
.vc-slider {
  $self: &;

  --navigation-size: 36px;
  --navigation-offset: 0px;

  &__btn {
    @apply absolute top-1/2 z-10 w-[var(--navigation-size)] h-[var(--navigation-size)]
    flex items-center justify-center text-primary cursor-pointer;

    margin-top: calc(0px - (var(--navigation-size) / 2) - var(--navigation-offset));

    &--prev {
      @apply -left-5 md:-left-10 -translate-y-1/2;
    }

    &--next {
      @apply -right-5 md:-right-10 -translate-y-1/2;
    }

    &--disabled {
      @apply cursor-auto pointer-events-none opacity-30;
    }

    &--lock {
      @apply hidden;
    }
  }

  &__image-wrap {
    height: v-bind(imageHeight);
  }

  &__image {
    @apply w-full h-full object-cover object-left;
  }
}
</style>

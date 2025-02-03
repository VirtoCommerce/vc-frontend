<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container--no-padding': noPadding,
        'vc-container--loading': loading,
      },
    ]"
  >
    <div v-if="hasBgImage" class="vc-container__bg" v-html="bgImageRaw"></div>

    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import bgImageRaw from "../../../images/main-bg.svg?raw";
import { getColorValue } from "../../../utilities";

interface IProps {
  loading?: boolean;
  maxWidth?: string;
  bgColor?: string;
  hasBgImage?: boolean;
  noPadding?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  maxWidth: "",
  bgColor: "",
  hasBgImage: true,
});

const _bgColor = computed(() => getColorValue(props.bgColor));
</script>

<style lang="scss">
.vc-container {
  --props-max-width: v-bind(props.maxWidth);
  --props-bg-color: v-bind(_bgColor);

  --max-width: var(--props-max-width, var(--vc-container-max-width, 87.75rem));
  --bg-color: var(--props-bg-color, var(--vc-container-bg-color, theme("colors.neutral.50")));
  --px: var(--vc-container-px, theme("padding.6"));
  --pt: var(--vc-container-pt, theme("padding.6"));
  --pb: var(--vc-container-pb, theme("padding.6"));

  --vc-container-width: min(var(--max-width), calc(100vw - var(--px) * 2));
  --vc-container-offset: calc((100vw - var(--vc-container-width)) / 2);

  @apply relative grow pb-[--pb] pt-[--pt] px-[--px];

  @media (width >= theme("screens.md")) {
    --pb: var(--vc-container-pb, theme("padding.9"));
  }

  @media (width >= theme("screens.lg")) {
    --px: var(--vc-container-px, theme("padding.8"));
  }

  @media (width >= theme("screens.2xl")) {
    --px: var(--vc-container-px, theme("padding.12"));
  }

  &--no-padding {
    --px: 0;
    --pt: 0;
    --pb: 0;
  }

  &--loading {
    @apply pointer-events-none opacity-50;
  }

  &__bg {
    @apply overflow-hidden absolute inset-0 bg-[--bg-color];

    svg {
      @apply absolute size-[28rem] bottom-[-10rem] right-[-10rem];

      @media (min-width: theme("screens.xl")) {
        @apply size-[48rem] bottom-[-15rem] right-[-13.5rem];
      }
    }
  }

  &__wrapper {
    @apply relative mx-auto max-w-[--max-width];
  }
}
</style>

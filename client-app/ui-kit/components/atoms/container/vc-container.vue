<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container--loading': loading,
      },
    ]"
  >
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isCssVariable } from "../../../utilities";

interface IProps {
  loading?: boolean;
  maxWidth?: string;
  bgColor?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  maxWidth: "",
  bgColor: "",
});

const _bgColor = computed(() => (isCssVariable(props.bgColor) ? `var(${props.bgColor})` : props.bgColor));
</script>

<style lang="scss">
.vc-container {
  --props-max-width: v-bind(props.maxWidth);
  --props-bg-color: v-bind(_bgColor);

  --max-width: var(--props-max-width, var(--vc-container-max-width, 87.75rem));
  --bg-color: var(--props-bg-color, var(--vc-container-bg-color, theme("colors.neutral.50")));
  --vc-container-padding-x: theme("padding.6");
  --vc-container-width: min(var(--max-width), calc(100vw - var(--vc-container-padding-x) * 2));
  --vc-container-offset: calc((100vw - var(--vc-container-width)) / 2);

  @apply grow bg-[--bg-color] py-6 px-[--vc-container-padding-x];

  @media (width >= theme("screens.md")) {
    @apply pb-9;
  }

  @media (width >= theme("screens.lg")) {
    --vc-container-padding-x: theme("padding.8");
  }

  @media (width >= theme("screens.2xl")) {
    --vc-container-padding-x: theme("padding.12");
  }

  &--loading {
    @apply pointer-events-none opacity-50;
  }

  &__wrapper {
    @apply mx-auto max-w-[--max-width];
  }
}
</style>

<template>
  <VcTooltip
    :class="[
      'vc-variant-picker',
      `vc-variant-picker--size--${size}`,
      {
        'vc-variant-picker--active': checked,
        'vc-variant-picker--unavailable': !checked && !isAvailable,
        'vc-variant-picker--square': type !== 'text',
      },
    ]"
    :disabled="!tooltip && !$slots.tooltip"
  >
    <template #trigger>
      <label class="vc-variant-picker__container">
        <input
          v-model="model"
          class="vc-variant-picker__input"
          type="radio"
          :name="name"
          :value="value"
          :checked="checked"
          :aria-checked="checked"
          :data-test-id="testIdInput"
          @change="emit('change', value)"
          @input="emit('input', value)"
        />

        <span v-if="type === 'color'" class="vc-variant-picker__color" />

        <VcImage v-else-if="type === 'image'" :src="image" class="vc-variant-picker__img" />

        <span v-else class="vc-variant-picker__text">
          {{ value }}
        </span>
      </label>
    </template>

    <template v-if="tooltip || $slots.tooltip" #content>
      <slot name="tooltip" v-bind="{ checked, value }">
        {{ tooltip }}
      </slot>
    </template>
  </VcTooltip>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { getColorValue } from "@/ui-kit/utilities";

interface IEmits {
  (e: "change", value: string): void;
  (e: "input", value: string): void;
}

interface IProps {
  type?: VcVariantPickerType;
  value: string;
  size?: VcVariantPickerSizeType;
  name?: string;
  isAvailable?: boolean;
  tooltip?: string;
  testIdInput?: string;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  type: "color",
  size: "md",
});

const model = defineModel<IProps["value"]>();

const checked = computed(() => model.value === props.value);

const color = computed(() => (props.type === "color" ? getColorValue(props.value) : ""));
const image = computed(() => (props.type === "image" ? props.value : ""));
</script>

<style lang="scss">
.vc-variant-picker {
  $square: "";
  $active: "";
  $unavailable: "";

  --props-color: v-bind(color);
  --color: var(--props-color, var(--vc-variant-picker-bg-color, theme("colors.additional.50")));
  --radius: var(--vc-variant-picker-radius, 0.5rem);
  --strike-line-width: 2px;

  @apply inline-block;

  &--active {
    $active: &;
  }

  &--square {
    $square: &;
  }

  &--unavailable {
    $unavailable: &;
  }

  &--size {
    &--xxs {
      --size: 1.5rem;
      --line-height: 0.875rem;
      --px: theme("padding[2.5]");
      --transparency: 44%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--xs {
      --size: 1.875rem;
      --line-height: 0.875rem;
      --px: theme("padding.3");
      --transparency: 45%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--sm {
      --size: 2.375rem;
      --line-height: 1rem;
      --px: theme("padding[3.5]");
      --transparency: 46%;

      @apply text-xs/[--line-height] font-black tracking-[1%];
    }

    &--md {
      --size: 3rem;
      --line-height: 1.25rem;
      --px: theme("padding.4");
      --transparency: 48%;

      @apply text-sm/[--line-height] font-black tracking-[1%];
    }

    &--lg {
      --size: 3.5rem;
      --line-height: 1.5rem;
      --px: theme("padding.5");
      --transparency: 49%;

      @apply text-base/[--line-height] font-black tracking-[1%];
    }
  }

  &__container {
    @apply relative flex items-stretch py-0.5
    min-h-[--size] min-w-[--size]
    bg-cover bg-center bg-no-repeat bg-additional-50
    rounded-[--radius] cursor-pointer px-[--px];

    box-shadow: 0 0 0 1px var(--color-neutral-200);

    #{$square} & {
      @apply size-[--size] px-0.5;
    }

    &:hover {
      box-shadow: 0 0 0 1px var(--color-neutral-400);
    }

    #{$active} & {
      box-shadow: 0 0 0 2px var(--color-primary-500);
    }

    #{$unavailable} & {
      &::before {
        @apply content-[""] absolute inset-0 rounded-[inherit] bg-additional-50/60;
      }

      &::after {
        @apply content-[""] absolute inset-0 rounded-[inherit] opacity-40;

        background: linear-gradient(
          -45deg,
          transparent var(--transparency),
          transparent var(--transparency) calc(50% - var(--strike-line-width) / 2),
          var(--color-secondary-950) calc(50% - var(--strike-line-width) / 2),
          var(--color-secondary-950) calc(50% + var(--strike-line-width) / 2),
          transparent calc(50% + var(--strike-line-width) / 2)
        );
      }
    }
  }

  &__input {
    @apply hidden;
  }

  &__color {
    @apply grow rounded-[calc(var(--radius)-2px)] bg-[--color];
  }

  &__img {
    @apply grow rounded-[calc(var(--radius)-2px)] object-cover object-center;
  }

  &__text {
    @apply flex items-center text-accent-600 font-bold;
  }
}
</style>

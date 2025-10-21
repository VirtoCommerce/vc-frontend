<template>
  <div
    :class="[
      'vc-variant-picker',
      `vc-variant-picker--size--${size}`,
      {
        'vc-variant-picker--active': checked,
        'vc-variant-picker--unavailable': !checked && !isAvailable,
        'vc-variant-picker--square': type !== 'text',
      },
    ]"
  >
    <label class="vc-variant-picker__container">
      <span v-if="type === 'color'" class="vc-variant-picker__color" />

      <VcImage v-else-if="type === 'image'" :src="image" :alt="value" class="vc-variant-picker__img" />

      <span v-else class="vc-variant-picker__text">
        {{ value }}
      </span>

      <VcTooltip :disabled="!tooltip && !$slots.tooltip" class="vc-variant-picker__tooltip">
        <template #default="{ triggerProps }">
          <input
            :checked="checked"
            class="vc-variant-picker__input"
            :type="multiple ? 'checkbox' : 'radio'"
            :aria-label="tooltip ?? value"
            :name="name"
            :value="value"
            :data-test-id="testId"
            :tabindex="tabindex ?? '0'"
            v-bind="triggerProps"
            @keydown.enter.prevent="toggleValue"
            @keydown.space.prevent="toggleValue"
            @click="toggleValue"
          />
        </template>

        <template #content>
          <slot name="tooltip">{{ tooltip }}</slot>
        </template>
      </VcTooltip>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { getColorValue } from "@/ui-kit/utilities";

interface IProps {
  type?: VcVariantPickerType;
  modelValue?: string | string[];
  value: string;
  size?: VcVariantPickerSizeType;
  name?: string;
  isAvailable?: boolean;
  tooltip?: string;
  tabindex?: string | number;
  testId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  type: "color",
  size: "md",
  multiple: false,
});

const model = defineModel<IProps["modelValue"]>();

const multiple = computed(() => Array.isArray(model.value));
const checked = computed(() => {
  if (multiple.value) {
    return Array.isArray(model.value) && model.value.includes(props.value);
  } else {
    return model.value === props.value;
  }
});

const color = computed(() => (props.type === "color" ? getColorValue(props.value) : undefined));
const image = computed(() => (props.type === "image" ? props.value : ""));

function toggleValue(): void {
  if (multiple.value) {
    const currentValue = Array.isArray(model.value) ? model.value : [];
    const index = currentValue.indexOf(props.value);

    if (index > -1) {
      const newValue = [...currentValue];
      newValue.splice(index, 1);
      model.value = newValue;
    } else {
      model.value = [...currentValue, props.value];
    }
  } else {
    model.value = props.value;
  }
}
</script>

<style lang="scss">
.vc-variant-picker {
  $square: "";
  $active: "";
  $unavailable: "";

  --props-color: v-bind(color);
  --color: var(--props-color, var(--vc-variant-picker-bg-color, theme("colors.additional.50")));
  --radius: var(--vc-variant-picker-radius, var(--vc-radius, 0.5rem));
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
    @apply relative flex items-stretch justify-center py-0.5
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

    &:focus-within {
      box-shadow: 0 0 0 2px rgb(from var(--color-primary-500) r g b / 0.5);
    }

    #{$active} & {
      box-shadow: 0 0 0 2px var(--color-primary-500);
    }

    #{$unavailable} & {
      &::before {
        @apply content-[""] absolute inset-px rounded-[inherit] bg-additional-50/60;
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

  &__tooltip {
    @apply absolute inset-0 block;
  }

  &__input {
    @apply z-[1] absolute inset-0 opacity-0;
  }

  &__color {
    @apply grow rounded-[calc(var(--radius)-2px)] bg-[--color];
  }

  &__img {
    @apply grow rounded-[calc(var(--radius)-2px)] object-cover object-center;
  }

  &__text {
    @apply flex items-center text-accent-600 text-center font-bold;
  }
}
</style>

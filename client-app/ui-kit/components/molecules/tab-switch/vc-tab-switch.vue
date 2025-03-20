<template>
  <label
    :class="[
      'vc-tab-switch',
      `vc-tab-switch--size--${size}`,
      `vc-tab-switch--label--${labelPosition}`,
      {
        'vc-tab-switch--disabled': disabled,
        'vc-tab-switch--checked': checked,
      },
    ]"
  >
    <input
      :id="componentId"
      type="radio"
      class="vc-tab-switch__input"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      :aria-checked="checked"
      @change="onChange"
      @input="onInput"
    />

    <button class="vc-tab-switch__button" type="button" tabindex="0" @click="onChange">
      <slot name="icon" v-bind="{ checked, value, label }">
        <VcIcon v-if="icon" :name="icon" class="vc-tab-switch__icon" />
      </slot>

      <slot v-bind="{ checked, value, label }">
        <span v-if="label" class="vc-tab-switch__label">
          {{ label }}
        </span>
      </slot>
    </button>
  </label>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
import { computed } from "vue";
import { useComponentId } from "@/ui-kit/composables";
import { getColorValue } from "@/ui-kit/utilities";

export interface IEmits {
  (event: "input", value: T): void;
  (event: "change", value: T): void;
}

export interface IProps {
  label?: string;
  name?: string;
  value: T;
  icon?: string;
  color?: string;
  hoverColor?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  labelPosition?: "start" | "end";
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  labelPosition: "end",
  color: "",
  hoverColor: "",
});

const model = defineModel<IProps["value"]>();

const componentId = useComponentId("input");

const checked = computed(() => model.value === props.value);
const _color = computed(() => getColorValue(props.color));
const _hoverColor = computed(() => getColorValue(props.hoverColor));

function onChange() {
  emit("change", props.value);
}

function onInput() {
  emit("input", props.value);
}
</script>

<style lang="scss">
.vc-tab-switch {
  $start: "";
  $end: "";
  $checked: "";

  --vc-props-color: v-bind(_color);
  --vc-props-hover-color: v-bind(_hoverColor);

  --color: var(--vc-props-color, var(--vc-tab-switch-color, theme("colors.primary.500")));
  --hover-color: var(--vc-props-hover-color, var(--vc-tab-switch-hover-color, theme("colors.accent.500")));
  --focus-color: rgb(from var(--color) r g b / 0.3);

  @apply inline-block text-neutral;

  &--size {
    &--sm {
      --vc-icon-size: 1rem;
      --p: theme("padding[1.5]");

      @apply text-sm;
    }

    &--md {
      --vc-icon-size: 1.25rem;
      --p: theme("padding.2");

      @apply text-base;
    }
  }

  &--label {
    &--start {
      $start: &;
    }

    &--end {
      $end: &;
    }
  }

  &--checked {
    $checked: &;

    --vc-icon-color: var(--color);
  }

  &--disabled {
    @apply pointer-events-none text-neutral-400;
  }

  &__button {
    @apply flex gap-1.5 rounded-sm border border-transparent p-[--p] font-bold cursor-pointer select-none;

    input:checked ~ & {
      @apply border-neutral-200 shadow-md text-neutral-950 bg-additional-50;
    }

    &:hover {
      --vc-icon-color: var(--hover-color);

      @apply text-[--hover-color];
    }

    &:focus,
    &:focus-visible {
      @apply outline outline-2 outline-[--focus-color] -outline-offset-1;
    }
  }

  &__icon {
    #{$start} & {
      @apply order-last;
    }

    #{$end} & {
      @apply order-first;
    }
  }

  &__input {
    @apply hidden;
  }
}
</style>

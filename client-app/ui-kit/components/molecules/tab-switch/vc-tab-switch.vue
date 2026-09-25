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
      @change="onChange"
      @input="onInput"
    />

    <!-- The radio is display:none, so its `aria-checked` never reaches the a11y tree — the visible
         button has to carry the state itself. Toggle semantics, not `role="tab"`: the tablist parent
         lives in consumer markup. -->
    <button
      class="vc-tab-switch__button"
      type="button"
      tabindex="0"
      :aria-label="ariaLabel || label"
      :aria-pressed="checked"
      @click="onChange"
    >
      <slot name="icon" v-bind="{ checked, value, label }">
        <VcIcon v-if="icon" :name="icon" class="vc-tab-switch__icon" />
      </slot>

      <slot v-bind="{ checked, value, label }">
        <span v-if="label" class="vc-tab-switch__label" :data-label="label">
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

const emit = defineEmits<{
  (event: "input", value: T): void;
  (event: "change", value: T): void;
}>();
const props = withDefaults(
  defineProps<{
    label?: string;
    name?: string;
    value: T;
    icon?: string;
    color?: string;
    hoverColor?: string;
    disabled?: boolean;
    size?: "sm" | "md";
    labelPosition?: "start" | "end";
    ariaLabel?: string;
  }>(),
  {
    size: "md",
    labelPosition: "end",
  },
);

const model = defineModel<T>();

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
  --radius: var(--vc-tab-switch-radius, var(--vc-radius, 0.5rem));
  --border-color: var(--vc-tab-switch-border-color, theme("colors.neutral.200"));

  // Everything a track wrapper needs to repaint a segment. A group cannot reach into
  // this block's elements from its own file, so the seams it pulls on are declared here,
  // each falling back to what the switch rendered before they existed.
  --px: var(--vc-tab-switch-padding-x, var(--p));
  --weight: var(--vc-tab-switch-font-weight, theme("fontWeight.bold"));
  --checked-weight: var(--vc-tab-switch-checked-font-weight, var(--weight));
  --checked-bg-color: var(--vc-tab-switch-checked-bg-color, theme("colors.additional.50"));
  --checked-shadow: var(--vc-tab-switch-checked-shadow, theme("boxShadow.md"));

  // Positioned, so that a track wrapper's sliding indicator — which precedes the switches in
  // the DOM — paints under them and the label never blinks with the fill behind it.
  @apply relative inline-block;

  color: var(--vc-tab-switch-text-color, theme("colors.neutral.DEFAULT"));

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
    @apply flex w-full cursor-pointer select-none items-center justify-center gap-1.5 rounded-[--radius] border border-[--border-color];

    padding: var(--p) var(--px);
    font-weight: var(--weight);

    input:checked ~ & {
      @apply text-neutral-950;

      border-color: var(--vc-tab-switch-checked-border-color, var(--border-color));
      background: var(--checked-bg-color);
      box-shadow: var(--checked-shadow);
      font-weight: var(--checked-weight);
    }

    &:hover {
      // Separately settable, for the rails that keep the glyph in one colour while the label
      // reacts to the pointer.
      --vc-icon-color: var(--vc-tab-switch-hover-icon-color, var(--hover-color));

      @apply text-[--hover-color];
    }
  }

  &__label {
    // The box is reserved at the CHECKED weight and the label is centred in it. Heavier text is
    // wider, so without the reservation a rail of equal columns grows by a pixel or two whenever
    // the longest option is picked, and everything beside it twitches — measured 217.33 -> 218.75
    // on the header's three appearance modes, enough to nudge the panel's column.
    @apply grid justify-items-center;

    &::after {
      @apply invisible h-0 overflow-hidden;

      content: attr(data-label);
      font-weight: var(--checked-weight);
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

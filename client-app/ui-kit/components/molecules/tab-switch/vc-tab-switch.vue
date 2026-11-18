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
      :name="groupContext?.name ?? name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
      @input="onInput"
    />

    <!-- The radio is display:none, so its `aria-checked` never reaches the a11y tree — the visible
         button has to carry the state itself. Alone it is a toggle; inside VcTabSwitchGroup it is a radio
         of the group's radiogroup, with one tab stop once an item is checked. -->
    <button
      class="vc-tab-switch__button"
      type="button"
      :tabindex="tabindex"
      :role="groupContext ? 'radio' : undefined"
      :aria-label="ariaLabel || label"
      :aria-pressed="groupContext ? undefined : checked"
      :aria-checked="groupContext ? checked : undefined"
      :aria-disabled="groupContext && disabled ? true : undefined"
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
import { computed, inject, onBeforeUnmount } from "vue";
import { useComponentId } from "@/ui-kit/composables";
import { getColorValue } from "@/ui-kit/utilities";
import { vcTabSwitchGroupKey } from "../tab-switch-group/vc-tab-switch-group-context";

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
const groupContext = inject(vcTabSwitchGroupKey, null);
const unregister = groupContext?.register({ value: () => props.value, disabled: () => props.disabled });

const checked = computed(() => (groupContext ? groupContext.modelValue.value : model.value) === props.value);
const tabindex = computed(() => {
  if (!groupContext) {
    return 0;
  }

  // One tab stop per group: the checked item, or every enabled item while none is checked.
  if (props.disabled) {
    return -1;
  }

  return checked.value || !groupContext.hasCheckedItem.value ? 0 : -1;
});
const _color = computed(() => getColorValue(props.color));
const _hoverColor = computed(() => getColorValue(props.hoverColor));

function onChange() {
  // In a group the button stays focusable for screen readers, so Space and Enter still land here.
  if (groupContext) {
    if (props.disabled) {
      return;
    }

    groupContext.select(props.value);
  }

  emit("change", props.value);
}

function onInput() {
  emit("input", props.value);
}

onBeforeUnmount(() => unregister?.());
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
  --text-color: var(--vc-tab-switch-text-color, theme("colors.neutral.DEFAULT"));
  --px: var(--vc-tab-switch-padding-x, var(--p));
  --weight: var(--vc-tab-switch-font-weight, theme("fontWeight.bold"));
  --checked-weight: var(--vc-tab-switch-checked-font-weight, var(--weight));
  --checked-text-color: var(--vc-tab-switch-checked-text-color, theme("colors.neutral.950"));
  --checked-bg-color: var(--vc-tab-switch-checked-bg-color, theme("colors.additional.50"));
  --checked-shadow: var(--vc-tab-switch-checked-shadow, theme("boxShadow.md"));

  @apply inline-block text-[--text-color];

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
    @apply flex items-center justify-center gap-1.5 w-full rounded-[--radius] border border-[--border-color] py-[--p] px-[--px] cursor-pointer select-none;

    font-weight: var(--weight);

    input:checked ~ & {
      @apply shadow-md text-[--checked-text-color] bg-[--checked-bg-color];

      // shadow-md keeps `--tw-shadow-colored`, so a `shadow-<colour>` class still tints; only the value is ours.
      --tw-shadow: var(--checked-shadow);

      border-color: var(--vc-tab-switch-checked-border-color, var(--border-color));
      font-weight: var(--checked-weight);
    }

    &:hover {
      --vc-icon-color: var(--hover-color);

      @apply text-[--hover-color];
    }
  }

  // A hidden copy of the `label` prop in the checked weight keeps the width when the weight changes;
  // a default-slot label gets no copy.
  // The label stays a block, so a consumer's `truncate` still gets its ellipsis.
  &__label {
    @apply block;

    &::after {
      @apply block invisible h-0 overflow-hidden;

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

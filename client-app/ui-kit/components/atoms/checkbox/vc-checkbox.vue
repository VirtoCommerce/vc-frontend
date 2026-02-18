<template>
  <div
    :class="[
      'vc-checkbox',
      `vc-checkbox--size--${size}`,
      `vc-checkbox--label--${labelPosition}`,
      {
        'vc-checkbox--disabled': disabled,
        'vc-checkbox--checked': isChecked,
        'vc-checkbox--indeterminate': indeterminate,
      },
    ]"
  >
    <component :is="containerTag" class="vc-checkbox__container">
      <!-- Hidden real input for form/a11y — ONLY in standalone mode -->
      <input
        v-if="!isInsideInteractive"
        type="checkbox"
        class="sr-only"
        :aria-label="ariaLabel || name"
        :name="name"
        :value="value"
        :disabled="disabled"
        :checked="isChecked"
        :indeterminate="indeterminate"
        :aria-checked="ariaCheckedValue"
        :data-test-id="testId"
        :tabindex="tabindex"
        @change="handleChange"
        @click="onClick"
      />

      <!-- Visual indicator — ALWAYS rendered -->
      <span class="vc-checkbox__indicator" aria-hidden="true" />

      <VcTooltip v-if="$slots.default" v-bind="tooltipBindings">
        <template #trigger>
          <span class="vc-checkbox__label">
            <slot v-bind="{ checked: isChecked }" />
          </span>
        </template>

        <template #content>
          <slot name="tooltip" :checked="isChecked" />
        </template>
      </VcTooltip>
    </component>

    <VcInputDetails
      class="vc-checkbox__details"
      :show-empty="showEmptyDetails"
      :message="message"
      :error="error"
      :single-line="singleLineMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { includes } from "lodash";
import { computed, inject, ref, useSlots } from "vue";
import { INTERACTIVE_PARENT_KEY } from "@/ui-kit/components/molecules/menu-item/vc-menu-item-context";

interface IEmits {
  (event: "update:modelValue", value: boolean): void;
  (event: "change", value: boolean): void;
}

interface IProps {
  modelValue?: boolean;
  name?: string;
  value?: string | number | object;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: "xs" | "sm" | "md";
  labelPosition?: "left" | "right";
  showEmptyDetails?: boolean;
  message?: string;
  error?: boolean;
  singleLineMessage?: boolean;
  testId?: string;
  preventDefault?: boolean;
  tabindex?: string;
  ariaLabel?: string;
  tooltip?: {
    placement?: VcPopoverPlacementType;
    width?: string;
    disabled?: boolean;
  };
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  modelValue: false,
  size: "md",
  labelPosition: "right",
  tooltip: () => ({
    placement: "bottom",
    width: "12rem",
    disabled: false,
  }),
});

const groupContext = inject<VcCheckboxGroupContextType | null>("checkboxGroupContext", null);
const isInsideInteractive = inject(INTERACTIVE_PARENT_KEY, ref(false));
const slots = useSlots();

// Dev warning for accessibility
if (import.meta.env.DEV) {
  if (!props.ariaLabel && !props.name && !slots.default) {
    // eslint-disable-next-line no-console
    console.warn("VcCheckbox: Checkbox should have ariaLabel, name, or slot content for accessibility");
  }
}

const isChecked = computed(() => {
  if (groupContext && !props.modelValue) {
    return includes(groupContext.modelValue.value, props.value);
  } else {
    return props.modelValue;
  }
});

const ariaCheckedValue = computed(() => (props.indeterminate ? "mixed" : isChecked.value));

const containerTag = computed(() => (isInsideInteractive.value ? "span" : "label"));

const tooltipBindings = computed(() => ({
  placement: props.tooltip?.placement,
  width: props.tooltip?.width,
  disabled: props.tooltip?.disabled || !slots.tooltip,
}));

function handleChange() {
  if (props.disabled) {
    return;
  }

  if (groupContext) {
    groupContext.toggleValue(props.value!);
  } else {
    const newValue = !props.modelValue;
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }
}

function onClick(event: Event) {
  if (props.preventDefault) {
    event.preventDefault();
    handleChange();
  }
}
</script>

<style lang="scss">
.vc-checkbox {
  $disabled: "";
  $checked: "";
  $indeterminate: "";
  $left: "";
  $right: "";

  --base-color: var(--vc-checkbox-base-color, var(--color-primary-500));
  --focus-color: rgb(from var(--base-color) r g b / 0.3);

  @apply flex-none select-none;

  &--size {
    &--xs {
      --size: 0.875rem;

      @apply text-xs;
    }

    &--sm {
      --size: 1.125rem;

      @apply text-xs;
    }

    &--md {
      --size: 1.25rem;

      @apply text-sm;
    }
  }

  &--disabled {
    $disabled: &;
  }

  &--checked {
    $checked: &;
  }

  &--indeterminate {
    $indeterminate: &;
  }

  &--label {
    &--left {
      $left: &;
    }

    &--right {
      $right: &;
    }
  }

  &__container {
    @apply relative inline-flex items-start cursor-pointer;

    #{$disabled} & {
      @apply cursor-not-allowed;
    }
  }

  &__indicator {
    @apply size-[--size] shrink-0 rounded border-2 border-neutral-400 bg-additional-50;

    // Focus styles via sibling selector (when hidden input is focused)
    input:focus + & {
      @apply ring ring-[--focus-color];
    }

    #{$checked} & {
      @apply border-none bg-[--base-color] bg-no-repeat bg-center bg-[length:120%];

      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M17.1561 8.43073C17.7304 7.85642 18.6616 7.85642 19.2359 8.43073C19.8102 9.00503 19.8102 9.93615 19.2359 10.5105L12.079 17.6673C11.5047 18.2416 10.5736 18.2416 9.99927 17.6673L6.76398 14.432C6.18968 13.8577 6.18968 12.9266 6.76398 12.3523C7.33828 11.778 8.2694 11.778 8.8437 12.3523L11.0391 14.5477L17.1561 8.43073Z' fill='white'/%3e%3c/svg%3e");
      print-color-adjust: exact;
    }

    #{$indeterminate} & {
      @apply border-none bg-neutral bg-no-repeat bg-center bg-contain;

      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 10a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 10z' fill='white'/%3e%3c/svg%3e");
    }

    #{$disabled} & {
      @apply bg-neutral-50 cursor-not-allowed;
    }

    #{$disabled}#{$checked} &,
    #{$disabled}#{$indeterminate} & {
      @apply border-neutral-200 bg-neutral-200;
    }
  }

  &__label {
    @apply flex items-center min-w-0 min-h-[--size];

    #{$left} & {
      @apply order-first me-2;
    }

    #{$right} & {
      @apply order-last ms-2;
    }

    #{$disabled} & {
      @apply opacity-60;
    }

    &::before {
      @apply content-[''] absolute inset-0;
    }
  }

  &__details {
    @apply min-w-full;
  }
}
</style>

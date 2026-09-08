<template>
  <div
    :class="[
      'vc-radio-button',
      `vc-radio-button--size--${size}`,
      `vc-radio-button--label--${labelPosition}`,
      {
        'vc-radio-button--disabled': disabled,
        'vc-radio-button--checked': checked,
        'vc-radio-button--no-indicator': noIndicator,
      },
    ]"
  >
    <component
      :is="containerTag"
      :for="isInsideInteractive ? undefined : inputId"
      class="vc-radio-button__container"
      @click="onContainerClick"
    >
      <input
        v-if="!isInsideInteractive"
        :id="inputId"
        ref="inputRef"
        v-model="model"
        class="vc-radio-button__input"
        type="radio"
        :name="name"
        :value="value"
        :checked="checked"
        :disabled="disabled"
        :tabindex="tabindex"
        :aria-checked="checked"
        :aria-label="ariaLabel || label || undefined"
        :aria-describedby="hasDetails ? detailsId : undefined"
        :aria-invalid="error || undefined"
        :data-test-id="testIdInput"
        @change="emit('change', value)"
        @input="emit('input', value)"
      />

      <span class="vc-radio-button__indicator" aria-hidden="true" />

      <span class="vc-radio-button__label">
        <slot v-bind="{ checked, value, label }">
          {{ label }}
        </slot>
      </span>
    </component>

    <VcInputDetails
      :id="detailsId"
      class="vc-radio-button__details"
      :show-empty="showEmptyDetails"
      :message="message"
      :error="error"
      :single-line="singleLineMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, useSlots } from "vue";
import { INTERACTIVE_PARENT_KEY } from "@/ui-kit/components/molecules/menu-item/vc-menu-item-context";
import { useComponentId } from "@/ui-kit/composables";

interface IProps {
  label?: string;
  name?: string;
  value: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md";
  labelPosition?: "left" | "right";
  showEmptyDetails?: boolean;
  message?: string;
  error?: boolean;
  singleLineMessage?: boolean;
  wordBreak?: string;
  maxLines?: number;
  noIndicator?: boolean;
  testIdInput?: string;
  ariaLabel?: string;
  tabindex?: number;
}

interface IEmits {
  (event: "input", value: string): void;
  (event: "change", value: string): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  labelPosition: "right",
});

const model = defineModel<IProps["value"]>();

const inputRef = ref<HTMLInputElement | null>(null);

let forwardExpected = false;

const isInsideInteractive = inject(INTERACTIVE_PARENT_KEY, ref(false));

const slots = useSlots();

// Dev warning for accessibility
if (import.meta.env.DEV) {
  if (!props.ariaLabel && !props.label && !slots.default) {
    // eslint-disable-next-line no-console
    console.warn("VcRadioButton: Radio button should have ariaLabel, label, or slot content for accessibility");
  }
}

const componentId = useComponentId("vc-radio-button");
const inputId = `${componentId}-input`;
const detailsId = `${componentId}-details`;

const checked = computed(() => model.value === props.value);
const hasDetails = computed(() => props.showEmptyDetails || !!props.message);
const containerTag = computed(() => (isInsideInteractive.value ? "span" : "label"));

// <label> activation forwards a second, identical click to the input, so one pointer press would
// otherwise reach consumers twice. Drop that duplicate and nothing else: keyboard activation and a
// click aimed at the input itself must still pass, and a click on slot content is not ours to eat.
// The flag is cleared on the next task because the forwarded click, when it comes, is dispatched
// synchronously within this one.
function onContainerClick(event: MouseEvent) {
  if (isInsideInteractive.value) {
    return;
  }

  // A disabled control surfaces nothing, as its full-bleed input used to guarantee.
  if (props.disabled) {
    event.stopPropagation();
    return;
  }

  if (event.target !== inputRef.value) {
    forwardExpected = true;
    setTimeout(() => (forwardExpected = false));
    return;
  }

  if (forwardExpected) {
    forwardExpected = false;
    event.stopPropagation();
  }
}
</script>

<style lang="scss">
.vc-radio-button {
  $self: &;
  $checked: "";
  $disabled: "";
  $no-indicator: "";
  $left: "";
  $right: "";

  --props-max-lines: v-bind(props.maxLines);
  --props-word-break: v-bind(props.wordBreak);

  --base-color: var(--vc-radio-button-base-color, var(--color-primary-500));
  --focus-color: rgb(from var(--base-color) r g b / 0.3);
  --max-lines: var(--props-max-lines, var(--vc-radio-button-max-lines, initial));
  --word-break: var(--props-word-break, var(--vc-radio-button-word-break, initial));

  @apply select-none;

  &--size {
    &--xs {
      --size: 0.875rem;
      --border-width: 0.25rem;

      @apply text-xs;
    }

    &--sm {
      --size: 1rem;
      --border-width: 0.3rem;

      @apply text-sm;
    }

    &--md {
      --size: 1.25rem;
      --border-width: 0.375rem;

      @apply text-base;
    }
  }

  &--label {
    &--left {
      $left: &;
    }

    &--right {
      $right: &;
    }
  }

  &--checked {
    $checked: &;
  }

  &--no-indicator {
    $no-indicator: &;
  }

  &--disabled {
    $disabled: &;
  }

  &__container {
    @apply relative flex gap-2 cursor-pointer;

    #{$disabled} & {
      @apply cursor-not-allowed;
    }
  }

  &__input {
    // Hidden, never stretched: an overlay over the container swallows clicks meant for label content.
    @apply sr-only;
  }

  &__indicator {
    @apply flex-none size-[--size] border-2 rounded-full border-neutral-500 bg-additional-50;

    #{$no-indicator} & {
      @apply hidden;
    }

    input:focus + & {
      @apply outline-none ring ring-[--focus-color];
    }

    #{$checked} & {
      @apply border-[--base-color] border-[length:var(--border-width)];
    }

    #{$disabled} & {
      @apply border-neutral-300 bg-neutral-50;
    }
  }

  &__label {
    @apply min-w-0 empty:hidden line-clamp-[var(--max-lines)] [word-break:var(--word-break)];

    #{$left} & {
      @apply order-first;
    }

    #{$right} & {
      @apply order-last;
    }

    #{$disabled} & {
      @apply opacity-60;
    }
  }

  &__details {
    @apply min-w-full;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: select;

      @apply self-start;
    }

    &--view-mode {
      &--grid #{$self} {
        @apply hidden;
      }

      &--list #{$self} {
        @apply hidden;
      }

      &--item {
        #{$self} {
          @apply z-[1] absolute -left-[0.35rem] -top-[0.45rem] p-1.5 rounded-full bg-[--bg];
        }

        @container (min-width: theme("containers.2xl")) {
          #{$self} {
            @apply relative left-auto top-auto self-center me-3 p-0;
          }
        }
      }
    }
  }
}
</style>

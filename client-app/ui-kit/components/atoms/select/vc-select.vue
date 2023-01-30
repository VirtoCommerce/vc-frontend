<template>
  <div
    :class="[
      'vc-select',
      `vc-select--size--${size}`,
      `vc-select--kind--${kind}`,
      {
        'vc-select--disabled': disabled,
        'vc-select--opened': open,
      },
    ]"
  >
    <VcLabel v-if="label" :text="label" :required="required" />

    <div v-click-outside="() => open && hideList()" class="vc-select__container">
      <button type="button" :disabled="disabled" class="vc-select__button" @click="toggle">
        <span class="grow">
          <slot v-if="placeholder && !selected" name="placeholder">
            <span class="vc-select__placeholder-default">
              {{ placeholder }}
            </span>
          </slot>

          <slot v-if="selected" name="selected" v-bind="{ item: selected }">
            <span class="vc-select__selected-default">
              {{ textField && selected ? selected[textField] : selected }}
            </span>
          </slot>
        </span>

        <VcIcon class="vc-select__icon" name="chevron-down" size="sm" />
      </button>

      <transition :leave-active-class="`transition duration-${transitionDuration} ease-in`" leave-to-class="opacity-0">
        <div v-show="open" class="vc-select__dropdown">
          <ul ref="listElement" class="vc-select__list">
            <li v-if="$slots.first" class="vc-select__item" @click="select()">
              <slot name="first" />
            </li>

            <li
              v-for="(item, index) in items"
              :key="index"
              :class="[
                'vc-select__item',
                {
                  'vc-select__item--active': isActiveItem(item),
                },
              ]"
              @click="select(item)"
            >
              <slot name="item" v-bind="{ item, index, selected }">
                <span class="vc-select__item-default">
                  {{ textField && item ? item[textField] : item }}
                </span>
              </slot>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Details -->
    <div class="vc-textarea__details">
      <!-- Message -->
      <div v-if="message" class="vc-textarea__message" v-html="message"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@/core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";

interface Props {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  modelValue: object | string;
  items: any[];
  size?: "sm" | "md" | "lg";
  kind?: "primary" | "secondary";
  textField?: string;
  valueField?: string;
  placeholder?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
}

interface Emits {
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  kind: "secondary",
});

const emit = defineEmits<Emits>();

const transitionDuration = 100;

const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

const selected = computed(() => {
  const returnValueKey: string | undefined = props.valueField;

  if (returnValueKey) {
    return props.items.find((item) => item[returnValueKey] === props.modelValue);
  }

  return props.modelValue;
});

function isActiveItem(item: any): boolean {
  const itemValue = props.valueField && item ? item[props.valueField] : item;
  return itemValue === props.modelValue;
}

function hideList() {
  open.value = false;

  setTimeout(() => {
    if (listElement.value) {
      listElement.value.scrollTop = 0;
    }
  }, transitionDuration);
}

function toggle() {
  if (props.disabled) {
    return;
  }

  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(item?: any) {
  if (props.disabled) {
    return;
  }

  const newValue = props.valueField && item ? item[props.valueField] : item;

  if (newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }

  hideList();
}
</script>

<style lang="scss">
.vc-select {
  $sizeSm: "";
  $sizeMd: "";
  $sizeLg: "";
  $kindPrimary: "";
  $kindSecondary: "";
  $disabled: "";
  $opened: "";
  $hideEmptyDetails: "";
  $error: "";

  &--size {
    &--sm {
      $sizeSm: &;
    }

    &--md {
      $sizeMd: &;
    }

    &--lg {
      $sizeLg: &;
    }
  }

  &--kind {
    &--primary {
      $kindPrimary: &;
    }

    &--secondary {
      $kindSecondary: &;
    }
  }

  &--disabled {
    $disabled: &;
  }

  &--opened {
    $opened: &;
  }

  &--hide-empty-details {
    $hideEmptyDetails: &;
  }

  &--error {
    $error: &;
  }

  &__container {
    @apply relative select-none;
  }

  &__button {
    @apply relative flex items-center w-full rounded border appearance-none outline-none text-left;

    #{$sizeSm} & {
      @apply min-h-[2rem] text-sm;
    }

    #{$sizeMd} & {
      @apply min-h-[2.25rem] text-sm;
    }

    #{$sizeLg} & {
      @apply min-h-[2.75rem] text-base;
    }

    &:focus {
      @apply outline outline-offset-0 outline-2 outline-[color:var(--color-primary-light)];
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50 cursor-not-allowed;
    }
  }

  &__placeholder-default {
    @apply block p-3 text-gray-400 truncate;
  }

  &__selected-default {
    @apply block p-3 text-[color:var(--color-body-text)] truncate;
  }

  &__icon {
    @apply mr-3;

    #{$kindPrimary} & {
      @apply text-[var(--color-primary)];
    }

    #{$kindSecondary} & {
      @apply text-[var(--color-secondary)];
    }

    #{$disabled} & {
      @apply text-gray-300;
    }

    #{$opened} & {
      @apply rotate-180;
    }
  }

  &__dropdown {
    @apply z-10 overflow-hidden absolute mt-1 w-full bg-white rounded border border-gray-200 shadow-lg;
  }

  &__list {
    @apply overflow-auto max-h-52;
  }

  &__item {
    @apply w-full cursor-pointer;

    &:hover {
      @apply bg-gray-100;
    }

    &--active,
    &--active:hover {
      @apply bg-[color:var(--color-primary-light)] cursor-default;
    }
  }

  &__item-default {
    @apply block p-2 text-13 truncate;
  }

  &__details {
    @apply flex justify-end gap-2 min-h-[0.875rem] text-11;

    #{$hideEmptyDetails} & {
      @apply empty:hidden;
    }
  }

  &__message {
    @apply grow text-gray-400;

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }
}
</style>

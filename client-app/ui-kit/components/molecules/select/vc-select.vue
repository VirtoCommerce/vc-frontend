<template>
  <div
    :class="[
      'vc-select',
      `vc-select--size--${size}`,
      {
        'vc-select--readonly': readonly,
        'vc-select--disabled': disabled,
        'vc-select--error': error,
        'vc-select--opened': open,
      },
    ]"
  >
    <VcLabel v-if="label" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <div v-click-outside="() => open && hideList()" class="vc-select__container">
      <button type="button" :disabled="disabled" class="vc-select__button" @click="toggle">
        <span class="vc-select__button-content">
          <slot v-if="selected" name="selected" v-bind="{ item: selected }">
            <VcSelectItem>
              <VcSelectItemText>
                {{ textField && selected ? selected[textField] : selected }}
              </VcSelectItemText>
            </VcSelectItem>
          </slot>

          <slot v-else-if="$slots.placeholder || placeholder" name="placeholder">
            <VcSelectItem class="opacity-75">
              <VcSelectItemText>
                {{ placeholder }}
              </VcSelectItemText>
            </VcSelectItem>
          </slot>
        </span>

        <VcIcon class="vc-select__icon" name="chevron-down" size="xs" />
      </button>

      <transition :leave-active-class="`transition duration-${transitionDuration} ease-in`" leave-to-class="opacity-0">
        <div v-if="open" class="vc-select__dropdown">
          <ul ref="listElement" class="vc-select__list">
            <li
              v-if="$slots.first"
              class="vc-select__item"
              tabindex="0"
              role="option"
              :aria-selected="!selected"
              @click="select()"
              @keyup.enter="select()"
            >
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
              tabindex="0"
              role="option"
              :aria-selected="isActiveItem(item)"
              @click="select(item)"
              @keyup.enter="select(item)"
            >
              <slot name="item" v-bind="{ item, index, selected }">
                <VcSelectItem>
                  <VcSelectItemText>
                    {{ textField && item ? item[textField] : item }}
                  </VcSelectItemText>
                </VcSelectItem>
              </slot>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" />
  </div>
</template>

<script lang="ts">
/* eslint-disable-next-line import/order */
import { clickOutside } from "@/core/directives";

export default {
  directives: {
    clickOutside, // TODO: Use directive from VueUse (https://vueuse.org/core/onClickOutside/#directive-usage)
  },
};
</script>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref, shallowRef } from "vue";

interface IProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  modelValue?: object | string;
  items: any[];
  size?: "sm" | "md" | "lg" | "auto";
  textField?: string;
  valueField?: string;
  placeholder?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
}

interface IEmits {
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
});

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

/** @deprecated Replace with the prepared computed array */
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
  if (props.disabled || props.readonly) {
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

<style scoped lang="scss">
.vc-select {
  $sizeSm: "";
  $sizeMd: "";
  $sizeLg: "";
  $sizeAuto: "";

  $disabled: "";
  $readonly: "";
  $opened: "";
  $error: "";

  @apply flex flex-col;

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

    &--auto {
      $sizeAuto: &;
    }
  }

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
  }

  &--opened {
    $opened: &;
  }

  &--error {
    $error: &;
  }

  &__container {
    @apply relative select-none;
  }

  &__button {
    @apply relative flex items-center w-full rounded border bg-white appearance-none outline-none text-left;

    #{$sizeSm} & {
      @apply h-8 text-sm;
    }

    #{$sizeMd} & {
      @apply h-9 text-sm;
    }

    #{$sizeLg} & {
      @apply h-11 text-base;
    }

    #{$sizeAuto} & {
      @apply h-auto text-sm;
    }

    #{$opened} &,
    &:focus {
      //fix for Safari. Do not change!
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50 cursor-not-allowed;
    }

    #{$readonly}:not(#{$disabled}) & {
      @apply pointer-events-none;
    }
  }

  &__button-content {
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0 h-full;

    #{$sizeAuto} & {
      @apply overflow-y-visible;
    }
  }

  &__icon {
    @apply shrink-0 mr-3 text-[color:var(--color-body-text)];

    #{$disabled} & {
      @apply text-gray-300;
    }

    #{$readonly} & {
      @apply hidden;
    }

    #{$opened} & {
      @apply rotate-180;
    }
  }

  &__dropdown {
    @apply z-10 overflow-hidden absolute mt-1 w-full bg-white rounded border border-gray-200 shadow-lg;
  }

  &__list {
    @apply overflow-auto max-h-60;
  }

  &__item {
    @apply w-full cursor-pointer;

    &:hover {
      @apply bg-gray-100;
    }

    &:focus {
      @apply outline outline-offset-[-3px] outline-[3px] outline-[color:var(--color-primary-light)];
    }

    &--active,
    &--active:hover {
      @apply bg-[color:var(--color-primary-light)] cursor-default;
    }
  }
}
</style>

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

    <div v-on-click-outside="hideList" class="vc-select__container">
      <div
        role="button"
        class="vc-select__button"
        :disabled="disabled"
        @click="toggle"
        @keyup.esc="open && toggle()"
        @keydown.down.prevent="next(-1)"
      >
        <template v-if="!autocomplete">
          <span class="vc-select__button-content">
            <slot v-if="selected" name="selected" v-bind="{ item: selected, error }">
              <VcSelectItem>
                <VcSelectItemText :error="error">
                  {{ selectedText }}
                </VcSelectItemText>
              </VcSelectItem>
            </slot>

            <slot v-else-if="$slots.placeholder || placeholder" name="placeholder" v-bind="{ error }">
              <VcSelectItem>
                <VcSelectItemText placeholder :error="error">
                  {{ placeholder }}
                </VcSelectItemText>
              </VcSelectItem>
            </slot>
          </span>

          <VcIcon class="vc-select__icon" name="chevron-down" size="xs" />
        </template>

        <VcInput
          v-else
          v-model="search"
          class="vc-select__input"
          :required="required"
          :size="size"
          :placeholder="selectedText || placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :error="error"
          truncate
          @input="onFilter"
        >
          <template #append>
            <VcIcon class="vc-select__icon" name="chevron-down" size="xs" />
          </template>
        </VcInput>
      </div>

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
              @keyup.esc="open && toggle()"
              @keydown.up.prevent="prev(0)"
              @keydown.down.prevent="next(0)"
            >
              <slot name="first" />
            </li>

            <li
              v-for="(item, index) in filteredItems"
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
              @keyup.esc="open && toggle()"
              @keydown.up.prevent="prev(index + ($slots.first ? 1 : 0))"
              @keydown.down.prevent="next(index + ($slots.first ? 1 : 0))"
            >
              <slot name="item" v-bind="{ item, index, selected }">
                <VcSelectItem>
                  <VcSelectItemText>
                    {{ getItemText(item) }}
                  </VcSelectItemText>
                </VcSelectItem>
              </slot>
            </li>

            <li v-if="filtering && !filteredItems.length" class="vc-select__item">
              <VcSelectItem>
                <VcSelectItemText> {{ $t("common.messages.no_results") }} </VcSelectItemText>
              </VcSelectItem>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts">
// FIXME: https://virtocommerce.atlassian.net/browse/ST-5117
/* eslint-disable @typescript-eslint/no-explicit-any */
import { union, lowerCase } from "lodash";
import { computed, ref, shallowRef } from "vue";

interface IProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  modelValue?: object | string;
  items: any[];
  size?: "sm" | "md" | "auto";
  textField?: string;
  valueField?: string;
  placeholder?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
  autocomplete?: boolean;
  singleLineMessage?: boolean;
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
const filterValue = ref("");
const filtering = ref<boolean>(false);

const getItemText = (item: any) => (props.textField && item ? item[props.textField] : item);
const getItemValue = (item: any) => (props.valueField && item ? item[props.valueField] : item);

const isActiveItem = (item: any) => getItemValue(item) === props.modelValue;

const selected = computed(() => {
  return props.valueField ? props.items.find((item) => item[props.valueField!] === props.modelValue) : props.modelValue;
});

const search = computed({
  get() {
    if (!filtering.value) {
      return selectedText.value;
    }

    return filterValue.value;
  },
  set(value) {
    filterValue.value = value;
  },
});

const filteredItems = computed(() => {
  if (!filtering.value) {
    return props.items;
  }

  const searching = lowerCase(filterValue.value);
  const items = props.items.filter((item) => lowerCase(getItemText(item)).includes(searching));

  const first = items.filter((item) => lowerCase(getItemText(item)).indexOf(searching) === 0);

  return union(first, items);
});

function onFilter() {
  filtering.value = true;

  if (!open.value) {
    toggle();
  }
}

const selectedText = computed(() =>
  props.textField && selected.value ? selected.value[props.textField] : selected.value,
);

function hideList() {
  open.value = false;
  filtering.value = false;

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

  const newValue = getItemValue(item);

  if (newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }

  hideList();
}

function next(index: number) {
  const listItems = listElement.value?.children as HTMLElement[] | undefined;

  if (!open.value) {
    toggle();
  }

  if (listItems?.length) {
    const focusItemIndex = index === listItems?.length - 1 ? 0 : index + 1;
    listItems[focusItemIndex].focus();
  }
}

function prev(index: number) {
  const listItems = listElement.value?.children as HTMLElement[] | undefined;

  if (listItems?.length) {
    const focusItemIndex = index === 0 ? listItems?.length - 1 : index - 1;
    listItems[focusItemIndex].focus();
  }
}
</script>

<style scoped lang="scss">
.vc-select {
  $sizeSm: "";
  $sizeMd: "";
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
      @apply h-9 text-sm;
    }

    #{$sizeMd} & {
      @apply h-11 text-sm;
    }

    #{$sizeAuto} & {
      @apply h-auto text-sm;
    }

    #{$opened} &,
    &:focus {
      @apply ring ring-[color:var(--color-primary-light)];
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50 cursor-not-allowed;
    }

    #{$readonly}:not(#{$disabled}) & {
      @apply pointer-events-none;
    }

    #{$error} & {
      @apply border-[color:var(--color-danger)];
    }
  }

  &__button-content {
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0 h-full;

    #{$sizeAuto} & {
      @apply overflow-y-visible;
    }

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }

  &__input {
    @apply w-full;
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

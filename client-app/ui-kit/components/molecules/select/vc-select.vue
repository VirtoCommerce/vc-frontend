<template>
  <div
    :id="componentId"
    :class="[
      'vc-select',
      `vc-select--size--${size}`,
      {
        'vc-select--readonly': readonly,
        'vc-select--disabled': disabled,
        'vc-select--error': error,
      },
    ]"
  >
    <VcLabel v-if="label" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <VcDropdownMenu placement="bottom" width="100%" :disabled="!enabled">
      <template #trigger="{ opened }">
        <div
          role="button"
          :class="[
            'vc-select__button',
            {
              'vc-select__button--opened': opened,
            },
          ]"
          :disabled="disabled"
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

            <VcIcon class="vc-select__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
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
            @keydown.down.prevent="next(-1)"
            @keyup.stop
            @input="onFilter"
            @click="opened && $event.stopPropagation()"
          >
            <template #append>
              <VcIcon class="vc-select__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
            </template>
          </VcInput>
        </div>
      </template>

      <template v-if="enabled" #content="{ close }">
        <VcMenuItem
          v-for="(item, index) in filteredItems"
          :key="index"
          :active="isActiveItem(item)"
          :aria-selected="isActiveItem(item)"
          role="option"
          :size="itemSize"
          @click="
            select(item);
            !multiple && close();
          "
          @keyup.enter="
            select(item);
            !multiple && close();
          "
          @keyup.esc="close()"
          @keydown.up.prevent="prev(index)"
          @keydown.down.prevent="next(index)"
        >
          <VcCheckbox v-if="multiple" :model-value="isActiveItem(item)" />

          <slot name="item" v-bind="{ item, index }">
            {{ getItemText(item) }}
          </slot>
        </VcMenuItem>

        <VcMenuItem v-if="filtering && !filteredItems.length" disabled>
          {{ $t("common.messages.no_results") }}
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts">
// TODO: https://virtocommerce.atlassian.net/browse/ST-5117
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { union, lowerCase, isEqual } from "lodash";
import { computed, ref } from "vue";
import { useComponentId } from "@/ui-kit/composables";

interface IProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  modelValue?: object | string | Array<object | string>;
  items: any[];
  size?: "sm" | "md" | "auto";
  itemSize?: "sm" | "md" | "lg";
  textField?: string;
  valueField?: string;
  placeholder?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
  autocomplete?: boolean;
  singleLineMessage?: boolean;
  multiple?: boolean;
}

interface IEmits {
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  itemSize: "sm",
});

const componentId = useComponentId("select");
const filterValue = ref("");
const filtering = ref<boolean>(false);

const getItemText = (item: any) => (props.textField && item ? item[props.textField] : item);
const getItemValue = (item: any) => (props.valueField && item ? item[props.valueField] : item);

function isActiveItem(item: any) {
  const itemValue = getItemValue(item);

  if (!Array.isArray(props.modelValue)) {
    return itemValue === props.modelValue;
  }

  return props.modelValue.some((selectedItem) => isEqual(getItemValue(selectedItem), itemValue));
}

const enabled = computed<boolean>(() => !props.readonly && !props.disabled);
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
}

const selectedText = computed(() =>
  props.textField && selected.value ? selected.value[props.textField] : selected.value,
);

function select(item?: any) {
  if (!enabled.value) {
    return;
  }

  if (props.multiple) {
    let newValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

    const existingIndex = newValues.findIndex((existingItem) =>
      isEqual(getItemValue(existingItem), getItemValue(item)),
    );

    if (existingIndex >= 0) {
      newValues = [...newValues.slice(0, existingIndex), ...newValues.slice(existingIndex + 1)];
    } else {
      newValues.push(item);
    }

    emit("update:modelValue", newValues);
    emit("change", newValues);
  } else {
    emit("update:modelValue", item);
    emit("change", item);
  }
}

function getItemElements() {
  return Array.from(document.querySelectorAll(`#${componentId} [role='option'] [tabindex='0']`));
}

function next(index: number) {
  const elements = getItemElements();

  console.log("next", index);

  if (elements?.length) {
    const focusItemIndex = index === elements?.length - 1 ? 0 : index + 1;
    const nextElement = elements[focusItemIndex];

    if (nextElement instanceof HTMLElement) {
      nextElement.focus();
    }
  }
}

function prev(index: number) {
  const elements = getItemElements();

  if (elements?.length) {
    const focusItemIndex = index === 0 ? elements?.length - 1 : index - 1;
    const prevElement = elements[focusItemIndex];

    if (prevElement instanceof HTMLElement) {
      prevElement.focus();
    }
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

  &--error {
    $error: &;
  }

  &__container {
    @apply relative select-none;
  }

  &__button {
    @apply relative flex items-center w-full rounded border bg-white appearance-none text-left;

    #{$sizeSm} & {
      @apply h-9 text-sm;
    }

    #{$sizeMd} & {
      @apply h-11 text-sm;
    }

    #{$sizeAuto} & {
      @apply h-auto text-sm;
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50 cursor-not-allowed pointer-events-none;
    }

    #{$readonly} & {
      @apply pointer-events-none;
    }

    #{$error} & {
      @apply border-[color:var(--color-danger)];
    }

    &--opened,
    &:focus {
      @apply outline-none ring-[3px] ring-[--color-primary-100];
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

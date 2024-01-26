<template>
  <div
    :id="componentId"
    :class="[
      'vc-select',
      {
        'vc-select--readonly': readonly,
        'vc-select--disabled': disabled,
        'vc-select--error': error,
        'vc-select--autocomplete': autocomplete,
      },
    ]"
  >
    <VcLabel v-if="label" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <VcDropdownMenu placement="bottom" width="100%" :disabled="!enabled" @toggle="toggle">
      <template #trigger="{ opened, open }">
        <div
          v-if="$slots.selected || $slots.placeholder"
          tabindex="0"
          role="button"
          class="vc-select__button"
          @keydown.down.prevent="next(-1)"
        >
          <div class="vc-select__button-content">
            <slot v-if="selected" name="selected" v-bind="{ item: selected, error }" />

            <slot v-else-if="!selected && $slots.placeholder" name="placeholder" v-bind="{ error }" />
          </div>

          <VcIcon class="vc-select__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
        </div>

        <VcInput
          v-else
          v-model="search"
          class="vc-select__input"
          :required="required"
          :size="size"
          :placeholder="placeholderText"
          :disabled="disabled"
          :readonly="readonly || !autocomplete"
          :error="error"
          :clearable="clearable"
          truncate
          @keydown.down.prevent="next(-1)"
          @keyup.stop
          @focus="!opened && open()"
          @click.stop="!opened && open()"
          @input="onFilter"
          @update:model-value="clear"
        >
          <template #append>
            <VcIcon class="vc-select__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
          </template>
        </VcInput>
      </template>

      <template v-if="enabled" #content="{ close }">
        <VcMenuItem
          v-for="(item, index) in filteredItems"
          :key="index"
          :active="isActiveItem(item)"
          :aria-selected="isActiveItem(item)"
          role="option"
          size="md"
          @click="
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
import { union, lowerCase, isEqual } from "lodash";
import { computed, ref } from "vue";
import { useComponentId } from "@/ui-kit/composables";

interface IProps {
  modelValue?: object | string | Array<object | string>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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
  clearable?: boolean;
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
const isShown = ref(false);
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

const placeholderText = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue.length) {
    return `${props.modelValue.length} items selected`;
  }

  return selectedText.value ?? props.placeholder;
});
const enabled = computed<boolean>(() => !props.readonly && !props.disabled);
const selected = computed(() => {
  return props.valueField ? props.items.find((item) => item[props.valueField!] === props.modelValue) : props.modelValue;
});

const search = computed({
  get() {
    if (
      ((!isShown.value && props.autocomplete) || !props.autocomplete) &&
      props.multiple &&
      Array.isArray(props.modelValue) &&
      props.modelValue.length
    ) {
      return `${props.modelValue.length} items selected`;
    }

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

  if (props.multiple && Array.isArray(props.modelValue)) {
    let newValues = [...props.modelValue];

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
    const newValue = getItemValue(item);
    filtering.value = false;

    if (newValue !== props.modelValue) {
      emit("update:modelValue", newValue);
      emit("change", newValue);
    }
  }
}

function getItemsElements() {
  return Array.from(document.querySelectorAll(`#${componentId} [role='option'] [tabindex='0']`));
}

function next(index: number) {
  const elements = getItemsElements();

  if (elements?.length) {
    const focusItemIndex = index === elements?.length - 1 ? 0 : index + 1;
    const nextElement = elements[focusItemIndex];

    if (nextElement instanceof HTMLElement) {
      nextElement.focus();
    }
  }
}

function prev(index: number) {
  const elements = getItemsElements();

  if (elements?.length) {
    const focusItemIndex = index === 0 ? elements?.length - 1 : index - 1;
    const prevElement = elements[focusItemIndex];

    if (prevElement instanceof HTMLElement) {
      prevElement.focus();
    }
  }
}

function toggle(value: boolean) {
  isShown.value = value;

  if (!isShown.value) {
    filterValue.value = "";
  }
}

function clear(value: any) {
  if (value === undefined) {
    if (
      ((!isShown.value && props.autocomplete) || !props.autocomplete) &&
      props.multiple &&
      Array.isArray(props.modelValue) &&
      props.modelValue.length
    ) {
      emit("update:modelValue", []);
    } else if (!props.multiple) {
      emit("update:modelValue", undefined);
    }
  }
}
</script>

<style scoped lang="scss">
.vc-select {
  $disabled: "";
  $readonly: "";
  $autocomplete: "";
  $opened: "";
  $error: "";

  @apply flex flex-col;

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
  }

  &--autocomplete {
    $autocomplete: &;
  }

  &--error {
    $error: &;
  }

  &__container {
    @apply relative select-none;
  }

  &__button {
    @apply relative flex items-center w-full rounded border bg-white appearance-none text-left;

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50 cursor-not-allowed pointer-events-none;
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
}
</style>

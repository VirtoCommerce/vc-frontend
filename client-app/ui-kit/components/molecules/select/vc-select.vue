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
        'vc-select--opened': isShown,
      },
    ]"
  >
    <VcLabel v-if="label" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <VcDropdownMenu
      class="vc-select__container"
      :disabled="!enabled"
      :data-test-id="testIdDropdown"
      @toggle="toggled"
      tabindex="-1"
    >
      <template #trigger="{ open, toggle, close }">
        <div
          v-if="$slots.selected || $slots.placeholder"
          tabindex="0"
          role="button"
          class="vc-select__button"
          @click="toggle"
          @keydown.enter="toggle"
          @keydown.down.prevent="next(-1)"
        >
          <div class="vc-select__button-content">
            <slot v-if="selected" name="selected" v-bind="{ item: selected, error }" />

            <slot v-else-if="!selected && $slots.placeholder" name="placeholder" v-bind="{ error }" />
          </div>

          <VcIcon class="vc-select__icon" :name="isShown ? 'chevron-up' : 'chevron-down'" size="xs" />
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
          truncate
          disable-autocomplete
          @keydown.down.prevent="next(-1)"
          @focus="open"
          @click="(autocomplete && open) || (!autocomplete && toggle)"
          @keydown.esc="close()"
        >
          <template #append>
            <VcButton
              v-if="isClearButtonVisible"
              :disabled="disabled"
              type="button"
              icon="delete-thin"
              color="neutral"
              variant="no-background"
              class="vc-select__clear"
              :icon-size="size === 'md' ? '0.875rem' : '0.75rem'"
              @keydown.enter.stop.prevent
              @keyup.enter.stop.prevent="clear"
              @click.stop="clear"
            />

            <button
              :aria-label="$t('ui_kit.buttons.toggle_dropdown')"
              type="button"
              tabindex="-1"
              class="vc-select__arrow"
              @click="handleArrowClick($event, toggle)"
            >
              <VcIcon :name="isShown ? 'chevron-up' : 'chevron-down'" size="xs" />
            </button>
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
          :size="itemSize"
          @click="
            select(item);
            !multiple && close();
          "
          @keyup.esc="close()"
          @keydown.up.prevent="prev(index)"
          @keydown.down.prevent="next(index)"
        >
          <VcCheckbox v-if="multiple" :model-value="isActiveItem(item)" tabindex="-1" />

          <slot name="item" v-bind="{ item, index }">
            {{ getItemText(item) }}
          </slot>
        </VcMenuItem>

        <VcMenuItem v-if="filterValue && !filteredItems.length" disabled>
          {{ $t("ui_kit.messages.no_results") }}
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts">
// TODO: https://virtocommerce.atlassian.net/browse/ST-5117

/* eslint-disable @typescript-eslint/no-explicit-any */

import { union, lowerCase, isEqual } from "lodash";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useComponentId } from "@/ui-kit/composables";

interface IProps {
  modelValue?: object | string | Array<object | string>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  items: any[];
  size?: "xs" | "sm" | "md" | "auto";
  itemSize?: "xs" | "sm" | "md" | "lg";
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
  testIdDropdown?: string;
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

const { t } = useI18n();
const componentId = useComponentId("select");

const isShown = ref(false);
const filterValue = ref("");

const getItemText = (item: any) => (props.textField && item ? item[props.textField] : item);
const getItemValue = (item: any) => (props.valueField && item ? item[props.valueField] : item);

const selectedText = computed(() => {
  if (Array.isArray(props.modelValue)) {
    if (props.modelValue.length) {
      return t("ui_kit.select.items_selected", [props.modelValue.length]);
    }

    return null;
  }

  if (props.textField && selected.value) {
    return selected.value[props.textField];
  }

  return selected.value;
});

const placeholderText = computed(() => selectedText.value ?? props.placeholder);

const enabled = computed<boolean>(() => !props.readonly && !props.disabled);

const selected = computed(() => {
  return props.valueField ? props.items.find((item) => item[props.valueField!] === props.modelValue) : props.modelValue;
});

const hasSelection = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0;
  }
  return props.modelValue !== undefined && props.modelValue !== null;
});

const isClearButtonVisible = computed(() => {
  if (!props.clearable || props.disabled || props.readonly) {
    return false;
  }

  // In autocomplete mode when dropdown is open - show if there's filterValue or selection
  if (props.autocomplete && isShown.value) {
    return !!filterValue.value || hasSelection.value;
  }

  return hasSelection.value;
});

const search = computed({
  get() {
    if (props.autocomplete && isShown.value) {
      return filterValue.value;
    }

    return selectedText.value;
  },
  set(value) {
    filterValue.value = value;
  },
});

const filteredItems = computed(() => {
  if (!filterValue.value) {
    return props.items;
  }

  const searching = lowerCase(filterValue.value);
  const items = props.items.filter((item) => lowerCase(getItemText(item)).includes(searching));

  const first = items.filter((item) => lowerCase(getItemText(item)).indexOf(searching) === 0);

  return union(first, items);
});

function isActiveItem(item: any) {
  const itemValue = getItemValue(item);

  if (!Array.isArray(props.modelValue)) {
    return itemValue === props.modelValue;
  }

  return props.modelValue.some((selectedItem) => isEqual(getItemValue(selectedItem), itemValue));
}

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

function toggled(value: boolean) {
  isShown.value = value;

  if (!isShown.value) {
    filterValue.value = "";
  }
}

function clear() {
  // In autocomplete mode - clear search first, then selection
  if (props.autocomplete && filterValue.value) {
    filterValue.value = "";
    return;
  }

  // Clear selection
  if (props.multiple && Array.isArray(props.modelValue) && props.modelValue.length) {
    emit("update:modelValue", []);
    emit("change", []);
  } else if (!props.multiple && hasSelection.value) {
    emit("update:modelValue", undefined);
    emit("change", undefined);
  }
}

function handleArrowClick(event: MouseEvent, toggle: () => void) {
  event.stopPropagation();
  toggle();
}
</script>

<style lang="scss">
.vc-select {
  $disabled: "";
  $readonly: "";
  $autocomplete: "";
  $opened: "";
  $error: "";

  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

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

  &--opened {
    $opened: &;
  }

  &--error {
    $error: &;
  }

  &__container {
    @apply relative rounded-[--radius];
  }

  &__button {
    @apply relative flex items-center w-full rounded-[--radius] border bg-additional-50 appearance-none text-left;

    #{$disabled} &,
    &:disabled {
      @apply bg-neutral cursor-not-allowed pointer-events-none;
    }

    #{$readonly} & {
      @apply pointer-events-none;
    }

    #{$error} & {
      @apply border-danger;
    }

    &--opened,
    &:focus {
      @apply outline-none ring-[3px] ring-primary-100;
    }
  }

  &__button-content {
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0 h-full;

    #{$error} & {
      @apply text-danger;
    }
  }

  &__input {
    @apply w-full cursor-pointer;

    & input {
      @apply cursor-pointer;

      #{$opened} & {
        @apply cursor-auto;
      }
    }
  }

  &__arrow {
    @apply flex items-center h-full pe-3 ps-1 text-neutral-900;

    &:hover {
      @apply text-neutral;
    }

    #{$disabled} & {
      @apply text-neutral;
    }
  }

  &__icon {
    @apply shrink-0 mr-3 fill-neutral-900;

    #{$disabled} & {
      @apply fill-neutral-400;
    }

    #{$readonly} & {
      @apply hidden;
    }
  }
}
</style>

<template>
  <div>
    <div v-if="label">
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
    </div>

    <div v-click-outside="() => open && hideList()" class="relative select-none">
      <button
        type="button"
        :disabled="isDisabled"
        :class="buttonClasses"
        class="relative truncate text-left w-full appearance-none rounded pl-3 pr-7 leading-none border border-gray-300 outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed focus:border-gray-400"
        @click="toggle"
      >
        <slot v-if="placeholder && !selected" name="placeholder">
          <span class="text-gray-400">{{ placeholder }}</span>
        </slot>

        <slot v-if="selected" name="selected" v-bind="{ item: selected }">
          {{ getValue(selected, textField) }}
        </slot>

        <span
          class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          :class="{ 'opacity-50': isDisabled }"
        >
          <i class="text-gray-700 fas fa-chevron-down"></i>
        </span>
      </button>

      <transition :leave-active-class="`transition duration-${transitionDuration} ease-in`" leave-to-class="opacity-0">
        <div
          v-show="open"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-52 rounded border border-gray-300 overflow-hidden"
        >
          <ul ref="listElement" class="max-h-52 overflow-auto">
            <li
              v-if="$slots.first"
              :class="`px-3 py-2 text-gray-400 hover:text-white hover:bg-[color:var(--color-primary)] cursor-pointer`"
              @click="select()"
            >
              <slot name="first" />
            </li>

            <li
              v-for="(item, index) in items"
              :key="index"
              :class="[
                `px-3 py-2 hover:text-white hover:bg-[color:var(--color-primary)] last:border-b-2 border-transparent`,
                isActiveItem(item) ? `cursor-default text-[color:var(--color-primary)]` : 'cursor-pointer',
              ]"
              @click="select(item)"
            >
              <slot name="item" v-bind="{ item, index, selected }">
                {{ getValue(item, textField) }}
              </slot>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
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

export interface Props {
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  modelValue: string | undefined;
  items: unknown[] | undefined;
  keyField?: string;
  textField?: string;
  valueField?: string;
  size?: "sm" | "md" | "lg";
  errorMessage?: string;
}

export interface Emits {
  (event: "update:modelValue", value: string): void;
  (event: "change", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  isRequired: false,
  isDisabled: false,
  size: "md",
});

const emit = defineEmits<Emits>();

const transitionDuration = 100;

const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

const selected = computed(() => props.items?.find((item) => getValue(item, props.valueField) === props.modelValue));

const buttonClasses = computed<string>(() => {
  switch (props.size) {
    case "lg":
      return "h-11 text-base";

    case "sm":
      return "h-8 text-sm";

    case "md":
    default:
      return "h-9 text-base";
  }
});

function isActiveItem(item: unknown): boolean {
  const value = getValue(item, props.valueField);
  const result = value === props.modelValue;
  return result;
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
  if (props.isDisabled) {
    return;
  }

  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(item?: unknown) {
  if (props.isDisabled) {
    return;
  }

  const value = getValue(item, props.valueField);

  if (value !== props.modelValue) {
    emit("update:modelValue", value);
    emit("change", value);
  }

  hideList();
}

function getValue(item: unknown, field: string | undefined): string {
  if (field && item) {
    return (item as Record<string, string>)[field];
  }
  return item as string;
}
</script>

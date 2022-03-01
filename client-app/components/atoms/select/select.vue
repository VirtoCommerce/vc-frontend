<template>
  <div>
    <div v-if="label">
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-red-500">*</span>
    </div>

    <div v-click-outside="hideList" class="relative select-none">
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
          {{ textField && selected ? selected[textField] : selected }}
        </slot>

        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
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
              :class="`px-3 py-2 text-gray-400 hover:text-white hover:bg-${color} cursor-pointer`"
              @click="select()"
            >
              <slot name="first" />
            </li>

            <li
              v-for="(item, index) in items"
              :key="index"
              :class="[
                `px-3 py-2 hover:text-white hover:bg-${color} last:border-b-2 border-transparent`,
                isActiveItem(item) ? `cursor-default text-${color}` : 'cursor-pointer',
              ]"
              @click="select(item)"
            >
              <slot name="item" v-bind="{ item, index, selected }">
                {{ textField && item ? item[textField] : item }}
              </slot>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <div v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</div>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import { computed, PropType, ref, shallowRef } from "vue";

const props = defineProps({
  label: {
    type: String,
  },

  isRequired: {
    type: Boolean,
    default: false,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },

  modelValue: {
    type: [Object, String],
    default: undefined,
  },

  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  /**
   * The property of the object that will be displayed in the "selected" and "item" slots.
   * (Optional) Only for objects array of modelValue.
   */
  textField: {
    type: String,
    default: undefined,
  },

  /**
   * An object property passed as a new value for the "modelValue" or "change" events
   * (Optional) Only for objects array of modelValue.
   */
  valueField: {
    type: String,
    default: undefined,
  },

  placeholder: {
    type: String,
    default: "",
  },

  color: {
    type: String,
    default: "yellow-500",
  },

  size: {
    type: String as PropType<"sm" | "md" | "lg">,
    default: "md",
    validator(value: string) {
      return ["sm", "md", "lg"].includes(value);
    },
  },

  errorMessage: {
    type: String,
    default: undefined,
  },

  // TODO: add size prop and etc...
});

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}>();

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
  if (props.isDisabled) {
    return;
  }

  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(item?: any) {
  if (props.isDisabled) {
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

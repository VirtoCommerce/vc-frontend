<template>
  <div>
    <div>
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-red-500">*</span>
    </div>

    <div v-click-outside="hideList" class="relative select-none">
      <button
        type="button"
        class="relative truncate text-left h-11 w-full appearance-none rounded pl-3 pr-7 py-3 text-base leading-none box-border border border-gray-300 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed focus:border-gray-400"
        :disabled="isDisabled"
        @click="toggle"
      >
        <slot v-if="placeholder && !selected" name="placeholder">
          <span class="text-gray-400">{{ placeholder }}</span>
        </slot>

        <slot v-if="selected" name="selected" v-bind="{ item: selected }">
          {{ itemTextKey && selected ? selected[itemTextKey] : selected }}
        </slot>

        <span
          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
          :class="{ 'opacity-50': isDisabled }"
        >
          <i class="text-gray-700 fas fa-chevron-down"></i>
        </span>
      </button>

      <transition
        :leave-active-class="`transition duration-${transitionDuration} ease-in`"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="open"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-52 rounded border border-gray-300 overflow-hidden"
        >
          <ul ref="listElement" class="max-h-52 overflow-auto">
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
                {{ itemTextKey ? item[itemTextKey] : item }}
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
    required: true,
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
    default: "",
  },

  items: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  /**
   * The property of the object that will be displayed in the "selected" and "item" slots.
   * (Optional) Only for objects array of modelValue.
   */
  itemTextKey: {
    type: String,
    default: undefined,
  },

  /**
   * An object property passed as a new value for the "modelValue" or "change" events
   * (Optional) Only for objects array of modelValue.
   */
  itemValueKey: {
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
  const returnValueKey: string | undefined = props.itemValueKey;

  if (returnValueKey) {
    return props.items.find((item) => item[returnValueKey] === props.modelValue);
  }

  return props.modelValue;
});

function isActiveItem(item: any): boolean {
  const itemValue = props.itemValueKey ? item[props.itemValueKey] : item;
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

function select(item: any) {
  if (props.isDisabled) {
    return;
  }

  const newValue = props.itemValueKey ? item[props.itemValueKey] : item;

  if (newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }

  hideList();
}
</script>

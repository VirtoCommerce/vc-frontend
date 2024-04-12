<template>
  <div>
    <button
      v-for="(item, index) in items"
      :key="index"
      :disabled="isDisabled"
      :class="isActiveItem(item) ? 'cursor-default' : 'text-[--link-color] hover:text-[--link-hover-color]'"
      type="button"
      class="appearance-none px-2.5 disabled:opacity-40"
      @click="select(item)"
    >
      <span
        :class="{ [isDisabled ? '!border-neutral-400' : '!border-primary']: isActiveItem(item) }"
        class="block appearance-none border-b-[3px] border-transparent pb-2.5 pt-3 font-bold"
      >
        <slot name="item" v-bind="{ item, index }">
          {{ textField && item ? item[textField] : item }}
        </slot>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
// FIXME: https://virtocommerce.atlassian.net/browse/ST-5118
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PropType } from "vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}>();

const props = defineProps({
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

  // TODO: implement resizing
  size: {
    type: String as PropType<"sm" | "md" | "lg">,
    default: "md",

    validator(value: string) {
      return ["sm", "md", "lg"].includes(value);
    },
  },
});

function isActiveItem(item: any): boolean {
  const itemValue = props.valueField && item ? item[props.valueField] : item;
  return itemValue === props.modelValue;
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
}
</script>

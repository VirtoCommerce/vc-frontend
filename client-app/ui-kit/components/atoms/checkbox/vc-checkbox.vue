<template>
  <label class="flex select-none items-center" :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'">
    <input
      type="checkbox"
      :name="name"
      :value="value"
      :disabled="disabled"
      :checked="checked"
      :aria-checked="checked"
      :class="[
        disabled
          ? `border-neutral-200 ${checked ? 'bg-neutral-300' : 'bg-neutral-50'}`
          : `border-neutral-300 bg-additional-50 checked:bg-primary`,
      ]"
      class="form-tick size-5 shrink-0 cursor-pointer appearance-none rounded border-2 checked:border-transparent disabled:cursor-not-allowed"
      @change="change"
    />

    <span v-if="$slots.default" :class="{ 'opacity-60': disabled }" class="ml-2 min-w-0 text-sm">
      <slot v-bind="{ checked }" />
    </span>
  </label>
</template>

<script setup lang="ts">
// FIXME: https://virtocommerce.atlassian.net/browse/ST-3812
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from "vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean | any[]): void;
  (event: "change", value: boolean | any[]): void;
}>();

const props = defineProps({
  disabled: Boolean,

  modelValue: {
    type: [Boolean, Array],
    default: () => [],
  },

  name: {
    type: String,
    default: null,
  },

  // only for array of model value
  value: {
    type: [Boolean, String, Number, Object],
    default: undefined,
  },
});

const checked = computed<boolean>(() =>
  typeof props.modelValue === "boolean" ? props.modelValue : props.modelValue.includes(props.value),
);

function change() {
  if (props.disabled) {
    return;
  }

  if (typeof props.modelValue === "boolean") {
    const newValue = !props.modelValue;
    emit("update:modelValue", newValue);
    emit("change", newValue);
  } else {
    const newArray = [...props.modelValue];
    const index = newArray.indexOf(props.value);

    if (index === -1) {
      newArray.push(props.value);
    } else {
      newArray.splice(index, 1);
    }

    emit("update:modelValue", newArray);
    emit("change", newArray);
  }
}
</script>

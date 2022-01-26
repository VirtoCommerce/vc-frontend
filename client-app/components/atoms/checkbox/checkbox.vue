<template>
  <label class="flex items-center select-none" :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'">
    <input
      type="checkbox"
      :name="name"
      :value="value"
      :disabled="disabled"
      :checked="checked"
      :aria-checked="checked"
      :class="[
        checked && disabled ? 'bg-gray-300' : `checked:bg-${color}`,
        disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white',
      ]"
      class="form-tick appearance-none flex-shrink-0 w-5 h-5 border-2 rounded-sm cursor-pointer disabled:cursor-not-allowed checked:border-transparent"
      @change="change"
    />

    <span v-if="$slots.default" :class="{ 'opacity-60': disabled }" class="ml-2 text-sm">
      <slot v-bind="{ checked }" />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

  color: {
    type: String,
    default: "yellow-500",
  },

  // only for array of model value
  value: {
    type: [Object, String, Number, Boolean],
    default: undefined,
  },
});

const emit = defineEmits<{
  (event: "update:modelValue", newValue: boolean | unknown[]): void;
}>();

const checked = computed<boolean>(() =>
  typeof props.modelValue === "boolean" ? props.modelValue : props.modelValue.includes(props.value)
);

function change() {
  if (typeof props.modelValue === "boolean") {
    emit("update:modelValue", !props.modelValue);
  } else {
    const newArray = [...props.modelValue];
    const index = newArray.indexOf(props.value);

    if (index === -1) {
      newArray.push(props.value);
    } else {
      newArray.splice(index, 1);
    }

    emit("update:modelValue", newArray);
  }
}
</script>

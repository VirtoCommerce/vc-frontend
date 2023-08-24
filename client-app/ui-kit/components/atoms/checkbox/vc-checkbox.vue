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
          ? `border-gray-200 ${checked ? 'bg-gray-300' : 'bg-gray-50'}`
          : `border-gray-300 bg-white checked:bg-[color:var(--color-primary)]`,
      ]"
      class="form-tick h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border-2 checked:border-transparent disabled:cursor-not-allowed"
      @change="change"
    />

    <span v-if="$slots.default" :class="{ 'opacity-60': disabled }" class="ml-2 min-w-0 text-sm">
      <slot v-bind="{ checked }" />
    </span>
  </label>
</template>

<script setup lang="ts" generic="V, T extends boolean | V[]">
import { isBoolean } from "lodash";
import { computed } from "vue";

export interface IEmits<T> {
  (event: "update:modelValue", value: T): void;
  (event: "change", value: T): void;
}

export interface IProps<V, T extends boolean | V[]> {
  modelValue?: T;
  value?: T extends boolean ? never : V;
  disabled?: boolean;
  name?: string;
}

const emit = defineEmits<IEmits<T>>();

const props = defineProps<IProps<V, T>>();

const checked = computed<boolean>(() =>
  isBoolean(props.modelValue) ? props.modelValue : props.modelValue?.includes(props.value!) ?? false,
);

function change() {
  if (props.disabled) {
    return;
  }

  let newValue: T;

  if (isBoolean(props.modelValue)) {
    newValue = !props.modelValue as T;
  } else {
    const newArray = [...(props.modelValue as V[])];
    const index = newArray.indexOf(props.value!);

    if (index === -1) {
      newArray.push(props.value!);
    } else {
      newArray.splice(index, 1);
    }

    newValue = newArray as T;
  }

  emit("update:modelValue", newValue);
  emit("change", newValue);
}
</script>

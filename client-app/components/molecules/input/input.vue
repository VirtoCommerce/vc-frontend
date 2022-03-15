<template>
  <div>
    <div v-if="label">
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-red-500">*</span>
    </div>

    <input
      class="appearance-none h-11 rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400 min-w-0"
      :value="modelValue"
      :type="inputType"
      :name="name"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :autofocus="autofocus"
      :min="minValue"
      :max="maxValue"
      :maxlength="maxlength"
      :step="stepValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <div v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  autofocus: Boolean,
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
  maxlength: [String, Number],

  label: {
    type: String,
    default: undefined,
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
    type: [String, Number],
    default: "",
  },

  placeholder: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    default: "text",
  },

  name: {
    type: String,
    default: undefined,
  },

  errorMessage: {
    type: String,
    default: undefined,
  },
});

const inputType = ref("");
const isNumberTypeSafari = ref(false);

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

watchEffect(() => {
  let type = props.type;

  // Safari has bug for number input
  if (typeof window !== "undefined" || typeof document !== "undefined") {
    const ua = navigator.userAgent.toLocaleLowerCase();

    if (type === "number" && ua.includes("safari") && !ua.includes("chrome")) {
      isNumberTypeSafari.value = true;
      type = "text";
    }
  }

  inputType.value = type;
});

watchEffect(() => {
  if (!isNumberTypeSafari.value) return;

  if (isNaN(props.modelValue as number)) {
    emit("update:modelValue");
  }
});
</script>

<template>
  <div class="vc-input">
    <div v-if="label">
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
    </div>

    <div class="relative h-11">
      <input
        class="appearance-none rounded h-full px-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400 min-w-0"
        :class="{ 'pr-12': isPasswordIconVisible }"
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
        :autocomplete="autocomplete"
        @input="change"
      />

      <button
        v-if="isPasswordIconVisible"
        type="button"
        class="appearance-none absolute top-0 right-0 h-full w-12 flex items-center justify-center cursor-pointer text-[color:var(--color-primary)]"
        @click="togglePasswordVisibility"
      >
        <i class="fa text-xl" :class="passwordVisibilityIcon" />
      </button>
    </div>

    <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  autofocus: Boolean,
  autocomplete: String,
  isDisabled: Boolean,
  isRequired: Boolean,
  hidePasswordSwitcher: Boolean,
  label: String,
  name: String,
  placeholder: String,
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
  maxlength: [String, Number],
  errorMessage: String,

  modelValue: {
    type: [String, Number],
    default: "",
  },

  type: {
    type: String,
    default: "text",
  },
});

const inputType = ref("");
const isPasswordVisible = ref(false);
const isNumberTypeSafari = ref(false);

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "fa-eye-slash" : "fa-eye"));
const isPasswordIconVisible = computed<boolean>(() => props.type === "password" && !props.hidePasswordSwitcher);

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
  inputType.value = isPasswordVisible.value ? "text" : "password";
}

function change(event: Event) {
  if (props.isDisabled) {
    return;
  }
  const newValue: string = (event.target as HTMLInputElement).value;
  emit("update:modelValue", props.type === "number" ? Number(newValue) : newValue);
}

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

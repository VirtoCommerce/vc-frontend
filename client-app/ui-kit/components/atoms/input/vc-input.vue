<template>
  <div class="vc-input">
    <div v-if="label">
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
    </div>

    <div class="relative h-11">
      <input
        class="box-border h-full w-full min-w-0 appearance-none rounded px-3 text-base leading-none outline-none"
        :class="[
          inputClass,
          { 'pr-12': isPasswordIconVisible, 'border border-gray-300 focus:border-gray-400': !withoutBorder },
        ]"
        :value="modelValue"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        :readonly="isReadonly"
        :disabled="isDisabled"
        :min="minValue"
        :max="maxValue"
        :minlength="minlength"
        :maxlength="maxlength"
        :step="stepValue"
        :autocomplete="autocomplete"
        @input="change"
      />

      <button
        v-if="isPasswordIconVisible"
        tabindex="-1"
        type="button"
        class="absolute top-0 right-0 flex h-full w-12 cursor-pointer appearance-none items-center justify-center text-[color:var(--color-primary)]"
        @click="togglePasswordVisibility"
      >
        <i class="fa text-xl" :class="passwordVisibilityIcon" />
      </button>
    </div>

    <div v-if="errorMessage" class="pt-0.5 text-xs text-[color:var(--color-danger)]" v-html="errorMessage"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watchEffect } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  autocomplete: String,
  isReadonly: Boolean,
  isDisabled: Boolean,
  isRequired: Boolean,
  withoutBorder: Boolean,
  hidePasswordSwitcher: Boolean,
  label: String,
  name: String,
  placeholder: String,
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
  minlength: [String, Number],
  maxlength: [String, Number],
  errorMessage: String,
  inputClass: String,

  modelValue: {
    type: [String, Number],
    default: "",
  },

  type: {
    type: String as PropType<"text" | "password" | "number">,
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
  let value: string = (event.target as HTMLInputElement).value;

  if (props.type !== "password") {
    value = value.trim();
  }

  emit("update:modelValue", props.type === "number" ? Number(value) : value);
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
  if (!isNumberTypeSafari.value) {
    return;
  }

  if (isNaN(props.modelValue as number)) {
    emit("update:modelValue");
  }
});
</script>

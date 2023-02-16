<template>
  <VcInput
    :model-value="modelValue"
    @update:model-value="$event && emit('update:modelValue', $event)"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :type="inputType"
    :message="message"
    :error="error"
    :size="size"
    :show-empty-details="showEmptyDetails"
    :name="name"
    autocomplete="password"
  >
    <template #endDecorator>
      <button
        v-if="!hidePasswordSwitcher"
        tabindex="-1"
        type="button"
        class="px-3 text-[color:var(--color-primary)] disabled:text-gray-300"
        :disabled="disabled"
        @click="togglePasswordVisibility"
      >
        <VcIcon :name="passwordVisibilityIcon" />
      </button>
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  noBorder?: boolean;
  hidePasswordSwitcher?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
  size?: "sm" | "md";
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
}

interface Emits {
  (event: "update:modelValue", value?: string): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const inputType = ref("password");
const isPasswordVisible = ref(false);

const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
  inputType.value = isPasswordVisible.value ? "text" : "password";
}
</script>

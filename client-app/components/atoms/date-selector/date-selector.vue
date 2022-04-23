<template>
  <div v-if="label">
    <span class="font-bold text-gray-900">{{ label }}</span>
    <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
  </div>
  <input
    class="appearance-none h-11 rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400 min-w-0"
    type="date"
    :value="props.modelValue"
    :disabled="isDisabled"
    :autofocus="autofocus"
    :name="name"
    @change="change"
  />
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
//const value = ref(null);

const props = defineProps({
  autofocus: Boolean,
  label: {
    type: String,
    default: undefined,
  },
  name: {
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
    type: String,
    default: "",
  },

  errorMessage: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue"]);

function change(event: Event) {
  const newValue: string = (event.target as HTMLInputElement).value;
  emit("update:modelValue", newValue);
}
</script>

<template>
  <VcInput
    v-model="draft"
    type="number"
    size="xs"
    min="0"
    :max="max"
    :disabled="disabled"
    :aria-label="label"
    @blur="commit"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface IProps {
  modelValue: number;
  max: number;
  /** Names the field for screen readers — several identical inputs share one column header. */
  label: string;
  disabled?: boolean;
}

interface IEmits {
  (event: "update:modelValue", value: number): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
// A local draft, not the bound number: emptying the field to retype is a legitimate intermediate
// state, and clamping on every keystroke would rewrite "1" before the second digit arrives.
const draft = ref<string | number | undefined>();

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value || undefined;
  },
  { immediate: true },
);

function commit(): void {
  const raw = String(draft.value ?? "").trim();
  const parsed = Math.trunc(Number(raw));
  const value = raw === "" || !Number.isFinite(parsed) ? 0 : Math.min(Math.max(parsed, 0), props.max);

  draft.value = value || undefined;
  emit("update:modelValue", value);
}
</script>

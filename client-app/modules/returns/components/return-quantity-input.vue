<template>
  <VcInput
    v-model="draft"
    type="number"
    size="xs"
    min="0"
    :max="max"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="onInput"
    @blur="commit"
    @keyup.enter="commit"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface IProps {
  modelValue: number;
  max: number;
  label: string;
  disabled?: boolean;
}

interface IEmits {
  (event: "update:modelValue", value: number): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const draft = ref<string | number | undefined>();

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value || undefined;
  },
  { immediate: true },
);

function clamp(): number {
  const raw = String(draft.value ?? "").trim();
  const parsed = Math.trunc(Number(raw));

  return raw === "" || !Number.isFinite(parsed) ? 0 : Math.min(Math.max(parsed, 0), props.max);
}

// Emitted while typing, without touching what is on screen: the Continue button is disabled until
// a quantity is selected, and a disabled button takes no focus, so waiting for blur would trap the
// buyer with a number they can see and cannot use.
function onInput(): void {
  emit("update:modelValue", clamp());
}

function commit(): void {
  const value = clamp();

  draft.value = value || undefined;
  emit("update:modelValue", value);
}
</script>

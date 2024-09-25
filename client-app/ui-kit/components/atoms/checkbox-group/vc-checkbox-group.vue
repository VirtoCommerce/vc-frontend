<template>
  <div class="vc-checkbox-group">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";

interface IEmits {
  (event: "update:modelValue", value: (string | number | object)[]): void;
  (event: "change", value: (string | number | object)[]): void;
}

interface IProps {
  modelValue?: (string | number | object)[];
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [],
});

function toggleValue(value: string | number | object) {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (index === -1) {
    newValue.push(value);
  } else {
    newValue.splice(index, 1);
  }

  emit("update:modelValue", newValue);
  emit("change", newValue);
}

provide<VcCheckboxGroupContextType>("checkboxGroupContext", {
  modelValue: computed(() => props.modelValue).value,
  toggleValue,
});
</script>

<style scoped>
.vc-checkbox-group {
}
</style>

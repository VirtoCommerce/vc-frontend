<template>
  <div class="vc-checkbox-group">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch, toRefs } from "vue";

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

const { modelValue } = toRefs(props);

const internalModelValue = ref([...modelValue.value]);

function toggleValue(value: string | number | object) {
  const index = internalModelValue.value.indexOf(value);

  if (index === -1) {
    internalModelValue.value.push(value);
  } else {
    internalModelValue.value.splice(index, 1);
  }

  emit("update:modelValue", [...internalModelValue.value]);
  emit("change", [...internalModelValue.value]);
}

provide<VcCheckboxGroupContextType>("checkboxGroupContext", {
  modelValue: internalModelValue,
  toggleValue,
});

watch(
  () => props.modelValue,
  (newVal) => {
    internalModelValue.value = [...newVal];
  },
  { deep: true, immediate: true },
);
</script>

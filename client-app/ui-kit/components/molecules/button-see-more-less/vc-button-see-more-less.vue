<template>
  <VcButton color="accent" variant="no-border" size="sm" :prepend-icon="icon" @click="toggled = !toggled">
    {{ text }}
  </VcButton>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IEmits {
  (event: "update:modelValue", value: boolean): void;
}

interface IProps {
  modelValue?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();
const toggled = useVModel(props, "modelValue", emit);

const icon = computed<string>(() => (toggled.value ? "chevron-up" : "chevron-down"));
const text = computed<string>(() => t(toggled.value ? "common.buttons.see_less" : "common.buttons.see_more"));
</script>

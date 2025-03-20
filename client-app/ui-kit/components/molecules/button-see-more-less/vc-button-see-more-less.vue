<template>
  <VcButton color="accent" variant="no-background" :size="size" :prepend-icon="icon" @click="toggled = !toggled">
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
  size?: "xs" | "sm" | "md" | "lg";
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  size: "sm",
});

const { t } = useI18n();
const toggled = useVModel(props, "modelValue", emit);

const icon = computed<string>(() => (toggled.value ? "chevron-up" : "chevron-down"));
const text = computed<string>(() => t(toggled.value ? "ui_kit.buttons.see_less" : "ui_kit.buttons.see_more"));
</script>

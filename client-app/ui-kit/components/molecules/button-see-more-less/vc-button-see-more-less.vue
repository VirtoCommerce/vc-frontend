<template>
  <button type="button" class="vc-button-see-more-less" @click="toggled = !toggled">
    <VcIcon :name="icon" size="xxs" class="vc-button-see-more-less__icon" />
    <span class="vc-button-see-more-less__text">{{ text }}</span>
  </button>
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

<style scoped lang="scss">
.vc-button-see-more-less {
  @apply inline-flex flex-row items-center gap-x-1 py-1
  border-[color:var(--color-link)] text-14 text-[color:var(--color-link)];

  &:hover {
    @apply border-[color:var(--color-link-hover)] text-[color:var(--color-link-hover)];
  }

  &__icon {
    @apply text-[color:var(--color-primary)] mt-0.5;
  }

  &__text {
    @apply border-b border-dashed border-inherit leading-tight;
  }
}
</style>

<template>
  <VcSectionWidget :title="$t('shared.checkout.order_comment_section.title')" icon="document-text">
    <VcTextarea
      v-model="text"
      :placeholder="$t('common.placeholders.enter_value')"
      :disabled="disabled"
      :max-length="1000"
      :rows="4"
      counter
    />
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";

interface Props {
  disabled?: boolean;
  comment: string;
}

interface Emits {
  (event: "update:comment", value: string): void;
}

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  comment: "",
});

const text = useVModel(props, "comment", emit);
</script>

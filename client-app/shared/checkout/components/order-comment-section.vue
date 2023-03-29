<template>
  <VcSectionWidget :title="$t('common.titles.order_comment')" icon="document-text">
    <p v-if="readonly">{{ comment }}</p>

    <VcTextarea
      v-else
      v-model.trim="text"
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

interface IEmits {
  (event: "update:comment", value: string): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  comment?: string;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  comment: "",
});

const text = useVModel(props, "comment", emit);
</script>

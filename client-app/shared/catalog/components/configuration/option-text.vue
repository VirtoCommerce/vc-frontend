<template>
  <div class="configuration-option-text">
    <div class="configuration-option-text__field">
      <VcRadioButton
        :model-value="selected ? 'selected' : ''"
        name="text"
        value="selected"
        @input="$emit('input', inputValue)"
      />
      <VcInput
        v-model="inputValue"
        class="configuration-option-text__input"
        :maxlength="MAX_LENGTH"
        @input="selected && $emit('input', inputValue)"
      />
    </div>

    <div v-if="!isRequired" class="configuration-option-text__field configuration-option-text__field--none">
      <VcRadioButton name="text" :model-value="selected ? '' : 'none'" value="none" @input="$emit('input', undefined)">
        <span class="configuration-option-text__label">
          {{ $t("shared.catalog.product_details.product_configuration.none") }}
        </span>
      </VcRadioButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from "vue";

defineEmits<IEmits>();

const props = defineProps<Props>();
const MAX_LENGTH = 255;
const propsValue = toRef(props, "value");

const inputValue = ref(propsValue.value);

interface Props {
  isRequired: boolean;
  value?: string;
  selected?: boolean;
}

interface IEmits {
  (e: "input", value: string | undefined): void;
}

watch(propsValue, (newVal) => {
  if (newVal) {
    inputValue.value = newVal;
  }
});
</script>

<style lang="scss">
.configuration-option-text {
  --bg: theme("colors.neutral.50");

  @apply flex flex-col gap-3;

  &__field {
    @apply flex gap-3 p-4 items-center odd:bg-[--bg];
  }

  &__input {
    @apply w-full;
  }

  &__label {
    @apply ml-2 text-sm font-bold;
  }
}
</style>

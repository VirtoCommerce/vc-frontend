<template>
  <div>
    <div class="option-text">
      <VcRadioButton v-model="text" :value="customInput" />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="option-text__input"
        @input="text = customInput"
        @focus="text = customInput"
      />
    </div>

    <div v-for="option in section.options" :key="option.id" class="option-text">
      <VcRadioButton v-model="text" :value="option.text!">
        {{ option.text }}
      </VcRadioButton>
    </div>

    <div class="option-text">
      <VcRadioButton v-model="text" :value="EMPTY_VALUE"> none </VcRadioButton>
    </div>

    <p>Вы выбрали: {{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

interface IProps {
  section: DeepReadonly<ConfigurationSectionType>;
  selected?: string;
}

defineProps<IProps>();

const MAX_LENGTH = 255;
const EMPTY_VALUE = "__none__";

const text = ref(EMPTY_VALUE);

const customInput = ref("");
</script>

<style lang="scss">
.option-text {
  @apply flex gap-3 p-4 items-center odd:bg-neutral-50 w-full;

  &__input {
    @apply w-full;
  }
}
</style>

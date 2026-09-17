<template>
  <ul class="agent-suggestions">
    <li v-for="suggestion in payload.suggestions" :key="suggestion">
      <VcButton size="xs" variant="outline" color="secondary" :disabled="disabled" @click="$emit('select', suggestion)">
        {{ suggestion }}
      </VcButton>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { IAgentSuggestionsPayload } from "../types";

interface IProps {
  payload: IAgentSuggestionsPayload;
  disabled?: boolean;
}

interface IEmits {
  (event: "select", suggestion: string): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.agent-suggestions {
  @apply flex flex-wrap gap-2;
}
</style>

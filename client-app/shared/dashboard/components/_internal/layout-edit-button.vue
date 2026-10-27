<template>
  <!-- Wrapped so the button keeps its intrinsic width inside a stretching flex column; classed so a
       project can restyle it without reaching for the button inside. -->
  <div class="layout-edit-button">
    <!-- A toggle keeps its label: `aria-pressed` carries the state, and the edit bar already reads
         "Editing layout" on screen. -->
    <VcButton
      size="xs"
      color="primary"
      variant="outline"
      prepend-icon="adjustments"
      data-layout-edit-toggle
      :aria-pressed="editing"
      @click="$emit('toggle')"
    >
      {{ t("shared.dashboard.edit") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface IProps {
  editing?: boolean;
}

interface IEmits {
  (event: "toggle"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
const { t } = useI18n();
</script>

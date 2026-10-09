<template>
  <div class="layout-edit-bar">
    <VcIcon class="layout-edit-bar__icon" name="switch-vertical" :size="18" />

    <p class="layout-edit-bar__text">
      <b>{{ t("sales_rep.hub.layout.editing") }}</b>
      {{ t("sales_rep.hub.layout.hint") }}
      <!-- Visible, not just announced: the arrow-key gesture was otherwise discoverable only by
           screen-reader users, who hear it on grab. -->
      <span class="layout-edit-bar__keys">{{ t("sales_rep.hub.layout.hint_keyboard") }}</span>
    </p>

    <div class="layout-edit-bar__actions">
      <!-- Disabled, not just inert: `inert` on the layout stops the interaction but greys nothing out. -->
      <VcButton size="sm" variant="ghost" color="secondary" :disabled="saving" @click="$emit('reset')">
        {{ t("sales_rep.hub.layout.reset") }}
      </VcButton>

      <VcButton size="sm" variant="outline" color="secondary" :disabled="saving" @click="$emit('cancel')">
        {{ t("sales_rep.hub.layout.cancel") }}
      </VcButton>

      <VcButton size="sm" prepend-icon="save" data-layout-save :loading="saving" @click="$emit('save')">
        {{ t("sales_rep.hub.layout.save") }}
      </VcButton>
    </div>

    <!-- A failed save keeps the draft, so the message sits beside the still-live Save button. -->
    <VcAlert v-if="failed" class="layout-edit-bar__error" color="danger" size="sm" variant="soft" icon>
      {{ t("sales_rep.hub.layout.save_failed") }}
    </VcAlert>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface IProps {
  saving?: boolean;
  failed?: boolean;
}

interface IEmits {
  (event: "save"): void;
  (event: "cancel"): void;
  (event: "reset"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
const { t } = useI18n();
</script>

<style lang="scss">
.layout-edit-bar {
  @apply flex flex-wrap items-center gap-3 rounded-[--vc-radius] border border-primary-200 bg-primary-50 px-4 py-2.5 text-primary-700;

  &__icon {
    @apply flex-none text-primary-500;
  }

  &__text {
    @apply m-0 min-w-0 text-sm;
  }

  &__keys {
    @apply block text-neutral-500;
  }

  &__actions {
    @apply flex flex-none items-center gap-2 md:ms-auto;
  }

  &__error {
    @apply w-full;
  }
}
</style>

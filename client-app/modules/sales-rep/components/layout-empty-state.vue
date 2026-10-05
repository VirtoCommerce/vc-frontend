<template>
  <div class="layout-empty-state">
    <!-- eslint-disable-next-line vue/no-v-html -- a static asset from this repo, never user content -->
    <div class="layout-empty-state__art" aria-hidden="true" v-html="artRaw" />

    <VcTypography tag="h2" class="layout-empty-state__title">
      {{ t("sales_rep.hub.layout.empty.title") }}
    </VcTypography>

    <i18n-t keypath="sales_rep.hub.layout.empty.text" scope="global" tag="p" class="layout-empty-state__text">
      <template #hidden>
        <b>{{ t("sales_rep.hub.layout.empty.hidden") }}</b>
      </template>

      <template #edit>
        <b>{{ t("sales_rep.hub.layout.edit") }}</b>
      </template>
    </i18n-t>

    <div class="layout-empty-state__actions">
      <VcButton
        prepend-icon="rotate-ccw"
        data-layout-restore
        :loading="restoring"
        :disabled="disabled"
        @click="$emit('restore')"
      >
        {{ t("sales_rep.hub.layout.empty.restore") }}
      </VcButton>

      <VcButton
        variant="outline"
        color="secondary"
        prepend-icon="adjustments"
        data-layout-empty-edit
        :disabled="disabled || restoring"
        @click="$emit('edit')"
      >
        {{ t("sales_rep.hub.layout.edit") }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import artRaw from "../assets/layout-empty-state.svg?raw";

interface IProps {
  /** The restore write is in flight. */
  restoring?: boolean;
  /** The layout cannot be edited right now (e.g. its read failed), so neither action would do anything. */
  disabled?: boolean;
}

interface IEmits {
  (event: "restore" | "edit"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
const { t } = useI18n();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.layout-empty-state {
  @apply mx-auto flex w-full max-w-xl flex-col items-center gap-5 pt-5 text-center;

  &__title {
    @apply pt-3 [word-break:break-word];
  }

  &__text {
    @apply m-0 text-neutral-600;

    b {
      @apply font-bold text-neutral-900;
    }
  }

  &__actions {
    @apply mt-1 flex w-full max-w-80 flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center;
  }
}
</style>

<template>
  <VcEmptyView class="layout-empty-state">
    <template #icon>
      <!-- eslint-disable-next-line vue/no-v-html -- a static asset from this repo, never user content -->
      <div class="layout-empty-state__art" aria-hidden="true" v-html="artRaw" />
    </template>

    <VcTypography tag="h2" class="layout-empty-state__title">
      {{ t("sales_rep.hub.layout.empty.title") }}
    </VcTypography>

    <i18n-t keypath="sales_rep.hub.layout.empty.text" scope="global" tag="p" class="layout-empty-state__text">
      <template #hidden>
        <b class="layout-empty-state__em">{{ t("sales_rep.hub.layout.empty.hidden") }}</b>
      </template>

      <template #edit>
        <b class="layout-empty-state__em">{{ t("sales_rep.hub.layout.edit") }}</b>
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
  </VcEmptyView>
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
  @apply mx-auto max-w-xl;

  &__title {
    @apply pt-3 [word-break:break-word];
  }

  &__text {
    @apply m-0 text-neutral-600;
  }

  &__em {
    @apply font-bold text-neutral-900;
  }

  // In the default slot rather than `#button`: the kit's button wrapper shrinks to its content, so a phone's
  // full-width stack would need a fixed width there, and a fixed width overflows inside the kit's padding.
  &__actions {
    @apply mt-1 flex w-full max-w-80 flex-col gap-3;

    @media (width >= theme("screens.sm")) {
      @apply w-auto max-w-none flex-row flex-wrap justify-center;
    }
  }
}
</style>

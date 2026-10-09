<template>
  <div class="layout-hidden-tray">
    <div class="layout-hidden-tray__label">
      <VcIcon name="eye-off" :size="16" />
      {{ t("sales_rep.hub.layout.hidden_widgets") }}
    </div>

    <ul class="layout-hidden-tray__list">
      <li v-for="id in entries" :key="id">
        <!--
          Restoring is a button rather than a drag target: a widget's region is fixed by the
          registry, so there is only ever one place it can go back to.
        -->
        <button
          type="button"
          class="layout-hidden-tray__restore"
          :data-restore-id="id"
          :aria-label="t('sales_rep.hub.layout.a11y.show', { title: titleOf(id) })"
          @click="$emit('restore', id)"
        >
          <span>{{ titleOf(id) }}</span>

          <VcIcon name="eye" :size="16" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useBlockTitle } from "../composables/useBlockTitle";
import type { SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
  entries: readonly string[];
}

interface IEmits {
  (event: "restore", id: string): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();
const { titleOf } = useBlockTitle(() => props.scope);
</script>

<style lang="scss">
.layout-hidden-tray {
  @apply flex flex-col gap-2.5 rounded-[--vc-radius] border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-3;

  &__label {
    @apply flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500;
  }

  &__list {
    @apply m-0 flex list-none flex-wrap gap-2 p-0;
  }

  &__restore {
    // The kit's own hook, rather than a rule aimed at `.vc-icon` from outside it.
    --vc-icon-color: var(--color-primary-500);

    @apply flex items-center gap-2 rounded-[--vc-radius] border border-neutral-200 bg-additional-50 px-2.5 py-1.5 text-sm font-semibold text-neutral-900 transition-colors;

    &:hover {
      @apply border-primary-500 text-primary-500;
    }
  }
}
</style>

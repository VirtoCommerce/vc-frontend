<template>
  <div class="layout-hidden-tray">
    <p class="layout-hidden-tray__label">
      <VcIcon name="eye-off" :size="16" />
      {{ t("sales_rep.hub.layout.hidden_widgets") }}
    </p>

    <ul class="layout-hidden-tray__list">
      <li v-for="entry in entries" :key="entry.id">
        <!--
          Restoring is a button rather than a drag target: a widget's region is fixed by the
          registry, so there is only ever one place it can go back to.
        -->
        <button
          type="button"
          class="layout-hidden-tray__restore"
          :aria-label="t('sales_rep.hub.layout.a11y.show', { title: titleOf(entry.id) })"
          @click="$emit('restore', entry.id)"
        >
          <span>{{ titleOf(entry.id) }}</span>

          <VcIcon name="eye" :size="16" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { getBlock } from "../layout/registry";
import type { SalesRepLayoutEntryType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
  entries: SalesRepLayoutEntryType[];
}

interface IEmits {
  (event: "restore", id: string): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();

const titleOf = (id: string) => {
  const block = getBlock(props.scope, id);
  return block ? t(block.titleKey) : id;
};
</script>

<style lang="scss">
.layout-hidden-tray {
  @apply flex flex-col gap-2.5 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-3;

  &__label {
    @apply m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500;
  }

  &__list {
    @apply m-0 flex list-none flex-wrap gap-2 p-0;
  }

  &__restore {
    @apply flex items-center gap-2 rounded border border-neutral-200 bg-additional-50 px-2.5 py-1.5 text-[13px] font-semibold text-neutral-900 transition-colors;

    .vc-icon {
      @apply text-primary-500;
    }

    &:hover {
      @apply border-primary-500 text-primary-500;
    }
  }
}
</style>

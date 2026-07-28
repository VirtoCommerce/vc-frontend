<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
    <LayoutSkeleton v-if="layoutLoading" :stats="4" :blocks="1" />

    <!-- The overlay covers the edit bar too: a save is a full-document replace, so nothing may change
         while one is in flight — including a drag, whose drop would land after the draft is gone. -->
    <div v-else class="sales-rep-dashboard__layout">
      <VcLoaderOverlay v-if="saving" />

      <LayoutEditBar
        v-if="editing"
        :saving="saving"
        :failed="saveFailed"
        @save="save"
        @cancel="cancel"
        @reset="reset"
      />

      <!-- Full-width KPI row (mock until the rep dashboard stats query lands). -->
      <LayoutStats
        :scope="SCOPE"
        :visible="visibleIn('statistics')"
        :hidden="hiddenIn('statistics')"
        :editing="editing"
        @reorder="reorderVisible('statistics', $event)"
        @reorder-hidden="reorderHidden('statistics', $event)"
        @set-hidden="toggleHidden"
        @announce="announce"
      />

      <!-- Cross-customer orders (real data: salesRepOrders). The dashboard has no right rail yet, so
         `mainRight` stays empty and this column runs full width. -->
      <LayoutRegion
        :scope="SCOPE"
        :entries="visibleIn('mainLeft')"
        orientation="vertical"
        group="sales-rep-dashboard-main-left"
        :editing="editing"
        @reorder="reorderVisible('mainLeft', $event)"
        @set-hidden="toggleHidden"
        @announce="announce"
      >
        <template #default="{ entry }">
          <component :is="componentOf(entry.id)" v-if="componentOf(entry.id)" :title="t('sales_rep.orders.title')" />
        </template>
      </LayoutRegion>

      <LayoutHiddenTray
        v-if="editing && hiddenWidgets.length"
        :scope="SCOPE"
        :entries="hiddenWidgets"
        @restore="toggleHidden($event, false)"
      />

      <LayoutEditButton v-if="canEdit" :editing="editing" @toggle="editing ? cancel() : startEdit()" />
    </div>

    <p class="sales-rep-dashboard__announcer" aria-live="assertive" aria-atomic="true">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LayoutEditBar from "../components/layout-edit-bar.vue";
import LayoutEditButton from "../components/layout-edit-button.vue";
import LayoutHiddenTray from "../components/layout-hidden-tray.vue";
import LayoutRegion from "../components/layout-region.vue";
import LayoutSkeleton from "../components/layout-skeleton.vue";
import LayoutStats from "../components/layout-stats.vue";
import { useLayoutAnnouncer } from "../composables/useLayoutAnnouncer";
import { focusBlockControl } from "../composables/useLayoutFocus";
import { useSalesRepLayout } from "../composables/useSalesRepLayout";
import { getBlock } from "../layout/registry";
import type { SalesRepLayoutRegionIdType } from "../types/layout";

const SCOPE = "dashboard" as const;

const { t } = useI18n();
const { message, announce } = useLayoutAnnouncer(SCOPE);
const {
  state,
  loading: layoutLoading,
  saving,
  editing,
  canEdit,
  saveFailed,
  visibleIn,
  hiddenIn,
  startEdit,
  cancel,
  reset,
  reorder,
  setHidden,
  save,
} = useSalesRepLayout(SCOPE);

const hiddenWidgets = computed(() => hiddenIn("mainLeft").concat(hiddenIn("mainRight")));

// eslint-disable-next-line sonarjs/function-return-type -- component or undefined by design
const componentOf = (id: string) => {
  const block = getBlock(SCOPE, id);
  return block && "component" in block ? block.component : undefined;
};

/**
 * A region's visible and hidden entries are two views of one ordered array, so a reorder of either
 * view has to be stitched back into the whole before it is stored.
 */
function reorderVisible(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
  reorder(regionId, [
    ...ids.map((id) => ({ id, hidden: false })),
    ...state.value[regionId].filter((entry) => entry.hidden),
  ]);
}

function reorderHidden(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
  reorder(regionId, [
    ...state.value[regionId].filter((entry) => !entry.hidden),
    ...ids.map((id) => ({ id, hidden: true })),
  ]);
}

function toggleHidden(id: string, hidden: boolean, index?: number): void {
  setHidden(id, hidden, index);
  focusBlockControl(id);
}
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-dashboard {
  @apply flex flex-col gap-5;

  &__title {
    @apply [word-break:break-word];
  }

  // `relative` anchors the absolutely-positioned save overlay.
  &__layout {
    @apply relative flex flex-col gap-5;
  }

  // Visually hidden, but announced. Keyboard sorting is silent without it.
  &__announcer {
    @apply absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)];
  }
}
</style>

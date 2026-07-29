<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- A read failure is not silent: what renders below is registry defaults, not the rep's layout,
         and the edit button is gone. Both need saying, or it reads as their arrangement being lost. -->
    <VcAlert v-if="loadFailed" color="danger" size="sm" variant="solid-light" icon>
      {{ t("sales_rep.hub.layout.load_failed") }}
    </VcAlert>

    <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
    <LayoutSkeleton v-if="layoutLoading" :stats="4" :blocks="1" />

    <!-- The overlay covers the edit bar too: a save is a full-document replace, so nothing may change
         while one is in flight — including a drag, whose drop would land after the draft is gone.
         `inert` is what enforces that; the overlay alone only stops the pointer, leaving the buttons
         and every drag handle reachable by keyboard. `|| undefined` so the attribute is dropped rather
         than written as `inert="false"` — Vue does not treat `inert` as a boolean attribute, and the
         attribute is presence-based, so a literal `false` would inert the layout permanently. -->
    <div v-else class="sales-rep-dashboard__layout" :inert="saving || undefined">
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
        <template #default="{ id }">
          <component :is="componentOf(id)" v-if="componentOf(id)" :title="t('sales_rep.orders.title')" />
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
import { useI18n } from "vue-i18n";
import LayoutEditBar from "../components/layout-edit-bar.vue";
import LayoutEditButton from "../components/layout-edit-button.vue";
import LayoutHiddenTray from "../components/layout-hidden-tray.vue";
import LayoutRegion from "../components/layout-region.vue";
import LayoutSkeleton from "../components/layout-skeleton.vue";
import LayoutStats from "../components/layout-stats.vue";
import { useLayoutPage } from "../composables/useLayoutPage";
import { useUnsavedLayoutGuard } from "../composables/useUnsavedLayoutGuard";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";

const SCOPE = DASHBOARD_LAYOUT_SCOPE;

const { t } = useI18n();
const {
  message,
  announce,
  loading: layoutLoading,
  saving,
  editing,
  canEdit,
  loadFailed,
  saveFailed,
  visibleIn,
  hiddenIn,
  hiddenWidgets,
  componentOf,
  startEdit,
  cancel,
  reset,
  reorderVisible,
  reorderHidden,
  toggleHidden,
  save,
} = useLayoutPage(SCOPE);

useUnsavedLayoutGuard({ editing, save, cancel });
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
    @apply sr-only;
  }
}
</style>

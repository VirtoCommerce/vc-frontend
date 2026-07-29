<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- What renders below is registry defaults, not the rep's layout, and there is no edit button. -->
    <VcAlert v-if="loadFailed" color="danger" size="sm" variant="solid-light" icon>
      {{ t("sales_rep.hub.layout.load_failed") }}
    </VcAlert>

    <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
    <LayoutSkeleton v-if="layoutLoading" :scope="SCOPE" />

    <!-- Nothing may change while a save is in flight, keyboard included, so inert rather than the
         overlay alone. Coerced to undefined because inert is presence-based: Vue renders a false value
         as the attribute itself, which would inert the layout permanently. -->
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

      <!-- Full-width KPI row. Cards come from the statistics queries; the layout only decides which
           of them show and in what order. -->
      <LayoutStats
        :scope="SCOPE"
        :visible="visibleIn('statistics')"
        :hidden="hiddenIn('statistics')"
        :cards="cards"
        :cards-loading="cardsLoading"
        :editing="editing"
        @reorder="reorderVisible('statistics', $event)"
        @reorder-hidden="reorderHidden('statistics', $event)"
        @set-hidden="toggleHidden"
        @announce="announce"
      />

      <!-- Two columns, but the rail only exists once a widget registers into `mainRight` — until then
           the row has one child and the content runs full width, matching the skeleton. -->
      <div class="sales-rep-dashboard__layout-row">
        <!-- Cross-customer orders and the top-sellers ranking. -->
        <LayoutRegion
          class="sales-rep-dashboard__main"
          :scope="SCOPE"
          :entries="visibleIn('mainLeft')"
          orientation="vertical"
          group="sales-rep-dashboard-main-left"
          :editing="editing"
          @reorder="reorderVisible('mainLeft', $event)"
          @set-hidden="toggleHidden"
          @announce="announce"
        >
          <template #default="{ id, title }">
            <component :is="componentOf(id)" v-if="componentOf(id)" :title="title" v-bind="propsOf(id)" />
          </template>
        </LayoutRegion>

        <!-- Its own Sortable group, so a rail widget can never be dropped into the wide column. -->
        <LayoutRegion
          v-if="visibleIn('mainRight').length"
          class="sales-rep-dashboard__aside"
          tag="aside"
          :scope="SCOPE"
          :entries="visibleIn('mainRight')"
          orientation="vertical"
          group="sales-rep-dashboard-main-right"
          :editing="editing"
          @reorder="reorderVisible('mainRight', $event)"
          @set-hidden="toggleHidden"
          @announce="announce"
        >
          <!-- No `title`: as on the customer profile, rail widgets set their own heading. -->
          <template #default="{ id }">
            <component :is="componentOf(id)" v-if="componentOf(id)" v-bind="propsOf(id)" />
          </template>
        </LayoutRegion>
      </div>

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
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";

const SCOPE = DASHBOARD_LAYOUT_SCOPE;

const { t } = useI18n();
const { cards, loading: cardsLoading } = useSalesRepDashboardWidgets();
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
  propsOf,
  startEdit,
  cancel,
  reset,
  reorderVisible,
  reorderHidden,
  toggleHidden,
  save,
} = useLayoutPage(SCOPE);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-dashboard {
  @apply flex flex-col gap-5;

  &__title {
    @apply [word-break:break-word];
  }

  // `relative` anchors the absolutely-positioned save overlay.
  &__layout {
    @apply relative flex flex-col gap-5;
  }

  // Single column until a widget registers into `mainRight`, then the rail splits off at xl — the same
  // shape as the customer profile, and what layout-skeleton.vue draws.
  &__layout-row {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__main {
    @apply min-w-0 flex-1;
  }

  &__aside {
    @apply min-w-0 xl:w-80 xl:shrink-0;
  }

  // Visually hidden, but announced. Keyboard sorting is silent without it.
  &__announcer {
    @apply sr-only;
  }
}
</style>

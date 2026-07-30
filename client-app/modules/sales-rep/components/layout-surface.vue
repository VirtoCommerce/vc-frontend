<template>
  <div class="layout-surface">
    <!-- What renders below is registry defaults, not the rep's layout, and there is no edit button. -->
    <VcAlert v-if="loadFailed" color="danger" size="sm" variant="soft" icon>
      {{ t("sales_rep.hub.layout.load_failed") }}
    </VcAlert>

    <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
    <LayoutSkeleton v-if="loading" :scope="scope" />

    <!-- Nothing may change mid-save, keyboard included, so inert rather than the overlay alone.
         `|| undefined` because inert is presence-based: a false value renders the attribute itself. -->
    <div v-else class="layout-surface__layout" :inert="saving || undefined">
      <VcLoaderOverlay v-if="saving" />

      <LayoutEditBar
        v-if="editing"
        :saving="saving"
        :failed="saveFailed"
        @save="save"
        @cancel="cancel"
        @reset="reset"
      />

      <!-- Cards come from the statistics queries; the layout only decides which show, and in what order. -->
      <LayoutStats
        :scope="scope"
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

      <!-- The rail exists only while something is visible in `mainRight`; until then the content runs
           full width, matching the skeleton. -->
      <div class="layout-surface__row">
        <div class="layout-surface__main-col">
          <LayoutRegion
            class="layout-surface__main"
            :scope="scope"
            :entries="visibleIn('mainLeft')"
            orientation="vertical"
            :group="`sales-rep-${scope}-main-left`"
            :editing="editing"
            @reorder="reorderVisible('mainLeft', $event)"
            @set-hidden="toggleHidden"
            @announce="announce"
          >
            <template #default="{ id, title }">
              <!-- Bindings bind first, so neither can shadow the heading the layout owns. -->
              <component :is="componentOf(id)" v-if="componentOf(id)" v-bind="bindingsOf(id)" :title="title" />
            </template>
          </LayoutRegion>

          <LayoutEditButton
            v-if="canEdit && editButtonPlacement === 'mainColumn'"
            :editing="editing"
            @toggle="editing ? cancel() : startEdit()"
          />
        </div>

        <!-- Its own Sortable group, so a rail widget can never be dropped into the wide column. -->
        <LayoutRegion
          v-if="visibleIn('mainRight').length"
          class="layout-surface__aside"
          tag="aside"
          :scope="scope"
          :entries="visibleIn('mainRight')"
          orientation="vertical"
          :group="`sales-rep-${scope}-main-right`"
          :editing="editing"
          @reorder="reorderVisible('mainRight', $event)"
          @set-hidden="toggleHidden"
          @announce="announce"
        >
          <!-- No `title`: rail widgets set their own heading. The registry's `titleKey` still names them
               in the tray and the announcements. -->
          <template #default="{ id }">
            <component :is="componentOf(id)" v-if="componentOf(id)" v-bind="bindingsOf(id)" />
          </template>
        </LayoutRegion>
      </div>

      <LayoutHiddenTray
        v-if="editing && hiddenWidgets.length"
        :scope="scope"
        :entries="hiddenWidgets"
        @restore="toggleHidden($event, false)"
      />

      <LayoutEditButton
        v-if="canEdit && editButtonPlacement === 'end'"
        :editing="editing"
        @toggle="editing ? cancel() : startEdit()"
      />
    </div>

    <!-- Visually hidden, but announced. Keyboard sorting is silent without it. -->
    <p class="layout-surface__announcer" aria-live="assertive" aria-atomic="true">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLayoutPage } from "../composables/useLayoutPage";
import LayoutEditBar from "./layout-edit-bar.vue";
import LayoutEditButton from "./layout-edit-button.vue";
import LayoutHiddenTray from "./layout-hidden-tray.vue";
import LayoutRegion from "./layout-region.vue";
import LayoutSkeleton from "./layout-skeleton.vue";
import LayoutStats from "./layout-stats.vue";
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatWidgetCardType } from "../types/widgets";

interface IProps {
  scope: SalesRepLayoutScopeType;
  /** Matched to layout ids by `key`. */
  cards: readonly StatWidgetCardType[];
  cardsLoading?: boolean;
  /** The customer every block on this surface is scoped to. Absent on the cross-customer dashboard,
   *  which is what the widgets' own optional `organizationId` already means. */
  organizationId?: string;
  /** `mainColumn` tucks the edit button under the left column; `end` puts it after the whole layout. */
  editButtonPlacement?: "end" | "mainColumn";
}

const props = withDefaults(defineProps<IProps>(), {
  organizationId: undefined,
  editButtonPlacement: "end",
});

const { t } = useI18n();

// A surface's scope is structural — one page, one scope, for its whole life.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const layout = useLayoutPage(props.scope);

const {
  message,
  announce,
  loading,
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
} = layout;

// Registry props (e.g. `filterable` on orders) plus the surface's, so each region stays one generic
// `<component>`. The surface assembles these because only the registry knows a block's component.
const bindingsOf = (id: string) => ({ ...propsOf(id), organizationId: props.organizationId });
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.layout-surface {
  @apply flex flex-col gap-5;

  // `relative` anchors the absolutely-positioned save overlay.
  &__layout {
    @apply relative flex flex-col gap-5;
  }

  // Single column through tablet; the rail splits off only at xl. layout-skeleton.vue matches.
  &__row {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  // Left column plus the desktop edit button; LayoutRegion supplies its own stacking.
  &__main-col {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__main {
    @apply min-w-0;
  }

  &__aside {
    @apply min-w-0 xl:w-80 xl:shrink-0;
  }

  // Visually hidden, but announced. Keyboard sorting is silent without it.
  &__announcer {
    @apply sr-only;
  }

  // Cancels VcWidget's mobile full-bleed: a bleeding block misaligns with the KPI row and has its
  // edit-mode outline clipped. Aimed at our own class on the same element; the extra & avoids !important.
  & &__main .layout-widget,
  & &__aside .layout-widget {
    @apply mx-0;
  }
}
</style>

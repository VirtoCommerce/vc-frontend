<template>
  <div class="layout-surface" tabindex="-1" data-layout-surface>
    <!-- What renders below is registry defaults, not the user's layout, and there is no edit button. -->
    <VcAlert v-if="loadFailed" color="danger" size="sm" variant="soft" icon>
      {{ t("shared.dashboard.load_failed") }}
    </VcAlert>

    <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
    <LayoutSkeleton v-if="loading" :scope="layout.scope" />

    <!-- Nothing may change mid-save, keyboard included, so inert rather than the overlay alone.
         `|| undefined` because inert is presence-based: a false value renders the attribute itself. -->
    <div v-else class="layout-surface__layout" :inert="saving || undefined">
      <VcLoaderOverlay v-if="saving" />

      <LayoutEmptyState
        v-if="allHidden"
        :restoring="saving"
        :disabled="!canEdit"
        @restore="restoreDefaults"
        @edit="editFromEmpty"
      />

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
        v-if="!allHidden"
        :scope="layout.scope"
        :visible="visibleIn('statistics')"
        :hidden="hiddenIn('statistics')"
        :cards="cards"
        :editing="editing"
        @reorder="reorderVisible('statistics', $event)"
        @reorder-hidden="reorderHidden('statistics', $event)"
        @set-hidden="toggleHidden"
        @announce="announce"
      />

      <!-- The rail exists only while something is visible in `mainRight`; until then the content runs
           full width, matching the skeleton. -->
      <div v-if="!allHidden" class="layout-surface__row">
        <div class="layout-surface__main-col">
          <LayoutRegion
            class="layout-surface__main"
            :scope="layout.scope"
            :entries="visibleIn('mainLeft')"
            orientation="vertical"
            :group="`layout-${layout.scope}-main-left`"
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
          :scope="layout.scope"
          :entries="visibleIn('mainRight')"
          orientation="vertical"
          :group="`layout-${layout.scope}-main-right`"
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
        :scope="layout.scope"
        :entries="hiddenWidgets"
        @restore="toggleHidden($event, false)"
      />

      <LayoutEditButton
        v-if="canEdit && !allHidden && editButtonPlacement === 'end'"
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
import { useLayoutPage } from "../composables/_internal/useLayoutPage";
import { provideLayoutSettings } from "../composables/_internal/useLayoutSettings";
import { getBlock } from "../registry";
import { maxRowsSetting } from "../settings";
import LayoutEditBar from "./_internal/layout-edit-bar.vue";
import LayoutEditButton from "./_internal/layout-edit-button.vue";
import LayoutEmptyState from "./_internal/layout-empty-state.vue";
import LayoutHiddenTray from "./_internal/layout-hidden-tray.vue";
import LayoutRegion from "./_internal/layout-region.vue";
import LayoutSkeleton from "./_internal/layout-skeleton.vue";
import LayoutStats from "./_internal/layout-stats.vue";
import type { LayoutControllerType, StatCardType } from "../types";

interface IProps {
  /** The page's layout controller: the saved document, the edit draft and how both are persisted. The
   *  page owns it — it shapes the statistics queries behind `cards` from the same object. */
  layout: LayoutControllerType;
  /** Matched to the `statistics` blocks by `key`. Each carries its own query's loading/failed state. */
  cards: readonly StatCardType[];
  /** Props every widget block receives on top of its registry props, e.g. the customer a profile page
   *  shows. Absent means none. */
  blockProps?: Record<string, unknown>;
  /** `mainColumn` tucks the edit button under the left column; `end` puts it after the whole layout. */
  editButtonPlacement?: "end" | "mainColumn";
}

const props = withDefaults(defineProps<IProps>(), {
  blockProps: undefined,
  editButtonPlacement: "end",
});

const { t } = useI18n();

// A surface's controller is structural — one page, one layout, for its whole life.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const page = useLayoutPage(props.layout);

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
  allHidden,
  componentOf,
  propsOf,
  startEdit,
  editFromEmpty,
  cancel,
  reset,
  restoreDefaults,
  reorderVisible,
  reorderHidden,
  toggleHidden,
  settingsOf,
  persistedSettingsOf,
  updateSettings,
  save,
} = page;

// The only component that knows both the draft and the registry, so blocks resolve their own slice of
// each through this.
provideLayoutSettings({
  valuesOf: settingsOf,
  savedValuesOf: persistedSettingsOf,
  maxRowsOf: (id) => maxRowsSetting(getBlock(props.layout.scope, id)),
  update: updateSettings,
});

// Registry props (e.g. `filterable` on orders) plus the page's, so each region stays one generic
// `<component>`. The surface assembles these because only the registry knows a block's component.
const bindingsOf = (id: string) => ({ ...propsOf(id), ...props.blockProps });
</script>

<style lang="scss">
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
    @apply min-w-0 xl:w-[22rem] xl:shrink-0;
  }

  // Visually hidden, but announced. Keyboard sorting is silent without it.
  &__announcer {
    @apply sr-only;
  }
}
</style>

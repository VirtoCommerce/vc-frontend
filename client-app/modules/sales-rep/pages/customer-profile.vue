<template>
  <div class="customer-profile">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcEmptyView v-if="notFound" :text="t('sales_rep.customer_profile.not_found')" icon="outline-404">
      <template #button>
        <VcButton :to="{ name: myCustomersRouteName }" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_profile.back_to_customers") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <div class="customer-profile__hero">
        <div class="customer-profile__name-row">
          <!-- Organization icon; a neutral mark stands in when the org has no icon set. -->
          <span class="customer-profile__logo">
            <VcImage v-if="customer?.iconUrl" :src="customer.iconUrl" :alt="title" class="customer-profile__logo-img" />

            <VcIcon v-else name="office-building" aria-hidden="true" />
          </span>

          <VcTypography tag="h1" class="customer-profile__title">
            {{ title }}
          </VcTypography>
        </div>

        <!-- Only fields the backend returns; the design's account # / "Assigned to" have no source yet. -->
        <p v-if="meta" class="customer-profile__meta">{{ meta }}</p>
      </div>

      <!-- Nothing block-shaped renders until the saved layout is known; see layout-skeleton.vue. -->
      <LayoutSkeleton v-if="layoutLoading" :stats="4" :blocks="2" />

      <!-- The overlay covers the edit bar too: a save is a full-document replace, so nothing may change
           while one is in flight — including a drag, whose drop would land after the draft is gone.
           `inert` is what enforces that; the overlay alone only stops the pointer, leaving the buttons
           and every drag handle reachable by keyboard. See dashboard.vue for why `|| undefined`. -->
      <div v-else class="customer-profile__layout-wrapper" :inert="saving || undefined">
        <VcLoaderOverlay v-if="saving" />

        <LayoutEditBar
          v-if="editing"
          :saving="saving"
          :failed="saveFailed"
          @save="save"
          @cancel="cancel"
          @reset="reset"
        />

        <!-- Full-width KPI row (mock until VCST-5309). -->
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

        <div class="customer-profile__layout">
          <div class="customer-profile__main-col">
            <LayoutRegion
              class="customer-profile__main"
              :scope="SCOPE"
              :entries="visibleIn('mainLeft')"
              orientation="vertical"
              group="sales-rep-customer-main-left"
              :editing="editing"
              @reorder="reorderVisible('mainLeft', $event)"
              @set-hidden="toggleHidden"
              @announce="announce"
            >
              <template #default="{ id }">
                <component
                  :is="componentOf(id)"
                  v-if="componentOf(id)"
                  :organization-id="organizationId"
                  :title="t('sales_rep.orders.title')"
                />
              </template>
            </LayoutRegion>

            <!-- Desktop: directly under the left column, per the design. Below xl the page is one
                 column, so it moves to the very end instead. -->
            <LayoutEditButton
              v-if="canEdit && !isCompact"
              :editing="editing"
              @toggle="editing ? cancel() : startEdit()"
            />
          </div>

          <!-- Its own Sortable group, so a rail widget can never be dropped into the wide column. -->
          <LayoutRegion
            class="customer-profile__aside"
            tag="aside"
            :scope="SCOPE"
            :entries="visibleIn('mainRight')"
            orientation="vertical"
            group="sales-rep-customer-main-right"
            :editing="editing"
            @reorder="reorderVisible('mainRight', $event)"
            @set-hidden="toggleHidden"
            @announce="announce"
          >
            <template #default="{ id }">
              <component :is="componentOf(id)" v-if="componentOf(id)" :organization-id="organizationId" />
            </template>
          </LayoutRegion>
        </div>

        <LayoutHiddenTray
          v-if="editing && hiddenWidgets.length"
          :scope="SCOPE"
          :entries="hiddenWidgets"
          @restore="toggleHidden($event, false)"
        />

        <LayoutEditButton v-if="canEdit && isCompact" :editing="editing" @toggle="editing ? cancel() : startEdit()" />
      </div>

      <p class="customer-profile__announcer" aria-live="assertive" aria-atomic="true">{{ message }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import LayoutEditBar from "../components/layout-edit-bar.vue";
import LayoutEditButton from "../components/layout-edit-button.vue";
import LayoutHiddenTray from "../components/layout-hidden-tray.vue";
import LayoutRegion from "../components/layout-region.vue";
import LayoutSkeleton from "../components/layout-skeleton.vue";
import LayoutStats from "../components/layout-stats.vue";
import { useLayoutPage } from "../composables/useLayoutPage";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { useUnsavedLayoutGuard } from "../composables/useUnsavedLayoutGuard";
import { CUSTOMER_PROFILE_LAYOUT_SCOPE, MY_CUSTOMERS_ROUTE_NAME } from "../constants";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const SCOPE = CUSTOMER_PROFILE_LAYOUT_SCOPE;

// The aside splits off at xl; below that the page is a single column and the button belongs at its end.
const isCompact = useBreakpoints(breakpointsTailwind).smaller("xl");

const { t } = useI18n();
const { customer, loading, notFound } = useSalesRepCustomer(() => props.organizationId);
const {
  message,
  announce,
  loading: layoutLoading,
  saving,
  editing,
  canEdit,
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

const myCustomersRouteName = MY_CUSTOMERS_ROUTE_NAME;

// Org name once resolved; neutral label while loading to avoid a header jump.
const title = computed(
  () => customer.value?.organizationName || (loading.value ? t("sales_rep.customer_profile.loading") : ""),
);

const meta = computed(() => [customer.value?.accountType, customer.value?.shipTo].filter(Boolean).join(" · "));

usePageHead({
  title: computed(() => customer.value?.organizationName || t("sales_rep.hub.title")),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
  { title: customer.value?.organizationName ?? "" },
]);
</script>

<style lang="scss">
.customer-profile {
  &__hero {
    @apply flex flex-col;
  }

  &__name-row {
    @apply flex items-center gap-4;
  }

  &__logo {
    --vc-icon-size: 1.5rem;

    @apply flex size-11 flex-none items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-additional-50 text-neutral-400;
  }

  &__logo-img {
    @apply size-full object-contain;
  }

  &__title {
    @apply [word-break:break-word];
  }

  &__meta {
    @apply mt-1.5 text-[13px] text-neutral-500;
  }

  // Single column through tablet; the aside splits off only on desktop (xl).
  // `relative` anchors the absolutely-positioned save overlay.
  &__layout-wrapper {
    @apply relative flex flex-col gap-5;
  }

  &__layout {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  // Both columns are LayoutRegions now, which supply their own vertical stacking and gap.
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

  // Cancel VcWidget's mobile full-bleed (-mx-4.5 in .vc-container) so blocks align with the KPI row
  // and title. The extra `&` lifts specificity above VcWidget's own rule (avoids !important).
  & &__main .vc-widget,
  & &__aside .vc-widget {
    @apply mx-0;
  }
}
</style>

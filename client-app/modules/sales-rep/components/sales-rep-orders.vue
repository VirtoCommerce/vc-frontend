<template>
  <LayoutWidget :title="title" size="md" class="sales-rep-orders">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="sales-rep-orders__all-link" target="_blank" rel="noopener noreferrer">
        {{ t("sales_rep.orders.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- VcWidget has no padding prop; #default-container is our seam for the inset, not .vc-widget__slot. -->
    <template #default-container>
      <div class="sales-rep-orders__body">
        <!-- In edit mode the tab strip becomes its own configuration: checked = offered as a tab.
             Replacing rather than adding, because ten statuses do not fit anywhere else. -->
        <div v-if="filterable && hasFilterOptions" class="sales-rep-orders__filter">
          <SalesRepRuleToggles
            v-if="editingTabs"
            :rules="selectableRules"
            :hidden="effectiveHiddenTabs"
            @toggle="toggleTab"
          />

          <SalesRepRuleChips
            v-else
            v-model="filter"
            :rules="visibleRules"
            :all-label="t('sales_rep.orders.filter_all')"
          />
        </div>

        <div class="sales-rep-orders__content">
          <!-- A failure replaces the table rather than sharing the empty view: apollo keeps the previous rows on a
               failed refetch, which would otherwise read as this filter's result (VCST-5586). -->
          <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.orders.load_failed')" variant="error" />

          <!-- With a filter active, an empty result means "nothing matches this filter", not "never ordered". -->
          <VcEmptyView
            v-else-if="!orders.length && !loading"
            :text="filter ? t('sales_rep.orders.no_results') : t('sales_rep.orders.empty')"
            icon="outline-order"
          />

          <!-- Skeleton rows match the page size; header clicks map to named backend sort rules (reversible ones toggle asc/desc). -->
          <VcTable
            v-else
            :loading="loading"
            :items="orders"
            :skeleton-rows="rowLimit"
            :sort="sortInfo"
            mobile-breakpoint="lg"
            @header-click="applySort"
          >
            <template #mobile-item="{ item }">
              <div class="sales-rep-orders__mobile-item">
                <div class="sales-rep-orders__mobile-row">
                  <VcLink
                    class="sales-rep-orders__order-link"
                    :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.number }}
                  </VcLink>

                  <span>{{ item.total }}</span>
                </div>

                <div v-if="isCrossCustomer" class="sales-rep-orders__mobile-customer">{{ item.organizationName }}</div>

                <div class="sales-rep-orders__mobile-sub">
                  <span>{{ $d(item.createdDate, "short") }}</span>

                  <template v-if="!isCrossCustomer"> · {{ item.itemsCount }}</template>
                </div>

                <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
              </div>
            </template>

            <VcTableColumn id="number" v-slot="{ item }" :title="t('sales_rep.orders.number')">
              <VcLink
                class="sales-rep-orders__order-link"
                :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.number }}
              </VcLink>
            </VcTableColumn>

            <VcTableColumn
              v-if="isCrossCustomer"
              id="customer"
              v-slot="{ item }"
              :title="t('sales_rep.orders.customer')"
            >
              {{ item.organizationName }}
            </VcTableColumn>

            <VcTableColumn
              id="date"
              v-slot="{ item }"
              :title="t('sales_rep.orders.date')"
              :sortable="isColumnSortable('date')"
            >
              {{ $d(item.createdDate, "short") }}
            </VcTableColumn>

            <VcTableColumn v-if="!isCrossCustomer" id="items" v-slot="{ item }" :title="t('sales_rep.orders.items')">
              {{ item.itemsCount }}
            </VcTableColumn>

            <VcTableColumn id="status" v-slot="{ item }" :title="t('sales_rep.orders.status')">
              <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
            </VcTableColumn>

            <VcTableColumn
              id="total"
              v-slot="{ item }"
              :title="t('sales_rep.orders.total')"
              :sortable="isColumnSortable('total')"
              align="right"
              class="font-bold"
            >
              {{ item.total }}
            </VcTableColumn>
          </VcTable>
        </div>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBlockChrome } from "../composables/useBlockChrome";
import { useSalesRepColumnSort } from "../composables/useSalesRepColumnSort";
import { useSalesRepOrders } from "../composables/useSalesRepOrders";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import { knownHiddenTabs, toggleTabRule, visibleTabRules } from "../layout/settings";
import { selectableFilterRules } from "../utils";
import LayoutWidget from "./layout-widget.vue";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";
import SalesRepRuleToggles from "./sales-rep-rule-toggles.vue";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  // Widget heading — the caller decides the wording (e.g. "Recent orders").
  title: string;
  // Scope to one customer (profile page); omit for cross-customer orders (hub dashboard).
  organizationId?: string;
  // How many orders to fetch; omit to use the composable's default page size.
  limit?: number;
  // Show the filter-rule chips (the dashboard turns them on).
  filterable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  limit: ORDERS_DEFAULT_LIMIT,
  filterable: false,
});

const { t } = useI18n();

const isCrossCustomer = computed(() => !props.organizationId);

// Selected named rules; undefined → the server default (baseline filter / "recent" sort).
const filter = ref<string | undefined>(undefined);
const sort = ref<string | undefined>(undefined);
const { from: periodFrom, to: periodTo } = useSalesRepPeriodFilter();

const { rules: filterRules } = useSalesRepRules("order", "filter");
const { rules: sortRules } = useSalesRepRules("order", "sort");

// Absent when this widget renders outside a layout, which then configures nothing.
const chrome = useBlockChrome();
const editingTabs = computed(() => Boolean(chrome?.editing.value));
const hiddenTabs = computed(() => chrome?.settings.value.hiddenTabs ?? []);
// The saved selection, not the draft: tabs apply on save, like the row cap.
const savedHiddenTabs = computed(() => chrome?.savedSettings.value.hiddenTabs ?? []);

// The backend's "All" passthrough would duplicate the baseline chip, so it is not offered as a tab
// and cannot be unchecked either.
const selectableRules = computed(() => selectableFilterRules(filterRules.value));

// Show the filter chips only when the backend offers a real filter beyond the "All" baseline.
const hasFilterOptions = computed(() => selectableRules.value.length > 0);

// The tabs the chips offer, in catalog order. Unchecking every one is allowed — the "All" baseline stays.
const visibleRules = computed(() => visibleTabRules(selectableRules.value, savedHiddenTabs.value));

// What the checkboxes read: the stored list minus anything the catalog no longer contains.
const effectiveHiddenTabs = computed(() => knownHiddenTabs(selectableRules.value, hiddenTabs.value));

// Edit mode is where the live catalog is known, so a retired name is cleared from the store there.
// Immediate: a widget restored from the tray mounts mid-edit with the catalog already cached.
watch(
  [editingTabs, selectableRules],
  () => {
    if (editingTabs.value && effectiveHiddenTabs.value.length !== hiddenTabs.value.length) {
      chrome?.updateSettings({ hiddenTabs: effectiveHiddenTabs.value });
    }
  },
  { immediate: true },
);

function toggleTab(name: string): void {
  chrome?.updateSettings({ hiddenTabs: toggleTabRule(effectiveHiddenTabs.value, name) });
}

// A save can retire the tab being filtered by, which the rep could then neither see nor clear.
watch(visibleRules, (rules) => {
  if (filter.value && !rules.some((rule) => rule.name === filter.value)) {
    filter.value = undefined;
  }
});

// Header sort: Date → "recent" (one-way, newest first); Total → "total" (reversible). Direction support is backend-driven.
const { sortInfo, isColumnSortable, applySort } = useSalesRepColumnSort({
  sortRule: sort,
  columns: { date: "recent", total: "total" },
  defaultColumn: "date",
  rules: sortRules,
});

// The saved cap, not the draft: it is a query variable, so it applies on save.
const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? props.limit);

const { orders, loading, error } = useSalesRepOrders({
  organizationId: () => props.organizationId,
  first: () => rowLimit.value,
  filter: () => filter.value,
  sort: () => sort.value,
  periodFrom,
  periodTo,
});

const failed = computed(() => Boolean(error.value));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-orders {
  &__body {
    @apply flex flex-col;
  }

  // px-6 aligns the tabs with the widget header title.
  &__filter {
    @apply border-b border-neutral-200 bg-neutral-50 px-6 py-3;
  }

  &__content {
    @apply px-1.5 pb-3 pt-1;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }

  &__order-link {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4;
  }

  &__mobile-row {
    @apply flex items-center justify-between font-bold;
  }

  &__mobile-customer {
    @apply font-medium;
  }

  &__mobile-sub {
    @apply text-sm text-neutral-600;
  }
}
</style>

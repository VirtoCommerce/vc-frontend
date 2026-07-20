<template>
  <VcWidget :title="title" size="md" class="sales-rep-orders">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="sales-rep-orders__all-link" target="_blank" rel="noopener noreferrer">
        {{ t("sales_rep.orders.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- VcWidget has no padding prop; #default-container is its supported body seam, so we own the
         inset here instead of touching .vc-widget__slot. The md header divider is unaffected. -->
    <template #default-container>
      <div class="sales-rep-orders__body">
        <!-- Optional controls: named filter rule (chips), sort rule + created-date period (selects). -->
        <div v-if="filterable" class="sales-rep-orders__controls">
          <div v-if="filterRules.length" class="sales-rep-orders__chips">
            <VcChip
              :variant="filter ? 'outline' : 'solid'"
              color="secondary"
              size="sm"
              clickable
              @click="filter = undefined"
            >
              {{ t("sales_rep.orders.filter_all") }}
            </VcChip>

            <VcChip
              v-for="rule in filterRules"
              :key="rule.name"
              :variant="filter === rule.name ? 'solid' : 'outline'"
              color="secondary"
              size="sm"
              clickable
              @click="filter = rule.name"
            >
              {{ rule.label }}
            </VcChip>
          </div>

          <div class="sales-rep-orders__selects">
            <VcSelect
              v-model="period"
              :items="periodOptions"
              text-field="label"
              value-field="value"
              size="sm"
              class="sales-rep-orders__select"
            />

            <VcSelect
              v-if="sortRules.length"
              v-model="sort"
              :items="sortRules"
              text-field="label"
              value-field="name"
              size="sm"
              :placeholder="t('sales_rep.orders.sort_placeholder')"
              class="sales-rep-orders__select"
            />
          </div>
        </div>

        <VcEmptyView v-if="!orders.length && !loading" :text="t('sales_rep.orders.empty')" icon="outline-order" />

        <!-- Skeleton rows match the page size so the loading state mirrors what will load. -->
        <VcTable v-else :loading="loading" :items="orders" :skeleton-rows="limit" mobile-breakpoint="lg">
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

              <!-- Item count only in single-customer mode, mirroring the desktop Items column (hidden cross-customer). -->
              <div class="sales-rep-orders__mobile-sub">
                {{ $d(item.createdDate, "short") }}<template v-if="!isCrossCustomer"> · {{ item.itemsCount }}</template>
              </div>

              <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
            </div>
          </template>

          <VcTableColumn id="number" v-slot="{ item }" :title="t('sales_rep.orders.number')" class="align-top">
            <VcLink
              class="sales-rep-orders__order-link"
              :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.number }}
            </VcLink>
          </VcTableColumn>

          <!-- Cross-customer (dashboard) shows the customer; a single-customer view shows item count instead. -->
          <VcTableColumn
            v-if="isCrossCustomer"
            id="customer"
            v-slot="{ item }"
            :title="t('sales_rep.orders.customer')"
            class="align-top"
          >
            {{ item.organizationName }}
          </VcTableColumn>

          <VcTableColumn id="date" v-slot="{ item }" :title="t('sales_rep.orders.date')" class="align-top">
            {{ $d(item.createdDate, "short") }}
          </VcTableColumn>

          <VcTableColumn
            v-if="!isCrossCustomer"
            id="items"
            v-slot="{ item }"
            :title="t('sales_rep.orders.items')"
            class="align-top"
          >
            {{ item.itemsCount }}
          </VcTableColumn>

          <VcTableColumn id="status" v-slot="{ item }" :title="t('sales_rep.orders.status')" class="align-top">
            <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
          </VcTableColumn>

          <VcTableColumn
            id="total"
            v-slot="{ item }"
            :title="t('sales_rep.orders.total')"
            align="right"
            class="align-top font-bold"
          >
            {{ item.total }}
          </VcTableColumn>
        </VcTable>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepOrders } from "../composables/useSalesRepOrders";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  // Widget heading — the caller decides the wording (e.g. "Recent orders").
  title: string;
  // Scope to one customer (profile page); omit for cross-customer orders (hub dashboard).
  organizationId?: string;
  // How many orders to fetch; omit to use the composable's default page size.
  limit?: number;
  // Show the filter-rule chips + sort-rule / period selects (the dashboard turns them on).
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
const { period, options: periodOptions, from: periodFrom, to: periodTo } = useSalesRepPeriodFilter();

const { rules: filterRules } = useSalesRepRules("order", "filter");
const { rules: sortRules } = useSalesRepRules("order", "sort");

const { orders, loading } = useSalesRepOrders({
  organizationId: () => props.organizationId,
  first: () => props.limit,
  filter: () => filter.value,
  sort: () => sort.value,
  periodFrom,
  periodTo,
});
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-orders {
  // Design insets the table ~6px from the widget edge; vertical matches the widget's own body padding.
  &__body {
    @apply px-1.5 pb-3 pt-4;
  }

  &__controls {
    @apply mb-4 flex flex-col gap-3;
  }

  &__chips {
    @apply flex flex-wrap gap-2;
  }

  &__selects {
    @apply flex flex-wrap gap-2;
  }

  &__select {
    @apply w-44;
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

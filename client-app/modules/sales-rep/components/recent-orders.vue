<template>
  <VcWidget :title="t('sales_rep.recent_orders.title')" size="lg" class="recent-orders">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="recent-orders__all-link" target="_blank" rel="noopener noreferrer">
        {{ t("sales_rep.recent_orders.view_all") }}
        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- Status tabs come entirely from salesRepOrderStatuses; "All" (no filter) leads. -->
    <div class="recent-orders__tabs">
      <VcTabSwitch
        v-for="tab in tabs"
        :key="tab.value"
        v-model="activeStatus"
        :value="tab.value"
        :label="tab.label"
        name="recent-orders-status"
        size="sm"
        @change="activeStatus = tab.value"
      />
    </div>

    <VcEmptyView v-if="!orders.length && !loading" :text="t('sales_rep.recent_orders.empty')" icon="outline-order" />

    <VcTable v-else :loading="loading" :items="orders" :row-class="rowClass" mobile-breakpoint="lg">
      <template #mobile-item="{ item }">
        <div class="recent-orders__mobile-item">
          <div class="recent-orders__mobile-row">
            <VcLink
              class="recent-orders__order-link"
              :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.number }}
            </VcLink>

            <span>{{ item.total }}</span>
          </div>

          <div v-if="isCrossCustomer" class="recent-orders__mobile-customer">{{ item.organizationName }}</div>

          <div class="recent-orders__mobile-sub">{{ $d(item.createdDate, "short") }} · {{ item.itemsCount }}</div>

          <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
        </div>
      </template>

      <VcTableColumn id="number" v-slot="{ item }" :title="t('sales_rep.recent_orders.number')" class="align-top">
        <VcLink
          class="recent-orders__order-link"
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
        :title="t('sales_rep.recent_orders.customer')"
        class="align-top"
      >
        {{ item.organizationName }}
      </VcTableColumn>

      <VcTableColumn id="date" v-slot="{ item }" :title="t('sales_rep.recent_orders.date')" class="align-top">
        {{ $d(item.createdDate, "short") }}
      </VcTableColumn>

      <VcTableColumn
        v-if="!isCrossCustomer"
        id="items"
        v-slot="{ item }"
        :title="t('sales_rep.recent_orders.items')"
        class="align-top"
      >
        {{ item.itemsCount }}
      </VcTableColumn>

      <VcTableColumn id="status" v-slot="{ item }" :title="t('sales_rep.recent_orders.status')" class="align-top">
        <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
      </VcTableColumn>

      <VcTableColumn
        id="total"
        v-slot="{ item }"
        :title="t('sales_rep.recent_orders.total')"
        align="right"
        class="align-top font-bold"
      >
        {{ item.total }}
      </VcTableColumn>
    </VcTable>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepOrderStatuses } from "../composables/useSalesRepOrderStatuses";
import { useSalesRepOrders } from "../composables/useSalesRepOrders";
import type { SalesRepOrderRowType } from "../types";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  // Scope to one customer (profile page); omit for cross-customer orders (hub dashboard).
  organizationId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  organizationId: undefined,
});

const { t } = useI18n();

const { statuses } = useSalesRepOrderStatuses();

// "" is the "All" tab (no status filter); other values are salesRepOrderStatuses names.
const activeStatus = ref("");
const selectedStatuses = computed(() => (activeStatus.value ? [activeStatus.value] : undefined));

const tabs = computed(() => [
  { value: "", label: t("sales_rep.recent_orders.tabs.all") },
  ...statuses.value.map((status) => ({ value: status.name, label: status.localizedName })),
]);

const isCrossCustomer = computed(() => !props.organizationId);

const { orders, loading } = useSalesRepOrders({
  organizationId: () => props.organizationId,
  statuses: selectedStatuses,
});

// Zebra striping (matches the My customers table).
function rowClass(_item: SalesRepOrderRowType, index: number): string {
  return index % 2 === 1 ? "bg-neutral-50" : "";
}
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.recent-orders {
  // Header divider (size=lg drops the built-in one).
  .vc-widget__header-container {
    @apply border-b border-neutral-200;
  }

  // Tighter than lg's default px-7 padding.
  .vc-widget__slot {
    @apply p-2;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:underline;
  }

  &__tabs {
    @apply flex flex-wrap gap-2 border-b border-neutral-200 px-3 pb-3 pt-1;
  }

  &__order-link {
    @apply text-[--link-color] hover:underline;
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

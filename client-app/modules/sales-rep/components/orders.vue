<template>
  <VcWidget :title="title" size="lg" class="sales-rep-orders">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="sales-rep-orders__all-link" target="_blank" rel="noopener noreferrer">
        {{ t("sales_rep.orders.view_all") }}
        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

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
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepOrders } from "../composables/useSalesRepOrders";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  // Widget heading — the caller decides the wording (e.g. "Recent orders").
  title: string;
  // Scope to one customer (profile page); omit for cross-customer orders (hub dashboard).
  organizationId?: string;
  // How many orders to fetch; omit to use the composable's default page size.
  limit?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  limit: ORDERS_DEFAULT_LIMIT,
});

const { t } = useI18n();

const isCrossCustomer = computed(() => !props.organizationId);

const { orders, loading } = useSalesRepOrders({
  organizationId: () => props.organizationId,
  first: () => props.limit,
});
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-orders {
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

<template>
  <VcWidget :title="t('sales_rep.customer_profile.orders.title')" size="lg" class="customer-profile-orders">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="customer-profile-orders__all-link">
        {{ t("sales_rep.customer_profile.orders.view_all") }}
        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <VcEmptyView
      v-if="!orders.length && !loading"
      :text="t('sales_rep.customer_profile.orders.empty')"
      icon="outline-order"
    />

    <VcTable v-else :loading="loading" :items="orders" :row-class="rowClass" mobile-breakpoint="lg">
      <template #mobile-item="{ item }">
        <div class="customer-profile-orders__mobile-item">
          <div class="customer-profile-orders__mobile-row">
            <VcLink
              class="customer-profile-orders__order-link"
              :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.number }}
            </VcLink>

            <span>{{ item.total }}</span>
          </div>

          <div class="customer-profile-orders__mobile-sub">
            {{ $d(item.createdDate, "short") }} · {{ item.itemsCount }}
          </div>

          <OrderStatus :status="item.status" />
        </div>
      </template>

      <VcTableColumn
        id="number"
        v-slot="{ item }"
        :title="t('sales_rep.customer_profile.orders.number')"
        class="align-top"
      >
        <VcLink
          class="customer-profile-orders__order-link"
          :to="{ name: 'OrderDetails', params: { orderId: item.id } }"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.number }}
        </VcLink>
      </VcTableColumn>

      <VcTableColumn id="date" v-slot="{ item }" :title="t('sales_rep.customer_profile.orders.date')" class="align-top">
        {{ $d(item.createdDate, "short") }}
      </VcTableColumn>

      <VcTableColumn
        id="items"
        v-slot="{ item }"
        :title="t('sales_rep.customer_profile.orders.items')"
        class="align-top"
      >
        {{ item.itemsCount }}
      </VcTableColumn>

      <VcTableColumn
        id="status"
        v-slot="{ item }"
        :title="t('sales_rep.customer_profile.orders.status')"
        class="align-top"
      >
        <OrderStatus :status="item.status" />
      </VcTableColumn>

      <VcTableColumn
        id="total"
        v-slot="{ item }"
        :title="t('sales_rep.customer_profile.orders.total')"
        align="right"
        class="align-top font-bold"
      >
        {{ item.total }}
      </VcTableColumn>
    </VcTable>
  </VcWidget>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSalesRepCustomerOrders } from "../composables/useSalesRepCustomerOrders";
import type { SalesRepCustomerOrderType } from "../types/customer-profile";
import OrderStatus from "@/shared/account/components/order-status.vue";

const props = defineProps<{ organizationId: string }>();

const { t } = useI18n();
const { orders, loading } = useSalesRepCustomerOrders(() => props.organizationId);

// Zebra striping (matches the My customers table).
function rowClass(_item: SalesRepCustomerOrderType, index: number): string {
  return index % 2 === 1 ? "bg-neutral-50" : "";
}
</script>

<style lang="scss">
.customer-profile-orders {
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

  &__mobile-sub {
    @apply text-sm text-neutral-600;
  }
}
</style>

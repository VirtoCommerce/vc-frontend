<template>
  <VcWidget :title="t('sales_rep.customer_profile.orders.title')" size="lg" class="customer-profile-orders">
    <template #append>
      <!-- Design's text link (`widget-link`): blue `--link-color`, no button chrome. Wires to the
           future "All orders" page once that route exists (next story). -->
      <button type="button" class="customer-profile-orders__all-link">
        {{ t("sales_rep.customer_profile.orders.view_all") }}
        <VcIcon name="arrow-right" size="xs" />
      </button>
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

            <span>{{ formatTotal(item.total, item.currency) }}</span>
          </div>

          <div class="customer-profile-orders__mobile-sub">
            {{ $d(item.createdDate, "short") }} · {{ item.itemsCount }}
          </div>

          <OrderStatus :status="item.status" />
        </div>
      </template>

      <!-- Customer-facing OrderDetails route (same as the My customers list). A rep opening another
           org's order may 403 — no rep-scoped order-detail query yet (VCST-5308 follow-up). -->
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
        {{ formatTotal(item.total, item.currency) }}
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

const { t, locale } = useI18n();
const { orders, loading } = useSalesRepCustomerOrders(() => props.organizationId);

// Zebra striping, matching the My customers table in this module.
function rowClass(_item: SalesRepCustomerOrderType, index: number): string {
  return index % 2 === 1 ? "bg-neutral-50" : "";
}

// salesRepOrders returns a raw Decimal `total` + `currency` code (no MoneyType/formattedAmount from
// the backend), so format client-side by the order's own currency. No fabricated fallback currency:
// when the code is missing/invalid, render a plain formatted number rather than a wrong symbol.
function formatTotal(amount: number, currency: string): string {
  try {
    return currency
      ? new Intl.NumberFormat(locale.value, { style: "currency", currency }).format(amount)
      : new Intl.NumberFormat(locale.value).format(amount);
  } catch {
    return new Intl.NumberFormat(locale.value).format(amount);
  }
}
</script>

<style lang="scss">
.customer-profile-orders {
  // Divider separating the header from the content, matching the design.
  .vc-widget__header-container {
    @apply border-b border-neutral-200;
  }

  // Tight content padding (VcWidget lg insets by px-7); the design wraps the table in ~8px.
  .vc-widget__slot {
    @apply p-2;
  }

  // "All orders" text link (design's `widget-link`): blue link color, small, with the arrow.
  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:underline;
  }

  // Order number as a blue link (design's `hub-order-link`); no "#" prefix.
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

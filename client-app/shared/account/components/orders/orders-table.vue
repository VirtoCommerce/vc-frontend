<template>
  <VcTable
    :loading="loading"
    :items="orders"
    :sort="sort"
    :pages="pages"
    :page="page"
    :hide-default-footer="hideDefaultFooter"
    :description="$t('pages.account.orders.meta.table_description')"
    :bordered="bordered"
    mobile-breakpoint="lg"
    class="orders-table"
    @header-click="emit('headerClick', $event)"
    @page-changed="emit('pageChanged', $event)"
    @row-click="emit('rowClick', $event)"
  >
    <template #mobile-item="{ item }">
      <button
        class="orders-table__mobile-row"
        type="button"
        tabindex="0"
        @click="emit('rowClick', item)"
        @keyup.enter="emit('rowClick', item)"
      >
        <div class="orders-table__mobile-field">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.order_number_label") }}
          </span>

          <span class="orders-table__mobile-value orders-table__mobile-value--emphasis">
            {{ item.number }}
          </span>
        </div>

        <div class="orders-table__mobile-status">
          <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
        </div>

        <div v-if="orderScope === 'organization' && item?.customerName" class="orders-table__mobile-field">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.buyer_name_label") }}
          </span>

          <span class="orders-table__mobile-value">
            {{ item?.customerName }}
          </span>
        </div>

        <div class="orders-table__mobile-field">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.date_label") }}
          </span>

          <span class="orders-table__mobile-value">
            {{ $d(item?.createdDate) }}
          </span>
        </div>

        <div class="orders-table__mobile-field">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.total_label") }}
          </span>

          <span
            v-for="total in getDisplayTotals(item)"
            :key="total.currency.code"
            class="orders-table__mobile-value orders-table__mobile-value--emphasis"
          >
            {{ total.formattedAmount }}
          </span>
        </div>
      </button>
    </template>

    <!-- Desktop columns -->
    <VcTableColumn id="number" v-slot="{ item }" :title="$t('pages.account.orders.order_number_label')" sortable>
      {{ item.number }}
    </VcTableColumn>

    <VcTableColumn
      v-if="orderScope === 'private'"
      id="purchaseOrder"
      v-slot="{ item }"
      :title="$t('pages.account.orders.purchase_number_label')"
    >
      {{ item.purchaseOrderNumber }}
    </VcTableColumn>

    <VcTableColumn
      v-if="orderScope === 'organization'"
      id="buyerName"
      v-slot="{ item }"
      :title="$t('pages.account.orders.buyer_name_label')"
      class="w-32 xl:w-40"
    >
      {{ item.customerName }}
    </VcTableColumn>

    <VcTableColumn
      id="invoice"
      v-slot="{ item }"
      :title="$t('pages.account.orders.invoice_label')"
      class="w-32 xl:w-40"
    >
      {{ item.inPayments?.[0]?.number }}
    </VcTableColumn>

    <VcTableColumn
      id="createdDate"
      v-slot="{ item }"
      :title="$t('pages.account.orders.date_label')"
      sortable
      class="w-28"
    >
      {{ $d(item?.createdDate) }}
    </VcTableColumn>

    <VcTableColumn id="status" v-slot="{ item }" :title="$t('pages.account.orders.status_label')" sortable class="w-36">
      <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" class="inline-block" />
    </VcTableColumn>

    <VcTableColumn
      id="total"
      v-slot="{ item }"
      :title="$t('pages.account.orders.total_label')"
      sortable
      align="right"
      class="w-40"
    >
      <div class="flex flex-col">
        <span v-for="total in getDisplayTotals(item)" :key="total.currency.code">
          {{ total.formattedAmount }}
        </span>
      </div>
    </VcTableColumn>

    <template #page-limit-message>
      {{ $t("ui_kit.reach_limit.page_limit_filters") }}
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTableColumn } from "@/ui-kit/components/organisms";
import OrderStatus from "../order-status.vue";
import type { OrderScopeType } from "../../types";
import type { CustomerOrderType, MoneyType, OrderTotalType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

interface IProps {
  loading: boolean;
  orders: CustomerOrderType[];
  sort?: ISortInfo;
  pages: number;
  page: number;
  hideDefaultFooter?: boolean;
  bordered?: boolean;
  orderScope: OrderScopeType;
}

interface IEmits {
  (e: "headerClick", sort: ISortInfo): void;
  (e: "pageChanged", page: number): void;
  (e: "rowClick", order: CustomerOrderType): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();

// Totals to show in the Total column: the primary-currency total first, then the rest.
// Falls back to the order's single total when per-currency totals are unavailable.
function getDisplayTotals(order: CustomerOrderType): MoneyType[] {
  const totals = order.orderTotals?.filter((total): total is OrderTotalType => !!total) ?? [];

  if (!totals.length) {
    return order.total ? [order.total] : [];
  }

  totals.sort((a, b) => Number(b.isDefaultTotalCurrency) - Number(a.isDefaultTotalCurrency));

  return totals.map((total) => total.total);
}
</script>

<style lang="scss">
.orders-table {
  @apply bg-additional-50;

  &__mobile-row {
    @apply grid w-full cursor-pointer grid-cols-2 items-center gap-x-4 gap-y-4 border-b border-neutral-200 p-6 text-left;
  }

  &__mobile-field {
    @apply flex flex-col;
  }

  &__mobile-status {
    @apply flex flex-col items-end justify-center;
  }

  &__mobile-label {
    @apply text-sm text-neutral-400;
  }

  &__mobile-value {
    @apply overflow-hidden text-ellipsis;

    &--emphasis {
      @apply font-black;
    }
  }
}
</style>

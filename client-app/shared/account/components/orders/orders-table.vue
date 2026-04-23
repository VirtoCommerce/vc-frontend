<template>
  <VcTable
    :loading="loading"
    :columns="columns"
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
  >
    <template #mobile-item="itemData">
      <button
        class="orders-table__mobile-row"
        type="button"
        tabindex="0"
        @click="emit('rowClick', itemData.item)"
        @keyup.enter="emit('rowClick', itemData.item)"
      >
        <div class="orders-table__mobile-cell">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.order_number_label") }}
          </span>

          <span class="orders-table__mobile-value orders-table__mobile-value--bold orders-table__mobile-value--pr">
            {{ itemData.item.number }}
          </span>
        </div>

        <div class="orders-table__mobile-cell orders-table__mobile-cell--end">
          <OrderStatus :status="itemData.item.status" :display-value="itemData.item.statusDisplayValue" />
        </div>

        <div v-if="orderScope === 'organization' && itemData.item?.customerName" class="orders-table__mobile-cell">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.buyer_name_label") }}
          </span>

          <span class="orders-table__mobile-value">
            {{ itemData.item?.customerName }}
          </span>
        </div>

        <div class="orders-table__mobile-cell">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.date_label") }}
          </span>

          <span class="orders-table__mobile-value">
            {{ $d(itemData.item?.createdDate) }}
          </span>
        </div>

        <div class="orders-table__mobile-cell">
          <span class="orders-table__mobile-label">
            {{ $t("pages.account.orders.total_label") }}
          </span>

          <span class="orders-table__mobile-value orders-table__mobile-value--bold">
            {{ itemData.item.total?.formattedAmount }}
          </span>
        </div>
      </button>
    </template>

    <template #desktop-body>
      <tr v-for="order in orders" :key="order.id" class="orders-table__desktop-row" @click="emit('rowClick', order)">
        <td class="orders-table__desktop-cell">
          {{ order.number }}
        </td>

        <td v-if="orderScope === 'private'" class="orders-table__desktop-cell">
          {{ order.purchaseOrderNumber }}
        </td>

        <td v-if="orderScope === 'organization'" class="orders-table__desktop-cell">
          {{ order.customerName }}
        </td>

        <td class="orders-table__desktop-cell">
          {{ order.inPayments?.[0]?.number }}
        </td>

        <td class="orders-table__desktop-cell">
          {{ $d(order?.createdDate) }}
        </td>

        <td class="orders-table__desktop-cell orders-table__desktop-cell--status">
          <OrderStatus :status="order.status" :display-value="order.statusDisplayValue" class="orders-table__status" />
        </td>

        <td class="orders-table__desktop-cell orders-table__desktop-cell--total">
          {{ order.total?.formattedAmount }}
        </td>
      </tr>
    </template>

    <template #page-limit-message>
      {{ $t("ui_kit.reach_limit.page_limit_filters") }}
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import OrderStatus from "../order-status.vue";
import type { OrderScopeType } from "../../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

interface IProps {
  loading: boolean;
  orders: CustomerOrderType[];
  columns: VcTableColumnType[];
  sort: ISortInfo;
  pages: number;
  page: number;
  hideDefaultFooter: boolean;
  bordered: boolean;
  orderScope: OrderScopeType;
}

interface IEmits {
  (e: "headerClick", sort: ISortInfo): void;
  (e: "pageChanged", page: number): void;
  (e: "rowClick", order: CustomerOrderType): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.orders-table {
  @apply bg-additional-50;

  &__mobile-row {
    @apply grid w-full cursor-pointer grid-cols-2 items-center gap-y-4 border-b border-neutral-200 p-6 text-left;
  }

  &__mobile-cell {
    @apply flex flex-col;

    &--end {
      @apply items-end justify-center;
    }
  }

  &__mobile-label {
    @apply text-sm text-neutral-400;
  }

  &__mobile-value {
    @apply overflow-hidden text-ellipsis;

    &--bold {
      @apply font-black;
    }

    &--pr {
      @apply pr-4;
    }
  }

  &__desktop-row {
    @apply cursor-pointer;

    &:nth-child(even) {
      @apply bg-neutral-50;
    }

    &:hover {
      @apply bg-neutral-200;
    }
  }

  &__desktop-cell {
    @apply overflow-hidden text-ellipsis p-5;

    &--status {
      @apply p-1;
    }

    &--total {
      @apply text-right;
    }
  }

  &__status {
    @apply inline-block;
  }
}
</style>

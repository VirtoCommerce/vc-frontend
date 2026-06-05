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
      <OrderCard :item="item" :order-scope="orderScope" />
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
      class="w-32"
    >
      {{ item.total?.formattedAmount }}
    </VcTableColumn>

    <template #page-limit-message>
      {{ $t("ui_kit.reach_limit.page_limit_filters") }}
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { VcTableColumn } from "@/ui-kit/components/organisms";
import OrderCard from "../order-card.vue";
import OrderStatus from "../order-status.vue";
import type { OrderScopeType } from "../../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";
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
</script>

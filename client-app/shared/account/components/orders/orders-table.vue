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

    <!-- Desktop columns: the four the design draws — number, date, status, total -->
    <VcTableColumn id="number" v-slot="{ item }" :title="$t('pages.account.orders.order_number_label')" sortable strong>
      {{ item.number }}
    </VcTableColumn>

    <VcTableColumn id="createdDate" v-slot="{ item }" :title="$t('pages.account.orders.date_label')" sortable>
      {{ $d(item?.createdDate) }}
    </VcTableColumn>

    <VcTableColumn id="status" v-slot="{ item }" :title="$t('pages.account.orders.status_label')" sortable>
      <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" class="inline-block" />
    </VcTableColumn>

    <VcTableColumn id="total" v-slot="{ item }" :title="$t('pages.account.orders.total_label')" sortable align="right">
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
import { getDisplayTotals } from "@/core/utilities";
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

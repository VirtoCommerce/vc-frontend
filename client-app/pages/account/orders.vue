<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 lg:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">Orders</h2>
          </div>
          <div class="flex flex-col bg-white shadow-sm" :class="{ 'rounded border': !isMobile }">
            <VcTable
              :loading="ordersLoading"
              :columns="columns"
              :items="orders"
              :sort="sort"
              :pages="pages"
              :page="page"
              @itemClick="openOrderDetails"
              @headerClick="applySorting"
              @pageChanged="onPageChange"
            >
              <template #mobile-item="itemData">
                <div class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200 cursor-pointer">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400"> Order number </span>
                    <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                      {{ itemData.item.number }}
                    </span>
                  </div>

                  <div class="flex flex-col justify-center items-end">
                    <TableStatusBadge :status="itemData.item.status"></TableStatusBadge>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Date</span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ moment(itemData.item?.createdDate).format("YYYY-MM-DD") }}
                    </span>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Total</span>
                    <span class="overflow-hidden overflow-ellipsis">{{ itemData.item.total?.formattedAmount }}</span>
                  </div>
                </div>
              </template>
              <template #mobile-empty>
                <div class="flex items-center justify-center space-x-10 p-5">
                  <img src="/static/images/account/icons/no-addresses.svg" alt="No orders" />
                  <div class="flex flex-col space-y-2">
                    <span class="text-base">There are no orders yet</span>
                  </div>
                </div>
              </template>
              <template #mobile-skeleton>
                <div v-for="i of itemsPerPage" :key="i" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Order number</span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Date</span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Total</span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Status</span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>
                </div>
              </template>
              <template #desktop-body>
                <tr
                  v-for="order in orders"
                  :key="order.id"
                  class="even:bg-gray-50 hover:bg-gray-200 cursor-pointer"
                  @click="openOrderDetails(order)"
                >
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ order.number }}
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ order.purchaseOrderNumber }}
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">{{ order.inPayments?.[0]?.number }}</td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ moment(order?.createdDate).format("YYYY-MM-DD") }}
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    <TableStatusBadge :status="order.status" class="mx-auto"></TableStatusBadge>
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis text-right">{{ order.total?.formattedAmount }}</td>
                </tr>
              </template>
              <template #desktop-empty>
                <!-- Workaround for using colspan -->
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="6" class="polygons-bg">
                    <div class="flex items-center pl-56 space-x-10 h-80">
                      <img src="/static/images/account/icons/no-addresses.svg" alt="No orders" />
                      <div class="flex flex-col space-y-2">
                        <span class="text-base">There are no orders yet</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <template #desktop-skeleton>
                <tr v-for="i of itemsPerPage" :key="i" class="even:bg-gray-50">
                  <td class="p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                  <td class="w-4/12 p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                  <td class="p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                  <td class="p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                  <td class="p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                  <td class="p-5">
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </td>
                </tr>
              </template>
            </VcTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ITableColumn, TableStatusBadge, VcTable } from "@/components";
import { AccountNavigation } from "@/shared/account";
import { onMounted, ref } from "vue";
import { sortAscending, sortDescending } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import useUserOrders from "@/shared/account/composables/useUserOrders";
import moment from "moment";
import { useRouter } from "vue-router";
import { CustomerOrderType } from "@/core/api/graphql/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, loadOrders, sort, pages, itemsPerPage, page } = useUserOrders();

const isMobile = breakpoints.smaller("md");

const router = useRouter();

const openOrderDetails = (item: CustomerOrderType) => {
  router.push({ name: "OrderDetails", params: { id: item.id } });
};

const onPageChange = async (newPage: number) => {
  page.value = newPage;
  await loadOrders();
};

const applySorting = async (column: string) => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === sortDescending ? sortAscending : sortDescending;
  } else {
    sort.value.column = column;
    sort.value.direction = sortDescending;
  }

  page.value = 1;
  await loadOrders();
};

onMounted(async () => {
  await loadOrders();
});

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: "Order number",
    sortable: true,
  },
  {
    id: "purchaseOrder",
    title: "Purchase order",
  },
  {
    id: "invoice",
    title: "Invoice",
  },
  {
    id: "createdDate",
    title: "Date",
    sortable: true,
  },
  {
    id: "status",
    title: "Status",
    sortable: true,
    titlePosition: "text-center",
  },
  {
    id: "total",
    title: "Total",
    sortable: true,
    titlePosition: "text-right",
  },
]);
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>

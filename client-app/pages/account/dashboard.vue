<template>
  <div class="bg-gray-100 pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="md:hidden text-gray-800 px-5 text-3xl font-bold uppercase mb-5">Dashboard</h2>
      <div class="flex">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>
        <!-- Second column-->
        <div class="flex flex-col w-full px-5 space-y-5 lg:w-3/5">
          <VcCard title="Last orders" :full-width-content="true">
            <template #header-button>
              <div v-if="isMobile">
                <VcButton :to="`/account/orders`" :is-outline="true" class="px-2 uppercase text-sm"
                  >All orders</VcButton
                >
              </div>
              <div class="flex items-center" v-else>
                <router-link :to="`/account/orders`" class="text-xs text-blue-500 hover:text-blue-700 font-bold mr-3"
                  >All Orders</router-link
                >
                <i class="fas fa-arrow-right text-yellow-500"></i>
              </div>
            </template>
            <VcTable
              :loading="ordersLoading"
              :columns="columns"
              :items="orders"
              :sort="sort"
              :footer="false"
              @itemClick="openOrderDetails"
            >
              <template #mobile-item="itemData">
                <div class="grid grid-cols-3 p-6 gap-y-4 gap-x-8 border-b border-gray-200 cursor-pointer">
                  <div class="flex flex-col text-sm">
                    <span class="text-gray-400">Order number</span>
                    <span class="font-extrabold overflow-hidden overflow-ellipsis">
                      {{ itemData.item.number }}
                    </span>
                  </div>

                  <div class="flex flex-col text-sm">
                    <span class="text-gray-400">Purchase number</span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ itemData.item.purchaseOrderNumber }}
                    </span>
                  </div>

                  <div class="flex flex-col justify-start">
                    <TableStatusBadge :status="itemData.item.status"></TableStatusBadge>
                  </div>

                  <div class="flex flex-col text-sm">
                    <span class="text-gray-400">Invoice</span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ itemData.item.inPayments?.[0]?.number }}
                    </span>
                  </div>

                  <div class="flex flex-col text-sm">
                    <span class="text-gray-400">Date</span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ moment(itemData.item?.createdDate).format("YYYY-MM-DD") }}
                    </span>
                  </div>

                  <div class="flex flex-col text-sm">
                    <span class="text-gray-400">Total</span>
                    <span class="font-extrabold overflow-hidden overflow-ellipsis">{{
                      itemData.item.total?.formattedAmount
                    }}</span>
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
                <div
                  v-for="i of itemsPerPage"
                  :key="i"
                  class="grid grid-cols-3 p-6 gap-y-4 gap-x-8 border-b border-gray-200"
                >
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Order number</span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Purchase number</span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Status</span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Invoice</span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Date</span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400">Total</span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
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
          </VcCard>
          <div class="flex flex-col space-y-5 lg:flex-row lg:space-x-5 lg:space-y-0">
            <VcCard title="Monthly spend report" class="lg:w-1/2">
              <div class="flex content-center space-x-9 lg:space-x-4">
                <VcImage src="/static/images/dashboard/spend-chart.svg" class="h-24 w-24" alt="Spend chart" />
                <div
                  class="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:flex-wrap sm:space-x-5 sm:items-center xl:space-x-7 justify-center"
                >
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Budget</span>
                    <span class="text-xl font-extrabold">$58,152</span>
                  </div>
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Total spend</span>
                    <span class="text-xl font-extrabold">$530,152</span>
                  </div>
                </div>
              </div>
            </VcCard>
            <VcCard title="Orders status" class="h-52 lg:h-auto lg:w-1/2"></VcCard>
          </div>
          <!-- Commented due to accetpance criteria, will be used in future-->
          <!-- <VcCard title="Users" class="h-52"></VcCard> -->
        </div>
        <!-- Third column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <VcCard title="Bulk order pad" class="h-96"></VcCard>
          <!-- Commented due to accetpance criteria, will be used in future-->
          <!-- <VcCard title="Current user roles" class="h-80"></VcCard> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ITableColumn, VcCard, VcImage, VcTable, TableStatusBadge, VcButton } from "@/components";
import { CustomerOrderType } from "@/core/api/graphql/types";
import { sortDescending } from "@/core/constants";
import { AccountNavigation } from "@/shared/account";
import useUserOrders from "@/shared/account/composables/useUserOrders";
import { onMounted, ref } from "vue";
import moment from "moment";
import { useRouter } from "vue-router";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const { loading: ordersLoading, orders, loadOrders, sort, itemsPerPage } = useUserOrders();

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: "Order number",
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
  },
  {
    id: "status",
    title: "Status",
    titlePosition: "text-center",
  },
  {
    id: "total",
    title: "Total",
    titlePosition: "text-right",
  },
]);

const router = useRouter();

const openOrderDetails = (item: CustomerOrderType) => {
  router.push({ name: "OrderDetails", params: { id: item.id } });
};

onMounted(async () => {
  sort.value.column = "createdDate";
  sort.value.direction = sortDescending;
  itemsPerPage.value = 4;
  await loadOrders();
});
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>

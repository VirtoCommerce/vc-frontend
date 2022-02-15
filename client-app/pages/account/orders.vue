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
            <!-- View Table -->
            <!-- TODO: make a component to view the addresses table -->
            <!-- Mobile table view -->
            <template v-if="isMobile">
              <div v-if="orders.length">
                <TableMobileItem v-for="order in orders" :key="order.id" :item="order" class="overflow-auto cursor-pointer" @click="openOrderDetails(order.id)">
                  <div class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400"> Order number </span>
                      <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                        {{ order.number }}
                      </span>
                    </div>

                    <div class="flex flex-col justify-center items-end">
                      <TableStatusBadge :status="order.status"></TableStatusBadge>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Date</span>
                      <span class="overflow-hidden overflow-ellipsis">
                        {{ moment(order?.createdDate).format("YYYY-MM-DD") }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Email</span>
                      <span class="overflow-hidden overflow-ellipsis">{{ order.total?.formattedAmount }}</span>
                    </div>
                  </div>
                </TableMobileItem>
              </div>

              <div v-else-if="!ordersLoading" class="flex items-center justify-center space-x-10 p-5">
                <img src="/static/images/account/icons/no-addresses.svg" alt="No orders" />
                <div class="flex flex-col space-y-2">
                  <span class="text-base">There are no orders yet</span>
                </div>
              </div>

              <!-- Grid Skeleton -->
              <div v-else>
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
              </div>
            </template>

            <!-- Desktop table view -->
            <table v-else class="table-fixed text-sm text-left w-full">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="py-3 px-5 font-extrabold cursor-pointer" @click="applySorting('number')">
                    Order number
                    <i
                      class="fas fa-caret-down ml-2"
                      v-if="sort.column === 'number' && sort.direction === sortDescending"
                    ></i>
                    <i
                      class="fas fa-caret-up ml-2"
                      v-if="sort.column === 'number' && sort.direction === sortAscending"
                    ></i>
                  </th>
                  <th class="py-3 px-5 font-extrabold">Purchase order</th>
                  <th class="py-3 px-5 font-extrabold">Invoice</th>
                  <th class="py-3 px-5 font-extrabold cursor-pointer" @click="applySorting('createdDate')">
                    Date
                    <i
                      class="fas fa-caret-down ml-2"
                      v-if="sort.column === 'createdDate' && sort.direction === sortDescending"
                    ></i>
                    <i
                      class="fas fa-caret-up ml-2"
                      v-if="sort.column === 'createdDate' && sort.direction === sortAscending"
                    ></i>
                  </th>
                  <th class="py-3 px-5 font-extrabold text-center cursor-pointer" @click="applySorting('status')">
                    Status
                    <i
                      class="fas fa-caret-down ml-2"
                      v-if="sort.column === 'status' && sort.direction === sortDescending"
                    ></i>
                    <i
                      class="fas fa-caret-up ml-2"
                      v-if="sort.column === 'status' && sort.direction === sortAscending"
                    ></i>
                  </th>
                  <th class="py-3 px-5 font-extrabold text-right cursor-pointer" @click="applySorting('total')">
                    Total
                    <i
                      class="fas fa-caret-down ml-2"
                      v-if="sort.column === 'total' && sort.direction === sortDescending"
                    ></i>
                    <i
                      class="fas fa-caret-up ml-2"
                      v-if="sort.column === 'total' && sort.direction === sortAscending"
                    ></i>
                  </th>
                </tr>
              </thead>

              <tbody v-if="orders.length">
                <tr
                  v-for="order in orders"
                  :key="order.id"
                  class="even:bg-gray-50 hover:bg-gray-200 cursor-pointer"
                  @click="openOrderDetails(order.id)"
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
              </tbody>

              <tbody v-else-if="!ordersLoading">
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
              </tbody>

              <!-- Table Skeleton -->
              <tbody v-else>
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
              </tbody>
            </table>

            <VcPagination
              v-if="pages > 1"
              v-model:page="page"
              :pages="pages"
              class="self-start"
              :class="[isMobile ? 'px-6 py-10' : 'pb-5 px-5 mt-5']"
              @update:page="loadOrders"
            ></VcPagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TableMobileItem, TableStatusBadge, VcPagination } from "@/components";
import { AccountNavigation } from "@/shared/account";
import { onMounted } from "vue";
import { sortAscending, sortDescending } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import useUserOrders from "@/shared/account/composables/useUserOrders";
import moment from "moment";
import { useRouter } from "vue-router";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, loadOrders, sort, pages, itemsPerPage, page } = useUserOrders();

const isMobile = breakpoints.smaller("md");

const router = useRouter();

const openOrderDetails = (orderId: string) => {
  router.push({ name: "OrderDetails", params: { id: orderId } });
};

async function applySorting(column: string): Promise<void> {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === sortDescending ? sortAscending : sortDescending;
  } else {
    sort.value.column = column;
    sort.value.direction = sortDescending;
  }

  page.value = 1;
  await loadOrders();
}

onMounted(async () => {
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

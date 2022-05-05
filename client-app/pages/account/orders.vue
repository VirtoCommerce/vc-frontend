<template>
  <div
    class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner"
    :class="{ 'polygon-gray-bg': !orders.length && !ordersLoading }"
  >
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- Mobile filters sidebar -->
        <VcPopupSidebar class="px-7 py-12 w-60" :visible="isMobile && filtersVisible" @hide="hideFilters">
          <div class="h-full flex flex-col">
            <div class="relative">
              <button class="absolute -right-3 appearance-none px-3 py-1" @click="hideFilters">
                <span class="text-2xl fa fa-times text-[color:var(--color-primary)]"></span>
              </button>
            </div>
            <div class="font-semibold text-2xl pt-1 mb-6">{{ $t("common.buttons.filters") }}</div>
            <OrdersFilter class="flex-grow" @change="filterChanged()" />
          </div>
        </VcPopupSidebar>
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 md:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.orders.title'"></h2>
          </div>
          <!-- search & filters -->
          <div class="flex gap-3 lg:flex-row-reverse">
            <div class="relative ml-5 md:mx-0">
              <VcButton
                ref="filterButtonElement"
                :is-disabled="ordersLoading"
                size="lg"
                class="p-4 uppercase"
                @click="toggleFilters"
              >
                <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
                <span class="lg:hidden fa fa-filter"></span>
              </VcButton>
              <div
                v-if="filtersVisible && !isMobile"
                class="absolute right-0 z-10 bg-white shadow-lg pb-6 rounded border border-gray-300 overflow-hidden mt-2"
              >
                <button class="absolute right-0 appearance-none px-4 py-2" @click="hideFilters">
                  <span class="fa fa-times text-[color:var(--color-primary)]"></span>
                </button>

                <OrdersFilter ref="filtersElement" class="px-8 pt-9" @change="filterChanged()" />
              </div>
            </div>
            <div class="flex flex-grow mr-5 md:mx-0">
              <input
                v-model.trim="keyword"
                :disabled="ordersLoading"
                type="search"
                class="flex-grow appearance-none bg-white rounded rounded-r-none h-11 px-4 font-medium outline-none text-sm border border-gray-300 focus:border-gray-400 disabled:bg-gray-200"
                @keypress.enter="applyKeyword"
              />
              <VcButton
                :is-disabled="ordersLoading"
                class="px-4 !rounded-l-none uppercase"
                size="lg"
                @click="applyKeyword"
              >
                <i class="fas fa-search text-lg"></i>
              </VcButton>
            </div>
          </div>
          <!-- Filters chips -->
          <div v-if="!isMobile && !isFilterEmpty" class="flex flex-wrap gap-x-3 gap-y-2 mb-2">
            <VcChip
              class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
              size="sm"
              is-outline
              clickable
              closable
              @click="resetFilters"
              @close="resetFilters"
            >
              {{ $t("pages.catalog.reset_filters_button") }}
            </VcChip>

            <template v-for="item in filterChipsItems" :key="item.value">
              <VcChip
                class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
                size="sm"
                closable
                @close="removeFilterChipsItem(item)"
              >
                {{ item.label }}
              </VcChip>
            </template>
          </div>
          <div class="flex flex-col bg-white shadow-sm md:rounded md:border" v-if="orders.length">
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
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.order_number_label'"> </span>
                    <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                      {{ itemData.item.number }}
                    </span>
                  </div>

                  <div class="flex flex-col justify-center items-end">
                    <TableStatusBadge :status="itemData.item.status"></TableStatusBadge>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.date_label'"></span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ moment(itemData.item?.createdDate).format("YYYY-MM-DD") }}
                    </span>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.total_label'"></span>
                    <span class="overflow-hidden overflow-ellipsis">{{ itemData.item.total?.formattedAmount }}</span>
                  </div>
                </div>
              </template>

              <template #mobile-skeleton>
                <div v-for="i of itemsPerPage" :key="i" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.order_number_label'"></span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.date_label'"></span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.total_label'"></span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.orders.status_label'"></span>
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

          <!-- Empty view -->
          <VcEmptyView :text="$t('pages.account.orders.no_orders_message')" v-else>
            <template #icon v-if="isMobile">
              <VcImage :src="'/static/images/common/order.svg'" />
            </template>
            <template #button>
              <VcButton class="px-6 uppercase" size="lg" @click="resetFilters">
                <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5"></i>
                {{ $t("pages.account.orders.no_orders_button") }}
              </VcButton>
            </template>
          </VcEmptyView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ITableColumn,
  TableStatusBadge,
  VcTable,
  VcButton,
  VcPopupSidebar,
  VcChip,
  VcEmptyView,
  VcImage,
} from "@/components";
import { OrdersFilter, AccountNavigation, useUserOrdersFilter, useUserOrders } from "@/shared/account";

import { onMounted, ref, shallowRef, watch } from "vue";
import { sortAscending, sortDescending } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints, onClickOutside } from "@vueuse/core";

import moment from "moment";
import { useRouter } from "vue-router";
import { CustomerOrderType } from "@/core/api/graphql/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, loadOrders, sort, pages, itemsPerPage, page, keyword } = useUserOrders();

const { appliedFilterData, isFilterEmpty, filterChipsItems, resetFilters, resetDataToApplied, removeFilterChipsItem } =
  useUserOrdersFilter();

const isMobile = breakpoints.smaller("lg");

const router = useRouter();

const openOrderDetails = (item: CustomerOrderType) => {
  router.push({ name: "OrderDetails", params: { id: item.id } });
};

watch(
  appliedFilterData,
  () => {
    page.value = 1;
    loadOrders();
  },
  { deep: true }
);

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

const applyKeyword = async () => {
  page.value = 1;
  await loadOrders();
};

onMounted(async () => {
  resetFilters();
  await loadOrders();
});

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("pages.account.orders.order_number_label"),
    sortable: true,
  },
  {
    id: "purchaseOrder",
    title: t("pages.account.orders.purchase_number_label"),
  },
  {
    id: "invoice",
    title: t("pages.account.orders.invoice_label"),
  },
  {
    id: "createdDate",
    title: t("pages.account.orders.date_label"),
    sortable: true,
  },
  {
    id: "status",
    title: t("pages.account.orders.status_label"),
    sortable: true,
    titlePosition: "text-center",
  },
  {
    id: "total",
    title: t("pages.account.orders.total_label"),
    sortable: true,
    titlePosition: "text-right",
  },
]);

const filtersVisible = ref(false);

function toggleFilters() {
  if (!filtersVisible.value) {
    resetDataToApplied();
  }
  filtersVisible.value = !filtersVisible.value;
}

function hideFilters() {
  filtersVisible.value = false;
}

const filtersElement = shallowRef<HTMLElement | null>(null);
const filterButtonElement = shallowRef<HTMLElement | null>(null);

onClickOutside(
  filtersElement,
  () => {
    hideFilters();
  },
  { ignore: [filterButtonElement] }
);

function filterChanged() {
  hideFilters();
}
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>

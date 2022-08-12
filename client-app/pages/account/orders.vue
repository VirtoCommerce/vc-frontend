<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.orders.title'" />
    </div>

    <!-- Mobile filters sidebar -->
    <VcPopupSidebar class="px-5 pt-12 w-72" :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <div class="relative">
        <button class="absolute -right-3 appearance-none px-3 py-1" @click="hideFilters">
          <span class="text-2xl fas fa-times text-red-400 hover:text-red-700"></span>
        </button>
      </div>

      <div class="font-semibold text-2xl pt-1 mb-6">
        {{ $t("common.buttons.filters") }}
      </div>

      <MobileOrdersFilter />
      <div class="sticky h-24 z-100 bottom-0 mt-4 -mx-5 px-5 py-5 shadow-t-md bg-white">
        <div class="flex space-x-4">
          <VcButton
            class="flex-1 uppercase"
            size="lg"
            is-outline
            :is-disabled="isFilterEmpty && !isFilterDirty"
            @click="
              resetFilters();
              hideFilters();
            "
          >
            {{ $t("common.buttons.reset") }}
          </VcButton>
          <VcButton
            class="flex-1 uppercase"
            size="lg"
            :is-disabled="!isFilterDirty"
            @click="
              hideFilters();
              applyFilters();
            "
          >
            {{ $t("common.buttons.apply") }}
          </VcButton>
        </div>
      </div>
    </VcPopupSidebar>

    <!-- search & filters -->
    <div class="flex gap-3 lg:flex-row-reverse" v-if="!isMobile || orders.length">
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
          <button class="absolute right-0 appearance-none mr-4 mt-2" @click="hideFilters">
            <span class="text-lg fa fa-times text-red-400 hover:text-red-700"></span>
          </button>

          <OrdersFilter ref="filtersElement" class="px-8 pt-9" @change="filterChanged()" />
        </div>
      </div>

      <div class="flex flex-grow mr-5 md:mx-0">
        <div class="relative grow">
          <input
            v-model.trim="keyword"
            :disabled="ordersLoading"
            class="w-full appearance-none bg-white rounded rounded-r-none h-11 px-4 font-medium outline-none text-sm border border-gray-300 focus:border-gray-400 disabled:bg-gray-200"
            @keypress.enter="applyKeyword"
            :placeholder="$t('pages.account.orders.search_placeholder')"
          />

          <button v-if="keyword" class="absolute right-[14px] top-[14px]" @click="resetKeyword">
            <svg class="text-[color:var(--color-primary)]" height="14" width="14">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton :is-disabled="ordersLoading" class="px-4 !rounded-l-none uppercase" size="lg" @click="applyKeyword">
          <i class="fas fa-search text-lg" />
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

    <!-- Empty view -->
    <VcEmptyView v-if="!orders.length && !ordersLoading" :text="$t('pages.account.orders.no_orders_message')">
      <template #icon v-if="isMobile">
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.account.orders.orders_icon')" />
      </template>

      <template #button>
        <VcButton class="px-6 uppercase" size="lg" @click="resetFiltersWithKeyword">
          <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.account.orders.no_orders_button") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
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
              <span class="text-sm text-gray-400" v-t="'pages.account.orders.order_number_label'" />

              <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                {{ itemData.item.number }}
              </span>
            </div>

            <div class="flex flex-col justify-center items-end">
              <TableStatusBadge :status="itemData.item.status" />
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.orders.date_label'" />

              <span class="overflow-hidden overflow-ellipsis">
                {{ $d(itemData.item?.createdDate) }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.orders.total_label'" />

              <span class="overflow-hidden overflow-ellipsis font-extrabold">
                {{ itemData.item.total?.formattedAmount }}
              </span>
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

            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ order.inPayments?.[0]?.number }}
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ $d(order?.createdDate) }}
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis">
              <TableStatusBadge :status="order.status" class="mx-auto" />
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis text-right">
              {{ order.total?.formattedAmount }}
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
</template>

<script setup lang="ts">
import { OrdersFilter, MobileOrdersFilter, useUserOrdersFilter, useUserOrders } from "@/shared/account";

import { onMounted, ref, shallowRef, watch } from "vue";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints, onClickOutside } from "@vueuse/core";

import { useRouter } from "vue-router";
import { CustomerOrderType } from "@/xapi/types";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const { t } = useI18n();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, loadOrders, sort, pages, itemsPerPage, page, keyword } = useUserOrders();

const {
  appliedFilterData,
  isFilterEmpty,
  isFilterDirty,
  filterChipsItems,
  applyFilters,
  resetFilters,
  resetDataToApplied,
  removeFilterChipsItem,
} = useUserOrdersFilter();

usePageHead({
  title: t("pages.account.orders.meta.title"),
});

const isMobile = breakpoints.smaller("lg");

const openOrderDetails = (item: CustomerOrderType) => {
  router.push({ name: "OrderDetails", params: { orderId: item.id } });
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
  window.scroll({ top: 0, behavior: "smooth" });
  await loadOrders();
};

const applySorting = async (column: string) => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === SORT_DESCENDING ? SORT_ASCENDING : SORT_DESCENDING;
  } else {
    sort.value.column = column;
    sort.value.direction = SORT_DESCENDING;
  }

  page.value = 1;
  await loadOrders();
};

const applyKeyword = async () => {
  page.value = 1;
  await loadOrders();
};

const resetFiltersWithKeyword = async () => {
  keyword.value = "";
  page.value = 1;
  resetFilters();
};

onMounted(async () => {
  resetFilters();
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
    align: "center",
  },
  {
    id: "total",
    title: t("pages.account.orders.total_label"),
    sortable: true,
    align: "right",
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

async function resetKeyword() {
  keyword.value = "";
  await applyKeyword();
}
</script>

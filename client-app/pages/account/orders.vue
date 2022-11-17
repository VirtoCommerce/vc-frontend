<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.orders.title'" />
    </div>

    <!-- Mobile filters sidebar -->
    <VcPopupSidebar class="px-5 pt-6 w-72" :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <div class="relative">
        <button class="absolute -right-3 appearance-none px-3 py-1" @click="hideFilters">
          <span class="text-2xl fas fa-times text-red-400 hover:text-red-700"></span>
        </button>
      </div>

      <div class="font-semibold text-2xl pt-1 mb-6">
        {{ $t("common.buttons.filters") }}
      </div>

      <MobileOrdersFilter class="grow" />

      <div class="sticky z-100 bottom-0 mt-4 -mx-5 px-5 py-5 shadow-t-md bg-white">
        <div class="flex gap-x-4">
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
              applyFilters();
              hideFilters();
            "
          >
            {{ $t("common.buttons.apply") }}
          </VcButton>
        </div>
      </div>
    </VcPopupSidebar>

    <div class="-mt-5" ref="stickyMobileHeaderAnchor"></div>

    <!-- Page Toolbar -->
    <PageToolbarBlock
      :stick="isVisibleStickyMobileHeader"
      class="flex flex-row lg:flex-row-reverse items-center py-3.5 -my-3.5 gap-x-2 lg:gap-x-5"
      shadow
    >
      <div class="relative">
        <VcButton
          ref="filtersButtonElement"
          :is-disabled="ordersLoading"
          :is-outline="!filtersVisible && !isMobile"
          size="lg"
          class="w-11 lg:w-auto px-3.5 uppercase"
          @click="toggleFilters"
        >
          <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
          <span class="lg:hidden fa fa-filter"></span>
        </VcButton>

        <!-- Desktop filters dropdown -->
        <div
          v-if="filtersVisible && !isMobile"
          ref="filtersDropdownElement"
          class="absolute right-0 z-[1] bg-white shadow-lg rounded border mt-2 p-6"
        >
          <button class="absolute top-0 right-0 appearance-none px-4 py-2" @click="hideFilters">
            <span class="text-lg fa fa-times text-red-400 hover:text-red-700"></span>
          </button>

          <OrdersFilter @change="hideFilters" />
        </div>
      </div>

      <div class="flex grow">
        <div class="relative grow">
          <VcInput
            v-model="localKeyword"
            maxlength="64"
            class="w-full"
            input-class="font-medium rounded-r-none !text-sm disabled:bg-gray-200 !pl-4 !pr-11"
            :is-disabled="ordersLoading"
            @keypress.enter="applyKeyword"
            :placeholder="$t('pages.account.orders.search_placeholder')"
          />

          <button v-if="localKeyword" class="absolute right-0 top-0 h-11 px-4" @click="resetKeyword">
            <svg class="text-[color:var(--color-primary)]" height="14" width="14">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton :is-disabled="ordersLoading" class="w-11 !rounded-l-none uppercase" size="lg" @click="applyKeyword">
          <i class="fas fa-search text-lg" />
        </VcButton>
      </div>
    </PageToolbarBlock>

    <!-- Filters chips -->
    <div v-if="!isFilterEmpty" class="hidden lg:flex flex-wrap gap-x-3 gap-y-2">
      <VcChip
        class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
        size="sm"
        is-outline
        clickable
        @click="resetFilters"
        @close="resetFilters"
      >
        {{ $t("common.buttons.reset_filters") }}
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
    <VcEmptyView
      v-if="!orders.length && !ordersLoading"
      :text="
        keyword || !isFilterEmpty
          ? $t('pages.account.orders.no_results_message')
          : $t('pages.account.orders.no_orders_message')
      "
    >
      <template #icon>
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.account.orders.no_orders_img_alt')" />
      </template>

      <template #button>
        <VcButton v-if="keyword || !isFilterEmpty" class="px-6 uppercase" size="lg" @click="resetFiltersWithKeyword">
          <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.account.orders.buttons.reset_search") }}
        </VcButton>

        <VcButton v-else :to="{ name: 'Catalog' }" class="px-6 uppercase" size="lg">
          {{ $t("pages.account.orders.buttons.no_orders") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcTable
        :loading="ordersLoading"
        :columns="columns"
        :items="orders"
        :sort="sort"
        :pages="pages"
        :page="page"
        @itemClick="goToOrderDetails"
        @headerClick="applySorting"
        @pageChanged="changePage"
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
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
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
            @click="goToOrderDetails(order)"
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
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
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
import {
  OrdersFilter,
  MobileOrdersFilter,
  useUserOrdersFilter,
  useUserOrders,
  PageToolbarBlock,
} from "@/shared/account";
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import { breakpointsTailwind, useBreakpoints, onClickOutside } from "@vueuse/core";
import { useRouter } from "vue-router";
import { CustomerOrderType } from "@/xapi/types";
import { useI18n } from "vue-i18n";
import { useElementVisibility, usePageHead } from "@/core/composables";
import { ISortInfo } from "@/core";

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
const localKeyword = ref("");
const filtersVisible = ref(false);
const filtersButtonElement = shallowRef<HTMLElement | null>(null);
const filtersDropdownElement = shallowRef<HTMLElement | null>(null);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });

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

const isVisibleStickyMobileHeader = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await loadOrders();
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = sortInfo;
  page.value = 1;
  await loadOrders();
}

async function applyKeyword() {
  keyword.value = localKeyword.value;
  page.value = 1;
  await loadOrders();
}

async function resetKeyword() {
  localKeyword.value = "";

  if (keyword.value) {
    await applyKeyword();
  }
}

function resetFiltersWithKeyword() {
  localKeyword.value = "";
  keyword.value = "";
  page.value = 1;
  resetFilters();
}

function toggleFilters() {
  if (!filtersVisible.value) {
    resetDataToApplied();
  }
  filtersVisible.value = !filtersVisible.value;
}

function hideFilters() {
  filtersVisible.value = false;
}

function goToOrderDetails(order: CustomerOrderType) {
  router.push({ name: "OrderDetails", params: { orderId: order.id } });
}

onClickOutside(
  filtersDropdownElement,
  () => {
    hideFilters();
  },
  { ignore: [filtersButtonElement] }
);

onMounted(() => {
  resetFilters();
});

watch(
  appliedFilterData,
  () => {
    page.value = 1;
    loadOrders();
  },
  { deep: true }
);
</script>

<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 v-t="'pages.account.orders.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <!-- Mobile filters sidebar -->
    <VcPopupSidebar class="w-72 px-5 pt-6" :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <div class="relative">
        <button type="button" class="absolute -right-3 appearance-none px-3 py-1" @click="hideFilters">
          <span class="fas fa-times text-2xl text-red-400 hover:text-red-700"></span>
        </button>
      </div>

      <div class="mb-6 pt-1 text-2xl font-semibold">
        {{ $t("common.buttons.filters") }}
      </div>

      <MobileOrdersFilter class="grow" />

      <div class="z-100 sticky bottom-0 -mx-5 mt-4 bg-white p-5 shadow-t-md">
        <div class="flex gap-4">
          <VcButton
            :disabled="isFilterEmpty && !isFilterDirty"
            class="flex-1"
            variant="outline"
            @click="
              resetFilters();
              hideFilters();
            "
          >
            {{ $t("common.buttons.reset") }}
          </VcButton>

          <VcButton
            :disabled="!isFilterDirty"
            class="flex-1"
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

    <div ref="stickyMobileHeaderAnchor" class="-mt-5"></div>

    <!-- Page Toolbar -->
    <PageToolbarBlock
      :stick="stickyMobileHeaderIsVisible"
      class="-my-3.5 flex flex-row items-center gap-x-2 py-3.5 lg:flex-row-reverse lg:gap-x-5"
      shadow
    >
      <div class="relative">
        <VcButton
          ref="filtersButtonElement"
          :disabled="ordersLoading"
          :variant="isMobile ? 'solid' : 'outline'"
          :icon="isMobile"
          @click="toggleFilters"
        >
          <VcIcon name="filter" class="lg:hidden" />

          <span>{{ $t("common.buttons.filters") }}</span>
        </VcButton>

        <!-- Desktop filters dropdown -->
        <div
          v-if="filtersVisible && !isMobile"
          ref="filtersDropdownElement"
          class="absolute right-0 z-[1] mt-2 rounded border bg-white p-6 shadow-lg"
        >
          <button type="button" class="absolute right-0 top-0 appearance-none px-4 py-3 align-top" @click="hideFilters">
            <VcIcon class="text-[--color-danger-500]" name="x" :size="18" />
          </button>

          <OrdersFilter @change="hideFilters" />
        </div>
      </div>

      <div class="flex grow">
        <VcInput
          v-model.trim="localKeyword"
          maxlength="64"
          class="w-full"
          :disabled="ordersLoading"
          :placeholder="$t('pages.account.orders.search_placeholder')"
          @keypress.enter="applyKeyword"
        >
          <template #append>
            <button v-if="localKeyword" type="button" class="flex h-full items-center px-4" @click="resetKeyword">
              <VcIcon class="text-[--color-primary-500]" name="delete-2" size="xs" />
            </button>

            <VcButton :disabled="ordersLoading" icon="search" @click="applyKeyword" />
          </template>
        </VcInput>
      </div>
    </PageToolbarBlock>

    <!-- Filters chips -->
    <div v-if="!isFilterEmpty" class="hidden flex-wrap gap-x-3 gap-y-2 lg:flex">
      <template v-for="item in filterChipsItems" :key="item.value">
        <VcChip size="sm" variant="secondary" closable @close="removeFilterChipsItem(item)">
          {{ item.label }}
        </VcChip>
      </template>

      <VcChip size="sm" variant="secondary" is-outline clickable @click="resetFilters">
        {{ $t("common.buttons.reset_filters") }}

        <VcIcon class="ml-2" name="reset" size="xs" />
      </VcChip>
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
        <VcButton v-if="keyword || !isFilterEmpty" prepend-icon="reset" @click="resetFiltersWithKeyword">
          {{ $t("pages.account.orders.buttons.reset_search") }}
        </VcButton>

        <VcButton v-else :to="{ name: 'Catalog' }">
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
        @item-click="goToOrderDetails"
        @header-click="applySorting"
        @page-changed="changePage"
      >
        <template #mobile-item="itemData">
          <div class="grid cursor-pointer grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.orders.order_number_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis pr-4 font-extrabold">
                {{ itemData.item.number }}
              </span>
            </div>

            <div class="flex flex-col items-end justify-center">
              <OrderStatus :status="itemData.item.status" />
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.orders.date_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ $d(itemData.item?.createdDate) }}
              </span>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.orders.total_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis font-extrabold">
                {{ itemData.item.total?.formattedAmount }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.orders.order_number_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.orders.date_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.orders.total_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.orders.status_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer even:bg-gray-50 hover:bg-gray-200"
            @click="goToOrderDetails(order)"
          >
            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.number }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.purchaseOrderNumber }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.inPayments?.[0]?.number }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ $d(order?.createdDate) }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5 text-center">
              <OrderStatus :status="order.status" />
            </td>

            <td class="overflow-hidden text-ellipsis p-5 text-right">
              {{ order.total?.formattedAmount }}
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="w-4/12 p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, onClickOutside, useElementVisibility } from "@vueuse/core";
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import {
  OrdersFilter,
  MobileOrdersFilter,
  useUserOrdersFilter,
  useUserOrders,
  PageToolbarBlock,
  OrderStatus,
} from "@/shared/account";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

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

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

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

function goToOrderDetails(order: CustomerOrderType): void {
  const orderRoute = router.resolve({ name: "OrderDetails", params: { orderId: order.id } });
  window.open(orderRoute.fullPath, "_blank")!.focus();
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

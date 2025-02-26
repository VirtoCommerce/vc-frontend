<template>
  <template v-if="withSearch">
    <!-- Mobile filters sidebar -->
    <VcPopupSidebar :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <MobileOrdersFilter>
        <template #buyerNameFilterType>
          <VcSelect
            v-if="isOrganizationMaintainer && orderScope === 'organization'"
            v-model="filterData.customerNames"
            :label="$t('common.labels.buyer_name')"
            :items="['Andrew Orlov', 'Max Boss']"
            class="my-4"
            multiple
          />
        </template>

        <template #dateFilterType>
          <DateFilterSelect :date-filter-type="selectedDateFilterType" @change="handleOrdersDateFilterChange" />
        </template>
      </MobileOrdersFilter>

      <template #footer>
        <VcButton
          :disabled="isFilterEmpty && !isFilterDirty"
          class="me-auto"
          color="secondary"
          variant="outline"
          size="sm"
          icon="reset"
          :title="$t('common.buttons.reset')"
          @click="resetOrderFilters"
        />

        <VcButton
          :disabled="isFilterEmpty && !isFilterDirty"
          variant="outline"
          size="sm"
          min-width="6.25rem"
          @click="hideFilters"
        >
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton :disabled="!isFilterDirty" size="sm" min-width="6.25rem" @click="applyOrderFilters">
          {{ $t("common.buttons.apply") }}
        </VcButton>
      </template>
    </VcPopupSidebar>

    <div ref="stickyMobileHeaderAnchor" class="-mt-5"></div>

    <div class="flex flex-col gap-3 lg:flex-row">
      <div v-if="isOrganizationMaintainer" class="flex gap-2">
        <button
          :class="[
            orderScope === 'organization'
              ? 'cursor-auto bg-additional-50 text-neutral-700 hover:shadow-md'
              : 'text-primary hover:text-primary-600',
          ]"
          class="flex rounded p-2"
          size="xs"
          type="button"
          @click="toggleOrdersScope('organization')"
        >
          <VcIcon class="size-5" name="case" />
          <span class="ms-1.5 text-base font-bold">
            {{ $t("common.buttons.agency") }}
          </span>
        </button>

        <button
          :class="[
            orderScope === 'private'
              ? 'cursor-auto bg-additional-50 text-neutral-700 hover:shadow-md'
              : 'text-primary hover:text-primary-600',
          ]"
          class="flex rounded p-2"
          size="xs"
          type="button"
          @click="toggleOrdersScope('private')"
        >
          <VcIcon class="size-5" name="user" />
          <span class="ms-1.5 text-base font-bold">
            {{ $t("common.buttons.personal") }}
          </span>
        </button>
      </div>

      <!-- Page Toolbar -->
      <PageToolbarBlock
        :stick="stickyMobileHeaderIsVisible"
        class="flex grow flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5"
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
            <VcIcon name="filter" />

            <span>{{ $t("common.buttons.filters") }}</span>
          </VcButton>

          <!-- Desktop filters dropdown -->
          <OrdersFilter
            v-if="filtersVisible && !isMobile"
            ref="filtersDropdownElement"
            class="absolute right-0 z-[1] mt-2"
            @apply="applyOrderFilters"
            @reset="resetOrderFilters"
            @close="hideFilters"
          >
            <template #buyerNameFilterType>
              <VcSelect
                v-if="isOrganizationMaintainer && orderScope === 'organization'"
                v-model="filterData.customerNames"
                :label="$t('common.labels.buyer_name')"
                :items="['Andrew Orlov', 'Max Boss']"
                class="my-4"
                multiple
              />
            </template>

            <template #dateFilterType>
              <DateFilterSelect :date-filter-type="selectedDateFilterType" @change="handleOrdersDateFilterChange" />
            </template>
          </OrdersFilter>
        </div>

        <div class="flex grow gap-6">
          <VcInput
            v-model="localKeyword"
            maxlength="64"
            class="w-full"
            :disabled="ordersLoading"
            :placeholder="$t('pages.account.orders.search_placeholder')"
            @keydown.enter="applyKeyword"
          >
            <template #append>
              <button
                v-if="localKeyword"
                :aria-label="$t('common.buttons.reset_orders_search_keyword')"
                type="button"
                class="flex h-full items-center px-4"
                @click="resetKeyword"
              >
                <VcIcon class="fill-primary" name="delete-2" size="xs" />
              </button>

              <VcButton
                :disabled="ordersLoading"
                :aria-label="$t('commmon.buttons.search_orders')"
                icon="search"
                @click="applyKeyword"
              />
            </template>
          </VcInput>
        </div>
      </PageToolbarBlock>
    </div>

    <!-- Filters chips -->
    <div v-if="!isFilterEmpty" class="hidden flex-wrap gap-x-3 gap-y-2 lg:flex">
      <template v-for="item in filterChipsItems" :key="item.value">
        <VcChip color="secondary" closable @close="handleRemoveFilter(item)">
          {{ item.label }}
        </VcChip>
      </template>

      <VcChip color="secondary" variant="outline" clickable @click="resetOrderFilters">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
      </VcChip>
    </div>
  </template>

  <!-- Empty view -->
  <VcEmptyView
    v-if="!orders.length && !ordersLoading"
    :text="
      keyword || !isFilterEmpty
        ? $t('pages.account.orders.no_results_message')
        : $t('pages.account.orders.no_orders_message')
    "
    icon="thin-order"
  >
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
  <div
    v-else
    :class="['flex flex-col bg-additional-50 shadow-sm', { 'max-md:-mx-6 lg:rounded lg:border': withSearch }]"
  >
    <VcTable
      :loading="ordersLoading"
      :columns="columns"
      :items="orders"
      :sort="sort"
      :pages="pages"
      :page="page"
      :hide-default-footer="!withPagination"
      :description="$t('pages.account.orders.meta.table_description')"
      @item-click="goToOrderDetails"
      @header-click="applySorting"
      @page-changed="changePage"
    >
      <template #mobile-item="itemData">
        <button
          class="grid w-full cursor-pointer grid-cols-2 items-center gap-y-4 border-b border-neutral-200 p-6 text-left"
          type="button"
          tabindex="0"
          @click="goToOrderDetails(itemData.item)"
          @keyup.enter="goToOrderDetails(itemData.item)"
        >
          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.order_number_label") }}
            </span>

            <span class="overflow-hidden text-ellipsis pr-4 font-black">
              {{ itemData.item.number }}
            </span>
          </div>

          <div class="flex flex-col items-end justify-center">
            <OrderStatus
              class="w-full !max-w-36"
              :status="itemData.item.status"
              :display-value="itemData.item.statusDisplayValue"
            />
          </div>

          <div v-if="orderScope === 'organization' && itemData.item?.customerName" class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.buyer_name_label") }}
            </span>

            <span class="overflow-hidden text-ellipsis">
              {{ itemData.item?.customerName }}
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.date_label") }}
            </span>

            <span class="overflow-hidden text-ellipsis">
              {{ $d(itemData.item?.createdDate) }}
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.total_label") }}
            </span>

            <span class="overflow-hidden text-ellipsis font-black">
              {{ itemData.item.total?.formattedAmount }}
            </span>
          </div>
        </button>
      </template>

      <template #mobile-skeleton>
        <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-neutral-200 p-6">
          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.order_number_label") }}
            </span>
            <div class="mr-4 h-6 animate-pulse bg-neutral-200" />
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.date_label") }}
            </span>
            <div class="h-6 animate-pulse bg-neutral-200" />
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.total_label") }}
            </span>
            <div class="mr-4 h-6 animate-pulse bg-neutral-200" />
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">
              {{ $t("pages.account.orders.status_label") }}
            </span>
            <div class="h-6 animate-pulse bg-neutral-200" />
          </div>
        </div>
      </template>

      <template #desktop-body>
        <tr
          v-for="order in orders"
          :key="order.id"
          class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
          @click="goToOrderDetails(order)"
        >
          <td class="overflow-hidden text-ellipsis p-5">
            {{ order.number }}
          </td>

          <td v-if="orderScope === 'private'" class="overflow-hidden text-ellipsis p-5">
            {{ order.purchaseOrderNumber }}
          </td>

          <td v-if="orderScope === 'organization'" class="overflow-hidden text-ellipsis p-5">
            {{ order.customerName }}
          </td>

          <td class="overflow-hidden text-ellipsis p-5">
            {{ order.inPayments?.[0]?.number }}
          </td>

          <td class="overflow-hidden text-ellipsis p-5">
            {{ $d(order?.createdDate) }}
          </td>

          <td class="p-5 text-center">
            <VcTooltip class="!block">
              <template #trigger>
                <OrderStatus
                  class="w-full !max-w-36"
                  :status="order.status"
                  :display-value="order.statusDisplayValue"
                />
              </template>

              <template #content>
                {{ order.statusDisplayValue }}
              </template>
            </VcTooltip>
          </td>

          <td class="overflow-hidden text-ellipsis p-5 text-right">
            {{ order.total?.formattedAmount }}
          </td>
        </tr>
      </template>

      <template #desktop-skeleton>
        <tr v-for="i in itemsPerPage" :key="i" class="even:bg-neutral-50">
          <td class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>

          <td class="w-4/12 p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>

          <td class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>

          <td class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>

          <td class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>

          <td class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200"></div>
          </td>
        </tr>
      </template>
      <template #page-limit-message>
        {{ $t("ui_kit.reach_limit.page_limit_filters") }}
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import {
  breakpointsTailwind,
  useBreakpoints,
  onClickOutside,
  useElementVisibility,
  useLocalStorage,
} from "@vueuse/core";
import { computed, onMounted, ref, shallowRef, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables/usePageHead";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { DEFAULT_ORDERS_PER_PAGE } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { toDateISOString } from "@/core/utilities";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import { useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useUser } from "../composables";
import DateFilterSelect from "./date-filter-select.vue";
import MobileOrdersFilter from "./mobile-orders-filter.vue";
import OrderStatus from "./order-status.vue";
import OrdersFilter from "./orders-filter.vue";
import PageToolbarBlock from "./page-toolbar-block.vue";
import type { OrderScopeType, OrdersFilterChipsItemType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { DateFilterType, ISortInfo } from "@/core/types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

export interface IProps {
  withSearch?: boolean;
  withPagination?: boolean;
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<IProps>(), { itemsPerPage: DEFAULT_ORDERS_PER_PAGE });

const { itemsPerPage } = toRefs(props);

const { t } = useI18n();
const { themeContext } = useThemeContext();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, fetchOrders, sort, pages, page, keyword } = useUserOrders({ itemsPerPage });
const { user, isOrganizationMaintainer } = useUser();

const {
  appliedFilterData,
  dateFilterTypes,
  isFilterEmpty,
  isFilterDirty,
  filterData,
  filterChipsItems,
  applyFilters,
  resetFilters,
  removeFilterChipsItem,
} = useUserOrdersFilter();

usePageHead({ title: t("pages.account.orders.meta.title") });

const ORDER_SCOPE_KEY = `order-scope-${user.value.id}`;
const orderScope = useLocalStorage<OrderScopeType>(ORDER_SCOPE_KEY, "private");

const isMobile = breakpoints.smaller("lg");

const localKeyword = ref("");
const filtersVisible = ref(false);
const selectedDateFilterType = ref<DateFilterType>();
const filtersButtonElement = shallowRef<HTMLElement | null>(null);
const filtersDropdownElement = shallowRef<HTMLElement | null>(null);

const columns = computed<ITableColumn[]>(() => [
  { id: "number", title: t("pages.account.orders.order_number_label"), sortable: true },
  {
    id: orderScope.value === "private" ? "purchaseOrder" : "buyerName",
    title:
      orderScope.value === "private"
        ? t("pages.account.orders.purchase_number_label")
        : t("pages.account.orders.buyer_name_label"),
  },
  { id: "invoice", title: t("pages.account.orders.invoice_label") },
  { id: "createdDate", title: t("pages.account.orders.date_label"), sortable: true },
  { id: "status", title: t("pages.account.orders.status_label"), sortable: true, align: "center" },
  { id: "total", title: t("pages.account.orders.total_label"), sortable: true, align: "right" },
]);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchOrders(orderScope.value);
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = new Sort(sortInfo.column, sortInfo.direction as SortDirection);
  page.value = 1;
  await fetchOrders(orderScope.value);
}

async function applyKeyword() {
  keyword.value = localKeyword.value.trim();
  page.value = 1;
  await fetchOrders(orderScope.value);
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
  resetOrderFilters();
}

function toggleFilters() {
  filtersVisible.value = !filtersVisible.value;
}

function hideFilters() {
  filtersVisible.value = false;
}

function handleOrdersDateFilterChange(dateFilterType: DateFilterType): void {
  filterData.value.startDate = dateFilterType.startDate ? toDateISOString(dateFilterType.startDate) : undefined;
  filterData.value.endDate = dateFilterType.endDate ? toDateISOString(dateFilterType.endDate) : undefined;

  selectedDateFilterType.value = dateFilterType;
}

function goToOrderDetails(order: CustomerOrderType): void {
  const orderRoute = router.resolve({ name: "OrderDetails", params: { orderId: order.id } });

  if (themeContext.value.settings.details_browser_target === "_blank") {
    window.open(orderRoute.fullPath, "_blank")!.focus();
  } else {
    window.location.href = orderRoute.fullPath;
  }
}

function applyOrderFilters(): void {
  applyFilters();
  hideFilters();
}

function handleRemoveFilter(item: OrdersFilterChipsItemType): void {
  removeFilterChipsItem(item);

  if (item.fieldName === "startDate" || item.fieldName === "endDate") {
    selectedDateFilterType.value = dateFilterTypes.value[0];
    selectedDateFilterType.value.startDate = appliedFilterData.value?.startDate;
    selectedDateFilterType.value.endDate = appliedFilterData.value?.endDate;
  }
}

function resetOrderFilters(): void {
  resetFilters();
  selectedDateFilterType.value = dateFilterTypes.value[0];
  selectedDateFilterType.value.startDate = undefined;
  selectedDateFilterType.value.endDate = undefined;
  hideFilters();
}

async function toggleOrdersScope(scope: OrderScopeType): Promise<void> {
  orderScope.value = scope;
  sort.value = new Sort("createdDate", SortDirection.Descending);
  resetFiltersWithKeyword();
  await fetchOrders(scope);
}

onClickOutside(
  filtersDropdownElement,
  () => {
    hideFilters();
  },
  { ignore: [filtersButtonElement] },
);

onMounted(() => {
  resetFilters();

  if (!isOrganizationMaintainer.value) {
    orderScope.value = "private";
  }
});

watch(
  appliedFilterData,
  () => {
    page.value = 1;
    void fetchOrders(orderScope.value);
  },
  { deep: true },
);
</script>

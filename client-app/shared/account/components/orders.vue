<template>
  <template v-if="withSearch">
    <!-- Mobile filters sidebar -->
    <VcPopupSidebar :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <MobileOrdersFilter>
        <template #buyerNameFilterType>
          <VcWidget v-if="showCustomerNameFilter" :title="$t('common.labels.buyer_name')" size="sm">
            <VcSelect v-model="filterData.customerNames" :items="organizationCustomerNames ?? []" multiple />
          </VcWidget>
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
          @click="
            resetOrderFilters();
            hideFilters();
          "
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

        <VcButton
          :disabled="!isFilterDirty"
          size="sm"
          min-width="6.25rem"
          @click="
            applyOrderFilters();
            hideFilters();
          "
        >
          {{ $t("common.buttons.apply") }}
        </VcButton>
      </template>
    </VcPopupSidebar>

    <div class="flex flex-col items-center gap-3 lg:flex-row">
      <div v-if="isOrganizationMaintainer" class="flex gap-2">
        <VcTabSwitch
          v-model="orderScope"
          value="organization"
          icon="case"
          :label="$t('common.buttons.all_orders')"
          @change="toggleOrdersScope('organization')"
        />

        <VcTabSwitch
          v-model="orderScope"
          value="private"
          icon="user"
          :label="$t('common.buttons.my_orders')"
          @change="toggleOrdersScope('private')"
        />
      </div>

      <div class="flex grow flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5">
        <!-- Desktop filters popover -->
        <VcPopover v-if="!isMobile" placement="bottom-end" :offset-options="8" :disabled="ordersLoading" lazy>
          <template #default="{ triggerProps }">
            <VcButton :disabled="ordersLoading" variant="outline" v-bind="triggerProps">
              <VcIcon name="filter" />

              <span>{{ $t("common.buttons.filters") }}</span>
            </VcButton>
          </template>

          <template #content="{ close }">
            <OrdersFilter
              @apply="
                applyOrderFilters();
                close();
              "
              @reset="
                resetOrderFilters();
                close();
              "
              @close="close"
            >
              <DateFilterSelect
                :date-filter-type="selectedDateFilterType"
                :label="$t('shared.account.orders_filter.created_date_label')"
                @change="handleOrdersDateFilterChange"
              />

              <VcSelect
                v-if="showCustomerNameFilter"
                v-model="filterData.customerNames"
                :label="$t('common.labels.buyer_name')"
                :items="organizationCustomerNames ?? []"
                multiple
                enable-teleport
              />
            </OrdersFilter>
          </template>
        </VcPopover>

        <!-- Mobile filters button -->
        <VcButton v-else :disabled="ordersLoading" icon @click="filtersVisible = true">
          <VcIcon name="filter" />

          <span>{{ $t("common.buttons.filters") }}</span>
        </VcButton>

        <div class="flex grow gap-6">
          <VcInput
            v-model="localKeyword"
            maxlength="64"
            clearable
            class="w-full"
            :disabled="ordersLoading"
            :placeholder="$t('pages.account.orders.search_placeholder')"
            @keydown.enter="applyKeyword"
            @clear="resetKeyword"
          >
            <template #append>
              <VcButton
                :disabled="ordersLoading"
                :aria-label="$t('commmon.buttons.search_orders')"
                icon="search"
                icon-size="1.25rem"
                @click="applyKeyword"
              />
            </template>
          </VcInput>
        </div>
      </div>
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
    icon="outline-order"
    :variant="!!keyword || !isFilterEmpty ? 'search' : 'empty'"
  >
    <template #button>
      <VcButton v-if="keyword || !isFilterEmpty" prepend-icon="reset" @click="resetFiltersWithKeyword">
        {{ $t("pages.account.orders.buttons.reset_search") }}
      </VcButton>

      <VcButton v-else-if="!!continue_shopping_link" :external-link="continue_shopping_link">
        {{ $t("pages.account.orders.buttons.no_orders") }}
      </VcButton>

      <VcButton v-else to="/">
        {{ $t("pages.account.orders.buttons.no_orders") }}
      </VcButton>
    </template>
  </VcEmptyView>

  <!-- Content block -->
  <VcTable
    v-else
    :loading="ordersLoading"
    :columns="columns"
    :items="orders"
    :sort="sort"
    :pages="pages"
    :page="page"
    :hide-default-footer="!withPagination"
    :description="$t('pages.account.orders.meta.table_description')"
    :bordered="withSearch"
    mobile-breakpoint="lg"
    class="bg-additional-50"
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
          <OrderStatus :status="itemData.item.status" :display-value="itemData.item.statusDisplayValue" />
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

        <td class="p-1">
          <OrderStatus :status="order.status" :display-value="order.statusDisplayValue" class="inline-block" />
        </td>

        <td class="overflow-hidden text-ellipsis p-5 text-right">
          {{ order.total?.formattedAmount }}
        </td>
      </tr>
    </template>

    <template #page-limit-message>
      {{ $t("ui_kit.reach_limit.page_limit_filters") }}
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBrowserTarget } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { usePageHead } from "@/core/composables/usePageHead";
import { CUSTOMER_NAME_FACET_NAME, DEFAULT_ORDERS_PER_PAGE } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { BrowserTargetType, SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { toDateISOString } from "@/core/utilities";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import { useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useUser } from "../composables";
import DateFilterSelect from "./date-filter-select.vue";
import MobileOrdersFilter from "./mobile-orders-filter.vue";
import OrderStatus from "./order-status.vue";
import OrdersFilter from "./orders-filter.vue";
import type { OrderScopeType, OrdersFilterChipsItemType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { DateFilterType, ISortInfo } from "@/core/types";

export interface IProps {
  withSearch?: boolean;
  withPagination?: boolean;
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<IProps>(), { itemsPerPage: DEFAULT_ORDERS_PER_PAGE });

const { itemsPerPage } = toRefs(props);

const { t } = useI18n();
const { browserTarget } = useBrowserTarget();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const {
  loading: ordersLoading,
  orders,
  fetchOrders,
  sort,
  pages,
  page,
  keyword,
  facets,
} = useUserOrders({ itemsPerPage });
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

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

usePageHead({ title: t("pages.account.orders.meta.title") });

const ORDER_SCOPE_KEY = `order-scope-${user.value.id}`;
const orderScope = useLocalStorage<OrderScopeType>(ORDER_SCOPE_KEY, "private");

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const isMobile = breakpoints.smaller("lg");

const localKeyword = ref("");
const filtersVisible = ref(false);
const selectedDateFilterType = ref<DateFilterType>();

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
  { id: "status", title: t("pages.account.orders.status_label"), sortable: true, classes: "!px-3" },
  { id: "total", title: t("pages.account.orders.total_label"), sortable: true, align: "right" },
]);

const organizationCustomerNames = computed(() =>
  facets.value?.find((item) => item.name === CUSTOMER_NAME_FACET_NAME)?.items?.map((item) => item.label),
);
const showCustomerNameFilter = computed(
  () =>
    isOrganizationMaintainer.value && orderScope.value === "organization" && organizationCustomerNames.value?.length,
);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchOrders(orderScope.value);
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = new Sort(sortInfo.column, sortInfo.direction);
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

  if (browserTarget.value === BrowserTargetType.BLANK) {
    window.open(orderRoute.href, "_blank")!.focus();
  } else {
    window.location.href = orderRoute.href;
  }
}

function applyOrderFilters(): void {
  applyFilters();
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
}

function toggleOrdersScope(scope: OrderScopeType): void {
  orderScope.value = scope;
  sort.value = new Sort("createdDate", SortDirection.Descending);

  resetFiltersWithKeyword();
}

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

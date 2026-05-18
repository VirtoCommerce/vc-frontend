<template>
  <div class="orders">
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

    <div class="orders__toolbar">
      <div v-if="isOrganizationMaintainer" class="orders__scope-tabs">
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

      <div class="orders__search-bar">
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

        <div class="orders__search-input-wrapper">
          <VcInput
            v-model="localKeyword"
            maxlength="64"
            clearable
            class="orders__search-input"
            :disabled="ordersLoading"
            :placeholder="$t('pages.account.orders.search_placeholder')"
            @keydown.enter="applyKeyword"
            @clear="resetKeyword"
          >
            <template #append>
              <VcButton
                :disabled="ordersLoading"
                :aria-label="$t('common.buttons.search_orders')"
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
    <div v-if="!isFilterEmpty" class="orders__chips">
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

    <!-- Content block -->
    <OrdersTable
      :loading="ordersLoading"
      :orders="orders"
      :sort="sort"
      :pages="pages"
      :page="page"
      bordered
      :order-scope="orderScope"
      @header-click="applySorting"
      @page-changed="changePage"
      @row-click="goToOrderDetails"
    >
      <template #empty>
        <VcEmptyView
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
      </template>
    </OrdersTable>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { usePageHead } from "@/core/composables/usePageHead";
import { CUSTOMER_NAME_FACET_NAME } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { toDateISOString } from "@/core/utilities";
import { useOrderNavigation } from "@/shared/account/composables/useOrderNavigation";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import { useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useUser } from "../../composables";
import DateFilterSelect from "../date-filter-select.vue";
import MobileOrdersFilter from "../mobile-orders-filter.vue";
import OrdersFilter from "../orders-filter.vue";
import OrdersTable from "./orders-table.vue";
import type { OrderScopeType, OrdersFilterChipsItemType } from "../../types";
import type { DateFilterType, ISortInfo } from "@/core/types";

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, fetchOrders, sort, pages, page, keyword, facets } = useUserOrders({});
const { user, isOrganizationMaintainer } = useUser();
const { goToOrderDetails } = useOrderNavigation();

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

<style lang="scss">
.orders {
  &__toolbar {
    @apply flex flex-col items-center gap-3;

    @media (width >= theme("screens.lg")) {
      @apply flex-row;
    }
  }

  &__scope-tabs {
    @apply flex gap-2;
  }

  &__search-bar {
    @apply flex grow flex-row items-center gap-x-2;

    @media (width >= theme("screens.lg")) {
      @apply flex-row-reverse gap-x-5;
    }
  }

  &__search-input-wrapper {
    @apply flex grow gap-6;
  }

  &__search-input {
    @apply w-full;
  }

  &__chips {
    @apply hidden flex-wrap gap-x-3 gap-y-2;

    @media (width >= theme("screens.lg")) {
      @apply flex;
    }
  }
}
</style>

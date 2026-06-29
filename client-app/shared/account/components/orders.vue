<template>
  <div class="orders">
    <div class="orders__toolbar">
      <div class="orders__search-bar">
        <!-- Desktop filters popover -->
        <OrdersDesktopFilters v-if="!isMobile" :order-scope="orderScope" :loading="ordersLoading" />

        <!-- Mobile filters -->
        <OrdersMobileFilters v-if="isMobile" :order-scope="orderScope" :loading="ordersLoading" />

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

      <div v-if="checkPermissions(XApiPermissions.CanViewOrganizationOrders)" class="orders__scope-tabs">
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
    </div>

    <!-- Filters chips -->
    <div v-if="!isFilterEmpty" class="orders__chips">
      <template v-for="item in filterChipsItems" :key="item.value">
        <VcChip color="secondary" closable @close="removeFilterChipsItem(item)">
          {{ item.label }}
        </VcChip>
      </template>

      <VcChip color="secondary" variant="outline" clickable @click="resetFilters">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
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
    <VcWidget v-else size="lg">
      <template #default-container>
        <OrdersTable
          :loading="ordersLoading"
          :orders="orders"
          :sort="sort"
          :pages="pages"
          :page="page"
          :order-scope="orderScope"
          @header-click="applySorting"
          @page-changed="changePage"
          @row-click="goToOrderDetails"
        />
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useLocalStorage } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { usePageHead } from "@/core/composables/usePageHead";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { SortDirection, XApiPermissions } from "@/core/enums";
import { Sort } from "@/core/types";
import { useOrderNavigation } from "@/shared/account/composables/useOrderNavigation";
import { facets, useUserOrders } from "@/shared/account/composables/useUserOrders";
import { getFilterExpression, useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useUser } from "../composables";
import OrdersDesktopFilters from "./orders/orders-desktop-filters.vue";
import OrdersMobileFilters from "./orders/orders-mobile-filters.vue";
import OrdersTable from "./orders/orders-table.vue";
import type { OrderScopeType } from "../types";
import type { ISortInfo } from "@/core/types";

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading: ordersLoading, orders, fetchOrders, sort, pages, page, keyword } = useUserOrders({});
const { user, checkPermissions } = useUser();
const { goToOrderDetails } = useOrderNavigation();

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

usePageHead({ title: t("pages.account.orders.meta.title") });

const ORDER_SCOPE_KEY = `order-scope-${user.value.id}`;
const orderScope = useLocalStorage<OrderScopeType>(ORDER_SCOPE_KEY, "private");

const {
  appliedFilterData,
  isFilterEmpty,
  filterChipsItems,
  resetFilters,
  removeFilterChipsItem,
  setFacetsLocalization,
} = useUserOrdersFilter();

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const isMobile = breakpoints.smaller("sm");

const localKeyword = ref("");

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchOrders(orderScope.value, getFilterExpression(keyword.value, appliedFilterData.value));
  setFacetsLocalization(facets.value);
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = new Sort(sortInfo.column, sortInfo.direction);
  page.value = 1;
  await fetchOrders(orderScope.value, getFilterExpression(keyword.value, appliedFilterData.value));
  setFacetsLocalization(facets.value);
}

async function applyKeyword() {
  keyword.value = localKeyword.value.trim();
  page.value = 1;
  await fetchOrders(orderScope.value, getFilterExpression(keyword.value, appliedFilterData.value));
  setFacetsLocalization(facets.value);
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

function toggleOrdersScope(scope: OrderScopeType): void {
  orderScope.value = scope;
  sort.value = new Sort("createdDate", SortDirection.Descending);

  resetFiltersWithKeyword();
}

onMounted(() => {
  resetFilters();

  if (!checkPermissions(XApiPermissions.CanViewOrganizationOrders)) {
    orderScope.value = "private";
  }
});

watch(
  appliedFilterData,
  async () => {
    page.value = 1;

    await fetchOrders(orderScope.value, getFilterExpression(keyword.value, appliedFilterData.value));
    setFacetsLocalization(facets.value);
  },
  { deep: true },
);
</script>

<style lang="scss">
.orders {
  &__toolbar {
    @apply mb-4 flex flex-col gap-3;

    @media (width >= theme("screens.lg")) {
      @apply flex-row items-center;
    }
  }

  &__search-bar {
    @apply flex grow flex-row items-center gap-x-2;

    @media (width >= theme("screens.sm")) {
      @apply flex-row-reverse gap-x-5;
    }
  }

  &__search-input-wrapper {
    @apply flex grow gap-6;
  }

  &__search-input {
    @apply w-full;
  }

  &__scope-tabs {
    @apply flex w-full gap-2;

    > * {
      @apply flex-1;
    }

    @media (width >= theme("screens.sm")) {
      @apply w-auto;

      > * {
        @apply flex-none;
      }
    }

    @media (width >= theme("screens.lg")) {
      @apply order-first;
    }
  }

  &__chips {
    @apply hidden;

    @media (width >= theme("screens.lg")) {
      @apply flex flex-wrap mb-4 gap-x-3 gap-y-2;
    }
  }
}
</style>

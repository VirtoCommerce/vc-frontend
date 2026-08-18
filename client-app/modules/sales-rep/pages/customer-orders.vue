<template>
  <div class="customer-orders">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcTypography tag="h1" class="customer-orders__title">
      {{ heading }}
    </VcTypography>

    <!-- Not served, unknown, or errored — the same view the profile shows, and no order read at all. -->
    <VcEmptyView v-if="notFound" :text="t('sales_rep.customer_profile.not_found')" icon="outline-404">
      <template #button>
        <VcButton :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId } }" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_orders.back_to_customer") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <div class="customer-orders__toolbar">
        <div class="customer-orders__search-bar">
          <OrdersDesktopFilters v-if="!isMobile" order-scope="organization" :loading="loading" />

          <OrdersMobileFilters v-if="isMobile" order-scope="organization" :loading="loading" />

          <div class="customer-orders__search-input-wrapper">
            <VcInput
              v-model="localKeyword"
              maxlength="64"
              clearable
              class="customer-orders__search-input"
              :disabled="loading"
              :placeholder="t('pages.account.orders.search_placeholder')"
              @keydown.enter="applyKeyword"
              @clear="resetKeyword"
            >
              <template #append>
                <VcButton
                  :disabled="loading"
                  :aria-label="t('common.buttons.search_orders')"
                  icon="search"
                  icon-size="1.25rem"
                  @click="applyKeyword"
                />
              </template>
            </VcInput>
          </div>
        </div>
      </div>

      <div v-if="!isFilterEmpty" class="customer-orders__chips">
        <VcChip
          v-for="item in filterChipsItems"
          :key="item.value"
          color="secondary"
          closable
          @close="removeFilterChipsItem(item)"
        >
          {{ item.label }}
        </VcChip>

        <VcChip color="secondary" variant="outline" clickable @click="resetFilters">
          <span>{{ t("common.buttons.reset_filters") }}</span>

          <VcIcon name="reset" />
        </VcChip>
      </div>

      <!-- A failed read gets its own view: the previous rows stay in place, so the empty view would
           otherwise read as this filter's result. -->
      <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.orders.load_failed')" variant="error" />

      <!-- With a search or filter active, empty means "nothing matches", not "never ordered". -->
      <VcEmptyView
        v-else-if="!orders.length && !loading"
        :text="hasSearch ? t('pages.account.orders.no_results_message') : t('pages.account.orders.no_orders_message')"
        :variant="hasSearch ? 'search' : 'empty'"
        icon="outline-order"
      >
        <template v-if="hasSearch" #button>
          <VcButton prepend-icon="reset" @click="resetSearch">
            {{ t("pages.account.orders.buttons.reset_search") }}
          </VcButton>
        </template>
      </VcEmptyView>

      <VcWidget v-else size="lg">
        <template #default-container>
          <!-- The buyer-facing table, in its organization scope: the buyer-name column then names which
               member of the customer placed each order. -->
          <OrdersTable
            :loading="loading"
            :orders="orders"
            :sort="sort"
            :pages="pages"
            :page="page"
            order-scope="organization"
            @header-click="applySorting"
            @page-changed="changePage"
            @row-click="goToOrderDetails"
          />
        </template>
      </VcWidget>
    </template>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables/useBreadcrumbs";
import { usePageHead } from "@/core/composables/usePageHead";
import { globals } from "@/core/globals";
import { Sort } from "@/core/types";
import { useOrderNavigation } from "@/shared/account/composables/useOrderNavigation";
import { facets, useUserOrders } from "@/shared/account/composables/useUserOrders";
import { getFilterExpression, useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { CUSTOMER_PROFILE_ROUTE_NAME, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import type { ISortInfo } from "@/core/types";
import OrdersDesktopFilters from "@/shared/account/components/orders/orders-desktop-filters.vue";
import OrdersMobileFilters from "@/shared/account/components/orders/orders-mobile-filters.vue";
import OrdersTable from "@/shared/account/components/orders/orders-table.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const isMobile = useBreakpoints(breakpointsTailwind).smaller("sm");

const { customer, loading: customerLoading, notFound } = useSalesRepCustomer(() => props.organizationId);

// The customer's own orders, read through the buyer-facing organization query — the module's
// salesRepOrders narrows to orders the rep placed themselves.
const {
  orders,
  loading: ordersLoading,
  pages,
  page,
  keyword,
  sort,
  fetchOrders,
} = useUserOrders({ organizationId: () => props.organizationId });

const {
  appliedFilterData,
  isFilterEmpty,
  filterChipsItems,
  resetFilters,
  removeFilterChipsItem,
  setFacetsLocalization,
} = useUserOrdersFilter("organization");

const { goToOrderDetails } = useOrderNavigation();

const failed = ref(false);
// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

const loading = computed(() => ordersLoading.value || customerLoading.value);
const hasSearch = computed(() => Boolean(keyword.value) || !isFilterEmpty.value);

const customerName = computed(() => customer.value?.organizationName ?? "");
const heading = computed(() =>
  customerName.value
    ? t("sales_rep.customer_orders.page.title", { customer: customerName.value })
    : t("sales_rep.customer_orders.page.title_fallback"),
);

// organizationOrders carries no store scoping, so this clause is what keeps another store's orders out.
function buildFilter(): string {
  return [getFilterExpression(keyword.value, appliedFilterData.value), `storeid:"${globals.storeId}"`]
    .filter(Boolean)
    .join(" ");
}

async function reload(): Promise<void> {
  try {
    await fetchOrders("organization", buildFilter());
    failed.value = false;
  } catch {
    failed.value = true;
  }

  setFacetsLocalization(facets.value);
}

async function applyKeyword(): Promise<void> {
  keyword.value = localKeyword.value.trim();
  page.value = 1;
  await reload();
}

async function resetKeyword(): Promise<void> {
  localKeyword.value = "";

  if (keyword.value) {
    await applyKeyword();
  }
}

// Clearing the filters re-reads through the watcher below, so this adds no second request.
function resetSearch(): void {
  localKeyword.value = "";
  keyword.value = "";
  page.value = 1;
  resetFilters();
}

async function changePage(newPage: number): Promise<void> {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await reload();
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = new Sort(sortInfo.column, sortInfo.direction);
  page.value = 1;
  await reload();
}

// Filters live in state shared with the buyer's own Orders list, so a selection left there would
// silently narrow this customer's orders. Cleared before the watcher below, so it counts as no change.
resetFilters();

watch(
  appliedFilterData,
  async () => {
    page.value = 1;
    await reload();
  },
  { deep: true },
);

// The read waits for the customer: an organization the rep does not serve must never reach the query.
const canRead = computed(() => !customerLoading.value && !notFound.value);

watch(
  [canRead, () => props.organizationId],
  ([allowed]) => {
    if (allowed) {
      page.value = 1;
      void reload();
    }
  },
  { immediate: true },
);

usePageHead({ title: heading });

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
  {
    title: customerName.value,
    route: { name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: props.organizationId } },
  },
  { title: t("sales_rep.customer_orders.breadcrumb") },
]);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.customer-orders {
  &__title {
    @apply [word-break:break-word];
  }

  &__toolbar {
    @apply flex flex-col gap-3;

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

  &__chips {
    @apply hidden;

    @media (width >= theme("screens.lg")) {
      @apply flex flex-wrap gap-x-3 gap-y-2;
    }
  }
}
</style>

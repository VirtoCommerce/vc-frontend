<template>
  <div class="customer-orders">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcTypography tag="h1" class="customer-orders__title">
      {{ heading }}
    </VcTypography>

    <VcEmptyView v-if="notFound" :text="t('sales_rep.customer_profile.not_found')" icon="outline-404">
      <template #button>
        <VcButton :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId } }" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_orders.back_to_customer") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <div class="customer-orders__search">
        <VcInput
          v-model="localKeyword"
          maxlength="64"
          class="customer-orders__search-input"
          :disabled="loading"
          :placeholder="t('sales_rep.customer_orders.search_placeholder')"
          clearable
          @keydown.enter="applyKeyword"
          @clear="resetKeyword"
        >
          <template #append>
            <VcButton
              :aria-label="t('sales_rep.customer_orders.search_aria')"
              :disabled="loading"
              icon="search"
              icon-size="1.25rem"
              @click="applyKeyword"
            />
          </template>
        </VcInput>
      </div>

      <!-- Status chips are read from this customer's own orders, so a chip always has orders behind it. -->
      <div v-if="hasFilterOptions" class="customer-orders__controls">
        <SalesRepRuleChips
          v-model="filter"
          :rules="selectableRules"
          :loading="filterRulesLoading"
          :all-label="t('sales_rep.orders.filter_all')"
        />
      </div>

      <!-- A failed read keeps the previous rows, so the failure needs its own view (VCST-5586). -->
      <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.orders.load_failed')" variant="error" />

      <VcEmptyView
        v-else-if="!orders.length && !loading"
        :text="hasSearch ? t('sales_rep.orders.no_results') : t('sales_rep.orders.empty')"
        :variant="hasSearch ? 'search' : 'empty'"
        icon="outline-order"
      >
        <template v-if="keyword" #button>
          <VcButton prepend-icon="reset" @click="resetKeyword">
            {{ t("sales_rep.customer_orders.reset_search") }}
          </VcButton>
        </template>
      </VcEmptyView>

      <VcWidget v-else size="lg">
        <template #default-container>
          <!-- Header clicks map to named backend sort rules; reversible ones toggle asc/desc. -->
          <VcTable
            :loading="loading"
            :items="orders"
            :pages="pages"
            :page="page"
            :skeleton-rows="PAGE_SIZE"
            :sort="sortInfo"
            mobile-breakpoint="lg"
            @page-changed="changePage"
            @header-click="applySort"
          >
            <template #mobile-item="{ item }">
              <div class="customer-orders__mobile-item">
                <div class="customer-orders__mobile-row">
                  <VcLink class="customer-orders__order-link" :to="orderRoute(item.id)">
                    {{ item.number }}
                  </VcLink>

                  <span>{{ item.total }}</span>
                </div>

                <div class="customer-orders__mobile-sub">
                  {{ $d(item.createdDate, "short") }} · {{ item.itemsCount }}
                </div>

                <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
              </div>
            </template>

            <VcTableColumn id="number" v-slot="{ item }" :title="t('sales_rep.orders.number')">
              <VcLink class="customer-orders__order-link" :to="orderRoute(item.id)">
                {{ item.number }}
              </VcLink>
            </VcTableColumn>

            <VcTableColumn
              id="date"
              v-slot="{ item }"
              :title="t('sales_rep.orders.date')"
              :sortable="isColumnSortable('date')"
            >
              {{ $d(item.createdDate, "short") }}
            </VcTableColumn>

            <VcTableColumn id="items" v-slot="{ item }" :title="t('sales_rep.orders.items')">
              {{ item.itemsCount }}
            </VcTableColumn>

            <VcTableColumn id="status" v-slot="{ item }" :title="t('sales_rep.orders.status')">
              <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
            </VcTableColumn>

            <VcTableColumn
              id="total"
              v-slot="{ item }"
              :title="t('sales_rep.orders.total')"
              :sortable="isColumnSortable('total')"
              align="right"
              class="font-bold"
            >
              {{ item.total }}
            </VcTableColumn>
          </VcTable>
        </template>
      </VcWidget>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables/useBreadcrumbs";
import { usePageHead } from "@/core/composables/usePageHead";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import { useSalesRepColumnSort } from "../composables/useSalesRepColumnSort";
import { PAGE_SIZE, useSalesRepCustomerOrders } from "../composables/useSalesRepCustomerOrders";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { CUSTOMER_PROFILE_ROUTE_NAME, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import { selectableFilterRules } from "../utils";
import type { RouteLocationRaw } from "vue-router";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const { customer, notFound, orders, loading, failed, page, pages, keyword, filter, sortRule } =
  useSalesRepCustomerOrders(() => props.organizationId);

const { rules: filterRules, loading: filterRulesLoading } = useSalesRepRules("order", "filter", {
  organizationId: () => props.organizationId,
});
const { rules: sortRules } = useSalesRepRules("order", "sort");

// The backend's "All" passthrough would duplicate the baseline chip the chips already prepend.
const selectableRules = computed(() => selectableFilterRules(filterRules.value));
const hasFilterOptions = computed(() => selectableRules.value.length > 0);

// Date → "recent" (one-way, newest first); Total → "total" (reversible). Direction support is backend-driven.
const { sortInfo, isColumnSortable, applySort } = useSalesRepColumnSort({
  sortRule,
  columns: { date: "recent", total: "total" },
  defaultColumn: "date",
  rules: sortRules,
});

// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

const hasSearch = computed(() => Boolean(keyword.value) || Boolean(filter.value));

const customerName = computed(() => customer.value?.organizationName ?? "");
const heading = computed(() =>
  customerName.value
    ? t("sales_rep.customer_orders.page.title", { customer: customerName.value })
    : t("sales_rep.customer_orders.page.title_fallback"),
);

// flush: "sync" resets the page before the variables watcher runs, so a filter/sort change fires one request, not two.
watch(
  [filter, sortRule],
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

function orderRoute(orderId: string): RouteLocationRaw {
  return { name: "OrderDetails", params: { orderId } };
}

function applyKeyword(): void {
  keyword.value = localKeyword.value.trim();
  page.value = 1;
}

function resetKeyword(): void {
  localKeyword.value = "";
  keyword.value = "";
  page.value = 1;
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}

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

  &__search {
    @apply flex grow;
  }

  &__search-input {
    @apply w-full;
  }

  &__controls {
    @apply flex flex-wrap gap-x-3 gap-y-2;
  }

  &__order-link {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4;
  }

  &__mobile-row {
    @apply flex items-center justify-between font-bold;
  }

  &__mobile-sub {
    @apply text-sm text-neutral-600;
  }
}
</style>

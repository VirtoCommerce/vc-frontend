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
      <div class="customer-orders__toolbar">
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

        <SalesRepOrdersFilters
          :statuses="statusOptions"
          :customers="customerOptions"
          :disabled="loading"
          @change="applyFilters"
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
          <!-- Header clicks map to the index fields the backend sorts on; both reverse. -->
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
                  <VcLink class="customer-orders__order-link" :to="orderRoute(item)">
                    {{ item.number }}
                  </VcLink>

                  <span>{{ item.total }}</span>
                </div>

                <div v-if="!hasCustomer" class="customer-orders__mobile-sub">{{ item.organizationName }}</div>

                <div class="customer-orders__mobile-sub">{{ $d(item.createdDate, "short") }}</div>

                <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
              </div>
            </template>

            <VcTableColumn id="number" v-slot="{ item }" :title="t('sales_rep.orders.number')">
              <VcLink class="customer-orders__order-link" :to="orderRoute(item)">
                {{ item.number }}
              </VcLink>
            </VcTableColumn>

            <VcTableColumn v-if="!hasCustomer" id="customer" v-slot="{ item }" :title="t('sales_rep.orders.customer')">
              {{ item.organizationName }}
            </VcTableColumn>

            <VcTableColumn id="date" v-slot="{ item }" :title="t('sales_rep.orders.date')" sortable>
              {{ $d(item.createdDate, "short") }}
            </VcTableColumn>

            <VcTableColumn id="status" v-slot="{ item }" :title="t('sales_rep.orders.status')">
              <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
            </VcTableColumn>

            <VcTableColumn
              id="total"
              v-slot="{ item }"
              :title="t('sales_rep.orders.total')"
              sortable
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
import SalesRepOrdersFilters from "../components/sales-rep-orders-filters.vue";
import { useSalesRepColumnSort } from "../composables/useSalesRepColumnSort";
import { PAGE_SIZE, useSalesRepCustomerOrders } from "../composables/useSalesRepCustomerOrders";
import { CUSTOMER_ORDERS_SORT_FIELDS, CUSTOMER_PROFILE_ROUTE_NAME, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import { salesRepOrderRoute } from "../utils";
import type { SalesRepCustomerOrderRowType, SalesRepOrdersFilterDataType } from "../types";
import type { RouteLocationRaw } from "vue-router";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  // Absent on /company/customer-orders, which lists every served customer's orders.
  organizationId?: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const {
  customer,
  hasCustomer,
  notFound,
  orders,
  statusOptions,
  customerOptions,
  sortRules,
  loading,
  failed,
  page,
  pages,
  keyword,
  filters,
  sortRule,
} = useSalesRepCustomerOrders(() => props.organizationId);

// Date → "createdDate", Total → "total"; both reverse on a repeat click.
const { sortInfo, applySort } = useSalesRepColumnSort({
  sortRule,
  columns: CUSTOMER_ORDERS_SORT_FIELDS,
  defaultColumn: "date",
  rules: sortRules,
});

// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

const hasSearch = computed(
  () =>
    Boolean(keyword.value) ||
    filters.value.statuses.length > 0 ||
    Boolean(filters.value.customerNames?.length) ||
    Boolean(filters.value.startDate) ||
    Boolean(filters.value.endDate),
);

const customerName = computed(() => customer.value?.organizationName ?? "");
const heading = computed(() => {
  if (!hasCustomer.value) {
    return t("sales_rep.customer_orders.page.all_title");
  }
  return customerName.value
    ? t("sales_rep.customer_orders.page.title", { customer: customerName.value })
    : t("sales_rep.customer_orders.page.title_fallback");
});

// Sorting starts over from the first page. (Apollo collapses the two variable changes into one request on
// its own — the sync flush only keeps `page` and `sort` consistent within the same tick.)
watch(
  sortRule,
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

function applyFilters(value: SalesRepOrdersFilterDataType): void {
  filters.value = value;
  page.value = 1;
}

function orderRoute(item: SalesRepCustomerOrderRowType): RouteLocationRaw {
  return salesRepOrderRoute(item, props.organizationId);
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

const breadcrumbs = useBreadcrumbs(() => {
  const trail = [{ title: t("common.links.account"), route: { name: "Account" } }, { title: t("sales_rep.hub.title") }];

  if (!hasCustomer.value) {
    return [...trail, { title: t("sales_rep.customer_orders.breadcrumb") }];
  }

  return [
    ...trail,
    { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
    {
      title: customerName.value,
      route: { name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: props.organizationId } },
    },
    { title: t("sales_rep.customer_orders.breadcrumb") },
  ];
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.customer-orders {
  &__title {
    @apply [word-break:break-word];
  }

  &__toolbar {
    @apply flex items-start gap-x-3;
  }

  &__search-input {
    @apply grow;
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

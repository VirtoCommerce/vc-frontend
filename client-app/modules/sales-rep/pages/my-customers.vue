<template>
  <div class="my-customers">
    <!-- Title — an <h1> above the card, matching the Sales reps / Company members pages. -->
    <VcTypography class="my-customers__title" tag="h1">
      {{ t("sales_rep.my_customers.page.title") }}
    </VcTypography>

    <!-- Search row (own row above the card, like the Sales reps page). -->
    <div class="my-customers__search">
      <VcInput
        v-model="localKeyword"
        maxlength="64"
        class="my-customers__search-input"
        :disabled="loading"
        :placeholder="t('sales_rep.my_customers.table.search_placeholder')"
        clearable
        @keydown.enter="applyKeyword"
        @clear="resetKeyword"
      >
        <template #append>
          <VcButton
            :aria-label="t('sales_rep.my_customers.table.search_aria')"
            :disabled="loading"
            icon="search"
            icon-size="1.25rem"
            @click="applyKeyword"
          />
        </template>
      </VcInput>
    </div>

    <!-- Empty view — outside the card, shown instead of it. Distinguishes "no customers at all"
         from "your search matched nothing" (+ reset). -->
    <VcEmptyView
      v-if="!items.length && !loading"
      :text="keyword ? t('sales_rep.my_customers.table.no_results') : t('sales_rep.my_customers.table.empty')"
      :variant="keyword ? 'search' : 'empty'"
      icon="outline-order"
    >
      <template v-if="keyword" #button>
        <VcButton prepend-icon="reset" @click="resetKeyword">
          {{ t("sales_rep.my_customers.table.reset_search") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="loading"
          :items="items"
          :columns="columns"
          :sort="sort"
          :pages="pages"
          :page="page"
          mobile-breakpoint="lg"
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #desktop-body>
            <tr v-for="customer in items" :key="customer.organizationId" class="my-customers__row">
              <td class="my-customers__cell">{{ customer.organizationName }}</td>

              <td class="my-customers__cell">
                <template v-if="customer.lastOrder">
                  <div>{{ $d(customer.lastOrder.createdDate) }}</div>

                  <VcLink
                    class="my-customers__order"
                    :to="{ name: 'OrderDetails', params: { orderId: customer.lastOrder.id } }"
                  >
                    {{ orderLabel(customer.lastOrder.number) }}
                  </VcLink>
                </template>

                <template v-else>—</template>
              </td>
            </tr>
          </template>

          <template #mobile-item="{ item }">
            <div class="my-customers__mobile-item">
              <b>{{ item.organizationName }}</b>

              <span v-if="item.lastOrder" class="my-customers__mobile-sub">
                {{ $d(item.lastOrder.createdDate) }} ·
                <VcLink
                  class="my-customers__order"
                  :to="{ name: 'OrderDetails', params: { orderId: item.lastOrder.id } }"
                >
                  {{ orderLabel(item.lastOrder.number) }}
                </VcLink>
              </span>
            </div>
          </template>
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepCustomers } from "../composables/useSalesRepCustomers";
import type { SalesRepCustomerSortColumnType } from "../types";

const { t } = useI18n();
const { loading, keyword, sort, page, pages, items } = useSalesRepCustomers();

// Local (unapplied) search term; committed to the query on Enter or the search button,
// matching the Sales reps page interaction.
const localKeyword = ref("");

// Only Customer (name) is sortable: the backend's salesRepCustomers sort is name-backed
// (same limit as the Sales reps table). Last order isn't a sortable server field.
const columns = computed(() => [
  { id: "name", title: t("sales_rep.my_customers.table.customer"), sortable: true },
  { id: "lastOrder", title: t("sales_rep.my_customers.table.last_order") },
]);

// The order number, prefixed with "#" (e.g. "#21580221"). Kept in one place so desktop and
// mobile stay in sync.
function orderLabel(number: string): string {
  return `#${number}`;
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

function applySorting(sortInfo: { column: string; direction: "asc" | "desc" }): void {
  sort.value = { column: sortInfo.column as SalesRepCustomerSortColumnType, direction: sortInfo.direction };
  page.value = 1;
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
// No vertical margins: the account shell wraps the page root in `flex flex-col gap-y-5` and owns the spacing.
.my-customers {
  &__title {
    @apply [word-break:break-word];
  }

  &__search {
    @apply flex;
  }

  &__search-input {
    @apply w-full;
  }

  &__row {
    @apply even:bg-neutral-50;
  }

  &__cell {
    @apply px-4 py-2.5 align-top;
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4.5 [word-break:break-word];
  }

  &__mobile-sub {
    @apply text-sm;
  }
}
</style>

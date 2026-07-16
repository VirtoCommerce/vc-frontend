<template>
  <div class="my-customers">
    <VcTypography class="my-customers__title" tag="h1">
      {{ t("sales_rep.my_customers.page.title") }}
    </VcTypography>

    <div class="my-customers__results">
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

      <VcWidget v-else size="lg">
        <template #default-container>
          <VcTable
            :loading="loading"
            :items="items"
            :sort="sort"
            :pages="pages"
            :page="page"
            :row-class="rowClass"
            mobile-breakpoint="lg"
            @header-click="applySorting"
            @page-changed="changePage"
          >
            <template #mobile-item="{ item }">
              <div class="my-customers__mobile-item">
                <VcLink
                  class="my-customers__customer my-customers__customer--mobile"
                  :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: item.organizationId } }"
                >
                  {{ item.organizationName }}
                </VcLink>

                <span v-if="item.lastOrder" class="my-customers__mobile-sub">
                  {{ $d(item.lastOrder.createdDate) }} ·
                  <VcLink
                    class="my-customers__order"
                    :to="{ name: 'OrderDetails', params: { orderId: item.lastOrder.id } }"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ orderLabel(item.lastOrder.number) }}
                  </VcLink>
                </span>
              </div>
            </template>

            <!-- Only Customer (name) is sortable — the server sort is name-backed. -->
            <VcTableColumn id="name" v-slot="{ item }" :title="t('sales_rep.my_customers.table.customer')" sortable>
              <VcLink
                class="my-customers__customer"
                :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: item.organizationId } }"
              >
                {{ item.organizationName }}
              </VcLink>
            </VcTableColumn>

            <VcTableColumn id="lastOrder" v-slot="{ item }" :title="t('sales_rep.my_customers.table.last_order')">
              <template v-if="item.lastOrder">
                <div>{{ $d(item.lastOrder.createdDate) }}</div>

                <VcLink
                  class="my-customers__order"
                  :to="{ name: 'OrderDetails', params: { orderId: item.lastOrder.id } }"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ orderLabel(item.lastOrder.number) }}
                </VcLink>
              </template>

              <template v-else>—</template>
            </VcTableColumn>
          </VcTable>
        </template>
      </VcWidget>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepCustomers } from "../composables/useSalesRepCustomers";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import type { SalesRepCustomerSortColumnType, SalesRepCustomerType } from "../types";

const { t } = useI18n();
const { loading, keyword, sort, page, pages, items } = useSalesRepCustomers();

// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

function orderLabel(number: string): string {
  return `#${number}`;
}

function rowClass(_item: SalesRepCustomerType, index: number): string {
  return index % 2 === 1 ? "bg-neutral-50" : "";
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
.my-customers {
  &__title {
    @apply [word-break:break-word];
  }

  // Own the search→table spacing (gap-4 = 1rem, matching Orders) instead of the shell's gap-y-5 (1.25rem) between page children.
  &__results {
    @apply flex flex-col gap-4;
  }

  &__search {
    @apply flex;
  }

  &__search-input {
    @apply w-full;
  }

  // Top-align body cells only, so the name lines up with the stacked last-order date/number.
  .vc-table__cell {
    @apply align-top;
  }

  &__customer {
    @apply text-[--link-color] hover:underline;

    &--mobile {
      @apply font-bold;
    }
  }

  // Muted, small order number under the date — matches the design; hover hints it's clickable.
  &__order {
    @apply text-sm text-neutral-500 hover:text-[--link-color] hover:underline;
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4.5 [word-break:break-word];
  }

  &__mobile-sub {
    @apply text-sm;
  }
}
</style>

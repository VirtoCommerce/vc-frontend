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

      <!-- Controls: customer segment chips (an "All" baseline + any project segments) + a named sort-rule dropdown. -->
      <div v-if="filterRules.length || sortRules.length" class="my-customers__controls">
        <div v-if="filterRules.length" class="my-customers__filters">
          <VcChip
            :variant="filter ? 'outline' : 'solid'"
            color="secondary"
            size="sm"
            clickable
            @click="filter = undefined"
          >
            {{ t("sales_rep.my_customers.table.all_customers") }}
          </VcChip>

          <VcChip
            v-for="segment in segments"
            :key="segment.name"
            :variant="filter === segment.name ? 'solid' : 'outline'"
            color="secondary"
            size="sm"
            clickable
            @click="filter = segment.name"
          >
            {{ segment.label }}
          </VcChip>
        </div>

        <VcSelect
          v-if="sortRules.length"
          v-model="sortRule"
          :items="sortRules"
          text-field="label"
          value-field="name"
          size="sm"
          :placeholder="t('sales_rep.my_customers.table.sort_placeholder')"
          class="my-customers__sort"
        />
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

      <VcWidget v-else size="md">
        <template #default-container>
          <VcTable
            :loading="loading"
            :items="items"
            :pages="pages"
            :page="page"
            :row-class="rowClass"
            mobile-breakpoint="lg"
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

                <span v-if="item.location" class="my-customers__location">{{ item.location }}</span>

                <span v-if="item.ytdTotal" class="my-customers__mobile-sub">
                  {{ t("sales_rep.my_customers.table.ytd") }}: {{ item.ytdTotal }}
                </span>

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

            <!-- Ordering is a named sort rule (dropdown), not a column header click. -->
            <VcTableColumn id="name" v-slot="{ item }" :title="t('sales_rep.my_customers.table.customer')">
              <VcLink
                class="my-customers__customer"
                :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: item.organizationId } }"
              >
                {{ item.organizationName }}
              </VcLink>

              <div v-if="item.location" class="my-customers__location">{{ item.location }}</div>
            </VcTableColumn>

            <!-- Inline per-row purchase columns (aliased orderStatistics slices; batched, no N+1). -->
            <VcTableColumn id="ytd" v-slot="{ item }" :title="t('sales_rep.my_customers.table.ytd')" align="right">
              <template v-if="item.ytdTotal">
                <div class="my-customers__amount">{{ item.ytdTotal }}</div>

                <div class="my-customers__sub">
                  {{ t("sales_rep.my_customers.table.orders_count", { count: item.ytdCount }) }}
                </div>
              </template>

              <template v-else>—</template>
            </VcTableColumn>

            <VcTableColumn
              id="lastYear"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.last_year')"
              align="right"
            >
              {{ item.lastYearTotal || "—" }}
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
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepCustomers } from "../composables/useSalesRepCustomers";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import type { SalesRepCustomerType } from "../types";

const { t } = useI18n();
const { loading, keyword, filter, sortRule, page, pages, items } = useSalesRepCustomers();

const { rules: sortRules } = useSalesRepRules("customer", "sort");
const { rules: filterRules } = useSalesRepRules("customer", "filter");

// The synthetic "All" chip (rendered first, clears the filter) already represents the backend "All" baseline, so
// drop it from the per-segment loop to avoid a duplicate. The filter row itself always shows (the "All" chip);
// real project-defined segments appear alongside it.
const segments = computed(() => filterRules.value.filter((rule) => rule.name.toLowerCase() !== "all"));

// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

// Re-page to the first page whenever the filter or sort selection changes.
watch([filter, sortRule], () => {
  page.value = 1;
});

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

  &__controls {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__filters {
    @apply flex flex-wrap gap-2;
  }

  &__sort {
    @apply w-52;
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

  // Muted, small location line under the customer name — matches the design.
  &__location {
    @apply mt-0.5 text-sm text-neutral-500 [word-break:break-word];
  }

  &__amount {
    @apply font-medium;
  }

  &__sub {
    @apply mt-0.5 text-sm text-neutral-500;
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

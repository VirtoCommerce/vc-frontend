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

      <!-- Segment chips (an "All" baseline + any project segments); hidden unless there's a real segment to pick. -->
      <div v-if="hasFilterOptions" class="my-customers__controls">
        <SalesRepRuleChips
          v-model="filter"
          :rules="filterRules"
          :all-label="t('sales_rep.my_customers.table.all_customers')"
        />
      </div>

      <!-- A failure gets its own view: it must not land in the empty state, which would read as "no
           customers" or, with a keyword active, offer a Reset search that can't help (VCST-5586). -->
      <VcEmptyView
        v-if="failed && !loading"
        :text="t('sales_rep.my_customers.table.load_failed')"
        icon="exclamation-circle"
      />

      <!-- Empty here means "nothing matches" (keyword/filter active), not "no customers"; reset is keyword-only. -->
      <VcEmptyView
        v-else-if="!items.length && !loading"
        :text="
          keyword || filter ? t('sales_rep.my_customers.table.no_results') : t('sales_rep.my_customers.table.empty')
        "
        :variant="keyword || filter ? 'search' : 'empty'"
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
          <!-- Sorting maps each header to a named backend rule; all three customer rules reverse on a second click. -->
          <VcTable
            :loading="loading"
            :items="items"
            :pages="pages"
            :page="page"
            :row-class="rowClass"
            :sort="sortInfo"
            mobile-breakpoint="lg"
            @page-changed="changePage"
            @header-click="applySort"
          >
            <template #mobile-item="{ item }">
              <div class="my-customers__mobile-item">
                <div class="my-customers__mobile-body">
                  <div class="my-customers__mobile-main">
                    <VcLink
                      class="my-customers__customer my-customers__customer--mobile"
                      :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: item.organizationId } }"
                    >
                      {{ item.organizationName }}
                    </VcLink>

                    <span v-if="item.location" class="my-customers__location">{{ item.location }}</span>

                    <span class="my-customers__mobile-sub">
                      {{ t("sales_rep.my_customers.table.ytd") }}: {{ item.ytdTotal }}
                    </span>

                    <!-- Mobile has no column header, so caption the last-order link — a bare date/#number reads as an unlabeled link. -->
                    <div v-if="item.lastOrder" class="my-customers__mobile-order">
                      <span class="my-customers__mobile-caption">{{
                        t("sales_rep.my_customers.table.last_order")
                      }}</span>

                      <span class="my-customers__mobile-sub">
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
                  </div>

                  <VcButton
                    class="my-customers__mobile-action"
                    size="sm"
                    variant="outline"
                    prepend-icon="mail"
                    @click="openCommunication(item)"
                  >
                    {{ t("sales_rep.communication.action") }}
                  </VcButton>
                </div>
              </div>
            </template>

            <VcTableColumn
              id="name"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.customer')"
              :sortable="isColumnSortable('name')"
            >
              <VcLink
                class="my-customers__customer"
                :to="{ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: item.organizationId } }"
              >
                {{ item.organizationName }}
              </VcLink>

              <div v-if="item.location" class="my-customers__location">{{ item.location }}</div>
            </VcTableColumn>

            <!-- Inline per-row purchase columns (aliased orderStatistics slices; batched, no N+1). -->
            <VcTableColumn
              id="ytd"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.ytd')"
              :sortable="isColumnSortable('ytd')"
              align="right"
            >
              <div class="my-customers__amount">{{ item.ytdTotal }}</div>

              <div class="my-customers__sub">
                {{ t("sales_rep.my_customers.table.orders_count", { count: item.ytdCount }) }}
              </div>
            </VcTableColumn>

            <VcTableColumn
              id="lastYear"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.last_year')"
              align="right"
            >
              {{ item.lastYearTotal }}
            </VcTableColumn>

            <VcTableColumn
              id="lastOrder"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.last_order')"
              :sortable="isColumnSortable('lastOrder')"
            >
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

            <VcTableColumn
              id="actions"
              v-slot="{ item }"
              :title="t('sales_rep.my_customers.table.actions')"
              class="my-customers__actions-col"
            >
              <VcButton
                :aria-label="t('sales_rep.communication.action')"
                :title="t('sales_rep.communication.action')"
                icon="mail"
                icon-size="1.25rem"
                variant="ghost"
                color="neutral"
                @click="openCommunication(item)"
              />
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
import { useModal } from "@/shared/modal";
import CustomerCommunicationModal from "../components/customer-communication-modal.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import { useSalesRepColumnSort } from "../composables/useSalesRepColumnSort";
import { useSalesRepCustomers } from "../composables/useSalesRepCustomers";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import { selectableFilterRules } from "../utils";
import type { SalesRepCustomerType } from "../types";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, error, keyword, filter, sortRule, page, pages, items } = useSalesRepCustomers();

const failed = computed(() => Boolean(error.value));

const { rules: sortRules } = useSalesRepRules("customer", "sort");
const { rules: filterRules } = useSalesRepRules("customer", "filter");

// Show the segment chips only when the backend offers a real segment beyond the "All" baseline.
const hasFilterOptions = computed(() => selectableFilterRules(filterRules.value).length > 0);

// Header-click sorting: each sortable column maps to its backend sort-rule name; "my-last-orders" is the server default.
const { sortInfo, isColumnSortable, applySort } = useSalesRepColumnSort({
  sortRule,
  columns: { name: "name", ytd: "ytd-purchases", lastOrder: "my-last-orders" },
  defaultColumn: "lastOrder",
  rules: sortRules,
});

// Unapplied search term; committed to the query on Enter or the search button.
const localKeyword = ref("");

// flush: "sync" resets the page before the variables watcher runs, so a filter/sort change fires one request, not two.
watch(
  [filter, sortRule],
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

function orderLabel(number: string): string {
  return `#${number}`;
}

// Broadcast to all members of the customer's org — reuses the shared modal shell (VCST-5310).
function openCommunication(item: SalesRepCustomerType): void {
  openModal({
    component: CustomerCommunicationModal,
    props: { organizationId: item.organizationId, organizationName: item.organizationName },
  });
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
// @apply: module is self-contained as an MF remote (no global utility layer).
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

  &__actions-col {
    @apply w-16 text-center;
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

  &__location {
    @apply mt-0.5 text-sm text-neutral-500 [word-break:break-word];
  }

  &__amount {
    @apply font-medium;
  }

  &__sub {
    @apply mt-0.5 text-sm text-neutral-500;
  }

  &__order {
    @apply text-sm text-neutral-500 hover:text-[--link-color] hover:underline;
  }

  &__mobile-item {
    @apply border-b px-5 py-4.5 [word-break:break-word];

    // The card is its own query container, so the body can lay the action beside the content once the card is wide enough (≈ tablets / iPad mini).
    container-type: inline-size;
  }

  // Stacked on narrow cards; splits into content + action once the card has room (see the container query above).
  &__mobile-body {
    @apply flex flex-col gap-3;

    @container (min-width: theme("containers.md")) {
      @apply flex-row items-start justify-between gap-4;
    }
  }

  &__mobile-main {
    @apply flex min-w-0 flex-col gap-1;
  }

  &__mobile-order {
    @apply flex flex-col;
  }

  // Label the last-order block; on desktop the column header does this job, but the mobile card has no header.
  &__mobile-caption {
    @apply text-sm font-medium;
  }

  &__mobile-sub {
    @apply text-sm;
  }

  &__mobile-action {
    @apply self-start;

    @container (min-width: theme("containers.md")) {
      @apply shrink-0;
    }
  }
}
</style>

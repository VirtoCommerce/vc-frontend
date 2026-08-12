<template>
  <div class="sales-reps">
    <!-- Title — an <h1> above the card, matching the Company members page. -->
    <VcTypography class="sales-reps__title" tag="h1">
      {{ t("sales_rep.page.title") }}
    </VcTypography>

    <!-- Search row (own row above the card, like Company members). -->
    <div class="sales-reps__search">
      <VcInput
        v-model="localKeyword"
        maxlength="64"
        class="sales-reps__search-input"
        :disabled="loading"
        :placeholder="t('sales_rep.table.search_placeholder')"
        clearable
        @keydown.enter="applyKeyword"
        @clear="resetKeyword"
      >
        <template #append>
          <VcButton
            :aria-label="t('sales_rep.table.search_aria')"
            :disabled="loading"
            icon="search"
            icon-size="1.25rem"
            @click="applyKeyword"
          />
        </template>
      </VcInput>
    </div>

    <!-- A failure must not land in the empty state, which with a keyword active offers a Reset search that
         cannot help (VCST-5586). -->
    <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.table.load_failed')" variant="error" />

    <!-- Empty view — outside the card, shown instead of it (Company members pattern).
         Distinguishes "no reps at all" from "your search matched nothing" (+ reset). -->
    <VcEmptyView
      v-else-if="!items.length && !loading"
      :text="keyword ? t('sales_rep.table.no_results') : t('sales_rep.table.empty')"
      :variant="keyword ? 'search' : 'empty'"
      icon="outline-order"
    >
      <template v-if="keyword" #button>
        <VcButton prepend-icon="reset" @click="resetKeyword">
          {{ t("sales_rep.table.reset_search") }}
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
            <tr v-for="rep in items" :key="rep.id" class="sales-reps__row">
              <td class="sales-reps__cell" :title="rep.name">{{ rep.name }}</td>

              <td class="sales-reps__cell" :title="rep.email">{{ rep.email }}</td>

              <td class="sales-reps__cell" :title="rep.phone">{{ rep.phone }}</td>
            </tr>
          </template>

          <template #mobile-item="{ item }">
            <div class="sales-reps__mobile-item">
              <b>{{ item.name }}</b>

              <span class="sales-reps__mobile-sub">{{ item.email }}</span>

              <span class="sales-reps__mobile-sub">{{ item.phone }}</span>
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
import { useSalesReps } from "../composables/useSalesReps";
import type { SalesRepSortColumnType } from "../types";

const { t } = useI18n();
const { loading, error, keyword, sort, page, pages, items } = useSalesReps();

const failed = computed(() => Boolean(error.value));

// Local (unapplied) search term; committed to the query on Enter or the search button,
// matching the Company members page interaction.
const localKeyword = ref("");

// Only Name is sortable: the backend's customerSalesReps sort is member-field-backed
// and ignores email/phone (they're collections) — verified against vcptcore-dev. Same as
// the Company members table, which also exposes sorting on Name only.
const columns = computed(() => [
  { id: "name", title: t("sales_rep.table.name"), sortable: true },
  { id: "email", title: t("sales_rep.table.email") },
  { id: "phone", title: t("sales_rep.table.phone") },
]);

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
  sort.value = { column: sortInfo.column as SalesRepSortColumnType, direction: sortInfo.direction };
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
.sales-reps {
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
    // Equal thirds, each capped and truncated so a long value (e.g. fullName)
    // ellipsizes with a `:title` tooltip instead of overflowing and pushing the other cells.
    @apply w-1/3 max-w-52 truncate px-4 py-2.5;
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4.5 [word-break:break-word];
  }

  &__mobile-sub {
    @apply text-sm;
  }
}
</style>

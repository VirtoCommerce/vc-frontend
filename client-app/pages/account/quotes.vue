<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 v-t="'pages.account.quotes.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <div ref="stickyMobileHeaderAnchor" class="-mt-5"></div>

    <!-- Page toolbar -->
    <PageToolbarBlock
      :stick="stickyMobileHeaderIsVisible"
      class="-my-3.5 flex flex-row items-center gap-x-2 py-3.5 lg:flex-row-reverse lg:gap-x-5"
      shadow
    >
      <div class="flex grow">
        <VcInput
          v-model="keyword"
          :disabled="fetching"
          :placeholder="$t('pages.account.quotes.search_placeholder')"
          maxlength="64"
          class="w-full"
          @keypress.enter="applyKeyword"
        >
          <template #append>
            <button v-if="keyword" type="button" class="h-full px-4" @click="resetKeyword">
              <svg class="text-[color:var(--color-primary)]" height="14" width="14">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>

            <VcButton :is-disabled="fetching" class="w-11 !rounded-[inherit] uppercase" size="lg" @click="applyKeyword">
              <i class="fas fa-search text-lg" />
            </VcButton>
          </template>
        </VcInput>
      </div>
    </PageToolbarBlock>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!fetching && !quotes.length"
      :text="$t(!!keyword ? 'pages.account.quotes.no_results_message' : 'pages.account.quotes.no_quotes_message')"
    >
      <template #icon>
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.account.orders.no_orders_img_alt')" />
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcTable
        :loading="fetching"
        :columns="columns"
        :sort="sort"
        :items="quotes"
        :pages="pages"
        :page="page"
        @item-click="navigateQuoteDetails"
        @header-click="applySorting"
        @page-changed="changePage"
      >
        <template #mobile-item="itemData">
          <div class="grid cursor-pointer grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.quote_number_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis pr-4 font-extrabold">
                {{ itemData.item.number }}
              </span>
            </div>

            <div class="flex flex-col items-end justify-center">
              <TableStatusBadge :status="itemData.item.status" />
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.date_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ $d(itemData.item?.createdDate) }}
              </span>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.total_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis font-extrabold">
                {{ itemData.item.totals?.grandTotalInclTax?.formattedAmount }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.quote_number_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.date_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.total_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.quotes.status_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="quote in quotes"
            :key="quote.id"
            class="cursor-pointer even:bg-gray-50 hover:bg-gray-200"
            @click="navigateQuoteDetails(quote)"
          >
            <td class="overflow-hidden text-ellipsis p-5">
              {{ quote.number }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ $d(quote.createdDate) }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              <TableStatusBadge :status="quote.status" class="mx-auto" />
            </td>

            <td class="overflow-hidden text-ellipsis p-5 text-right">
              {{ quote.totals?.grandTotalInclTax?.formattedAmount }}
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td v-for="column in columns" :key="column.id" class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useElementVisibility, useRouteQueryParam, usePageHead } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { getSortingExpression, getSortInfoFromStringExpression } from "@/core/utilities";
import { PageToolbarBlock, useUserQuotes } from "@/shared/account";
import type { ISortInfo } from "@/core/types";
import type { QuoteType } from "@/xapi/types";

const { t } = useI18n();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: t("pages.account.quotes.title"),
});

const { quotes, fetching, itemsPerPage, pages, page, keyword, sort, fetchQuotes } = useUserQuotes();

const isMobile = breakpoints.smaller("lg");

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: "createdDate:desc",
});

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("pages.account.quotes.quote_number_label"),
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("pages.account.quotes.date_label"),
    sortable: true,
  },
  {
    id: "status",
    title: t("pages.account.quotes.status_label"),
    sortable: true,
    align: "center",
  },
  {
    id: "total",
    title: t("pages.account.quotes.total_label"),
    align: "right",
  },
]);

async function changePage(newPage: number): Promise<void> {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchQuotes();
}

function navigateQuoteDetails(quote: QuoteType): void {
  const pathName: string = quote.status === "Draft" ? "EditQuote" : "ViewQuote";
  router.push({ name: pathName, params: { quoteId: quote.id } });
}

async function applyKeyword(): Promise<void> {
  page.value = 1;
  await fetchQuotes();
}

async function resetKeyword(): Promise<void> {
  keyword.value = "";
  page.value = 1;
  await applyKeyword();
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sortQueryParam.value = getSortingExpression(sortInfo);
  sort.value = sortInfo;
  page.value = 1;
  await fetchQuotes();
}

watch(
  () => sortQueryParam.value,
  async (value: string) => {
    await applySorting(getSortInfoFromStringExpression(value));
  },
  {
    immediate: true,
  }
);

fetchQuotes();
</script>

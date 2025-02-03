<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between gap-2">
      <VcTypography tag="h1">
        {{ $t("quotes.title") }}
      </VcTypography>

      <VcButton size="sm" variant="outline" prepend-icon="plus" @click="requestQuote">
        <span class="hidden sm:inline">{{ $t("quotes.request_quote_button") }}</span>
        <span class="sm:hidden">{{ $t("quotes.request_quote_button") }}</span>
      </VcButton>
    </div>

    <div ref="stickyMobileHeaderAnchor" class="-mt-5" />

    <!-- Page toolbar -->
    <PageToolbarBlock
      :stick="stickyMobileHeaderIsVisible"
      class="flex flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5"
      shadow
    >
      <div class="flex grow">
        <VcInput
          v-model="keyword"
          :disabled="fetching"
          :placeholder="$t('quotes.search_placeholder')"
          maxlength="64"
          class="w-full"
          @keydown.enter="applyKeyword"
        >
          <template #append>
            <button
              v-if="keyword"
              :aria-label="$t('quotes.reset_search')"
              type="button"
              class="flex h-full items-center px-4"
              @click="resetKeyword"
            >
              <VcIcon class="fill-primary" name="delete-2" size="xs" />
            </button>

            <VcButton
              :aria-label="$t('quotes.search_quote_requests')"
              :disabled="fetching"
              icon="search"
              @click="applyKeyword"
            />
          </template>
        </VcInput>
      </div>
    </PageToolbarBlock>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!fetching && !quotes.length"
      :text="$t(!!keyword ? 'quotes.no_results_message' : 'quotes.no_quotes_message')"
      icon="thin-quotes"
    />

    <!-- Content block -->
    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="fetching"
          :columns="columns"
          :sort="sort"
          :items="quotes"
          :pages="pages"
          :page="page"
          :description="$t('quotes.meta.table_description')"
          @item-click="goToQuoteDetails"
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #mobile-item="itemData">
            <button
              type="button"
              class="grid w-full cursor-pointer appearance-none grid-cols-2 items-center gap-y-4 border-b border-neutral-200 p-6 text-left"
              tabindex="0"
              @click="goToQuoteDetails(itemData.item)"
              @keyup.enter="goToQuoteDetails(itemData.item)"
            >
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.quote_number_label") }}
                </span>

                <span class="overflow-hidden text-ellipsis pr-4 font-black">
                  {{ itemData.item.number }}
                </span>
              </div>

              <div class="flex flex-col items-end justify-center">
                <QuoteStatus class="w-full !max-w-36" :status="itemData.item.status" />
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.date_label") }}
                </span>

                <span class="overflow-hidden text-ellipsis">
                  {{ $d(itemData.item?.createdDate) }}
                </span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.total_label") }}
                </span>

                <span class="overflow-hidden text-ellipsis font-black">
                  {{ itemData.item.totals?.grandTotalInclTax?.formattedAmount }}
                </span>
              </div>
            </button>
          </template>

          <template #mobile-skeleton>
            <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-neutral-200 p-6">
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.quote_number_label") }}
                </span>
                <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.date_label") }}
                </span>
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.total_label") }}
                </span>
                <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("quotes.status_label") }}
                </span>
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </div>
            </div>
          </template>

          <template #desktop-body>
            <tr
              v-for="quote in quotes"
              :key="quote.id"
              class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
              @click="goToQuoteDetails(quote)"
            >
              <td class="overflow-hidden text-ellipsis p-5">
                {{ quote.number }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5">
                {{ $d(quote.createdDate) }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5 text-center">
                <QuoteStatus class="w-full !max-w-36" :status="quote.status" />
              </td>

              <td class="overflow-hidden text-ellipsis p-5 text-right">
                {{ quote.totals?.grandTotalInclTax?.formattedAmount }}
              </td>
            </tr>
          </template>

          <template #desktop-skeleton>
            <tr v-for="i in itemsPerPage" :key="i" class="even:bg-neutral-50">
              <td v-for="column in columns" :key="column.id" class="p-5">
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </td>
            </tr>
          </template>
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import { useBreakpoints, breakpointsTailwind, useElementVisibility } from "@vueuse/core";
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useRouteQueryParam, usePageHead, useThemeContext } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { Sort } from "@/core/types";
import { PageToolbarBlock } from "@/shared/account";
import { CreateQuoteDocument } from "../api/graphql/types";
import QuoteStatus from "../components/quote-status.vue";
import { useUserQuotes } from "../useUserQuotes";
import type { SortDirection } from "@/core/enums";
import type { ISortInfo } from "@/core/types";

const { t } = useI18n();
const { themeContext } = useThemeContext();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { storeId, userId, currencyCode, cultureName } = globals;
usePageHead({
  title: t("quotes.meta.title"),
});

const { quotes, fetching, itemsPerPage, pages, page, keyword, sort, fetchQuotes } = useUserQuotes();
const { mutate: createQuote } = useMutation(CreateQuoteDocument);

const isMobile = breakpoints.smaller("lg");

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: "createdDate:desc",
});

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("quotes.quote_number_label"),
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("quotes.date_label"),
    sortable: true,
  },
  {
    id: "status",
    title: t("quotes.status_label"),
    sortable: true,
    align: "center",
  },
  {
    id: "total",
    title: t("quotes.total_label"),
    align: "right",
  },
]);

async function changePage(newPage: number): Promise<void> {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchQuotes();
}

function goToQuoteDetails(payload: { id: string; status?: string }): void {
  const pathName: string = payload.status === "Draft" ? "EditQuote" : "ViewQuote";
  const quoteRoute = router.resolve({ name: pathName, params: { quoteId: payload.id } });

  if (themeContext.value.settings?.details_browser_target === "_blank") {
    window.open(quoteRoute.fullPath, "_blank")!.focus();
  } else {
    window.location.href = quoteRoute.fullPath;
  }
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
  // Workaround. Put Sort in vc-table then delete
  const sortObj = new Sort(sortInfo.column, sortInfo.direction as SortDirection);
  sortQueryParam.value = sortObj.toString();
  sort.value = sortInfo;
  page.value = 1;
  await fetchQuotes();
}

async function requestQuote(): Promise<void> {
  const result = await createQuote({ command: { storeId, userId, currencyCode, cultureName } });
  const quoteId = result?.data?.createQuote?.id;

  await router.push({ name: "EditQuote", params: { quoteId } });
}

watch(
  () => sortQueryParam.value,
  async (value: string) => {
    await applySorting(Sort.fromString(value));
  },
  {
    immediate: true,
  },
);

void fetchQuotes();
</script>

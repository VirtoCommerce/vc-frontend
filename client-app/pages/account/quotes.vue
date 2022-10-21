<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.quotes.title'" />
    </div>

    <div class="-mt-5" ref="stickyMobileHeaderAnchor"></div>

    <!-- Empty view -->
    <VcEmptyView v-if="!fetching && !quotes.length" :text="$t('pages.account.quotes.no_quotes_message')">
      <template #icon>
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.account.orders.no_orders_img_alt')" />
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <div class="flex flex-col bg-white shadow-sm md:rounded md:border" v-else>
      <VcTable
        :loading="fetching"
        :columns="columns"
        :items="quotes"
        :pages="pages"
        :page="page"
        @itemClick="navigateQuoteDetails"
        @pageChanged="changePage"
      >
        <template #mobile-item="itemData">
          <div class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200 cursor-pointer">
            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.quote_number_label'" />

              <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                {{ itemData.item.number }}
              </span>
            </div>

            <div class="flex flex-col justify-center items-end">
              <TableStatusBadge :status="itemData.item.status" />
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.date_label'" />

              <span class="overflow-hidden overflow-ellipsis">
                {{ $d(itemData.item?.createdDate) }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.total_label'" />

              <span class="overflow-hidden overflow-ellipsis font-extrabold">
                {{ itemData.item.totals?.grandTotalInclTax?.formattedAmount }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.quote_number_label'"></span>
              <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.date_label'"></span>
              <div class="h-6 bg-gray-200 animate-pulse"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.total_label'"></span>
              <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400" v-t="'pages.account.quotes.status_label'"></span>
              <div class="h-6 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="quote in quotes"
            :key="quote.id"
            class="even:bg-gray-50 hover:bg-gray-200 cursor-pointer"
            @click="navigateQuoteDetails(quote)"
          >
            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ quote.number }}
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ $d(quote.createdDate) }}
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis">
              <TableStatusBadge :status="quote.status" class="mx-auto" />
            </td>

            <td class="p-5 overflow-hidden overflow-ellipsis text-right">
              {{ quote.totals?.grandTotalInclTax?.formattedAmount }}
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td v-for="column in columns" :key="column.id" class="p-5">
              <div class="h-6 bg-gray-200 animate-pulse"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserQuotes } from "@/shared/account";
import { QuoteType } from "@/xapi/types";

const { t } = useI18n();
const router = useRouter();

const { quotes, fetching, itemsPerPage, pages, page, fetchQuotes } = useUserQuotes();

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("pages.account.quotes.quote_number_label"),
  },
  {
    id: "createdDate",
    title: t("pages.account.quotes.date_label"),
  },
  {
    id: "status",
    title: t("pages.account.quotes.status_label"),
    align: "center",
  },
  {
    id: "total",
    title: t("pages.account.quotes.total_label"),
    align: "right",
  },
]);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchQuotes();
}

function navigateQuoteDetails(quote: QuoteType) {
  router.push({ name: "QuoteDetails", params: { quoteId: quote.id } });
}

fetchQuotes();
</script>

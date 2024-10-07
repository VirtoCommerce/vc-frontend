<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between gap-2">
      <VcTypography tag="h1">
        {{ $t("pages.account.purchase_requests.title") }}
      </VcTypography>
    </div>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!loading && !purchaseRequests.length"
      :text="$t('pages.account.purchase_requests.no_purchase_requests_message')"
    >
      <template #icon>
        <VcImage
          src="/static/images/common/order.svg"
          :alt="$t('pages.account.purchase_requests.no_purchase_requests_img_alt')"
        />
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="loading"
          :columns="columns"
          :items="purchaseRequests"
          :pages="pages"
          :page="page"
          :description="$t('pages.account.quotes.meta.table_description')"
          @item-click="goToPurchaseRequest"
          @page-changed="changePage"
        >
          <template #mobile-item="itemData">
            <div
              class="grid cursor-pointer grid-cols-2 gap-y-4 border-b border-neutral-200 p-6"
              role="button"
              tabindex="0"
              @click="goToPurchaseRequest(itemData.item)"
              @keyup.enter="goToPurchaseRequest(itemData.item)"
            >
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("pages.account.purchase_requests.purchase_request_number_label") }}
                </span>

                <span class="overflow-hidden text-ellipsis pr-4 font-black">
                  {{ itemData.item.number }}
                </span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("pages.account.quotes.date_label") }}
                </span>

                <span class="overflow-hidden text-ellipsis">
                  {{ $d(itemData.item?.createdDate) }}
                </span>
              </div>
            </div>
          </template>

          <template #mobile-skeleton>
            <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-neutral-200 p-6">
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("pages.account.quotes.quote_number_label") }}
                </span>
                <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("pages.account.quotes.date_label") }}
                </span>
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </div>
            </div>
          </template>

          <template #desktop-body>
            <tr
              v-for="purchaseRequest in purchaseRequests"
              :key="purchaseRequest.id"
              class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
              @click="goToPurchaseRequest(purchaseRequest)"
            >
              <td class="overflow-hidden text-ellipsis p-5">
                {{ purchaseRequest.number }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5">
                {{ $d(purchaseRequest.createdDate) }}
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { usePurchaseRequests } from "@/shared/purchase-request/composables/usePurchaseRequests";

const { t } = useI18n();
const router = useRouter();
const { themeContext } = useThemeContext();

const { loading, purchaseRequests, itemsPerPage, pages, page, refetch } = usePurchaseRequests();

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
]);

function goToPurchaseRequest(payload: { id: string }): void {
  const quoteRoute = router.resolve({ name: "PurchaseRequest", params: { quoteId: payload.id } });

  if (themeContext.value.settings?.show_details_in_separate_tab) {
    window.open(quoteRoute.fullPath, "_blank")!.focus();
  } else {
    window.location.href = quoteRoute.fullPath;
  }
}

async function changePage(newPage: number): Promise<void> {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await refetch();
}
</script>

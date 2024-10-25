<template>
  <div>
    <!-- Title block -->
    <VcTypography tag="h1">
      {{ $t("purchase_requests.title") }}
    </VcTypography>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!loading && !purchaseRequests.length"
      :text="$t('purchase_requests.no_purchase_requests_message')"
    >
      <template #icon>
        <VcImage src="/static/images/common/order.svg" :alt="$t('purchase_requests.no_purchase_requests_img_alt')" />
      </template>
    </VcEmptyView>

    <div v-else>
      <FromFile class="mb-5" />

      <!-- Content block -->
      <VcWidget size="lg">
        <template #default-container>
          <VcTable
            :loading="loading"
            :columns="columns"
            :sort="sort"
            :items="purchaseRequests"
            :pages="pages"
            :page="page"
            :description="$t('purchase_requests.meta.table_description')"
            @item-click="goToPurchaseRequest"
            @header-click="applySorting"
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
                    {{ $t("purchase_requests.purchase_request_number_label") }}
                  </span>

                  <span class="overflow-hidden text-ellipsis pr-4 font-black">
                    {{ itemData.item.number }}
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-sm text-neutral-400">
                    {{ $t("purchase_requests.date_label") }}
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
                    {{ $t("purchase_requests.purchase_request_number_label") }}
                  </span>
                  <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
                </div>

                <div class="flex flex-col">
                  <span class="text-sm text-neutral-400">
                    {{ $t("purchase_requests.date_label") }}
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables/usePageHead";
import { usePurchaseRequests } from "@/modules/purchase-requests/composables/usePurchaseRequests";
import type { Sort } from "@/core/types";
import FromFile from "@/shared/bulk-order/components/from-file.vue";

const { t } = useI18n();
const router = useRouter();

usePageHead({
  title: t("purchase_requests.meta.title"),
});

const { loading, purchaseRequests, itemsPerPage, pages, page, sort } = usePurchaseRequests();

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("purchase_requests.purchase_request_number_label"),
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("purchase_requests.date_label"),
    sortable: true,
  },
]);

function applySorting(newSort: Sort): void {
  sort.value = newSort;
  page.value = 1;
}

function goToPurchaseRequest(payload: { id: string }): void {
  void router.push({ name: "PurchaseRequest", params: { purchaseRequestId: payload.id } });
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>

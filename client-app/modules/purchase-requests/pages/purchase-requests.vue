<template>
  <div>
    <!-- Title block -->
    <VcTypography tag="h1">{{ $t("purchase_requests.title") }}</VcTypography>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!loading && !purchaseRequests.length"
      :text="$t('purchase_requests.no_purchase_requests_message')"
      icon="outline-order"
    />

    <div v-else>
      <FromFile class="mb-5" />

      <!-- Content block -->
      <VcWidget size="lg" mobile-flat>
        <template #default-container>
          <VcTable
            :loading="loading"
            :columns="columns"
            :sort="sort"
            :items="purchaseRequests"
            :pages="pages"
            :page="page"
            :description="$t('purchase_requests.meta.table_description')"
            mobile-breakpoint="lg"
            mobile-cards
            @item-click="goToPurchaseRequest"
            @header-click="applySorting"
            @page-changed="changePage"
          >
            <template #mobile-item="{ item }">
              <VcRecordCard
                :title="item.number"
                :to="getPurchaseRequestRoute(item)"
                :description="$d(item.createdDate)"
              />
            </template>

            <template #desktop-body>
              <tr
                v-for="purchaseRequest in purchaseRequests"
                :key="purchaseRequest.id"
                class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
                tabindex="0"
                @click="goToPurchaseRequest(purchaseRequest)"
                @keydown.enter.prevent="goToPurchaseRequest(purchaseRequest)"
                @keydown.space.prevent="goToPurchaseRequest(purchaseRequest)"
              >
                <td class="overflow-hidden text-ellipsis p-5">
                  {{ purchaseRequest.number }}
                </td>

                <td class="overflow-hidden text-ellipsis p-5">
                  {{ $d(purchaseRequest.createdDate) }}
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
import { Sort } from "@/core/types";
import { usePurchaseRequests } from "@/modules/purchase-requests/composables/usePurchaseRequests";
import type { ISortInfo } from "@/core/types";
import type { RouteLocationRaw } from "vue-router";
import FromFile from "@/modules/purchase-requests/components/from-file.vue";

const { t } = useI18n();
const router = useRouter();

usePageHead({
  title: t("purchase_requests.meta.title"),
});

const { loading, purchaseRequests, pages, page, sort } = usePurchaseRequests();

const columns = ref<VcTableColumnType[]>([
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

function applySorting(sortInfo: ISortInfo): void {
  sort.value = new Sort(sortInfo.column, sortInfo.direction);
  page.value = 1;
}

function getPurchaseRequestRoute(payload: { id: string }): RouteLocationRaw {
  return { name: "PurchaseRequest", params: { purchaseRequestId: payload.id } };
}

function goToPurchaseRequest(payload: { id: string }): void {
  void router.push(getPurchaseRequestRoute(payload));
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>

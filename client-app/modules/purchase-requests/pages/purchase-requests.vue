<template>
  <div class="purchase-requests">
    <!-- Title block -->
    <VcTypography tag="h1">{{ $t("purchase_requests.title") }}</VcTypography>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!loading && !purchaseRequests.length"
      :text="$t('purchase_requests.no_purchase_requests_message')"
      icon="outline-order"
    />

    <div v-else>
      <FromFile class="purchase-requests__from-file" />

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
                class="purchase-requests__card"
                role="button"
                tabindex="0"
                @click="goToPurchaseRequest(itemData.item)"
                @keyup.enter="goToPurchaseRequest(itemData.item)"
              >
                <div class="purchase-requests__field">
                  <span class="purchase-requests__label">
                    {{ $t("purchase_requests.purchase_request_number_label") }}
                  </span>

                  <span class="purchase-requests__number">
                    {{ itemData.item.number }}
                  </span>
                </div>

                <div class="purchase-requests__field">
                  <span class="purchase-requests__label">
                    {{ $t("purchase_requests.date_label") }}
                  </span>

                  <span class="purchase-requests__value">
                    {{ $d(itemData.item?.createdDate) }}
                  </span>
                </div>
              </div>
            </template>

            <template #desktop-body>
              <tr
                v-for="purchaseRequest in purchaseRequests"
                :key="purchaseRequest.id"
                class="purchase-requests__row"
                tabindex="0"
                @click="goToPurchaseRequest(purchaseRequest)"
                @keydown.enter.prevent="goToPurchaseRequest(purchaseRequest)"
                @keydown.space.prevent="goToPurchaseRequest(purchaseRequest)"
              >
                <td class="purchase-requests__cell">
                  {{ purchaseRequest.number }}
                </td>

                <td class="purchase-requests__cell">
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

function goToPurchaseRequest(payload: { id: string }): void {
  void router.push({ name: "PurchaseRequest", params: { purchaseRequestId: payload.id } });
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>

<style lang="scss">
.purchase-requests {
  &__from-file {
    @apply mb-5;
  }

  &__card {
    @apply grid cursor-pointer grid-cols-2 gap-y-4 border-b border-neutral-200 p-6;
  }

  &__field {
    @apply flex flex-col;
  }

  &__label {
    @apply text-sm text-neutral-400;
  }

  &__number {
    @apply overflow-hidden text-ellipsis pr-4 font-black;
  }

  &__value {
    @apply overflow-hidden text-ellipsis;
  }

  &__row {
    @apply cursor-pointer;

    &:nth-child(even) {
      @apply bg-neutral-50;
    }

    // After the zebra: a hovered even row takes the hover colour.
    &:hover {
      @apply bg-[var(--vc-table-row-hover-bg-color,var(--color-neutral-200))];
    }
  }

  &__cell {
    @apply overflow-hidden text-ellipsis p-5;
  }
}
</style>

<template>
  <div>
    <div class="flex items-center justify-between gap-2">
      <VcTypography tag="h1">
        {{ $t("loyalty.points-history.meta.title") }}
      </VcTypography>

      <div v-if="!balanceLoading">
        {{ $t("loyalty.points-history.current-balance", { currentBalance: currentBalance }) }}
      </div>
  </div>

    <VcWidget size="lg">
      <template #default-container>
        <VcTable
          :loading="historyLoading"
          :columns="columns"
          :items="historyLogs"
          :sort="sort"
          :pages="pages"
          :page="page"
          :hide-default-footer="false"
          mobile-breakpoint="lg"
          @page-changed="changePage"
        >
          <template #mobile-item="itemData">
            <div class="grid w-full cursor-pointer appearance-none grid-cols-2 items-center gap-y-4 border-b border-neutral-200 p-6 text-left">
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.operation") }}
                </span>

                <span class="overflow-hidden text-ellipsis pr-4 font-black">
                  {{ getOperation(itemData.item) }}
                </span>
              </div>

              <div class="flex flex-col items-end justify-center">
                {{ getOperationType(itemData.item) }}
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.date") }}
                </span>

                <span class="overflow-hidden text-ellipsis">
                  {{ $d(itemData.item?.createdDate) }}
                </span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.amount") }}
                </span>

                <span class="overflow-hidden text-ellipsis font-black">
                  {{ itemData.item?.amount }}
                </span>
              </div>

            </div>
          </template>
        
          <template #mobile-skeleton>
            <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-neutral-200 p-6">
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.operation") }}
                </span>
                <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.operation-type") }}
                </span>
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.date") }}
                </span>
                <div class="mr-4 h-6 animate-pulse bg-neutral-200"></div>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">
                  {{ $t("loyalty.points-history.amount") }}
                </span>
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </div>
            </div>
          </template>

          <template #desktop-body>
            <tr
              v-for="log in historyLogs"
              :key="log.id"
              class="cursor-default even:bg-neutral-50 hover:bg-neutral-200"
            >
              <td class="overflow-hidden text-ellipsis p-5">
                {{ getOperation(log) }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5">
                {{ getOperationType(log) }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5">
                {{ $d(log?.createdDate) }}
              </td>

              <td class="overflow-hidden text-ellipsis p-5 text-right">
                {{ log.amount }}
              </td>
            </tr>
          </template>

          <template #desktop-skeleton>
            <tr v-for="i in itemsPerPage" :key="i" class="even:bg-neutral-50">
              <td class="p-5">
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </td>

              <td class="w-4/12 p-5">
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </td>

              <td class="p-5">
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </td>

              <td class="p-5">
                <div class="h-6 animate-pulse bg-neutral-200"></div>
              </td>
            </tr>
          </template>

          <template #page-limit-message>
            {{ $t("ui_kit.reach_limit.page_limit_filters") }}
          </template>
        </VcTable>
    </template>
    </VcWidget>
</div>
</template>

<script setup lang="ts">

import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useLoyaltyBalance } from "../composables/useLoyaltyBalance";
import { useLoyaltyPointsHistory } from "../composables/useLoyaltyPointsHistory";
import { CUSTOMER_ORDER_OBJECT_TYPE, REGISTRATION_OBJECT_TYPE, REDEEMED_OPERATION, EARNED_OPERATION } from "../constants";
import type { LoyaltyOperationLog } from "../api/graphql/types";

const { t } = useI18n();

const columns = computed<ITableColumn[]>(() => [
  { id: "operation", title: t("loyalty.points-history.operation"), sortable: false },
  { id: "operationType", title: t("loyalty.points-history.operation-type"), sortable: false  },
  { id: "createdDate", title: t("loyalty.points-history.date"), sortable: false, classes: "!px-3" },
  { id: "amount", title: t("loyalty.points-history.amount"), sortable: false, align: "right" },
]);

const {
  fetchHistory,
  sort,
  loading: historyLoading,
  historyLogs,
  itemsPerPage,
  pages,
  page,
} = useLoyaltyPointsHistory();

const {
  fetchLoyaltyBalance,
  loading: balanceLoading,
  currentBalance,
} = useLoyaltyBalance();

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchHistory();
}

function getOperation(log: LoyaltyOperationLog) {
  if (log.object?.type === CUSTOMER_ORDER_OBJECT_TYPE) {
    return log.object.orderNumber;
  }

  if (log.object?.type == REGISTRATION_OBJECT_TYPE) {
    return t("loyalty.points-history.registration");
  }

  return log.object?.type;
}

function getOperationType(log: LoyaltyOperationLog) {
  if (log.operationType === REDEEMED_OPERATION) {
    return t("loyalty.points-history.redeemed");
  }

  if (log.operationType === EARNED_OPERATION ) {
    return t("loyalty.points-history.earned");
  }
  
  return log.operationType;
}

onMounted(async () => {
    await fetchHistory();
    await fetchLoyaltyBalance();
});
</script>

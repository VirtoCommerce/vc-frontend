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

    <VcWidget size="lg" mobile-flat>
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
          mobile-cards
          @page-changed="changePage"
        >
          <template #mobile-item="{ item }">
            <VcRecordCard :title="getOperation(item)" :description="$d(item.createdDate)" :metric="item.amount">
              <template v-if="item.operationType" #status>
                <VcChip
                  :color="isRedeemed(item) ? 'warning' : 'success'"
                  :icon="isRedeemed(item) ? 'minus' : 'plus'"
                  variant="outline"
                  size="sm"
                  rounded
                  nowrap
                >
                  {{ getOperationType(item) }}
                </VcChip>
              </template>
            </VcRecordCard>
          </template>

          <template #desktop-body>
            <tr v-for="log in historyLogs" :key="log.id" class="cursor-default even:bg-neutral-50 hover:bg-neutral-200">
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
import {
  CUSTOMER_ORDER_OBJECT_TYPE,
  REGISTRATION_OBJECT_TYPE,
  MISSION_OBJECT_TYPE,
  REDEEMED_OPERATION,
  EARNED_OPERATION,
} from "../constants";
import type { LoyaltyOperationLog } from "../api/graphql/types";

const { t } = useI18n();

const columns = computed<VcTableColumnType[]>(() => [
  { id: "operation", title: t("loyalty.points-history.operation"), sortable: false },
  { id: "operationType", title: t("loyalty.points-history.operation-type"), sortable: false },
  { id: "createdDate", title: t("loyalty.points-history.date"), sortable: false, classes: "!px-3" },
  { id: "amount", title: t("loyalty.points-history.amount"), sortable: false, align: "right" },
]);

const { fetchHistory, sort, loading: historyLoading, historyLogs, pages, page } = useLoyaltyPointsHistory();

const { fetchLoyaltyBalance, loading: balanceLoading, currentBalance } = useLoyaltyBalance();

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

  if (log.object?.type === MISSION_OBJECT_TYPE) {
    return t("loyalty.points-history.mission");
  }

  return log.object?.type;
}

function isRedeemed(log: LoyaltyOperationLog): boolean {
  return log.operationType === REDEEMED_OPERATION;
}

function getOperationType(log: LoyaltyOperationLog) {
  if (isRedeemed(log)) {
    return t("loyalty.points-history.redeemed");
  }

  if (log.operationType === EARNED_OPERATION) {
    return t("loyalty.points-history.earned");
  }

  return log.operationType;
}

onMounted(async () => {
  await Promise.all([fetchHistory(), fetchLoyaltyBalance()]);
});
</script>

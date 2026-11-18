<template>
  <div class="points-history">
    <div class="points-history__header">
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
            <div class="points-history__card">
              <div class="points-history__field">
                <span class="points-history__label">
                  {{ $t("loyalty.points-history.operation") }}
                </span>

                <span class="points-history__operation">
                  {{ getOperation(itemData.item) }}
                </span>
              </div>

              <div class="points-history__field points-history__field--type">
                {{ getOperationType(itemData.item) }}
              </div>

              <div class="points-history__field">
                <span class="points-history__label">
                  {{ $t("loyalty.points-history.date") }}
                </span>

                <span class="points-history__value">
                  {{ $d(itemData.item?.createdDate) }}
                </span>
              </div>

              <div class="points-history__field">
                <span class="points-history__label">
                  {{ $t("loyalty.points-history.amount") }}
                </span>

                <span class="points-history__value points-history__value--strong">
                  {{ itemData.item?.amount }}
                </span>
              </div>
            </div>
          </template>

          <template #desktop-body>
            <tr v-for="log in historyLogs" :key="log.id" class="points-history__row">
              <td class="points-history__cell">
                {{ getOperation(log) }}
              </td>

              <td class="points-history__cell">
                {{ getOperationType(log) }}
              </td>

              <td class="points-history__cell">
                {{ $d(log?.createdDate) }}
              </td>

              <td class="points-history__cell points-history__cell--amount">
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
  { id: "createdDate", title: t("loyalty.points-history.date"), sortable: false, classes: "px-3" },
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

function getOperationType(log: LoyaltyOperationLog) {
  if (log.operationType === REDEEMED_OPERATION) {
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

<style lang="scss">
.points-history {
  &__header {
    @apply flex items-center justify-between gap-2;
  }

  &__card {
    @apply grid w-full cursor-pointer appearance-none grid-cols-2 items-center gap-y-4 border-b border-neutral-200 p-6 text-left;
  }

  &__field {
    @apply flex flex-col;

    &--type {
      @apply items-end justify-center;
    }
  }

  &__label {
    @apply text-sm text-neutral-400;
  }

  &__operation {
    @apply overflow-hidden text-ellipsis pr-4 font-black;
  }

  &__value {
    @apply overflow-hidden text-ellipsis;

    &--strong {
      @apply font-black;
    }
  }

  &__row {
    @apply cursor-default;

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

    &--amount {
      @apply text-right;
    }
  }
}
</style>

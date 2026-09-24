<template>
  <div class="returns-list">
    <VcTypography tag="h1">{{ $t("returns.title") }}</VcTypography>

    <div v-if="canViewOrganizationReturns" class="returns-list__scope-tabs">
      <VcTabSwitch
        :model-value="scope"
        :value="RETURN_SCOPE.ORGANIZATION"
        icon="case"
        :label="$t('returns.scope.organization')"
        :disabled="loading"
        @change="applyScope(RETURN_SCOPE.ORGANIZATION)"
      />

      <VcTabSwitch
        :model-value="scope"
        :value="RETURN_SCOPE.OWN"
        icon="user"
        :label="$t('returns.scope.own')"
        :disabled="loading"
        @change="applyScope(RETURN_SCOPE.OWN)"
      />
    </div>

    <div class="returns-list__toolbar">
      <div class="returns-list__search-wrapper">
        <VcInput
          v-model="localKeyword"
          maxlength="64"
          class="returns-list__search"
          :disabled="loading"
          :placeholder="$t('returns.search_placeholder')"
          clearable
          @keydown.enter="applyKeyword(localKeyword)"
          @clear="applyKeyword('')"
        >
          <template #append>
            <VcButton
              :aria-label="$t('returns.search_aria')"
              :disabled="loading"
              icon="search"
              icon-size="1.25rem"
              @click="applyKeyword(localKeyword)"
            />
          </template>
        </VcInput>
      </div>

      <ReturnsFilters :statuses="statuses" :applied="filter" :disabled="loading" @change="applyFilter" />
    </div>

    <div v-if="chips.length" class="returns-list__chips">
      <VcChip v-for="chip in chips" :key="chip.id" color="secondary" closable @close="removeChip(chip)">
        {{ chip.label }}
      </VcChip>

      <VcChip color="secondary" variant="outline" clickable @click="resetAll">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
      </VcChip>
    </div>

    <VcEmptyView
      v-if="!loading && !returns.length"
      :text="isSearching ? $t('returns.no_results_message') : $t('returns.no_returns_message')"
      :variant="isSearching ? 'search' : 'empty'"
      icon="outline-order"
    >
      <template v-if="isSearching" #button>
        <VcButton prepend-icon="reset" @click="resetAll">
          {{ $t("common.buttons.reset_filters") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="loading"
          :sort="sort"
          :items="returns"
          :pages="pages"
          :page="page"
          :skeleton-rows="itemsPerPage"
          :description="$t('returns.meta.table_description')"
          @row-click="goToReturn"
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #mobile-item="{ item }">
            <button
              type="button"
              class="returns-list__mobile-item"
              @click="goToReturn(item)"
              @keyup.enter="goToReturn(item)"
            >
              <div class="returns-list__mobile-cell">
                <span class="returns-list__mobile-label">{{ $t("returns.list.columns.number") }}</span>

                <span class="returns-list__mobile-value font-black">{{ item.number }}</span>
              </div>

              <div class="returns-list__mobile-cell">
                <span class="returns-list__mobile-label">{{ $t("returns.list.columns.date") }}</span>

                <span class="returns-list__mobile-value">{{ $d(new Date(item.createdDate)) }}</span>
              </div>

              <div v-if="isOrganizationScope" class="returns-list__mobile-cell">
                <span class="returns-list__mobile-label">{{ $t("returns.list.columns.buyer") }}</span>

                <span class="returns-list__mobile-value">{{ item.customerName }}</span>
              </div>

              <div class="returns-list__mobile-cell">
                <span class="returns-list__mobile-label">{{ $t("returns.list.columns.status") }}</span>

                <span class="returns-list__mobile-value">{{ statusLabel(item.status, item.statusDisplayValue) }}</span>
              </div>

              <div class="returns-list__mobile-cell">
                <span class="returns-list__mobile-label">{{ $t("returns.list.columns.quantity") }}</span>

                <span class="returns-list__mobile-value">{{ item.itemsQuantity }}</span>
              </div>
            </button>
          </template>

          <VcTableColumn id="number" v-slot="{ item }" :title="$t('returns.list.columns.number')" sortable>
            {{ item.number }}
          </VcTableColumn>

          <VcTableColumn id="createdDate" v-slot="{ item }" :title="$t('returns.list.columns.date')" sortable>
            {{ $d(new Date(item.createdDate)) }}
          </VcTableColumn>

          <VcTableColumn
            v-if="isOrganizationScope"
            id="customerName"
            v-slot="{ item }"
            :title="$t('returns.list.columns.buyer')"
            sortable
          >
            {{ item.customerName }}
          </VcTableColumn>

          <VcTableColumn id="status" v-slot="{ item }" :title="$t('returns.list.columns.status')" sortable>
            {{ statusLabel(item.status, item.statusDisplayValue) }}
          </VcTableColumn>

          <VcTableColumn
            id="itemsQuantity"
            v-slot="{ item }"
            :title="$t('returns.list.columns.quantity')"
            align="right"
          >
            {{ item.itemsQuantity }}
          </VcTableColumn>
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables/usePageHead";
import { useReturnStatusLabel } from "@/modules/returns/composables/useReturnStatusLabel";
import { useReturnStatuses } from "@/modules/returns/composables/useReturnStatuses";
import { useReturns } from "@/modules/returns/composables/useReturns";
import { RETURN_ACTION, RETURN_SCOPE } from "@/modules/returns/constants";
import type { ReturnsFilterDataType } from "@/modules/returns/types";
import ReturnsFilters from "@/modules/returns/components/returns-filters.vue";

type ChipType = { id: string; label: string; field: keyof ReturnsFilterDataType; value?: string };

type ReturnListItemType = {
  id: string;
  availableActions?: { name: string; isAvailable: boolean }[];
};

const { t, d } = useI18n();
const router = useRouter();

usePageHead({
  title: computed(() => t("returns.meta.title")),
});

const {
  loading,
  returns,
  pages,
  page,
  sort,
  keyword,
  filter,
  isFilterEmpty,
  itemsPerPage,
  canViewOrganizationReturns,
  scope,
  applyScope,
  applyKeyword,
  applyFilter,
  applySorting,
  changePage: setPage,
  resetFilters,
} = useReturns();

const { statuses } = useReturnStatuses();
const { statusLabel } = useReturnStatusLabel();

const localKeyword = ref(keyword.value);

const isOrganizationScope = computed(() => scope.value === RETURN_SCOPE.ORGANIZATION);

const isSearching = computed(() => Boolean(keyword.value) || !isFilterEmpty.value);

const chips = computed<ChipType[]>(() => {
  const result: ChipType[] = filter.value.statuses.map((code) => ({
    id: `status:${code}`,
    label: statuses.value.find((status) => status.code === code)?.label ?? code,
    field: "statuses",
    value: code,
  }));

  if (filter.value.startDate) {
    result.push({
      id: "startDate",
      label: t("common.labels.starts_from", [d(toLocalDate(filter.value.startDate))]),
      field: "startDate",
    });
  }

  if (filter.value.endDate) {
    result.push({
      id: "endDate",
      label: t("common.labels.ends_to", [d(toLocalDate(filter.value.endDate))]),
      field: "endDate",
    });
  }

  return result;
});

// new Date("2026-06-15") is UTC midnight, which formats as the day before west of Greenwich.
// The filter stores local calendar days, so they have to be read back as local midnight.
function toLocalDate(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00`);
}

function removeChip(chip: ChipType): void {
  applyFilter({
    ...filter.value,
    statuses:
      chip.field === "statuses" ? filter.value.statuses.filter((code) => code !== chip.value) : filter.value.statuses,
    startDate: chip.field === "startDate" ? undefined : filter.value.startDate,
    endDate: chip.field === "endDate" ? undefined : filter.value.endDate,
  });
}

function resetAll(): void {
  localKeyword.value = "";
  resetFilters();
}

function changePage(newPage: number): void {
  setPage(newPage);
  window.scroll({ top: 0, behavior: "smooth" });
}

// Routed by the server's own action list, so the transition table stays in the module.
function goToReturn(payload: ReturnListItemType): void {
  const editable = payload.availableActions?.some((action) => action.name === RETURN_ACTION.EDIT && action.isAvailable);

  void router.push(
    editable
      ? { name: "EditReturn", params: { returnId: payload.id } }
      : { name: "Return", params: { returnId: payload.id } },
  );
}

// The keyword also arrives from the URL, on a shared link or the back button.
watch(keyword, (value) => {
  localKeyword.value = value;
});
</script>

<style lang="scss">
.returns-list {
  &__scope-tabs {
    @apply mt-5 flex w-full gap-2;

    > * {
      @apply flex-1;
    }
  }

  &__toolbar {
    @apply mb-4 mt-5 flex flex-col gap-3;

    @media (width >= theme("screens.lg")) {
      @apply flex-row items-center;
    }
  }

  &__search-wrapper {
    @apply flex grow;
  }

  &__search {
    @apply w-full;
  }

  &__chips {
    @apply mt-3 flex flex-wrap gap-2;
  }

  &__mobile-item {
    @apply grid w-full cursor-pointer appearance-none grid-cols-2 gap-y-4 border-b border-neutral-200 p-6 text-left;
  }

  &__mobile-cell {
    @apply flex flex-col;
  }

  &__mobile-label {
    @apply text-sm text-neutral-400;
  }

  &__mobile-value {
    @apply overflow-hidden text-ellipsis pr-4;
  }
}
</style>

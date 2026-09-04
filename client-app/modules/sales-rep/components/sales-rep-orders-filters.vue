<template>
  <VcPopover placement="bottom-end" class="sales-rep-orders-filters" :offset-options="8" :disabled="disabled" lazy>
    <template #default="{ triggerProps }">
      <VcButton :disabled="disabled" variant="outline" v-bind="triggerProps">
        <VcIcon name="filter" />

        <span>{{ t("sales_rep.customer_orders.filters.button") }}</span>
      </VcButton>
    </template>

    <template #content="{ close }">
      <div class="sales-rep-orders-filters__panel">
        <VcDialog dividers size="xs">
          <VcDialogHeader @close="close">
            {{ t("sales_rep.customer_orders.filters.title") }}
          </VcDialogHeader>

          <VcDialogContent>
            <div class="sales-rep-orders-filters__content">
              <VcSelect
                v-model="selectedRange"
                :label="t('sales_rep.customer_orders.filters.created_date')"
                :items="ranges"
                text-field="label"
                enable-teleport
                @change="applyRange"
              />

              <template v-if="selectedRange.id === CUSTOM_RANGE_ID">
                <div class="sales-rep-orders-filters__range">
                  <VcDatePicker
                    v-model="draft.startDate"
                    class="sales-rep-orders-filters__date"
                    :label="t('sales_rep.customer_orders.filters.start_date')"
                    :error="showRangeError"
                    mask
                    enable-teleport
                    @update:valid="startValid = $event"
                  />

                  <div class="sales-rep-orders-filters__separator">&mdash;</div>

                  <VcDatePicker
                    v-model="draft.endDate"
                    class="sales-rep-orders-filters__date"
                    :label="t('sales_rep.customer_orders.filters.end_date')"
                    :error="showRangeError"
                    mask
                    enable-teleport
                    @update:valid="endValid = $event"
                  />
                </div>

                <VcInputDetails
                  show-empty
                  error
                  :message="showRangeError ? t('sales_rep.customer_orders.filters.invalid_range') : undefined"
                />
              </template>

              <div v-if="statuses.length" class="sales-rep-orders-filters__statuses">
                <VcLabel>{{ t("sales_rep.customer_orders.filters.order_status") }}</VcLabel>

                <VcCheckboxGroup v-model="draft.statuses" class="sales-rep-orders-filters__status-list">
                  <VcCheckbox v-for="status in statuses" :key="status.name" :value="status.name">
                    <div class="sales-rep-orders-filters__option">
                      <span class="sales-rep-orders-filters__option-label">{{ status.label }}</span>

                      <VcBadge variant="outline" size="sm" rounded>{{ status.count }}</VcBadge>
                    </div>
                  </VcCheckbox>
                </VcCheckboxGroup>
              </div>

              <!-- Only where the list spans customers; on a customer's own page every order is theirs. -->
              <div v-if="customers.length" class="sales-rep-orders-filters__statuses">
                <VcLabel>{{ t("sales_rep.customer_orders.filters.customer") }}</VcLabel>

                <VcCheckboxGroup v-model="draft.customerNames" class="sales-rep-orders-filters__status-list">
                  <VcCheckbox v-for="customer in customers" :key="customer.name" :value="customer.name">
                    <div class="sales-rep-orders-filters__option">
                      <span class="sales-rep-orders-filters__option-label">{{ customer.label }}</span>

                      <VcBadge variant="outline" size="sm" rounded>{{ customer.count }}</VcBadge>
                    </div>
                  </VcCheckbox>
                </VcCheckboxGroup>
              </div>
            </div>
          </VcDialogContent>

          <VcDialogFooter>
            <VcButton
              color="secondary"
              variant="outline"
              :disabled="isEmpty && !isDirty"
              @click="
                reset();
                close();
              "
            >
              {{ t("sales_rep.customer_orders.filters.reset") }}
            </VcButton>

            <VcButton
              :disabled="!isDirty || !isRangeValid"
              @click="
                apply();
                close();
              "
            >
              {{ t("sales_rep.customer_orders.filters.apply") }}
            </VcButton>
          </VcDialogFooter>
        </VcDialog>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { SalesRepFacetOptionType, SalesRepOrdersFilterDataType } from "../types";

interface IProps {
  statuses: SalesRepFacetOptionType[];
  customers?: SalesRepFacetOptionType[];
  applied?: SalesRepOrdersFilterDataType;
  disabled?: boolean;
}

interface IEmits {
  (event: "change", value: SalesRepOrdersFilterDataType): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), { customers: () => [], applied: undefined, disabled: false });

const { t } = useI18n();

const CUSTOM_RANGE_ID = "custom";

type RangeType = { id: string; label: string; startDate?: string; endDate?: string };

function emptyFilter(): SalesRepOrdersFilterDataType {
  return { statuses: [], customerNames: [], startDate: undefined, endDate: undefined };
}

function cloneFilter(value: SalesRepOrdersFilterDataType): SalesRepOrdersFilterDataType {
  return { ...value, statuses: [...value.statuses], customerNames: [...(value.customerNames ?? [])] };
}

function toDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

const ranges = computed<RangeType[]>(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const from = (shift: (date: Date) => void): string => {
    const date = new Date(today);
    shift(date);
    return toDateOnly(date);
  };

  return [
    { id: CUSTOM_RANGE_ID, label: t("sales_rep.customer_orders.filters.custom_date") },
    {
      id: "lastDay",
      label: t("sales_rep.customer_orders.filters.last_day"),
      startDate: from((date) => date.setDate(date.getDate() - 1)),
      endDate: toDateOnly(today),
    },
    {
      id: "lastWeek",
      label: t("sales_rep.customer_orders.filters.last_week"),
      startDate: from((date) => date.setDate(date.getDate() - 7)),
      endDate: toDateOnly(today),
    },
    {
      id: "lastMonth",
      label: t("sales_rep.customer_orders.filters.last_month"),
      startDate: from((date) => date.setMonth(date.getMonth() - 1)),
      endDate: toDateOnly(today),
    },
    {
      id: "lastYear",
      label: t("sales_rep.customer_orders.filters.last_year"),
      startDate: from((date) => date.setFullYear(date.getFullYear() - 1)),
      endDate: toDateOnly(today),
    },
  ];
});

const draft = ref<SalesRepOrdersFilterDataType>(emptyFilter());
const appliedFilter = ref<SalesRepOrdersFilterDataType>(emptyFilter());
const selectedRange = ref<RangeType>(ranges.value[0]);

const startValid = ref(true);
const endValid = ref(true);

const isRangeOrderValid = computed(() => {
  const { startDate, endDate } = draft.value;
  if (!startDate || !endDate) {
    return true;
  }
  return new Date(startDate).getTime() <= new Date(endDate).getTime();
});

const showRangeError = computed(
  () => !isRangeOrderValid.value && Boolean(draft.value.startDate) && Boolean(draft.value.endDate),
);

const isRangeValid = computed(() => startValid.value && endValid.value && isRangeOrderValid.value);

const isEmpty = computed(() => {
  const { statuses, customerNames, startDate, endDate } = appliedFilter.value;
  return !statuses.length && !customerNames?.length && !startDate && !endDate;
});

const isDirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(appliedFilter.value));

function applyRange(range: RangeType): void {
  if (range.id === CUSTOM_RANGE_ID) {
    draft.value.startDate = undefined;
    draft.value.endDate = undefined;
    return;
  }

  draft.value.startDate = range.startDate;
  draft.value.endDate = range.endDate;
  startValid.value = true;
  endValid.value = true;
}

function apply(): void {
  appliedFilter.value = cloneFilter(draft.value);
  emit("change", appliedFilter.value);
}

function reset(): void {
  draft.value = emptyFilter();
  appliedFilter.value = emptyFilter();
  selectedRange.value = ranges.value[0];
  emit("change", appliedFilter.value);
}

// The page can drop a single filter from its chips, so the popover follows what is actually applied.
watch(
  () => props.applied,
  (value) => {
    if (!value) {
      return;
    }

    appliedFilter.value = cloneFilter(value);
    draft.value = cloneFilter(value);

    if (!value.startDate && !value.endDate) {
      selectedRange.value = ranges.value[0];
    }
  },
  { deep: true },
);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-orders-filters {
  &__panel {
    @apply w-[27.5rem] max-w-[calc(100vw-2rem)];
  }

  &__content {
    @apply flex flex-col;
  }

  &__range {
    @apply mt-3 flex items-end gap-3;

    @media (width < theme("screens.lg")) {
      @apply mt-4 flex-col;
    }
  }

  &__date {
    @apply grow;

    @media (width < theme("screens.lg")) {
      @apply w-full;
    }
  }

  &__separator {
    @apply text-2xl/[2.75rem];

    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__statuses {
    @apply mt-4;
  }

  &__status-list {
    @apply mt-2 space-y-3.5;
  }

  &__option {
    @apply flex w-full max-w-full items-center gap-1;
  }

  &__option-label {
    @apply min-w-0 truncate;
  }
}
</style>

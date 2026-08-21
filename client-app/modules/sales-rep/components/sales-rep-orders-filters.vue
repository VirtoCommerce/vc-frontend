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
                    {{ t("sales_rep.customer_orders.filters.status_option", [status.label, status.count]) }}
                  </VcCheckbox>
                </VcCheckboxGroup>
              </div>

              <!-- Only where the list spans customers; on a customer's own page every order is theirs. -->
              <div v-if="customers.length" class="sales-rep-orders-filters__statuses">
                <VcLabel>{{ t("sales_rep.customer_orders.filters.customer") }}</VcLabel>

                <VcCheckboxGroup v-model="draft.customerNames" class="sales-rep-orders-filters__status-list">
                  <VcCheckbox v-for="customer in customers" :key="customer.name" :value="customer.name">
                    {{ t("sales_rep.customer_orders.filters.status_option", [customer.label, customer.count]) }}
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { SalesRepFacetOptionType, SalesRepOrdersFilterDataType } from "../types";

interface IProps {
  // Statuses the listed orders carry, with their counts, from the list's own status facet.
  statuses: SalesRepFacetOptionType[];
  // Customers those orders belong to; empty on a single customer's page.
  customers?: SalesRepFacetOptionType[];
  disabled?: boolean;
}

interface IEmits {
  (event: "change", value: SalesRepOrdersFilterDataType): void;
}

const emit = defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), { customers: () => [], disabled: false });

const { t } = useI18n();

const CUSTOM_RANGE_ID = "custom";

type RangeType = { id: string; label: string; startDate?: string; endDate?: string };

function emptyFilter(): SalesRepOrdersFilterDataType {
  return { statuses: [], customerNames: [], startDate: undefined, endDate: undefined };
}

// Date-only bounds ("YYYY-MM-DD"); the page turns them into the query's period instants.
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
const applied = ref<SalesRepOrdersFilterDataType>(emptyFilter());
const selectedRange = ref<RangeType>(ranges.value[0]);

const startValid = ref(true);
const endValid = ref(true);

// Start must not be after end; empty and partial ranges are valid.
const isRangeOrderValid = computed(() => {
  const { startDate, endDate } = draft.value;
  if (!startDate || !endDate) {
    return true;
  }
  return new Date(startDate).getTime() <= new Date(endDate).getTime();
});

// The message names a wrong order, so a malformed input must not raise it — the pickers flag that themselves.
const showRangeError = computed(
  () => !isRangeOrderValid.value && Boolean(draft.value.startDate) && Boolean(draft.value.endDate),
);

const isRangeValid = computed(() => startValid.value && endValid.value && isRangeOrderValid.value);

const isEmpty = computed(() => {
  const { statuses, customerNames, startDate, endDate } = applied.value;
  return !statuses.length && !customerNames?.length && !startDate && !endDate;
});

const isDirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(applied.value));

// A preset fills the bounds; "Custom date" clears them for the pickers to take over.
function applyRange(range: RangeType): void {
  if (range.id === CUSTOM_RANGE_ID) {
    draft.value.startDate = undefined;
    draft.value.endDate = undefined;
    return;
  }

  draft.value.startDate = range.startDate;
  draft.value.endDate = range.endDate;
  // The pickers unmount without re-emitting validity.
  startValid.value = true;
  endValid.value = true;
}

function apply(): void {
  applied.value = {
    ...draft.value,
    statuses: [...draft.value.statuses],
    customerNames: [...(draft.value.customerNames ?? [])],
  };
  emit("change", applied.value);
}

function reset(): void {
  draft.value = emptyFilter();
  applied.value = emptyFilter();
  selectedRange.value = ranges.value[0];
  emit("change", applied.value);
}
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
}
</style>

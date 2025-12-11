<template>
  <div class="active-filter-chips">
    <template v-for="filterItem in filters">
      <template v-if="!facetsToHide?.includes(filterItem.name.toLowerCase())">
        <!-- Term values -->
        <template v-for="term in filterItem.termValues" :key="filterItem.name + 'term-' + term.value">
          <VcChip color="secondary" closable truncate @close="onCancelFilter(filterItem.name, term.value)">
            {{ `${formatFilterLabel(filterItem.label)}${getFormattedLabel(term.label || term.value)}` }}
          </VcChip>
        </template>

        <!-- Range values -->
        <template
          v-for="range in filterItem.rangeValues"
          :key="filterItem.name + 'range-' + range.lower + '-' + range.upper"
        >
          <VcChip color="secondary" closable truncate @close="onCancelRangeFilter(filterItem.name, range)">
            {{ `${formatFilterLabel(filterItem.label)}${formatRangeValue(range)}` }}
          </VcChip>
        </template>
      </template>
    </template>

    <template v-for="control in controls" :key="control.value">
      <VcChip color="secondary" closable @close="$emit('cancelControl', control.value)">
        {{ control.label }}
      </VcChip>
    </template>

    <slot name="actions">
      <VcChip color="secondary" variant="outline" clickable @click="$emit('resetFilters')">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
      </VcChip>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { getFormattedLabel } from "@/core/utilities";
import type { SearchProductFilterRangeValue, SearchProductFilterResult } from "@/core/api/graphql/types.ts";
import type { CatalogControl } from "@/shared/catalog/constants/catalog";

interface IEmits {
  (event: "resetFilters"): void;
  (event: "applyFilters", value: SearchProductFilterResult[]): void;
  (event: "cancelControl", value: CatalogControl): void;
}

interface IControl {
  label: string;
  value: CatalogControl;
}

interface IProps {
  facetsToHide?: string[];
  filters?: SearchProductFilterResult[];
  controls?: IControl[];
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { filters } = toRefs(props);

function formatFilterLabel(filterLabel: string | undefined) {
  const trimmedFilterLabel = filterLabel?.trim();

  if (!trimmedFilterLabel || trimmedFilterLabel.startsWith("_")) {
    return "";
  }

  return `${trimmedFilterLabel}: `;
}

function formatRangeValue(range: SearchProductFilterRangeValue): string {
  const lower = range.lower || "";
  const upper = range.upper || "";

  if (lower && upper) {
    return `${lower} - ${upper}`;
  } else if (lower) {
    return `≥ ${lower}`;
  } else if (upper) {
    return `≤ ${upper}`;
  }

  return "";
}

function onCancelFilter(filterName: string, filterValue: string): void {
  // Find the filter to update
  const filterToUpdate = filters.value?.find((filter) => filter.name === filterName);

  if (!filterToUpdate) {
    return;
  }

  // Create a copy of preparedFilters to modify
  const updatedFilters = filters.value
    ?.map((filter) => {
      if (filter.name === filterName) {
        // Remove the specific filterValue from termValues
        const updatedTermValues = filter.termValues?.filter((term) => term?.value !== filterValue);

        // If no termValues remain, return null to remove the filter entirely
        if (!updatedTermValues || updatedTermValues.length === 0) {
          return null;
        }

        // Return updated filter with remaining termValues
        return {
          ...filter,
          termValues: updatedTermValues,
        };
      }
      return filter;
    })
    .filter((filter) => filter !== null); // Remove null values

  emit("applyFilters", updatedFilters || []);
}

function onCancelRangeFilter(filterName: string, rangeToRemove: SearchProductFilterRangeValue): void {
  // Find the filter to update
  const filterToUpdate = filters.value?.find((filter) => filter.name === filterName);

  if (!filterToUpdate) {
    return;
  }

  // Create a copy of preparedFilters to modify
  const updatedFilters = filters.value
    ?.map((filter) => {
      if (filter.name === filterName) {
        // Remove the specific range from rangeValues
        const updatedRangeValues = filter.rangeValues?.filter(
          (range) =>
            !(
              range.includeLowerBound === rangeToRemove.includeLowerBound &&
              range.includeUpperBound === rangeToRemove.includeUpperBound &&
              range.lower === rangeToRemove.lower &&
              range.upper === rangeToRemove.upper
            ),
        );

        // If no rangeValues remain, return null to remove the filter entirely
        if (!updatedRangeValues || updatedRangeValues.length === 0) {
          return null;
        }

        // Return updated filter with remaining rangeValues
        return {
          ...filter,
          rangeValues: updatedRangeValues,
        };
      }
      return filter;
    })
    .filter((filter) => filter !== null); // Remove null values

  emit("applyFilters", updatedFilters || []);
}
</script>

<style lang="scss">
.active-filter-chips {
  @apply flex mb-3 flex-wrap gap-2;
}
</style>

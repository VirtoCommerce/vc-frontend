<template>
  <VcWidget
    v-if="mode === 'collapsable' && typeof facetMin === 'number' && typeof facetMax === 'number' && sliderValue"
    class="facet-filter-widget"
    size="xs"
    collapsible
    :title="facet.label"
    collapsed
    ><div>
      <VcSlider
        :value="sliderValue"
        :min="facetMin"
        :max="facetMax"
        :cols="sliderCols"
        show-tooltip-on-col-hover
        cols-height="36px"
        @change="handleSliderChange"
      /></div
  ></VcWidget>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import type { SearchProductFilterRangeValue, SearchProductFilterResult } from "@/core/api/graphql/types.ts";
import type { FacetItemType } from "@/core/types";
import type { ColType } from "@/ui-kit/components/molecules/slider/vc-slider.vue";

type EmitValueType = [number, number] | [null, number] | [number, null] | [null, null];

interface IProps {
  facet: FacetItemType;
  // make sure only name price goes here
  filters?: SearchProductFilterResult[];
  mode: "dropdown" | "collapsable";
}

interface IEmits {
  (event: "update:range", value: EmitValueType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { facet, filters } = toRefs(props);

const facetMin = computed(() => {
  return typeof facet.value.statistics?.min === 'number' ? Math.floor(facet.value.statistics.min) : undefined
});

const facetMax = computed(() => {
  return typeof facet.value.statistics?.max === 'number' ? Math.ceil(facet.value.statistics.max) : undefined
});

const sliderValue = computed(() => {
  if (typeof facetMin.value === "number" && typeof facetMax.value === "number") {
    const range = getRangeFromFilter();

    if (typeof range[0] === "number" && typeof range[1] === "number") {
      return range;
    }

    if(typeof range[0] === "number") {
      return [range[0], facetMax.value] as [number, number];
    }

    if(typeof range[1] === "number") {
      return [facetMin.value, range[1]] as [number, number];
    }

    return [facetMin.value, facetMax.value] as [number, number];
  }

  return undefined
});

const sliderCols = computed<ColType[]>(() => {
  return facet.value.values
    .filter((item) => item.count !== undefined && item.from !== undefined && item.to !== undefined)
    .map((item) => {
      return {
        count: item.count!,
        value: [item.from!, item.to!] as [number, number],
      };
    });
});

function handleSliderChange(value: [number, number] | [number]) {
  const doubleValue = value.length === 2 ? value : [value[0], value[0]];
  if (doubleValue[0] === facetMin.value && doubleValue[1] === facetMax.value) {
    emit("update:range", [null, null]);
    return;
  }
  if (doubleValue[0] === facetMin.value && doubleValue[1] !== facetMax.value) {
    emit("update:range", [null, doubleValue[1]]);
    return;
  }
  if (doubleValue[0] !== facetMin.value && doubleValue[1] === facetMax.value) {
    emit("update:range", [doubleValue[0], null]);
    return;
  }

  emit("update:range", [doubleValue[0], doubleValue[1]]);
}

function getRangeFromFilter(): EmitValueType {
  // filters are already filtered to exclude zero price filters
  if (filters.value?.length === 1 && filters.value[0].rangeValues?.length === 1) {
    const rangeValue = filters.value[0].rangeValues[0];
    return getBounceFromRange(rangeValue);
  }

  return [null, null];
}

function getBounceFromRange(rangeValue: SearchProductFilterRangeValue): EmitValueType {
  const { lower, upper, includeLowerBound, includeUpperBound } = rangeValue;

  const lowerNum = lower ? Number(lower)  : null;
  const upperNum = upper ? Number(upper) : null;

  if (includeLowerBound && includeUpperBound) {
    return [typeof lowerNum === 'number' && isFinite(lowerNum) ? lowerNum : null, typeof upperNum === 'number' && isFinite(upperNum) ? upperNum : null]
  }

  return [null, null]
}
</script>

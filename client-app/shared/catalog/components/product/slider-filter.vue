<template>
  <div v-if="typeof facetMin === 'number' && typeof facetMax === 'number' && sliderValue">
    <VcWidget
      v-if="mode === 'collapsable'"
      class="facet-filter-widget"
      size="xs"
      collapsible
      :title="facet.label"
      collapsed
      >
      <div>
        <VcSlider
          :value="sliderValue"
          :min="facetMin"
          :max="facetMax"
          :cols="sliderCols"
          show-tooltip-on-col-hover
          cols-height="36px"
          @change="handleSliderChange"
        />
      </div>
    </VcWidget>
    <!-- Dropdown mode -->
    <VcDropdownMenu
      v-if="mode === 'dropdown'"
      :offset-options="4"
      class="slider-filter-dropdown"
      z-index="10"
      max-height="20rem"
      width="15rem"
      :dividers="false"
    >
      <template #trigger="{ opened, triggerProps }">
        <VcButton
          :class="['slider-filter-dropdown__trigger', { 'slider-filter-dropdown__trigger--opened': opened }]"
          size="sm"
          :color="hasSelected ? 'accent' : 'secondary'"
          variant="outline"
          v-bind="triggerProps"
        >
          {{ facet.label }}

          <template #append>
            <span class="slider-filter-dropdown__append">
              <VcBadge v-if="hasSelected" size="sm" rounded color="info">
                1
              </VcBadge>

              <VcIcon v-else name="chevron-down" class="slider-filter-dropdown__arrow" />
            </span>
          </template>
        </VcButton>
      </template>
      <template #content>
        <div class="slider-filter-dropdown__slider-wrapper">
          <VcSlider
            :value="sliderValue"
            :min="facetMin"
            :max="facetMax"
            :cols="sliderCols"
            show-tooltip-on-col-hover
            update-on-column-click
            cols-height="36px"
            @change="handleSliderChange"
          />
        </div>
      </template>
    </VcDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import type { SearchProductFilterRangeValue, SearchProductFilterResult } from "@/core/api/graphql/types.ts";
import type { FacetItemType } from "@/core/types";
import type { ColType } from "@/ui-kit/components/molecules/slider/vc-slider.vue";

type EmitValueType = [number, number] | [null, number] | [number, null] | [null, null];

interface IProps {
  facet: FacetItemType;
  filter?: SearchProductFilterResult;
  mode: "dropdown" | "collapsable";
}

interface IEmits {
  (event: "update:filter", filters: SearchProductFilterResult): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { facet, filter } = toRefs(props);

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

const hasSelected = computed(() => {
  return !!filter.value;
})

function handleSliderChange(value: [number, number] | [number]) {
  const doubleValue = value.length === 2 ? value : [value[0], value[0]];

  if (doubleValue[0] === facetMin.value && doubleValue[1] === facetMax.value) {
    applyRange([null, null]);
    return;
  }

  if (doubleValue[0] === facetMin.value && doubleValue[1] !== facetMax.value) {
    applyRange([null, doubleValue[1]]);
    return;
  }

  if (doubleValue[0] !== facetMin.value && doubleValue[1] === facetMax.value) {
    applyRange([doubleValue[0], null]);
    return;
  }

  applyRange([doubleValue[0], doubleValue[1]]);
}

function getRangeFromFilter(): EmitValueType {
  if (filter.value?.rangeValues?.length === 1) {
    const rangeValue = filter.value.rangeValues[0];
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

function applyRange(range: [number | null, number | null]) {
  const from = typeof range[0] == 'number' ? range[0] : undefined;
  const to = typeof range[1] == 'number' ? range[1] : undefined;

  const newFilter: SearchProductFilterResult = {
    filterType: facet.value.type,
    name: facet.value.paramName,
    rangeValues: from === undefined && to === undefined ? [] : [{
      lower: from?.toString(),
      upper: to?.toString(),
      includeLowerBound: true,
      includeUpperBound: true
    }]
  };

  emit("update:filter", newFilter);
}
</script>

<style lang="scss">
.slider-filter-dropdown {
$opened: "";

  @apply shrink-0;

  &__trigger {
    width: max-content;

    &--opened {
    $opened: &;
    }
  }

  &__append {
    @apply ms-2;
  }

  &__arrow {
    @apply transition-transform;

    #{$opened} & {
      @apply rotate-180;
    }
  }

  &__slider-wrapper {
    @apply p-4;
  }
}
</style>

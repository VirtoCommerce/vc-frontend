<template>
  <div class="space-y-4 lg:space-y-5">
    <!-- Facet Filters Skeletons -->
    <template v-if="loading && !localFilters.facets.length">
      <template v-if="!isHorizontal">
        <VcWidgetSkeleton v-for="i in 6" :key="i" size="xs" head />
      </template>
      <div v-else class="flex gap-3">
        <div v-for="i in 6" :key="i" class="h-8 w-36 animate-pulse rounded-sm bg-neutral-200" />
      </div>
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <div
        ref="facetFiltersContainer"
        :class="[
          'flex gap-3',
          {
            'flex-row items-start': isHorizontal,
            'flex-col items-stretch lg:gap-5': !isHorizontal,
            '[&>*:last-child]:invisible': isHorizontal && filterCalculationInProgress,
          },
        ]"
      >
        <slot name="prepend" :loading="loading" />

        <template v-for="facet in filtersToShow" :key="facet.paramName">
          <component
            :is="facetHasBounce(facet.statistics) ? SliderFilter : FacetFilter"
            :mode="isHorizontal ? 'dropdown' : 'collapsable'"
            :facet="facet"
            :loading="loading"
            :filter="getFiltersByParamName(facet.paramName)"
            @update:filter="onFacetFilterChanged"
            @update:range="applyRange($event, facet.paramName)"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind, useElementBounding, watchDebounced } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, shallowRef, ref, nextTick, computed } from "vue";
import FacetFilter from "./facet-filter.vue";
import type { SearchProductFilterResult } from "@/core/api/graphql/types";
import type { FacetItemType } from "@/core/types";
import type { ProductsFiltersType } from "@/shared/catalog";
import SliderFilter from "@/shared/catalog/components/product/slider-filter.vue";

interface IEmits {
  (event: "change", value: ProductsFiltersType): void;
  (event: "change:facets", value: FacetItemType[]): void;
  (event: "change:filters", value: SearchProductFilterResult[]): void;
}

interface IProps {
  loading?: boolean;
  filters: ProductsFiltersType;
  orientation?: "vertical" | "horizontal";
  preparedFilters: SearchProductFilterResult[];
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  orientation: "vertical",
});

const facetFiltersContainer = shallowRef<HTMLDivElement | null>(null);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const localFilters = ref<ProductsFiltersType>({
  facets: [],
  inStock: false,
  branches: [],
  purchasedBefore: false,
  filters: []
});
const isHorizontal = props.orientation === "horizontal";

const filterCalculationInProgress = ref(false);
const filtersCountToShow = ref(1);

const filtersToShow = computed(() => {
  return props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value
    ? localFilters.value.facets
    : localFilters.value.facets.slice(0, filtersCountToShow.value);
});

const { right: containerRight } = useElementBounding(facetFiltersContainer);

watchDebounced(
  [containerRight, () => localFilters.value.facets],
  async () => {
    if (props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value) {
      return;
    }
    async function calculateFiltersCountToShow() {
      filterCalculationInProgress.value = true;
      const facetsElements =
        (facetFiltersContainer?.value?.querySelectorAll("[data-facet-filter-dropdown]") as NodeListOf<HTMLElement>) ||
        [];
      let filtersCount = 1;
      for (let i = 0; i < localFilters.value.facets.length; i++) {
        const facetFilter = facetsElements[i];
        if (!facetFilter) {
          filtersCountToShow.value++;
          await nextTick();
          await calculateFiltersCountToShow();
          return;
        }
        if (useElementBounding(facetFilter, { windowScroll: false }).right.value > containerRight.value) {
          filtersCount--;
          break;
        }
        filtersCount++;
      }
      filtersCountToShow.value = filtersCount;
      filterCalculationInProgress.value = false;
    }
    await calculateFiltersCountToShow();
  },
  { debounce: 500, maxWait: 1000, immediate: true },
);

watch(
  () => props.filters.facets,
  (newFacets) => (localFilters.value.facets = cloneDeep(newFacets)),
  { immediate: true },
);

watch(
  () => props.filters.inStock,
  (newValue) => (localFilters.value.inStock = newValue),
  { immediate: true },
);

watch(
  () => props.filters.purchasedBefore,
  (newValue) => (localFilters.value.purchasedBefore = newValue),
  { immediate: true },
);

watch(
  () => props.filters.branches,
  (newValue) => (localFilters.value.branches = newValue.slice()),
  { immediate: true },
);

function onFacetFilterChanged(newFilter: SearchProductFilterResult): void {
  // Remove existing filter with the same name and add the new one
  const updatedFilters = props.preparedFilters.filter(f => f.name !== newFilter.name);

  // Only add the new filter if it has values (not empty)
  if ((newFilter.termValues && newFilter.termValues.length > 0) ||
      (newFilter.rangeValues && newFilter.rangeValues.length > 0)) {
    updatedFilters.push(newFilter);
  }

  // Emit only filters change
  emit("change:filters", updatedFilters);
}

function applyRange(range: [number | null, number | null], paramName: string) {
  const from = typeof range[0] == 'number' ? range[0] : undefined;
  const to = typeof range[1] == 'number' ? range[1] : undefined;

  // Create a new filter object for the range
  const newFilter: SearchProductFilterResult = {
    name: paramName,
    filterType: "Range",
    rangeValues: from === undefined && to === undefined ? [] : [{
      lower: from?.toString(),
      upper: to?.toString(),
      includeLowerBound: true,
      includeUpperBound: true
    }]
  };

  // Update only the filters array, keeping facets unchanged
  const newFilters = from === undefined && to === undefined
    ? props.preparedFilters.filter(f => f.name !== paramName)
    : [...props.preparedFilters.filter(f => f.name !== paramName), newFilter];

    emit("change:filters", newFilters);
}

function facetHasBounce(statistics?: { min?: number, max?: number }) {
  return typeof statistics?.min === "number" && typeof statistics?.max === "number";
}

function getFiltersByParamName(paramName: string) {
  return props.preparedFilters.find((el) => el.name === paramName);
}
</script>

<style scoped lang="scss">
:deep(.facet-filter--dropdown:last-child) {
  .vc-popover__content {
    @apply right-0 left-auto #{!important};
  }
}
</style>

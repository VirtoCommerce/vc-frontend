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
        class="flex gap-3"
        :class="[isHorizontal && ' flex-row items-start', !isHorizontal && 'flex-col items-stretch lg:gap-5']"
      >
        <slot name="prepend" :loading="loading" />
        <template v-for="(facet, i) in filtersToShow" :key="facet.paramName">
          <FacetFilter
            :mode="isHorizontal ? 'dropdown' : 'collapsable'"
            :facet="facet"
            :loading="loading"
            :class="[
              isHorizontal && 'shrink-0',
              filterCalculationInProgress && i === filtersToShow.length - 1 && 'invisible',
            ]"
            @update:facet="onFacetFilterChanged"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  orientation: "vertical",
});
import { useBreakpoints, breakpointsTailwind, useElementBounding, watchDebounced } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, shallowReactive, shallowRef, ref, nextTick, computed } from "vue";
import FacetFilter from "./facet-filter.vue";
import type { FacetItemType } from "@/core/types";
import type { ProductsFiltersType } from "@/shared/catalog";

interface IEmits {
  (event: "change", value: ProductsFiltersType): void;
  (event: "openBranches"): void;
}

interface IProps {
  loading?: boolean;
  filters: ProductsFiltersType;
  orientation?: "vertical" | "horizontal";
}

const facetFiltersContainer = shallowRef<HTMLDivElement | null>(null);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const localFilters = shallowReactive<ProductsFiltersType>({ facets: [], inStock: false, branches: [] });
const isHorizontal = props.orientation === "horizontal";

const filterCalculationInProgress = ref(false);
const filtersCountToShow = ref(1);
const filtersToShow = computed(() =>
  props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value
    ? localFilters.facets
    : localFilters.facets.slice(0, filtersCountToShow.value),
);
const { right: containerRight } = useElementBounding(facetFiltersContainer);

watchDebounced(
  [containerRight, () => localFilters.facets],
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
      for (let i = 0; i < localFilters.facets.length; i++) {
        const facetFilter = facetsElements[i] as HTMLElement;
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
  (newFacets) => (localFilters.facets = cloneDeep(newFacets)),
  { immediate: true },
);

watch(
  () => props.filters.inStock,
  (newValue) => (localFilters.inStock = newValue),
  { immediate: true },
);

watch(
  () => props.filters.branches,
  (newValue) => (localFilters.branches = newValue.slice()),
  { immediate: true },
);

function onFacetFilterChanged(facet: FacetItemType): void {
  const existingFacet = localFilters.facets.find((item) => item.paramName === facet.paramName);
  if (existingFacet) {
    existingFacet.values = facet.values;
    emit("change", localFilters);
  }
}
</script>

<style scoped lang="scss">
:deep(.facet-filter--dropdown:last-child) {
  .vc-popover__content {
    @apply right-0 left-auto #{!important};
  }
}
</style>

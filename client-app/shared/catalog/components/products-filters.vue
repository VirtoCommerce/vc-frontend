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

        <SliderFilter
          v-if="priceFacet"
          :mode="isHorizontal ? 'dropdown' : 'collapsable'"
          :facet="priceFacet"
          query-key="price"
          show-tooltip-on-col-hover
          @update:range="applyPriceRange"
        />

        <template v-for="facet in filtersToShow" :key="facet.paramName">
          <FacetFilter
            :mode="isHorizontal ? 'dropdown' : 'collapsable'"
            :facet="facet"
            :loading="loading"
            @update:facet="onFacetFilterChanged"
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
import { getFilterExpressionFromFacetRange } from "@/core/utilities";
import FacetFilter from "./facet-filter.vue";
import type { FacetItemType } from "@/core/types";
import type { ProductsFiltersType } from "@/shared/catalog";
import SliderFilter from "@/shared/catalog/components/product/slider-filter.vue";

interface IEmits {
  (event: "change", value: ProductsFiltersType): void;
}

interface IProps {
  loading?: boolean;
  filters: ProductsFiltersType;
  orientation?: "vertical" | "horizontal";
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
});
const isHorizontal = props.orientation === "horizontal";

const filterCalculationInProgress = ref(false);
const filtersCountToShow = ref(1);

const filtersToShow = computed(() => {
  return props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value
    ? localFilters.value.facets
    : localFilters.value.facets.slice(0, filtersCountToShow.value);
});

const priceFacet = computed(() => localFilters.value.facets.find((el) => el.paramName === "price"));

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

function onFacetFilterChanged(facet: Pick<FacetItemType, "paramName" | "values">): void {
  const existingFacet = localFilters.value.facets.find((item) => item.paramName === facet.paramName);
  if (existingFacet) {
    existingFacet.values = facet.values;
    emit("change", localFilters.value);
  }
}

function applyPriceRange(range: [number, number]) {
  onFacetFilterChanged({
    paramName: "price",
    values: [
      {
        label: "price",
        count: 0,
        from: range[0],
        to: range[1],
        selected: true,
        includeFrom: true,
        includeTo: true,
        value: getFilterExpressionFromFacetRange({ from: range[0], to: range[1], includeFrom: true, includeTo: true })
      }
    ]
  })
}
</script>

<style scoped lang="scss">
:deep(.facet-filter--dropdown:last-child) {
  .vc-popover__content {
    @apply right-0 left-auto #{!important};
  }
}
</style>

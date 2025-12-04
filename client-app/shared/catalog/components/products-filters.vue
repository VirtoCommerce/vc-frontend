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
          <div data-facet-filter>
            <component
              :is="facetHasBounce(facet.statistics) && isSliderFilterEnabled() ? SliderFilter : FacetFilter"
              :mode="isHorizontal ? 'dropdown' : 'collapsable'"
              :loading="loading"
              :facet="facet"
              :filter="getFiltersByParamName(facet.paramName)"
              @update:filter="onFacetFilterChanged"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useElementBounding, watchDebounced } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, shallowRef, ref, nextTick, computed } from "vue";
import { useThemeContext } from "@/core/composables";
import FacetFilter from "./facet-filter.vue";
import type { SearchProductFilterResult } from "@/core/api/graphql/types";
import type { ProductsFiltersType } from "@/shared/catalog";
import SliderFilter from "@/shared/catalog/components/product/slider-filter.vue";

interface IEmits {
  (event: "change:filters", value: SearchProductFilterResult[]): void;
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

const localFilters = ref<ProductsFiltersType>({
  facets: [],
  inStock: false,
  branches: [],
  purchasedBefore: false,
  filters: [],
});
const isHorizontal = props.orientation === "horizontal";

const filterCalculationInProgress = ref(false);
const filtersCountToShow = ref(1);

const filtersToShow = computed(() => {
  return props.orientation === "horizontal"
    ? localFilters.value.facets.slice(0, filtersCountToShow.value)
    : localFilters.value.facets;
});

const { right: containerRight } = useElementBounding(facetFiltersContainer);

watchDebounced(
  [containerRight, () => localFilters.value.facets],
  () => {
    if (props.orientation === "horizontal") {
      void calculateFiltersCountToShow();
    }
  },
  { debounce: 300, immediate: true, maxWait: 1000 },
);

async function calculateFiltersCountToShow() {
  filterCalculationInProgress.value = true;

  await nextTick();

  const container = facetFiltersContainer.value;
  if (!container) {
    filterCalculationInProgress.value = false;
    return;
  }

  const allFacets = localFilters.value.facets;

  for (let i = 0; i < allFacets.length; i++) {
    filtersCountToShow.value = i + 1;

    await nextTick();

    const renderedFacetsFilters = getFacetWrapperChildren();

    const lastEl = renderedFacetsFilters?.[renderedFacetsFilters.length - 1];

    if (lastEl) {
      // add offset to avoid flickering when screen width changes slightly
      const safeRight = Math.floor(containerRight.value || 0) - 4;
      const elementRight = Math.ceil(lastEl.getBoundingClientRect().right);

      if (elementRight > safeRight) {
        filtersCountToShow.value = i;
        break;
      }
    } else {
      filtersCountToShow.value = i;
      break;
    }
  }

  filterCalculationInProgress.value = false;
}

function getFacetWrapperChildren() {
  return facetFiltersContainer.value?.querySelectorAll("[data-facet-filter]");
}

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
  // Remove existing filter with the same name
  const updatedFilters = props.filters.filters.filter((f) => f.name !== newFilter.name);

  // Only add the new filter if it is not empty
  if (
    (newFilter.termValues && newFilter.termValues.length > 0) ||
    (newFilter.rangeValues && newFilter.rangeValues.length > 0)
  ) {
    updatedFilters.push(newFilter);
  }

  emit("change:filters", updatedFilters);
}

function facetHasBounce(statistics?: { min?: number; max?: number }) {
  return typeof statistics?.min === "number" && typeof statistics?.max === "number";
}

function getFiltersByParamName(paramName: string) {
  return props.filters.filters.find((el) => el.name === paramName);
}

const { themeContext } = useThemeContext();

function isSliderFilterEnabled() {
  return themeContext.value.settings.range_filter_type === "slider";
}
</script>

<style scoped lang="scss">
:deep(.facet-filter--dropdown:last-child) {
  .vc-popover__content {
    @apply right-0 left-auto #{!important};
  }
}
</style>

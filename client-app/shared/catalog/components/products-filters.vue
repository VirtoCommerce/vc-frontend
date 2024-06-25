<template>
  <div class="space-y-4 lg:space-y-5">
    <template v-if="isMobile">
      <!-- In Stock -->
      <VcWidget size="xs">
        <VcCheckbox v-model="localFilters.inStock" :disabled="loading" @change="onFilterChanged">
          {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
        </VcCheckbox>
      </VcWidget>

      <!-- Branch availability -->
      <VcWidget size="xs">
        <button type="button" @click.prevent="onOpenBranches">
          <VcCheckbox :model-value="!!localFilters.branches.length" :disabled="loading">
            <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div" scope="global">
              <span :class="{ 'font-bold text-[--link-color]': localFilters.branches.length }">
                {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: localFilters.branches.length }) }}
              </span>
            </i18n-t>
          </VcCheckbox>
        </button>

        <div class="ml-0.5 mt-1 pl-6 text-xs font-medium">
          {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
        </div>
      </VcWidget>
    </template>

    <!-- Facet Filters Skeletons -->
    <template v-if="loading && !localFilters.facets.length">
      <VcWidgetSkeleton v-for="i in 6" :key="i" size="xs" head />
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <div
        ref="facetFiltersContainer"
        class="flex gap-4"
        :class="[isHorizontal && ' flex-row items-start', !isHorizontal && 'flex-col items-stretch lg:gap-5']"
      >
        <slot name="prepend" />
        <template v-for="(facet, i) in filtersToShow" :key="facet.paramName">
          <FacetFilter
            :collapse-on-change="isHorizontal"
            :collapse-on-click-outside="isHorizontal"
            :no-wrap="isHorizontal"
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
import { useBreakpoints, breakpointsTailwind, useElementBounding } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, shallowReactive, shallowRef, ref, nextTick, computed } from "vue";
import FacetFilter from "./facet-filter.vue";
import type { FacetItemType } from "@/core/types";
import type { ProductsFilters } from "@/shared/catalog";

interface IEmits {
  (event: "change", value: ProductsFilters): void;
  (event: "openBranches"): void;
}

interface IProps {
  loading?: boolean;
  filters: ProductsFilters;
  orientation?: "vertical" | "horizontal";
}

const facetFiltersContainer = shallowRef<HTMLDivElement | null>(null);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const localFilters = shallowReactive<ProductsFilters>({ facets: [], inStock: false, branches: [] });
const isHorizontal = props.orientation === "horizontal";

const filterCalculationInProgress = ref(false);
const filtersCountToShow = ref(1);
const filtersToShow = computed(() =>
  props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value
    ? localFilters.facets
    : localFilters.facets.slice(0, filtersCountToShow.value),
);
const { right: containerRight } = useElementBounding(facetFiltersContainer);

watch([containerRight, () => localFilters.facets], async () => {
  if (props.orientation === "vertical" || !facetFiltersContainer.value || isMobile.value) {
    return;
  }
  async function calculate() {
    filterCalculationInProgress.value = true;
    const facetsElements =
      (facetFiltersContainer?.value?.querySelectorAll(".vc-widget") as NodeListOf<HTMLElement>) || [];
    let filtersCount = 1;
    for (let i = 0; i < localFilters.facets.length; i++) {
      const facetFilter = facetsElements[i] as HTMLElement;
      if (!facetFilter) {
        filtersCountToShow.value++;
        await nextTick();
        await calculate();
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
  await calculate();
});

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

function onFilterChanged(): void {
  emit("change", localFilters);
}

function onFacetFilterChanged(facet: FacetItemType): void {
  const existingFacet = localFilters.facets.find((item) => item.paramName === facet.paramName);
  if (existingFacet) {
    existingFacet.values = facet.values;
    emit("change", localFilters);
  }
}

function onOpenBranches(): void {
  emit("openBranches");
}
</script>

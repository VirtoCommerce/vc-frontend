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
      <VcFilterCardSkeleton v-for="i in 6" :key="i" is-collapsible />
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <FacetFilter
        v-for="facet in localFilters.facets"
        :key="facet.paramName"
        :facet="facet"
        :loading="loading"
        @update:facet="onFacetFilterChanged"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, shallowReactive } from "vue";
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
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const localFilters = shallowReactive<ProductsFilters>({ facets: [], inStock: false, branches: [] });

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

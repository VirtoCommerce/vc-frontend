<template>
  <div class="space-y-4 lg:space-y-5">
    <!-- Search results -->
    <VcFilterCard v-if="withLocalSearch" :title="$t('pages.catalog.search_card.title')">
      <div class="flex items-center gap-2.5">
        <VcInput
          v-model.trim="localKeyword"
          size="sm"
          maxlength="30"
          :disabled="loading"
          @keypress.enter="onSearchStart"
        >
          <template #append>
            <button type="button" class="h-full px-3" :class="{ hidden: !localKeyword }" @click="reset">
              <svg class="text-[color:var(--color-primary)]" height="12" width="12">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </template>
        </VcInput>

        <VcButton
          :is-disabled="loading || isAppliedKeyword"
          kind="primary"
          class="px-3.5 !text-15 uppercase"
          is-outline
          @click="onSearchStart"
        >
          {{ $t("pages.catalog.search_card.search_button") }}
        </VcButton>
      </div>
    </VcFilterCard>

    <template v-if="isMobile">
      <!-- In Stock -->
      <VcFilterCard :with-header="false">
        <VcCheckbox v-model="localFilters.inStock" :disabled="loading" @change="onFilterChanged">
          {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
        </VcCheckbox>
      </VcFilterCard>

      <!-- Branch availability -->
      <VcFilterCard :with-header="false">
        <button type="button" @click.prevent="onOpenBranches">
          <VcCheckbox :model-value="!!localFilters.branches.length" :disabled="loading">
            <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div" scope="global">
              <span :class="{ 'font-bold text-[color:var(--color-link)]': localFilters.branches.length }">
                {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: localFilters.branches.length }) }}
              </span>
            </i18n-t>
          </VcCheckbox>
        </button>

        <div class="mt-1 ml-0.5 pl-6 text-xs font-medium">
          {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
        </div>
      </VcFilterCard>
    </template>

    <!-- Facet Filters Skeletons -->
    <template v-if="loading && !localFilters.facets.length">
      <VcFilterCardSkeleton v-for="i in 6" :key="i" is-collapsible />
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <VcFilterCard
        v-for="facet in localFilters.facets"
        :key="facet.paramName"
        is-collapsible
        :title="facet.label"
        :is-collapsed="!filterHasSelectedValues(facet)"
      >
        <FacetValues :facet="facet" :loading="loading" @update:facet="onFacetValuesChanged" />

        <!--<VcCheckbox
          v-for="item in facet.values"
          :key="item.value"
          v-model="item.selected"
          :disabled="loading"
          class="mt-3 first:mt-1 last:mb-2"
          @change="onFilterChanged"
        >
          <div class="flex text-13" :class="[item.selected ? 'font-semibold' : 'font-medium text-gray-500']">
            <span class="truncate">{{ item.label }}</span>
            <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
          </div>
        </VcCheckbox>-->
      </VcFilterCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { eagerComputed, useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { watch, ref, shallowReactive } from "vue";
import FacetValues from "./facet-values.vue";
import type { FacetItemType } from "@/core/types";
import type { ProductsFilters } from "@/shared/catalog";

interface IEmits {
  (event: "search", keyword: string): void;
  (event: "change", value: ProductsFilters): void;
  (event: "openBranches"): void;
}

interface IProps {
  loading?: boolean;
  withLocalSearch?: boolean;
  keyword?: string;
  filters: ProductsFilters;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const localKeyword = ref("");
const localFilters = shallowReactive<ProductsFilters>({ facets: [], inStock: false, branches: [] });

watch(
  () => props.filters.facets,
  (newFacets) => (localFilters.facets = cloneDeep(newFacets)),
  { immediate: true }
);

watch(
  () => props.filters.inStock,
  (newValue) => (localFilters.inStock = newValue),
  { immediate: true }
);

watch(
  () => props.filters.branches,
  (newValue) => (localFilters.branches = newValue.slice()),
  { immediate: true }
);

watch(
  () => props.keyword,
  (newKeyword) => (localKeyword.value = newKeyword ?? ""),
  { immediate: true }
);

const isAppliedKeyword = eagerComputed<boolean>(() => localKeyword.value === props.keyword);

const filterHasSelectedValues = (facet: FacetItemType) => facet.values.some((value) => value.selected);

function onFilterChanged(): void {
  emit("change", localFilters);
}

function onFacetValuesChanged(facet: FacetItemType): void {
  const existingFacet = localFilters.facets.find((item) => item.paramName === facet.paramName);
  if (existingFacet) {
    existingFacet.values = facet.values;
    emit("change", localFilters);
  }
}

function onSearchStart(): void {
  emit("search", localKeyword.value);
}

function onOpenBranches(): void {
  emit("openBranches");
}

function reset(): void {
  localKeyword.value = "";
  emit("search", "");
}
</script>

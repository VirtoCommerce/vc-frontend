<template>
  <div class="space-y-4 lg:space-y-5">
    <!-- Search results -->
    <VcFilterCard v-if="withLocalSearch" :title="$t('pages.catalog.search_card.title')">
      <div class="flex gap-2.5">
        <div class="relative">
          <VcInput
            v-model="localKeyword"
            class="h-8 w-full flex-1"
            input-class="leading-8 !h-8 !pl-2 !pr-6"
            maxlength="30"
            :is-disabled="loading"
            @keypress.enter="onSearchStart"
          />

          <button v-if="localKeyword" class="absolute right-[10px] top-[10px]" @click="reset">
            <svg class="text-[color:var(--color-primary)]" height="12" width="12">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton
          :is-disabled="loading || isAppliedKeyword"
          kind="primary"
          size="sm"
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
        <button @click.prevent="onOpenBranches">
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
        <VcCheckbox
          v-for="item in facet.values"
          :key="item.value"
          v-model="item.selected"
          :disabled="loading"
          class="mt-3 first:mt-1 last:mb-2"
          @change="onFilterChanged"
        >
          <div class="text-13" :class="[item.selected ? 'font-semibold' : 'font-medium text-gray-500']">
            <span class="truncate">{{ item.label }}</span>
            <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
          </div>
        </VcCheckbox>
      </VcFilterCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { eagerComputed, useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import _ from "lodash";
import { watch, PropType, ref, shallowReactive } from "vue";
import { FacetItem } from "@/core/types";
import { ProductsFilters } from "@/shared/catalog";

const emit = defineEmits<{
  (e: "search", keyword: string): void;
  (e: "change", value: ProductsFilters): void;
  (e: "openBranches"): void;
}>();
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  keyword: {
    type: String,
    default: "",
  },

  filters: {
    type: Object as PropType<ProductsFilters>,
    required: true,
  },

  withLocalSearch: {
    type: Boolean,
    default: true,
  },
});
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const localKeyword = ref("");
const localFilters = shallowReactive<ProductsFilters>({ facets: [], inStock: false, branches: [] });

watch(
  () => props.filters.facets,
  (newFacets) => (localFilters.facets = _.cloneDeep(newFacets)),
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

const filterHasSelectedValues = (facet: FacetItem) => _.some(facet.values, (value) => value.selected);

function onFilterChanged() {
  emit("change", localFilters);
}

function onSearchStart() {
  emit("search", localKeyword.value);
}

function onOpenBranches() {
  emit("openBranches");
}

function reset() {
  localKeyword.value = "";
  emit("search", "");
}
</script>

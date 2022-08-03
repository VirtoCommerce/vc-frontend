<template>
  <div class="space-y-4 lg:space-y-5">
    <!-- Search results -->
    <VcFilterCard :title="$t('pages.catalog.search_card.title')">
      <div class="flex gap-2.5">
        <div class="relative">
          <input
            v-model="_keyword"
            class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
            type="text"
            maxlength="30"
            :disabled="loading"
            @keypress.enter="onSearchStart"
          />

          <button v-if="_keyword" class="absolute right-[10px] top-[10px]" @click="reset">
            <svg class="text-[color:var(--color-products-filter-button)]" height="12" width="12">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton
          :is-disabled="loading || isAppliedKeyword"
          kind="custom"
          class="px-3.5 uppercase !border-current text-[color:var(--color-products-filter-button)] hover:text-primary !text-15"
          size="sm"
          is-outline
          @click="onSearchStart"
        >
          {{ $t("pages.catalog.search_card.search_button") }}
        </VcButton>
      </div>
    </VcFilterCard>

    <!-- Branch availability -->
    <VcFilterCard v-if="isMobile" :with-header="false">
      <div class="relative cursor-pointer" @click="onOpenBranches">
        <VcCheckbox :model-value="!!filters.availableIn?.length" :disabled="loading">
          <i18n-t keypath="pages.catalog.branch_availability_filter_card.available_in" tag="div">
            <b v-if="filters.availableIn?.length" class="text-[color:var(--color-link)]">
              {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: filters.availableIn?.length }) }}
            </b>
            <template v-else>
              {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: filters.availableIn?.length }) }}
            </template>
          </i18n-t>
        </VcCheckbox>
        <div class="absolute inset-0"></div>
      </div>
      <div class="mt-1 ml-0.5 pl-6 text-xs font-medium">
        {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
      </div>
    </VcFilterCard>

    <!-- Previously purchased -->
    <VcFilterCard v-if="isMobile" :title="$t('pages.catalog.instock_filter_card.title')">
      <VcCheckbox v-model="_filters.inStock" :disabled="loading" @change="onFilterChanged">
        {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
      </VcCheckbox>
    </VcFilterCard>

    <!-- Facet Filters Skeletons -->
    <template v-if="loading && !_filters.facets.length">
      <VcFilterCardSkeleton is-collapsible v-for="i in 6" :key="i" />
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <VcFilterCard
        is-collapsible
        v-for="facet in _filters.facets"
        :key="facet.paramName"
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
          <div class="text-13">
            <span class="truncate">{{ item.label }}</span>
            <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
          </div>
        </VcCheckbox>
      </VcFilterCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ProductsFilters, ProductsFacet } from "@/shared/catalog";
import { eagerComputed, useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { watch, onMounted, PropType, ref, shallowReactive, toRefs } from "vue";
import _ from "lodash";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const _keyword = ref("");
const _filters = shallowReactive<ProductsFilters>({ facets: [], inStock: false });

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  keyword: {
    type: String,
    required: true,
  },
  filters: {
    type: Object as PropType<ProductsFilters>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "search", keyword: string): void;
  (e: "change", value: ProductsFilters): void;
  (e: "openBranches"): void;
}>();

const { loading, keyword, filters } = toRefs(props);

onMounted(() => {
  _keyword.value = keyword.value;
  _filters.facets = _.cloneDeep(filters.value.facets);
  _filters.inStock = props.filters.inStock;
  _filters.availableIn = _.cloneDeep(props.filters.availableIn);
});

watch(
  () => filters.value.facets,
  (newFacets) => {
    _filters.facets = _.cloneDeep(newFacets);
  }
);

watch(
  () => filters.value.inStock,
  (newValue) => {
    _filters.inStock = newValue;
  }
);

watch(
  () => filters.value.availableIn,
  (newValue) => {
    _filters.availableIn = _.cloneDeep(newValue);
  }
);

watch(keyword, (newKeyword) => (_keyword.value = newKeyword ?? ""));

const isAppliedKeyword = eagerComputed<boolean>(() => _keyword.value == keyword.value);

const filterHasSelectedValues = (facet: ProductsFacet) => _.some(facet.values, (value) => value.selected);

function onFilterChanged() {
  emit("change", _filters);
}
function onSearchStart() {
  emit("search", _keyword.value);
}

function onOpenBranches() {
  emit("openBranches");
}

function reset() {
  _keyword.value = "";
  emit("search", "");
}
</script>

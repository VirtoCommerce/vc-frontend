<template>
  <div class="flex flex-col gap-4 lg:gap-5">
    <!-- Search results -->
    <VcCard :title="$t('pages.catalog.search_card.title')">
      <p class="text-sm pb-2" v-t="'pages.catalog.search_card.search_label'"></p>
      <div class="flex gap-3">
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
            <svg class="text-[color:var(--color-primary)]" height="12" width="12">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton
          :is-disabled="loading || isAppliedKeyword"
          class="px-5 uppercase"
          outline
          size="sm"
          @click="onSearchStart"
        >
          {{ $t("pages.catalog.search_card.search_button") }}
        </VcButton>
      </div>
    </VcCard>

    <!-- Branch availability -->
    <VcCard v-if="isMobile" :with-header="false">
      <div class="relative cursor-pointer" @click="onOpenBranches">
        <VcCheckbox :model-value="!!availableIn?.length" :disabled="loading" class="hidden md:flex">
          <div
            v-html="$t('pages.catalog.branch_availability_filter_card.available_in', { n: availableIn?.length })"
          ></div>
        </VcCheckbox>
        <div class="absolute inset-0"></div>
      </div>
      <div class="mt-1 text-xs font-medium">
        {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
      </div>
    </VcCard>

    <!-- Previously purchased -->
    <VcCard :title="$t('pages.catalog.instock_filter_card.title')">
      <VcCheckbox v-model="_filters.inStock" :disabled="loading" @change="onFilterChanged">
        {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
      </VcCheckbox>
    </VcCard>

    <!-- Facet Filters Skeletons -->
    <template v-if="loading && !_filters.facets.length">
      <VcCardSkeleton is-collapsible v-for="i in 6" :key="i">
        <!-- TODO: add checkbox skeleton -->
        <div class="flex items-center mt-3 first:mt-0" v-for="i in 5" :key="i">
          <div class="w-5 h-5 bg-gray-100 inline-block"></div>
          <div class="ml-2 text-sm bg-gray-100 w-11/12">&nbsp;</div>
        </div>
      </VcCardSkeleton>
    </template>

    <!-- Facet Filters -->
    <template v-else>
      <VcCard
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
          class="mt-3 first:mt-0"
          @change="onFilterChanged"
        >
          <div class="flex">
            <span class="truncate">{{ item.label }}</span>
            <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
          </div>
        </VcCheckbox>
      </VcCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ProductsFilters, ProductsFacet } from "@/shared/catalog";
import { eagerComputed, breakpointsTailwind, useBreakpoints } from "@vueuse/core";
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
  availableIn: {
    type: Array as PropType<string[]>,
    default: []
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

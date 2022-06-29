<template>
  <div class="flex flex-col gap-4 lg:gap-5">
    <!-- Search results -->
    <VcCard :title="$t('pages.catalog.search_card.title')">
      <p class="text-sm pb-2" v-t="'pages.catalog.search_card.search_label'"></p>
      <div class="flex gap-3">
        <input
          v-model="_keyword"
          class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
          type="text"
          maxlength="30"
          :disabled="loading"
          @keypress.enter="onSearchStart"
        />

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

    <!-- Previously purchased -->
    <VcCard :title="$t('pages.catalog.instock_filter_card.title')">
      <VcCheckbox v-model="_filters.inStock" :disabled="loading" @change="onFilterChanged">
        {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
      </VcCheckbox>
    </VcCard>

    <!-- Branch availability -->
    <VcCard :title="$t('pages.catalog.branch_availability_filter_card.title')">
      <p class="text-sm font-medium">
        <span
          class="text-[color:var(--color-link)] font-semibold cursor-pointer hover:text-[color:var(--color-link-hover)]"
        >
          {{ $t("pages.catalog.branch_availability_filter_card.select_branch_link") }}
        </span>
        {{ $t("pages.catalog.branch_availability_filter_card.select_branch_link_end") }}
      </p>
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
import { eagerComputed } from "@vueuse/core";
import { watch, onMounted, PropType, ref, shallowReactive, toRefs } from "vue";
import _ from "lodash";

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
</script>

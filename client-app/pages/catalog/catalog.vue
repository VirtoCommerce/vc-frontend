<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="mb-2 md:mb-8" :items="breadcrumbsItems"></Breadcrumbs>

      <div class="flex items-start lg:gap-6">
        <!-- Mobile sidebar back cover -->
        <div
          :class="{ hidden: !mobileSidebarVisible }"
          class="fixed z-40 inset-0 w-full h-screen lg:hidden bg-gray-800 opacity-95"
          @click="hideMobileSidebar"
        />

        <!-- Sidebar -->
        <div
          ref="sidebarElement"
          :class="[
            { hidden: !mobileSidebarVisible },
            isMobileSidebar
              ? 'fixed z-50 inset-0 w-72 h-screen overflow-y-auto px-5 py-12 bg-white'
              : 'lg:flex lg:w-1/4 xl:w-1/5 flex-shrink-0',
          ]"
        >
          <div class="flex flex-col gap-4 lg:gap-5 overflow-hidden">
            <!-- Search results -->
            <VcCard :title="$t('pages.catalog.search_card.title')">
              <p class="text-sm pb-2" v-t="'pages.catalog.search_card.search_label'"></p>
              <div class="flex gap-3">
                <input
                  v-model="keyword"
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
            <VcCard :title="$t('pages.catalog.purchased_filter_card.title')">
              <VcCheckbox color="[color:var(--color-link)]">
                {{ $t("pages.catalog.purchased_filter_card.checkbox_label") }}
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
            <template v-if="loading && !filters.length">
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
                v-for="(filter, index) in filters"
                :key="`${filter.paramName}_${index}`"
                :title="filter.label"
                is-collapsible
              >
                <VcCheckbox
                  v-for="(item, itemIndex) in filter.values"
                  :key="`${item.value}_${index}_${itemIndex}`"
                  v-model="item.selected"
                  :value="item.value"
                  :disabled="loading"
                  class="mt-3 first:mt-0"
                  @change="applyFilters"
                >
                  <div class="flex">
                    <span class="truncate">{{ item.label }}</span>
                    <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
                  </div>
                </VcCheckbox>
              </VcCard>
            </template>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow">
          <div class="flex flex-col">
            <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ selectedCategory?.label }}</h2>

            <p class="py-3">
              <span class="font-extrabold">{{ $t("pages.catalog.products_found_message", [total]) }}</span>
            </p>

            <div class="flex justify-start mb-6 mt-4">
              <!-- Mobile filters toggler -->
              <div class="lg:hidden mr-3">
                <VcButton class="px-4 font-extrabold" size="md" @click="mobileSidebarVisible = true">
                  <i class="fas fa-filter mr-1"></i> {{ $t("pages.catalog.filters_button") }}
                </VcButton>
              </div>

              <!-- View options -->
              <ViewMode v-model:mode="viewModeQueryParam" class="hidden md:inline-flex mr-6" />

              <!-- Sorting -->
              <div class="flex items-center flex-grow md:flex-grow-0 ml-auto">
                <span class="hidden lg:block shrink-0 mr-2" v-t="'pages.catalog.sort_by_label'"></span>

                <VcSelect
                  v-model="sortQueryParam"
                  text-field="name"
                  value-field="id"
                  :is-disabled="loading"
                  :items="productSortingList"
                  class="w-full md:w-52 lg:w-64"
                />
              </div>
            </div>
          </div>

          <!-- Products -->
          <DisplayProducts
            :loading="loading"
            :view-mode="viewModeQueryParam"
            :items-per-page="itemsPerPage"
            :products="products"
            :class="
              viewModeQueryParam === 'list'
                ? 'space-y-5'
                : 'grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 xl:gap-x-6 xl:gap-y-8'
            "
          >
            <template #cart-handler="{ item }">
              <VcButton
                v-if="item.hasVariations"
                :to="{ name: 'Product', params: { productId: item.id } }"
                :class="{ 'w-full': viewModeQueryParam === 'list' }"
                class="uppercase mb-4"
              >
                {{ $t("pages.catalog.choose_button") }}
              </VcButton>

              <AddToCart v-else :product="item" />
            </template>
          </DisplayProducts>

          <VcInfinityScrollLoader
            v-if="!loading"
            :loading="loadingMore"
            distance="400"
            class="mt-9 -mb-6"
            @visible="loadMoreProducts"
          />
          <VcScrollTopButton></VcScrollTopButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  shallowRef,
  watch,
  onMounted,
  watchEffect,
  PropType,
  onBeforeUnmount,
  WatchStopHandle,
} from "vue";
import { breakpointsTailwind, useBreakpoints, whenever } from "@vueuse/core";
import {
  Breadcrumbs,
  IBreadcrumbsItem,
  DisplayProducts,
  toFilterExpression,
  useCategories,
  useProducts,
  ViewMode,
  ProductsSearchParams,
} from "@/shared/catalog";
import {
  VcButton,
  VcCard,
  VcCardSkeleton,
  VcCheckbox,
  VcInfinityScrollLoader,
  VcSelect,
  VcScrollTopButton,
} from "@/components";
import { AddToCart } from "@/shared/cart";
import { useRouteQueryParam } from "@core/composables";
import { defaultPageSize, productSortingList } from "@core/constants";
import QueryParamName from "@core/query-param-name.enum";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const watchStopHandles: WatchStopHandle[] = [];

const props = defineProps({
  categorySeoUrls: {
    type: [String, Array] as PropType<string | string[]>,
    default: "",
  },
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const { selectedCategory, selectCategoryBySeoUrl, loadCategoriesTree } = useCategories();
const { fetchProducts, fetchMoreProducts, loading, loadingMore, products, total, pages, filters } = useProducts({
  withFilters: true,
});

const isMobile = breakpoints.smaller("md");
const isMobileSidebar = breakpoints.smaller("lg");
const mobileSidebarVisible = ref(false);
const sidebarElement = shallowRef<HTMLElement | null>(null);
const keyword = ref("");
const page = ref(1);
const itemsPerPage = ref(defaultPageSize);

const viewModeQueryParam = useRouteQueryParam<"grid" | "list">("viewMode", {
  defaultValue: "grid",
  validator: (value) => (isMobile.value ? false : ["grid", "list"].includes(value)),
});

const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
  defaultValue: productSortingList[0].id,
  validator: (value) => productSortingList.some((item) => item.id === value),
});

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const filterQueryParam = useRouteQueryParam<string>(QueryParamName.Filter, {
  defaultValue: "",
});

const categorySeoUrl = computed<string>(() =>
  typeof props.categorySeoUrls === "string"
    ? props.categorySeoUrls
    : props.categorySeoUrls?.[props.categorySeoUrls?.length - 1] ?? ""
);

const searchParams = computed<ProductsSearchParams>(() => ({
  categoryId: selectedCategory.value?.id,
  itemsPerPage: itemsPerPage.value,
  sort: sortQueryParam.value,
  keyword: keywordQueryParam.value,
  filter: filterQueryParam.value,
}));

const isAppliedKeyword = computed<boolean>(() => keyword.value === keywordQueryParam.value);

const breadcrumbsItems = computed<IBreadcrumbsItem[]>(() => {
  const items: IBreadcrumbsItem[] = [{ url: "/", title: t("common.links.home") }];

  if (selectedCategory.value) {
    items.push({
      title: selectedCategory.value.label!,
    });
  }

  return items;
});

function hideMobileSidebar() {
  mobileSidebarVisible.value = false;

  if (sidebarElement.value) {
    sidebarElement.value.scrollTop = 0;
  }
}

function onSearchStart() {
  const searchText = keyword.value;

  if (searchText !== keywordQueryParam.value && searchText.length <= 30) {
    hideMobileSidebar();
    keywordQueryParam.value = searchText;
  }
}

function applyFilters() {
  hideMobileSidebar();
  filterQueryParam.value = toFilterExpression(filters);
}

async function loadProducts() {
  page.value = 1;
  await fetchProducts(searchParams.value);
}

async function loadMoreProducts() {
  if (page.value === pages.value) {
    return;
  }

  const nextPage = page.value + 1;

  page.value = nextPage;

  await fetchMoreProducts({
    ...searchParams.value,
    page: nextPage,
  });
}

onMounted(async () => {
  await loadCategoriesTree(""); // TODO: use active category key instead of id
  selectCategoryBySeoUrl(categorySeoUrl.value);
  await loadProducts();

  // Start change tracking after initial data load
  watchStopHandles.push(
    /**
     * You must force the watch to stop before unmounting the component
     * because the computed value being watched includes the global reactive object.
     * In this case, it is the "current route" inside the "useRouteQueryParam" function.
     *
     * Related links:
     * https://github.com/vuejs/core/issues/2291
     */
    watch(
      computed(() => JSON.stringify(searchParams.value)),
      loadProducts,
      {
        flush: "post",
      }
    )
  );
});

onBeforeUnmount(() => {
  watchStopHandles.forEach((watchStopHandle) => watchStopHandle());
});

watchEffect(() => (keyword.value = keywordQueryParam.value ?? ""));
whenever(() => !isMobileSidebar.value, hideMobileSidebar);
watch(categorySeoUrl, selectCategoryBySeoUrl);
</script>

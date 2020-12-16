<template>
  <div id="category">
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"></SfBreadcrumbs>
    <div class="navbar section">
      <div class="navbar__aside desktop-only">
        <SfHeading :level="3"
                   title="Categories"
                   class="navbar__title"></SfHeading>
      </div>
      <div class="navbar__main">
        <SfButton
          class="sf-button--text navbar__filters-button"
          data-cy="category-btn_filters"
          aria-label="Filters"
          @click="toggleFilterSidebar">
          <SfIcon
            size="24px"
            color="dark-secondary"
            icon="filter2"
            class="navbar__filters-icon"
            data-cy="category-icon_"></SfIcon>
          Filters
        </SfButton>
        <div class="navbar__sort desktop-only">
          <span class="navbar__label">Sort by:</span>
          <SfSelect
            :value="sortBy.selected"
            placeholder="Select sorting"
            data-cy="category-select_sortBy"
            class="navbar__select"
            @input="changeSorting">
            <SfSelectOption
              v-for="option in sortBy.options"
              :key="option.id"
              :value="option.id"
              class="sort-by__option">
              {{ option.value }}
            </SfSelectOption>
          </SfSelect>
        </div>
        <div class="navbar__counter">
          <span class="navbar__label desktop-only">Products found: </span>
          <span class="desktop-only">{{ pagination.totalItems }}</span>
          <span class="navbar__label smartphone-only">{{ pagination.totalItems }} Items</span>
        </div>
        <div class="navbar__view">
          <span class="navbar__view-label desktop-only">View</span>
          <SfIcon
            data-cy="category-icon_grid-view"
            class="navbar__view-icon"
            color="black"
            icon="tiles"
            size="12px"
            role="button"
            aria-label="Change to grid view"
            aria-pressed="true"
            @click="toggleCategoryGridView"></SfIcon>
          <SfIcon
            data-cy="category-icon_list-view"
            class="navbar__view-icon"
            color="black"
            icon="list"
            size="12px"
            role="button"
            aria-label="Change to list view"
            aria-pressed="true"
            @click="toggleCategoryGridView"></SfIcon>
        </div>
      </div>
    </div>
    <div class="main section">
      <div class="sidebar desktop-only">
        <h1>filter panel (todo)</h1>
      </div>
      <SfLoader :class="{ loading }" :loading="loading">
        <div v-if="!loading" class="products">
          <SfProductCard
            v-for="(product, i) in products"
            :key="product.slug"
            data-cy="category-product-card"
            :style="{ '--index': i }"
            :title="product.name"
            :image="product.imgSrc"
            :regular-price="product.price ? product.price.list.amount : 0"
            :special-price="product.price ? product.price.list.amount : 0"
            :max-rating="5"
            :score-rating="0"
            :show-add-to-cart-button="true"
            :is-on-wishlist="false"
            :is-added-to-cart="false"
            link=""
            class="products__product-card"
            @click:wishlist="addToWishlist(product)"
            @click:add-to-cart="addToCart(product, 1)"></SfProductCard>


          <SfPagination
            v-if="!loading"
            v-show="pagination.totalPages > 1"
            data-cy="category-pagination"
            class="products__pagination desktop-only"
            :current="pagination.currentPage"
            :total="pagination.totalPages"
            :visible="5"></SfPagination>
          <div
            v-show="pagination.totalPages > 1"
            class="products__show-on-page">
            <span class="products__show-on-page__label">Show on page:</span>
            <SfSelect
              :value="pagination.itemsPerPage"
              class="products__items-per-page"
              @input="changeItemsPerPage">
              <SfSelectOption
                v-for="option in pagination.pageOptions"
                :key="option"
                :value="option"
                class="products__items-per-page__option">
                {{ option }}
              </SfSelectOption>
            </SfSelect>
          </div>
        </div>
      </SfLoader>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  // SfSidebar,
  SfButton,
  // SfList,
  SfIcon,
  SfHeading,
  // SfMenuItem,
  // SfFilter,
  SfProductCard,
  // SfProductCardHorizontal,
  SfPagination,
  // SfAccordion,
  SfSelect,
  SfBreadcrumbs,
  SfLoader
  // SfColor,
  // SfProperty
} from '@storefront-ui/vue';
import { ref, computed, onMounted, watchEffect} from '@vue/composition-api';
import { useProducts } from '@libs/catalog'
import { ProductType } from '@core/api/graphql/types';

export default {
  transition: 'fade',
  setup(props, context) {
    const th = {};
    const uiState = {};
    const { addToCart, isOnCart } = {} ;
    const { addToWishlist } = {};
    const { result, search } = {};
    const categoryTree = computed(() => []);
    const breadcrumbs = computed(() => []);
    const sortBy = computed(() => []);
    const facets = computed(() => ['color', 'size']);
    const pagination = computed(() => []);

    const { fetchProducts, products, total, loading } = useProducts();

    watchEffect(() => console.log(loading.value))

    onMounted(async () => await fetchProducts())

    // const activeCategory = computed(() => {
    //   const items = categoryTree.value.items;

    //   if (!items) {
    //     return '';
    //   }

    //   const category = items.find(({ isCurrent, items }) => isCurrent || items.find(({ isCurrent }) => isCurrent));

    //   return category?.label || items[0].label;
    // });

    //await search();

    // const { changeFilters, isFacetColor } = useUiHelpers();
    const  toggleFilterSidebar  =  () => { console.log("toggleFilterSidebar"); };
    const  toggleCategoryGridView  =  () => { console.log("toggleCategoryGridView"); };
    const  changeItemsPerPage  =  () => { console.log("changeItemsPerPage"); };
    const  changeSorting  =  () => { console.log("changeSorting"); };

    // const selectedFilters = ref({});

    //const isFilterSelected = (facet, option) => (selectedFilters.value[facet.id] || []).includes(option.id);

    // const selectFilter = (facet, option) => {
    //   if (!selectedFilters.value[facet.id]) {
    //     Vue.set(selectedFilters.value, facet.id, []);
    //   }

    //   if (selectedFilters.value[facet.id].find(f => f === option.id)) {
    //     selectedFilters.value[facet.id] = selectedFilters.value[facet.id].filter(f => f !== option.id);
    //     return;
    //   }

    //   selectedFilters.value[facet.id].push(option.id);
    // };

    // const clearFilters = () => {
    //   toggleFilterSidebar();
    //   selectedFilters.value = {};
    //   changeFilters(selectedFilters.value);
    // };

    // const applyFilters = () => {
    //   toggleFilterSidebar();
    //   changeFilters(selectedFilters.value);
    // };

    return {
      ...uiState,
      th,
      products,
      categoryTree,
      loading,
      pagination,
      sortBy,
      facets,
      breadcrumbs,
      toggleFilterSidebar,
      toggleCategoryGridView,
      changeItemsPerPage,
      changeSorting
    };
  },
  components: {
    SfButton,
    // SfSidebar,
    SfIcon,
    // SfList,
    // SfFilter,
    SfProductCard,
    // SfProductCardHorizontal,
    SfPagination,
    // SfMenuItem,
    // SfAccordion,
    SfSelect,
    SfBreadcrumbs,
    SfLoader,
    // SfColor,
    SfHeading
    // SfProperty
  }
};
</script>

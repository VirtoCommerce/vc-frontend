<template>
  <div id="category">
    <!-- Breadcrumbs -->
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"></SfBreadcrumbs>
    <!-- Horizontal navigation bar-->
    <div class="navbar section">
      <div class="navbar__aside desktop-only">
        <SfHeading
          :level="3"
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
          <!-- Grid view-->
          <div class="products__grid">
            <!-- Products loop -->
            <SfProductCard
              v-for="(product, i) in products"
              :key="product.slug"
              data-cy="category-product-card"
              :style="{ '--index': i }"
              :title="product.name"
              :image="product.imgSrc"
              :regular-price="product.price.list.amount"
              :special-price="product.price.list.amount"
              :max-rating="5"
              :score-rating="0"
              :show-add-to-cart-button="true"
              :is-on-wishlist="false"
              :is-added-to-cart="false"
              link=""
              class="products__product-card"
              @click:wishlist="addToWishlist(product)"
              @click:add-to-cart="addToCart(product, 1)"></SfProductCard>
          </div>
          <!-- Pagination -->
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
import { ref, computed, onMounted } from '@vue/composition-api';
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
    const loading = computed(() => false );
    const categoryTree = computed(() => []);
    const breadcrumbs = computed(() => []);
    const sortBy = computed(() => []);
    const facets = computed(() => ['color', 'size']);
    const pagination = computed(() => []);

    const { fetchProducts, products, total } = useProducts();

    onMounted(() => fetchProducts())

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
<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#category {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1240px;
    margin: 0 auto;
  }
}
.main {
  &.section {
    padding: var(--spacer-xs);
    @include for-desktop {
      padding: 0;
    }
  }
}
.breadcrumbs {
  padding: var(--spacer-base) var(--spacer-base) var(--spacer-base)
    var(--spacer-sm);
}
.navbar {
  position: relative;
  display: flex;
  border: 1px solid var(--c-light);
  border-width: 0 0 1px 0;
  @include for-desktop {
    border-width: 1px 0 1px 0;
  }
  &.section {
    padding: var(--spacer-sm);
    @include for-desktop {
      padding: 0;
    }
  }
  &__aside,
  &__main {
    display: flex;
    align-items: center;
    padding: var(--spacer-sm) 0;
  }
  &__aside {
    flex: 0 0 15%;
    padding: var(--spacer-sm) var(--spacer-sm);
    border: 1px solid var(--c-light);
    border-width: 0 1px 0 0;
  }
  &__main {
    flex: 1;
    padding: 0;
    @include for-desktop {
      padding: var(--spacer-xs) var(--spacer-xl);
    }
  }
  &__title {
    --heading-title-font-weight: var(--font-weight--semibold);
    --heading-title-font-size: var(--font-size--xl);
  }
  &__filters-icon {
    margin: 0 var(--spacer-xs) 0 0;
  }
  &__filters-button {
    display: flex;
    align-items: center;
    --button-font-size: var(--font-size--base);
    --button-text-decoration: none;
    --button-color: var(--c-link);
    --button-font-weight: var(--font-weight--normal);
    @include for-mobile {
      order: 1;
    }
    svg {
      fill: var(--c-text-muted);
      transition: fill 150ms ease;
    }
    &:hover {
      svg {
        fill: var(--c-primary);
      }
    }
  }
  &__label {
    font-family: var(--font-family--secondary);
    font-weight: var(--font-weight--normal);
    color: var(--c-link);
    margin: 0 var(--spacer-2xs) 0 0;
  }
  &__select {
    --component-select-width: 220px;
    --component-select-padding: 0;
    --component-select-selected-padding: 0 var(--spacer-lg) 0 var(--spacer-2xs);
    --component-select-margin: 0;
    --component-select-error-message-height: 0;
  }
  &__sort {
    display: flex;
    align-items: center;
    margin: 0 auto 0 var(--spacer-2xl);
  }
  &__counter {
    font-family: var(--font-family--secondary);
    margin: auto;
    @include for-desktop {
      margin: auto 0 auto auto;
    }
  }
  &__view {
    display: flex;
    align-items: center;
    margin: 0 var(--spacer-xl);
    @include for-desktop {
      margin: 0 0 0 var(--spacer-2xl);
    }
    &-icon {
      cursor: pointer;
      margin: 0 var(--spacer-base) 0 0;
      &:last-child {
        margin: 0;
      }
    }
    &-label {
      margin: 0 var(--spacer-sm) 0 0;
      font: var(--font-weight--normal) var(--font-size--base) / 1.6
        var(--font-family--secondary);
      text-decoration: none;
      color: var(--c-link);
    }
  }
}
.sort-by {
  --component-select-dropdown-z-index: 1;
  flex: unset;
  width: 11.875rem;
}
.main {
  display: flex;
}
.sidebar {
  flex: 0 0 15%;
  padding: var(--spacer-sm);
  border: 1px solid var(--c-light);
  border-width: 0 1px 0 0;
}
.sidebar-filters {
  --sidebar-title-display: none;
  --sidebar-top-padding: 0;
  @include for-desktop {
    --sidebar-content-padding: 0 var(--spacer-xl);
    --sidebar-bottom-padding: 0 var(--spacer-xl);
  }
}
.list {
  --menu-item-font-size: var(--font-size--sm);
  &__item {
    &:not(:last-of-type) {
      --list-item-margin: 0 0 var(--spacer-sm) 0;
    }
  }
}
.products {
  box-sizing: border-box;
  flex: 1;
  margin: 0;
  &__grid,
  &__list {
    display: flex;
    flex-wrap: wrap;
  }
  &__grid {
    justify-content: space-between;
  }
  &__product-card {
    --product-card-max-width: 50%;
    --product-card-title-margin: var(--spacer-base) 0 0 0;
    flex: 1 1 50%;
  }
  &__product-card-horizontal {
    flex: 0 0 100%;
  }
  &__slide-enter {
    opacity: 0;
    transform: scale(0.5);
  }
  &__slide-enter-active {
    transition: all 0.2s ease;
    transition-delay: calc(0.1s * var(--index));
  }
  @include for-desktop {
    margin: var(--spacer-sm) 0 0 var(--spacer-sm);
    &__pagination {
      display: flex;
      justify-content: flex-start;
      margin: var(--spacer-xl) 0 0 0;
    }
    &__product-card-horizontal {
      margin: var(--spacer-lg) 0;
    }
    &__product-card {
      flex: 1 1 25%;
    }
    &__list {
      margin: 0 0 0 var(--spacer-sm);
    }
  }
  &__show-on-page {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    &__label {
      font-family: var(--font-family--secondary);
      font-size: var(--font-size--sm);
    }
  }
}
.filters {
  &__title {
    --heading-title-font-size: var(--font-size--xl);
    margin: var(--spacer-xl) 0 var(--spacer-base) 0;
    &:first-child {
      margin: calc(var(--spacer-xl) + var(--spacer-base)) 0 var(--spacer-xs) 0;
    }
  }
  &__colors {
    display: flex;
  }
  &__color {
    margin: var(--spacer-xs) var(--spacer-xs) var(--spacer-xs) 0;
  }
  &__chosen {
    color: var(--c-text-muted);
    font-weight: var(--font-weight--normal);
    font-family: var(--font-family--secondary);
    position: absolute;
    right: var(--spacer-xl);
  }
  &__item {
    --radio-container-padding: 0 var(--spacer-sm) 0 var(--spacer-xl);
    --radio-background: transparent;
    --filter-label-color: var(--c-secondary-variant);
    --filter-count-color: var(--c-secondary-variant);
    --checkbox-padding: 0 var(--spacer-sm) 0 var(--spacer-xl);
    padding: var(--spacer-sm) 0;
    border-bottom: 1px solid var(--c-light);
    &:last-child {
      border-bottom: 0;
    }
    @include for-desktop {
      --checkbox-padding: 0;
      margin: var(--spacer-sm) 0;
      border: 0;
      padding: 0;
    }
  }
  &__accordion-item {
    --accordion-item-content-padding: 0;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    width: 100vw;
  }
  &__buttons {
    margin: var(--spacer-sm) 0;
  }
  &__button-clear {
    --button-background: var(--c-light);
    --button-color: var(--c-dark-variant);
    margin: var(--spacer-xs) 0 0 0;
  }
}
</style>

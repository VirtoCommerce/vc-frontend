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
          {{ $t('collections.filter.title') }}
        </SfButton>

        <div class="navbar__sort desktop-only">
          <span class="navbar__label">{{ $t('collections.sorting.title') }}:</span>
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
          <span class="desktop-only">{{ totalItems }}</span>
          <span class="navbar__label smartphone-only">{{ totalItems }} Items</span>
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
            @click="changeGridViewStyle(true)"></SfIcon>
          <SfIcon
            data-cy="category-icon_list-view"
            class="navbar__view-icon"
            color="black"
            icon="list"
            size="12px"
            role="button"
            aria-label="Change to list view"
            aria-pressed="true"
            @click="changeGridViewStyle(false)"></SfIcon>
        </div>
      </div>
    </div>
    <div class="main section">
      <div class="sidebar desktop-only">
        <SfLoader
          :class="{ loading: categoryTreeLoading }"
          :loading="categoryTreeLoading">
          <SfAccordion
            :open="activeCategory"
            :show-chevron="true">
            <SfAccordionItem
              v-for="(cat, i) in categoryTree && categoryTree.items"
              :key="i"
              :header="cat.label">
              <template>
                <SfList class="list">
                  <SfListItem class="list__item">
                    <SfMenuItem
                      :count="cat.count || ''"
                      :data-cy="`category-link_subcategory_${cat.slug}`"
                      :label="cat.label">
                      <template #label>
                        <SfLink
                          :href="cat.slug"
                          :class="cat.isCurrent ? 'sidebar--cat-selected' : ''">
                          All
                        </SfLink>
                      </template>
                    </SfMenuItem>
                  </SfListItem>
                  <SfListItem
                    v-for="(subCat, j) in cat.items"
                    :key="j"
                    class="list__item">
                    <SfMenuItem
                      :count="subCat.count || ''"
                      :data-cy="`category-link_subcategory_${subCat.slug}`"
                      :label="subCat.label">
                      <template #label="{ label }">
                        <SfLink
                          :href="subCat.slug"
                          :class="subCat.isCurrent ? 'sidebar--cat-selected' : ''">
                          {{ label }}
                        </SfLink>
                      </template>
                    </SfMenuItem>
                  </SfListItem>
                </SfList>
              </template>
            </SfAccordionItem>
          </SfAccordion>
        </SfLoader>
      </div>
      <SfLoader :loading="loading" style="top:3em">
        <div class="products">
          <transition-group
            v-if="isGridViewStyle"
            appear
            name="products__slide"
            tag="div"
            class="products__grid">
            <SfProductCard
              v-for="(product, i) in products"
              :key="product.slug + '__grid'"
              :style="{ '--index': i }"
              :title="product.name"
              :image="product.imgSrc | imgUrl('348x348')"
              :regular-price="product.price.list | price"
              :special-price="product.price.actual | price(product.price.list)"
              :max-rating="5"
              :score-rating="5"
              :is-on-wishlist="false"
              :is-added-to-cart="false"
              :show-add-to-cart-button="true"
              class="products__product-card"
              :link="product.slug !== null? product.slug:''"
              @click:wishlist="addToWishlist(product)"
              @click:add-to-cart="addToCart(product.id, 1)"></SfProductCard>
          </transition-group>
          <transition-group
            v-else
            appear
            name="products__slide"
            tag="div"
            class="products__list">
            <SfProductCardHorizontal
              v-for="(product, i) in products"
              :key="product.slug + '__list'"
              :style="{ '--index': i }"
              :title="product.name"
              :image="product.imgSrc | imgUrl('348x348')"
              :regular-price="product.price.list | price"
              :special-price="product.price.actual | price(product.price.list)"
              :max-rating="5"
              :reviews-count="0"
              :score-rating="5"
              :is-on-wishlist="false"
              :is-added-to-cart="false"
              :link="product.slug !== null? product.slug:''"
              class="products__product-card-horizontal"
              @click:wishlist="addToWishlist(product)"
              @click:add-to-cart="addToCart(product.id, 1)">
              <template #description>
                <p class="sf-product-card-horizontal__description desktop-only" v-html="product.description ? product.description.content : ''">
                </p>
              </template>
              <template #actions>
                <SfButton
                  class="sf-button--text desktop-only"
                  style="margin: 0 0 1rem auto; display: block;"
                  @click="$emit('click:add-to-wishlist')">
                  Save for later
                </SfButton>
                <SfButton
                  class="sf-button--text desktop-only"
                  style="margin: 0 0 0 auto; display: block;"
                  @click="$emit('click:add-to-compare')">
                  Add to compare
                </SfButton>
              </template>
            </SfProductCardHorizontal>
          </transition-group>

          <!-- Pagination -->
          <SfPagination
            v-if="!loading"
            v-show="totalPages > 1"
            data-cy="category-pagination"
            class="products__pagination desktop-only"
            :current="getCurrentPage"
            :total="totalPages"
            :visible="5"
            @click="changeCurrentPage($event)"></SfPagination>

          <div
            v-show="totalPages > 0"
            class="products__show-on-page">
            <span class="products__show-on-page__label">Show on page:</span>
            <SfSelect
              :value="getItemsPerPage"
              class="products__items-per-page"
              @input="changeItemsPerPage($event)">
              <SfSelectOption
                v-for="option in gridViewOptions.pageOptions"
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
import { useRoute } from "vue-router";
import {
  SfLink,
  SfButton,
  SfList,
  SfIcon,
  SfHeading,
  SfMenuItem,
  // SfFilter,
  SfProductCard,
  SfProductCardHorizontal,
  //SfPagination,
  SfAccordion,
  SfSelect,
  SfBreadcrumbs,
  SfLoader
  // SfColor,
  // SfProperty
} from '@storefront-ui/vue';
//VSUI has a bug with pagination component we fix this bug ourselves
//our customization can be romeved since they publish the release with this fix
//https://github.com/vuestorefront/storefront-ui/commit/60fab4a59e47eaa4dadccb0c1c421a4baf317079
import { ref, watch, computed, onMounted, watchEffect} from '@vue/composition-api';
import { useCart } from '@libs/cart';
import { useProducts, useCategories } from '@libs/catalog';
import {
  SfPagination
} from '@libs/storefront-ui';
import { ProductType } from '@core/api/graphql/types';
import { categoryId } from '@core/constants';

export default {
  components: {
    SfLink,
    SfButton,
    // SfSidebar,
    SfIcon,
    SfList,
    // SfFilter,
    SfProductCard,
    SfProductCardHorizontal,
    SfPagination,
    SfMenuItem,
    SfAccordion,
    SfSelect,
    SfBreadcrumbs,
    SfLoader,
    // SfColor,
    SfHeading

    // SfProperty
  },
  props: {
    catId: {
      type: String,
      "default": ''
    }
  },
  transition: 'fade',

  setup(props, context) {

    const th = {};
    const uiState = {};
    const { isOnCart } = {} ;
    const { addToWishlist } = {};
    const { result, search } = {};

    const sortBy = ref({
      options: [
        { type: 'sort', id: 'createddate', selected: true, value: 'Latest', count: null },
        {
          type: 'sort',
          id: 'price',
          selected: false,
          value: 'Price from low to high',
          count: null
        },
        {
          type: 'sort',
          id: 'price:desc',
          selected: false,
          value: 'Price from high to low',
          count: null
        }
      ],
      selected: 'createddate'
    });


    const { fetchProducts, products, total, loading } = useProducts();
    const { loadCategoriesTree, categoryTree, loading : categoryTreeLoading } = useCategories();
    const { cart, loadMyCart, addToCart, isCartSideBarOpen } = useCart();

    // Refs
    const isGridView = ref(false);
    const itemsPerPage = ref('20');
    const currentPage = ref(1);


    const breadcrumbs = computed(() => []);

    const changeSorting = async (sort) =>  {
      const { query } = context.root.$router.history.current;
      context.root.$router.push({ query: { ...query, sort } });
      sortBy.value.selected = sort;
      //TODO: load from URL
      await fetchProducts({ itemsPerPage:Number(itemsPerPage.value), currentPage: currentPage.value,  categoryId, sort });


    };
    const facets = computed(() => ['color', 'size']);


    const gridViewOptions = {
      pageOptions: ['10', '20', '50']
    };

    const isGridViewStyle = computed(() => isGridView.value);

    const totalItems = computed(() =>  total.value);

    const getCurrentPage = computed(() => currentPage.value);
    const getItemsPerPage = computed(() => itemsPerPage.value);
    const totalPages = computed(() => Math.ceil(total.value / itemsPerPage.value));
    const activeCategory = computed(() => {
      const items = categoryTree.value.items;
      if (!items) {
        return '';
      }
      const category = items.find(({ isCurrent, items }) => isCurrent || items.find(({ isCurrent }) => isCurrent));
      return category?.label || items[0].label;
    });

    watchEffect(() => {
      //console.log(loading.value);
    })

    onMounted(async () => {
      await loadCategoriesTree(categoryId);
      //TODO: load from URL
      await fetchProducts({ itemsPerPage:Number(itemsPerPage.value), currentPage: currentPage.value,  categoryId });
      await loadMyCart();
    })

    //const route = useRoute();

    watch(() => props.catId,
      async catId => {
        await fetchProducts(Number(itemsPerPage.value), currentPage.value, catId);
      }
    )
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


    const toggleFilterSidebar = () => { console.log("toggleFilterSidebar"); };

    const changeGridViewStyle = (isGrid) => isGridView.value = isGrid;

    // Change items per page event
    const changeItemsPerPage = async (newItemsPerPage) => {
      itemsPerPage.value = newItemsPerPage;
      currentPage.value = 1;
      await fetchProducts({ itemsPerPage:Number(itemsPerPage.value), page: currentPage.value,  categoryId });
    };

    // Change current page event
    const changeCurrentPage = async (newCurrentPage) => {
      currentPage.value = Number(newCurrentPage);
      await fetchProducts({ itemsPerPage:Number(itemsPerPage.value), page: currentPage.value,  categoryId });
    };

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
      cart,
      addToCart,
      categoryTree,
      categoryTreeLoading,
      activeCategory,
      loading,
      gridViewOptions,
      isGridViewStyle,
      totalItems,
      getCurrentPage,
      getItemsPerPage,
      totalPages,
      sortBy,
      facets,
      breadcrumbs,
      toggleFilterSidebar,
      changeGridViewStyle,
      changeItemsPerPage,
      changeCurrentPage,
      changeSorting
    };
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
  max-width: 100%;
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
    @include for-desktop {
      --product-card-max-width: 25%;
    }
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

//Customization
.sf-heading__title{
  font-family: var(--font-family--primary);
  font-size: 8em;
}
</style>

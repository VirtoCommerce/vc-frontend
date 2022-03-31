<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <EmptyComparison v-if="!productsIds.length"></EmptyComparison>

    <div class="w-full md:max-w-screen-2xl md:px-12 mx-auto" v-else>
      <!-- Page header -->
      <VcBreadcrumbs :items="breadcrumbs" class="mb-3 px-5 md:px-0"></VcBreadcrumbs>
      <div class="flex flex-col lg:flex-row lg:space-x-12 px-5 md:px-0 lg:mb-5">
        <div class="flex flex-col space-y-1.5">
          <h1 class="text-black-800 text-3xl uppercase font-bold">{{ $t("pages.compare.header_block.title") }}</h1>
          <span
            class="block mb-3"
            v-html="$t('pages.compare.header_block.counter_message', [productsIds.length, productsLimit])"
          ></span>
        </div>
        <div class="flex justify-between items-start grow mb-5 lg:mb-0">
          <VcCheckbox class="mt-2" v-model="showOnlyDifferences" @change="onShowOnlyDifferencesChange">{{
            $t("pages.compare.header_block.differences_checkbox_label")
          }}</VcCheckbox>
          <VcButton is-outline class="p-3 uppercase" @click="clearList">{{
            isMobile
              ? $t("pages.compare.header_block.clear_button_mobile")
              : $t("pages.compare.header_block.clear_button_desktop")
          }}</VcButton>
        </div>
      </div>

      <!-- Main block -->
      <div class="shadow py-8 bg-white md:rounded overflow-x-auto">
        <!-- Product cards block -->
        <div class="flex space-x-5 pr-8" :class="isMobile && 'pl-8'">
          <div class="w-56 flex-shrink-0" v-if="!isMobile"></div>
          <div
            v-for="product in products"
            :key="product.id"
            class="w-32 flex-shrink-0 lg:flex-shrink md:w-48 md:pb-6 flex flex-col"
          >
            <!-- Product image -->
            <router-link :to="`/${SeoUrl.Product}/${product.id}`" class="cursor-pointer mb-3">
              <div
                class="flex flex-col justify-center items-center border border-gray-100 h-32 w-32 md:h-48 md:w-48 relative"
              >
                <div
                  class="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center absolute -top-3 -right-3 z-10 bg-white hover:bg-gray-100"
                  @click.prevent="removeProduct(product)"
                >
                  <i class="fas fa-times text-red-500"></i>
                </div>
                <VcImage
                  :src="product.imgSrc"
                  :alt="product.name"
                  class="w-full h-full object-cover object-center"
                  lazy
                />
              </div>
            </router-link>

            <!-- Product title -->
            <router-link
              :to="`/${SeoUrl.Product}/${product.id}`"
              class="text-[color:var(--color-link)] font-extrabold text-sm mb-3 flex-grow line-clamp-3 overflow-hidden cursor-pointer"
            >
              {{ product.name }}
            </router-link>

            <!-- Product price -->
            <div class="flex flex-col md:flex-row items-baseline text-sm mb-3">
              <div class="w-1/2 font-bold text-xs" v-if="!isMobile">
                {{ $t("pages.compare.main_block.price_label") }}
              </div>
              <div class="md:w-1/2">
                <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                {{ $t("common.suffixes.per_item") }}
              </div>
            </div>

            <div class="h-12">
              <AddToCart :product="product" @update:lineitem="refreshProducts" />
            </div>
          </div>
        </div>

        <!-- Properties block -->
        <div
          class="items-start md:items-center space-x-5 px-8 lg:px-0 border-b border-gray-100 lg:border-0"
          v-for="(values, key, index) in computedProperties"
          :key="index"
          :class="!isMobile ? 'even:bg-gray-50 flex' : productsIds.length >= 3 ? 'inline-flex' : 'flex'"
        >
          <div class="w-56 pl-8 font-extrabold text-sm flex-shrink-0" v-if="!isMobile">{{ key }}</div>
          <div class="w-32 flex-shrink-0 md:w-48 py-5 last:pr-8" v-for="(property, index) in values" :key="index">
            <span v-if="isMobile" class="block font-extrabold text-sm">{{ key }}</span>
            {{ property.value }}
          </div>
        </div>
        <div class="flex items-center space-x-5 px-5 lg:px-0">
          <div class="w-56 flex-shrink-0" v-if="!isMobile"></div>
          <div v-for="product in products" :key="product.id" class="w-32 flex-shrink-0 md:w-48">
            <!-- Product price -->
            <div class="flex flex-col md:flex-row items-baseline text-sm my-4 h-8">
              <div class="w-1/2 font-bold text-xs" v-if="!isMobile">
                {{ $t("pages.compare.main_block.price_label") }}
              </div>
              <div class="md:w-1/2">
                <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                {{ $t("common.suffixes.per_item") }}
              </div>
            </div>
            <AddToCart :product="product" @update:lineitem="refreshProducts" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VcBreadcrumbs,
  VcCheckbox,
  VcButton,
  IBreadcrumbs,
  VcImage,
  VcPriceDisplay,
  IProductProperties,
} from "@/components";
import { EmptyComparison, useProducts } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import SeoUrl from "@core/seo-routes.enum";
import _ from "lodash";
import { onMounted, ref, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCompareProducts } from "@/shared/compare";
import { Product as ProductType } from "@/core/api/graphql/types";
import { useI18n } from "vue-i18n";
const { fetchProducts, products } = useProducts();
const { clearCompareList, productsLimit, removeFromCompareList, productsIds } = useCompareProducts();
const { t } = useI18n();

const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: t("pages.compare.links.home"), route: "/" },
  { title: t("pages.compare.links.compare_products"), route: "/compare-products" },
]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const showOnlyDifferences = ref(false);

const originalProperties = ref<IProductProperties>({});
const computedProperties = ref<IProductProperties>({});

const removeProduct = (product: ProductType) => {
  removeFromCompareList(product);
};

const clearList = () => {
  clearCompareList();
};

const onShowOnlyDifferencesChange = () => {
  if (showOnlyDifferences.value) {
    _.each(_.keys(computedProperties.value), (key) => {
      const values = _.map(_.values(computedProperties.value[key]), (value) => {
        return value.value;
      });
      const uniqueValues = _.uniq(values);

      if (uniqueValues.length === 1) {
        delete computedProperties.value[key];
      }
    });
  } else {
    computedProperties.value = { ...originalProperties.value };
  }
};

const refreshProducts = async () => {
  await fetchProducts({ productIds: productsIds.value });
  getProductProperties();
};

function getProductProperties() {
  if (_.isEmpty(products.value)) return;
  const grouped: IProductProperties = {};
  const properties = _.flatten(
    _.map(products.value, (product) => {
      return product.properties;
    })
  );

  const propertyDisplayNames = _.uniq(
    _.map(properties, (property) => {
      return property?.name;
    })
  );
  _.each(propertyDisplayNames, (displayName) => {
    if (displayName) {
      grouped[displayName] = [];
      _.each(products.value, (product) => {
        const productProperty = _.filter(product.properties, (prop) => {
          return prop.name === displayName;
        });

        if (productProperty && productProperty.length) {
          const productPropertyValues = _.map(productProperty, (prop) => prop.value).join(", ");
          grouped[displayName].push({ value: productPropertyValues });
        } else {
          grouped[displayName].push({ value: "-" });
        }
      });
    }
  });
  computedProperties.value = { ...grouped };
  originalProperties.value = { ...grouped };
}

onMounted(() => {
  refreshProducts();
});

watch(
  () => productsIds.value,
  () => {
    showOnlyDifferences.value = false;
    refreshProducts();
  }
);
</script>

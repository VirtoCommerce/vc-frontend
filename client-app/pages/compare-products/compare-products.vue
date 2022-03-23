<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <EmptyComparison v-if="!comparisonProducts"></EmptyComparison>
    <div class="w-full md:max-w-screen-2xl md:px-12 mx-auto" v-else>
      <!-- Page header -->
      <VcBreadcrumbs :items="breadcrumbs" class="mb-2 px-5"></VcBreadcrumbs>
      <div class="flex flex-wrap md:space-x-12 px-5">
        <div class="flex flex-col">
          <h1 class="text-black-800 text-3xl uppercase font-bold">Compare products</h1>
          <span class="block mb-3"
            >Added <span class="font-bold">{{ products.length }}</span> items out of
            <span class="font-bold">5</span></span
          >
        </div>
        <div class="flex justify-between items-start grow mb-5 md:mb-0">
          <VcCheckbox class="mt-2">Show only differences</VcCheckbox>
          <VcButton is-outline class="p-3 uppercase">{{
            isMobile ? "Clear compare list" : "Clear product compare list"
          }}</VcButton>
        </div>
      </div>

      <!-- Main block -->
      <div class="shadow py-8 bg-white md:rounded overflow-x-auto">
        <!-- Product cards block -->
        <div class="flex space-x-5 px-5 lg:px-0">
          <div class="w-1/6" v-if="!isMobile"></div>
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
              <div class="w-1/2 font-bold text-xs" v-if="!isMobile">Your price</div>
              <div class="md:w-1/2">
                <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                / each
              </div>
            </div>

            <AddToCart :product="product" />
          </div>
        </div>

        <!-- Properties block -->
        <div
          class="inline-flex lg:flex items-start md:items-center space-x-5 px-5 lg:px-0 border-b border-gray-100 lg:border-0"
          v-for="(values, key, index) in computedProperties"
          :key="index"
          :class="!isMobile && 'even:bg-gray-50'"
        >
          <div class="w-1/6 pl-8 font-extrabold text-sm" v-if="!isMobile">{{ key }}</div>
          <div class="w-32 flex-shrink-0 lg:flex-shrink md:w-48 py-5" v-for="(value, index) in values" :key="index">
            <span v-if="isMobile" class="block font-extrabold text-sm">{{ key }}</span>
            {{ value.value }}
          </div>
        </div>
        <div class="flex items-center space-x-5 px-5 lg:px-0">
          <div class="w-1/6" v-if="!isMobile"></div>
          <div v-for="product in products" :key="product.id" class="w-32 flex-shrink-0 lg:flex-shrink md:w-48">
            <!-- Product price -->
            <div class="flex flex-col md:flex-row items-baseline text-sm my-4">
              <div class="w-1/2 font-bold text-xs" v-if="!isMobile">Your price</div>
              <div class="md:w-1/2">
                <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                / each
              </div>
            </div>
            <AddToCart :product="product" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { VcBreadcrumbs, VcCheckbox, VcButton, IBreadcrumbs, VcImage, VcPriceDisplay } from "@/components";
import { EmptyComparison, useProducts } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import SeoUrl from "@core/seo-routes.enum";
import _ from "lodash";
import { onMounted, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
const { fetchProducts, products } = useProducts();

const comparisonProducts = ref(true);
const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: "Home", url: "/" },
  { title: "Compare products", url: "/compare-products" },
]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const computedProperties = ref<{ [key: string]: { value: string }[] }>({});

function getProductProperties() {
  if (_.isEmpty(products.value)) return;
  const grouped: { [key: string]: { value: string }[] } = {};
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
  computedProperties.value = grouped;
}

onMounted(async () => {
  const productIds = [
    "aad7a78a899048d6b21e646887bddaa6",
    "5512e3a5201541769e1d81fc5217490c",
    "14f8279fc25d4e509c017f66f09ff562",
    "b4e347da31b842ccbf9bd847ac5c1849",
    "3b4e335592444025bf89be55757789d9",
  ];
  await fetchProducts({ itemsPerPage: 6, productIds: productIds });
  getProductProperties();
});
</script>

<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <EmptyComparison v-if="!comparisonProducts"></EmptyComparison>
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto" v-else>
      <VcBreadcrumbs :items="breadcrumbs"></VcBreadcrumbs>
      <div class="flex items-center justify-between my-2">
        <div class="flex items-center space-x-12">
          <h1 class="text-black-800 text-3xl uppercase font-bold">Compare products</h1>
          <VcCheckbox>Show only differences</VcCheckbox>
        </div>
        <VcButton is-outline class="p-3 uppercase">Clear product compare list</VcButton>
      </div>
      <span class="block mb-5"
        >Added <span class="font-bold">{{ products.length }}</span> items out of <span class="font-bold">5</span></span
      >
      <!-- Products block -->
      <div class="shadow py-8 bg-white rounded overflow-x-auto">
        <table class="w-full">
          <tr>
            <td class="w-1/6"></td>
            <td v-for="product in products" :key="product.id" class="px-4 w-1/5 h-0 pb-6">
              <div class="flex flex-col space-y-3 justify-start h-full">
                <!-- Product image -->
                <router-link :to="`/${SeoUrl.Product}/${product.id}`" class="cursor-pointer">
                  <div class="flex flex-col justify-center items-center border border-gray-100 h-48 w-48">
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
                <div class="flex flex-col md:flex-row items-baseline text-sm">
                  <div class="w-1/2 font-bold text-xs">Your price</div>
                  <div class="md:w-1/2">
                    <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                    / each
                  </div>
                </div>

                <AddToCart :product="product" />
              </div>
            </td>
          </tr>
          <tr v-for="(values, key, index) in computedProperties" :key="index" class="even:bg-gray-50">
            <td class="pl-8 font-extrabold text-sm">
              <span>{{ key }}</span>
            </td>
            <td v-for="value in values" :key="value" class="p-6 text-sm">
              {{ value.value }}
            </td>
          </tr>
          <tr>
            <td></td>
            <td v-for="product in products" :key="product.id" class="p-3">
              <!-- Product price -->
              <div class="flex flex-col md:flex-row items-baseline text-sm my-4">
                <div class="w-1/2 font-bold text-xs">Your price</div>
                <div class="md:w-1/2">
                  <span class="text-green-700 font-extrabold"><VcPriceDisplay :value="product.price?.actual" /></span>
                  / each
                </div>
              </div>
              <AddToCart :product="product" />
            </td>
          </tr>
        </table>
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
const { fetchProducts, products } = useProducts();

const comparisonProducts = ref(true);
const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: "Home", url: "/" },
  { title: "Compare products", url: "/compare-products" },
]);

const computedProperties = ref({});

function getProductProperties() {
  if (_.isEmpty(products.value)) return;
  const grouped: { [key: string]: any } = {};
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

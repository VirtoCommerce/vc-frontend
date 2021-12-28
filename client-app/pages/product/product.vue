<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div v-if="!productLoading" class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="hidden md:block mb-2" :items="breadcrumbsItems"></Breadcrumbs>
      <div class="md:hidden mb-3">
        <button class="border border-grey-200 rounded bg-white px-3 py-2 hover:bg-gray-100" @click="back()">
          <i class="fas fa-chevron-left text-yellow-500"></i><span class="ml-2 text-cyan-700">Back</span>
        </button>
      </div>
      <h1 class="text-2xl font-bold uppercase mb-3">{{ product.name }}</h1>
      <div v-if="!withVariations" class="text-sm">
        <span>Item #</span><span class="font-semibold pl-1">{{ product.code }}</span>
      </div>
      <div class="flex flex-col md:flex-row md:space-x-6 mt-3">
        <div
          class="flex flex-grow flex-col lg:flex-row -mx-5 md:mx-0 lg:space-x-12 mb-6 p-6 bg-white border border-gray-100 rounded-md shadow-sm"
        >
          <div class="lg:w-1/3 mb-8 lg:mb-0">
            <ImageGallery
              :src="product.imgSrc || ''"
              :images="product.images || []"
              :is-mobile="isMobile"
            ></ImageGallery>
            <!-- Compare checkbox -->
            <div class="mt-8 hidden md:flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
              />
              <span class="ml-2">Compare</span>
            </div>
          </div>
          <div class="flex flex-col lg:w-2/3">
            <ProductTitledBlock class="mt-5" image-src="/static/images/technical_specs.svg" title="technical specs">
              <ProductProperties v-if="product.properties" :properties="product.properties"></ProductProperties>
            </ProductTitledBlock>
            <ProductTitledBlock
              v-if="!withVariations && product?.description"
              class="mt-5"
              image-src="/static/images/description.svg"
              title="Description"
            >
              <MarkdownRender :src="product?.description?.content" class="text-gray-500"></MarkdownRender>
            </ProductTitledBlock>
            <!-- variations  -->
            <ProductTitledBlock
              v-if="withVariations"
              class="mt-5"
              image-src="/static/images/variations_customize.svg"
              title="Customize your order"
            >
              <ProductVariationCard class="mb-5" :variation="product"></ProductVariationCard>
              <div v-for="variation in product.variations" :key="variation?.id ?? ''">
                <ProductVariationCard
                  v-if="variation"
                  class="mb-5"
                  :variation="variation"
                  :product="product"
                ></ProductVariationCard>
              </div>
            </ProductTitledBlock>
          </div>
        </div>
        <div class="flex-none md:w-80 lg:w-96 flex flex-col">
          <div class="bg-white border shadow-sm rounded-md">
            <div class="border-b p-5 md:p-6">
              <h2 class="text-xl font-bold uppercase">Price &amp; Delivery</h2>
            </div>
            <div class="border-b p-5 md:p-6">
              <!-- Product price -->
              <div v-if="!withVariations" class="flex items-baseline justify-between text-sm">
                <div class="font-extrabold text-base">Your price:</div>
                <div class="font-semibold">
                  <span class="text-green-800">{{ product.price?.actual?.formattedAmount }}</span> / each
                </div>
              </div>
              <div v-else class="flex items-baseline justify-between text-sm">
                <div class="font-extrabold text-base">Total in your cart:</div>
                <div class="font-semibold">
                  <span class="text-green-800">{{ currency?.symbol }}{{ variationsCartTotal.toFixed(2) }}</span>
                </div>
              </div>
              <div class="mt-3">
                <AddToCart v-if="!withVariations" :product="product"></AddToCart>
                <div v-else>
                  <router-link
                    class="block text-center bg-yellow-500 rounded text-white px-2 py-2 font-bold uppercase hover:bg-yellow-600 cursor-pointer"
                    to="/cart"
                    >view cart</router-link
                  >
                </div>
              </div>
            </div>
            <div class="flex text-center">
              <div
                class="flex items-center justify-center flex-1 py-3 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
              >
                <i class="fas fa-plus text-base text-yellow-500"></i>
                <span class="text-sm text-blue-800 font-bold">Add to list</span>
              </div>
              <div
                class="flex items-center justify-center flex-1 py-3 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
              >
                <i class="fas fa-envelope fa-xl text-yellow-500"></i
                ><span class="text-sm text-blue-800 font-bold">Email</span>
              </div>
              <div class="flex items-center justify-center flex-1 py-3 px-1 space-x-2 cursor-pointer hover:bg-gray-100">
                <i class="fas fa-print text-yellow-500"></i>
                <span class="text-sm text-blue-800 font-bold" @click="print()">Print</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useProducts,
  Breadcrumbs,
  IBreadcrumbsItem,
  ProductProperties,
  ProductTitledBlock,
  ProductVariationCard,
} from "@/shared/catalog";
import { AddToCart, useCart } from "@/shared/cart";
import { MarkdownRender, ImageGallery } from "@/components";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import _ from "lodash";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const route = useRoute();
const router = useRouter();

const { product, loading: productLoading, loadProduct } = useProducts();
const { loading: cartLoading, getItemsTotal, currency } = useCart();

const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);

const productId = ref(route.params.id as string);

onMounted(async () => {
  await loadProduct(productId.value);
  BuildBreadcrumbs();
  console.log(product.value);
});

const withVariations = computed(() => product.value.variations?.length);

const variationsCartTotal = ref(0);

watch(
  () => cartLoading.value === false && productLoading.value === false,
  (condition) => {
    if (condition && product.value.variations?.length) {
      const variationsIds = _(product.value.variations)
        .filter((x) => !!x?.id)
        .map((x) => x?.id as string)
        .value();

      variationsCartTotal.value = getItemsTotal(variationsIds);
    }
  }
);

function BuildBreadcrumbs() {
  if (product.value) {
    breadcrumbsItems.value = [
      { url: "/", title: "Home" },
      { url: "/product/" + product.value.id ?? "", title: product.value.name ?? "" },
    ];
  }
}

function print() {
  window.print();
}

function back() {
  router.back();
}
</script>

<style lang="scss" scoped></style>

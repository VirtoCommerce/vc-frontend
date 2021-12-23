<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div v-if="!loading" class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbsItems"></Breadcrumbs>
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
            <ProductProperties v-if="product.properties" :properties="product.properties"></ProductProperties>
            <div v-if="!withVariations && product?.description" class="flex flex-col">
              <div class="flex items-center mb-4">
                <img src="/assets/static/images/description.svg" alt="description" />
                <h2 class="text-xl font-bold uppercase ml-2">Description</h2>
              </div>
              <MarkdownRender :src="product?.description?.content" class="text-gray-500"></MarkdownRender>
            </div>
            <!-- variations  -->
            <div v-if="withVariations" class="flex flex-col">
              <div class="flex items-center mb-4">
                <img src="/assets/static/images/variations_customize.svg" alt="customize order" />
                <h2 class="text-xl font-bold uppercase ml-2">Customize your order</h2>
              </div>
              <div v-for="variation in product.variations" :key="variation?.id ?? ''" class="flex flex-col">
                <div class="flex flex-row space-x-2.5 border border-gray-100 rounded-sm mb-5 p-5">
                  <!-- image -->
                  <div class="w-12 h-12">
                    <div
                      v-if="variation?.images?.length"
                      class="-mt-2 -ml-2 square relative flex flex-col justify-center items-center"
                    >
                      <img
                        :src="variation?.images[0]?.url ?? ''"
                        alt="variation"
                        class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
                      />
                    </div>
                  </div>
                  <div class="flex-1 flex flex-col xl:flex-row xl:space-x-3">
                    <!-- variations description -->
                    <div class="flex-1 flex flex-col">
                      <div class="text-base font-bold uppercase mb-2">item #{{ variation?.code }}</div>
                      <VariationProperties :properties="variation?.properties || []"></VariationProperties>
                      <div class="flex flex-row space-x-3">
                        <div class="w-1/2 text-sm text-gray-500">Your price</div>
                        <div class="w-1/2 font-bold">
                          <span class="text-green-800">{{ variation?.price?.actual?.formattedAmount }}</span>
                          <span class="invisible lg:visible">/ each</span>
                        </div>
                      </div>
                    </div>
                    <!-- add to cart -->
                    <div class="flex-1 xl:self-center flex flex-row items-center">
                      <div class="flex flex-col w-full mt-4">
                        <AddToCart :product="product"></AddToCart>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-none md:w-80 lg:w-96 flex flex-col">
          <div class="bg-white border shadow-sm rounded-md">
            <div class="border-b p-5 md:p-6">
              <h2 class="text-xl font-bold uppercase">Price &amp; Delivery</h2>
            </div>
            <div class="border-b p-5 md:p-6">
              <!-- Product price -->
              <div class="flex items-baseline justify-between text-sm">
                <div class="font-extrabold text-base">Your price:</div>
                <div class="font-semibold">
                  <span class="text-green-800">{{ product.price?.actual?.formattedAmount }}</span> / each
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
import { ref, onMounted, Ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useProducts, Breadcrumbs, IBreadcrumbsItem, ProductProperties, VariationProperties } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";
import { MarkdownRender, ImageGallery } from "@/components";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const route = useRoute();

const { product, loading, loadProduct } = useProducts();

const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);

const productId = ref(route.params.id as string);

onMounted(async () => {
  await loadProduct(productId.value);
  BuildBreadcrumbs();
  console.log(product.value);
});

const withVariations = computed(() => product.value.variations?.length);

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
</script>

<style lang="scss" scoped></style>

<template>
  <div v-if="product" class="bg-gray-100 pt-7 pb-8 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs class="hidden md:block mb-3" :items="breadcrumbsItems" />

      <div class="md:hidden mb-5">
        <!-- todo: use VcButton -->
        <button class="border border-grey-200 rounded bg-white px-3 py-2 hover:bg-gray-100" @click="back()">
          <i class="fas fa-chevron-left text-yellow-500"></i><span class="ml-2 text-cyan-700">Back</span>
        </button>
      </div>

      <h1 class="text-2xl md:text-4xl font-bold uppercase">{{ product.name }}</h1>

      <div v-if="!productWithVariations && !isMobile" class="text-sm mt-1">
        Item # <span class="font-extrabold">{{ product.code }}</span>
      </div>

      <div class="flex flex-col lg:flex-row lg:space-x-8 mt-5">
        <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
          <ProductDetails :product="product" class="shadow-sm border rounded-none md:rounded" />
        </div>

        <div class="lg:w-4/12 mt-6 lg:mt-0 xl:w-3/12">
          <!-- Price & Delivery (with variations) -->
          <ProductPriceBlock v-if="productWithVariations" :product="product">
            <div class="flex items-baseline justify-between text-sm">
              <div class="font-extrabold text-base">Total in your cart:</div>

              <div class="font-extrabold">
                <!-- todo: extract a component for price and use it here -->
                <span class="text-green-700">{{ currency?.symbol }}{{ variationsCartTotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="mt-7 md:mt-5">
              <VcButton to="/checkout" class="uppercase px-2 w-full">view cart</VcButton>
            </div>
          </ProductPriceBlock>

          <!-- Price & Delivery (without variations) -->
          <ProductPriceBlock v-else :product="product">
            <div class="flex items-baseline justify-between text-sm">
              <div class="font-extrabold text-base">Your price:</div>

              <div>
                <VcPriceDisplay :value="product.price?.actual" class="font-extrabold text-green-700" />
                <span class="font-semibold hidden lg:inline-block ml-1">/ each</span>
              </div>
            </div>

            <div class="mt-7 md:mt-5">
              <AddToCart :product="product" />
            </div>
          </ProductPriceBlock>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, Ref, computed } from "vue";
import { useRouter } from "vue-router";
import { VcButton, VcPriceDisplay } from "@/components";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCart, AddToCart } from "@/shared/cart";
import {
  useProduct,
  useBreadcrumbs,
  Breadcrumbs,
  IBreadcrumbsItem,
  ProductDetails,
  ProductPriceBlock,
} from "@/shared/catalog";

const props = defineProps({
  productId: {
    type: String,
    default: "",
  },
});

const router = useRouter();
const { currency } = useCart();
const { buildBreadcrumbs } = useBreadcrumbs();
const { product, loadProduct, variationsCartTotal } = useProduct();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");
const breadcrumbsItems: Ref<IBreadcrumbsItem[]> = ref([{ url: "/", title: "Home" }]);

const productWithVariations = computed<boolean>(() => !!product.value?.variations?.length);

function back() {
  router.back();
}

onBeforeMount(async () => {
  await loadProduct(props.productId);
  breadcrumbsItems.value = buildBreadcrumbs(product.value!.breadcrumbs!);
});
</script>

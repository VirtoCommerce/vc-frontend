<template>
  <div v-if="product" class="mt-5 flex flex-col lg:flex-row lg:space-x-8" :class="{ 'mb-6': !relatedProducts.length }">
    <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
      <ProductDetails :product="product" :section="model" class="rounded-none border shadow-sm md:rounded" />
    </div>

    <div class="mt-6 lg:sticky lg:top-4 lg:mt-0 lg:h-full lg:w-4/12 xl:w-3/12">
      <!-- Price & Delivery (with variations) -->
      <ProductPriceBlock v-if="productWithVariations" :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div v-t="'pages.product.variations_total_label'" class="text-base font-extrabold"></div>

          <div class="font-extrabold">
            <!-- todo: extract a component for price and use it here -->
            <span class="text-green-700">{{ currentCurrency.symbol }}{{ variationsCartTotalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mt-7 md:mt-5">
          <VcButton :to="{ name: 'Cart' }" class="w-full px-2 uppercase">
            {{ $t("pages.product.view_cart_button") }}
          </VcButton>
        </div>
      </ProductPriceBlock>

      <!-- Price & Delivery (without variations) -->
      <ProductPriceBlock v-else :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div v-t="'pages.product.price_label'" class="text-base font-extrabold"></div>

          <div>
            <VcItemPrice :value="product.price" />
          </div>
        </div>

        <div class="mt-7 md:mt-5">
          <AddToCart :product="product" />

          <div class="mt-2 flex">
            <VcInStock
              :is-in-stock="product.availabilityData?.isInStock"
              :quantity="product.availabilityData?.availableQuantity"
            ></VcInStock>
          </div>
        </div>
      </ProductPriceBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { useCurrency } from "@/core";
import { AddToCart } from "@/shared/cart";
import { ProductDetails, ProductPriceBlock } from "@/shared/catalog";
import { PageContent } from "@/shared/static-content";
import { Product } from "@/xapi";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },

  relatedProducts: {
    type: Array as PropType<Product[]>,
    required: true,
  },

  productWithVariations: {
    type: Boolean,
  },

  variationsCartTotalAmount: {
    type: Number,
    required: true,
  },

  model: {
    type: Object as PropType<PageContent>,
    required: true,
  },
});

const { currentCurrency } = useCurrency();
</script>

<template>
  <div v-if="product" class="flex flex-col lg:flex-row lg:space-x-8 mt-5" :class="{ 'mb-6': !relatedProducts.length }">
    <div class="-mx-5 md:mx-0 lg:w-8/12 xl:w-9/12">
      <ProductDetailsTemplate :product="product" :section="model" class="shadow-sm border rounded-none md:rounded" />
    </div>

    <div class="lg:w-4/12 lg:h-full lg:sticky lg:top-4 mt-6 lg:mt-0 xl:w-3/12">
      <!-- Price & Delivery (with variations) -->
      <ProductPriceBlock v-if="productWithVariations" :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div class="font-extrabold text-base" v-t="'pages.product.variations_total_label'"></div>

          <div class="font-extrabold">
            <!-- todo: extract a component for price and use it here -->
            <span class="text-green-700">{{ currency?.symbol }}{{ variationsCartTotalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mt-7 md:mt-5">
          <VcButton :to="{ name: 'Checkout' }" class="uppercase px-2 w-full">
            {{ $t("pages.product.view_cart_button") }}
          </VcButton>
        </div>
      </ProductPriceBlock>

      <!-- Price & Delivery (without variations) -->
      <ProductPriceBlock v-else :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div class="font-extrabold text-base" v-t="'pages.product.price_label'"></div>

          <div>
            <VcItemPrice :value="product.price" />
          </div>
        </div>

        <div class="mt-7 md:mt-5">
          <AddToCart :product="product" />

          <div class="flex">
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
import { Product } from "@/xapi/types";
import { useCart, AddToCart } from "@/shared/cart";
import { ProductDetailsTemplate, ProductPriceBlock } from "@/shared/catalog";
import { PageContent } from "@/core/types";

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
    type: Object,
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

const { currency } = useCart();
</script>

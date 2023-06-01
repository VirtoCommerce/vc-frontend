<template>
  <div
    v-if="product"
    class="mt-5 flex flex-col print:flex-row print:space-x-12 lg:flex-row lg:space-x-8"
    :class="{ 'mb-6': !relatedProducts.length }"
  >
    <div class="-mx-5 print:mx-0 print:grow md:mx-0 lg:w-8/12 xl:w-9/12">
      <ProductDetails
        :product="product"
        :section="model"
        class="rounded-none border shadow-sm print:border-none print:shadow-none md:rounded"
      />
    </div>

    <div
      class="mt-6 flex-none print:!relative print:mt-0 print:!w-72 lg:sticky lg:top-4 lg:mt-0 lg:h-full lg:w-4/12 xl:w-3/12"
      :class="{ 'print:hidden': productWithVariations }"
    >
      <!-- Price & Delivery (with variations) -->
      <ProductPriceBlock v-if="productWithVariations" :product="product">
        <div class="flex items-baseline justify-between text-sm">
          <div v-t="'pages.product.variations_total_label'" class="text-base font-extrabold"></div>

          <div class="font-extrabold">
            <!-- todo: extract a component for price and use it here -->
            <span class="text-green-700">{{ currentCurrency.symbol }}{{ variationsCartTotalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mt-7 print:hidden md:mt-5">
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

        <div class="mt-7 print:hidden md:mt-5">
          <AddToCart :product="product" />

          <div class="mt-2 flex">
            <VcInStock
              :is-in-stock="product.availabilityData?.isInStock"
              :is-digital="isDigital"
              :quantity="product.availabilityData?.availableQuantity"
            ></VcInStock>
          </div>
        </div>
      </ProductPriceBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCurrency } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { AddToCart } from "@/shared/cart";
import { ProductDetails, ProductPriceBlock } from "@/shared/catalog";
import type { PageContent } from "../types";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  relatedProducts: Product[];
  productWithVariations: boolean;
  variationsCartTotalAmount: number;
  model: PageContent;
}

const props = defineProps<IProps>();

const { currentCurrency } = useCurrency();

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);
</script>

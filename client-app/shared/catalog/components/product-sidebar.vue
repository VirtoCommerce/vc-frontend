<template>
  <div class="space-y-6">
    <ProductPriceBlock :product="product">
      <template v-if="!!product.hasVariations">
        <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
          <span>
            {{ $t("pages.product.variations_total_label") }}
          </span>

          <!-- todo: extract a component for price and use it here -->
          <span class="text-[--color-success-600]">
            {{ currentCurrency.symbol }}{{ variationsCartTotalAmount.toFixed(2) }}
          </span>
        </div>

        <VcButton class="mt-4 print:hidden" :to="{ name: 'Cart' }" full-width>
          {{ $t("pages.product.view_cart_button") }}
        </VcButton>
      </template>

      <template v-else>
        <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
          <span>
            {{ $t("pages.product.price_label") }}
          </span>

          <VcItemPrice :value="product.price" />
        </div>

        <div class="mt-4 print:hidden">
          <AddToCart :product="product" />

          <div class="mt-2 flex">
            <InStock
              :is-in-stock="product.availabilityData?.isInStock"
              :is-digital="isDigital"
              :quantity="product.availabilityData?.availableQuantity"
            />
          </div>
        </div>
      </template>
    </ProductPriceBlock>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCurrency } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { useShortCart } from "@/shared/cart/composables/useShortCart";
import InStock from "./in-stock.vue";
import ProductPriceBlock from "./product-price-block.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCart from "@/shared/cart/components/add-to-cart.vue";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const { currentCurrency } = useCurrency();
const { getItemsTotal } = useShortCart();

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);

const variationsCartTotalAmount = computed<number>(() => {
  if (!props.product) {
    return 0;
  }

  const variationsIds = props.product.variations!.map((variation) => variation.id!);
  variationsIds.push(props.product.id);

  return getItemsTotal(variationsIds);
});
</script>

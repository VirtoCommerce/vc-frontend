<template>
  <div class="space-y-6">
    <ProductPriceBlock :product="product">
      <template v-if="product.hasVariations">
        <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
          <span>
            {{ $t("pages.product.variations_total_label") }}
          </span>

          <!-- todo: extract a component for price and use it here -->
          <span class="text-[--price-color]">
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
          <span class="relative">
            <VcLoaderOverlay v-if="configuredLineItemLoading" />
            <VcItemPrice :value="price" />
          </span>
        </div>

        <div class="mt-4 print:hidden">
          <component
            :is="getComponent(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON)"
            v-if="
              isComponentRegistered(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON) &&
              shouldRenderComponent(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON, product)
            "
            :product="product"
            v-bind="getComponentProps(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON)"
          />
          <AddToCart v-else :product="product">
            <InStock
              :is-in-stock="product.availabilityData?.isInStock"
              :is-digital="isDigital"
              :quantity="product.availabilityData?.availableQuantity"
            />

            <CountInCart :product-id="product.id" />
          </AddToCart>
        </div>
      </template>
    </ProductPriceBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useCurrency } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { AddToCart, useShortCart } from "@/shared/cart";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
import CountInCart from "./count-in-cart.vue";
import InStock from "./in-stock.vue";
import ProductPriceBlock from "./product-price-block.vue";
import type { MoneyType, PriceType, Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  variations?: Product[];
}

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { currentCurrency } = useCurrency();
const { getItemsTotal } = useShortCart();
const { configuredLineItem, loading: configuredLineItemLoading } = useConfigurableProduct(product.value.id);
const { getComponent, isComponentRegistered, shouldRenderComponent, getComponentProps } = useCustomProductComponents();

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);

const variationsCartTotalAmount = computed<number>(() => {
  if (!props.product) {
    return 0;
  }

  const variationsIds = props.variations?.map((variation) => variation.id!) ?? [];

  return getItemsTotal(variationsIds);
});

const price = computed<PriceType | { actual: MoneyType; list: MoneyType } | undefined>(() => {
  if (props.product.isConfigurable && configuredLineItem.value) {
    return {
      actual: configuredLineItem.value.extendedPrice as MoneyType,
      list: configuredLineItem.value.listPrice as MoneyType,
    };
  }
  return props.product.price;
});
</script>

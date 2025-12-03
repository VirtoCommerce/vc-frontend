<template>
  <template v-if="product.hasVariations && templateLayout === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c">
    <div class="flex justify-between gap-x-2 text-base font-bold">
      <div>
        {{ $t("pages.product.price_label") }}
      </div>

      <Price v-if="variationResult && variationResult.price?.actual?.amount > 0" :value="variationResult.price" />

      <VcTooltip v-else>
        <template #trigger>
          <span class="flex items-center gap-1 text-primary-500">
            <VcIcon name="information-circle" size="xs" />

            {{ $t("common.labels.not_available") }}
          </span>
        </template>

        <template #content>
          <span v-if="variationResult">
            {{ $t("shared.catalog.product_details.options.price_unavailable") }}
          </span>

          <span v-else>
            {{ $t("shared.catalog.product_details.options.select_to_proceed") }}
          </span>
        </template>
      </VcTooltip>
    </div>

    <div class="mt-4 print:hidden">
      <component
        v-if="variationResult && variationResult.price?.actual?.amount > 0"
        :is="product.isConfigurable ? AddToCart : AddToCartSimple"
        :product="variationResult"
      >
        <InStock
          :is-in-stock="variationResult.availabilityData?.isInStock"
          :is-digital="isDigital"
          :quantity="variationResult.availabilityData?.availableQuantity"
        />

        <CountInCart :product-id="variationResult.id" />
      </component>

      <div v-else>
        <VcButton
          class="w-full cursor-not-allowed"
          disabled
          :title="$t('shared.catalog.product_details.options.select_to_proceed')"
        >
          {{ $t("ui_kit.buttons.add_to_cart") }}
        </VcButton>

        <VcAlert v-if="variationResult" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
          {{ $t("shared.catalog.product_details.options.price_unavailable") }}
        </VcAlert>
      </div>
    </div>
  </template>

  <template v-else-if="product.hasVariations">
    <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
      <span>
        {{ $t("pages.product.variations_in_cart_label") }}
      </span>

      <span class="text-[--price-color]">
        {{ variationsInCartQty }}
      </span>
    </div>

    <VcButton class="mt-4 print:hidden" :to="{ name: ROUTES.CART.NAME }" full-width>
      {{ $t("pages.product.view_cart_button") }}
    </VcButton>
  </template>

  <template v-else>
    <div class="flex items-center justify-between gap-x-2">
      <div class="text-base font-bold">
        {{ $t("pages.product.price_label") }}
      </div>

      <Price :loading="configuredLineItemLoading" :value="price" />
    </div>

    <div class="mt-4 print:hidden">
      <ExtensionPoint
        v-if="$canRenderExtensionPoint('productPage', EXTENSION_NAMES.productPage.sidebarButton, product)"
        :name="EXTENSION_NAMES.productPage.sidebarButton"
        category="productPage"
        :product="product"
      />

      <component v-else :is="product.isConfigurable ? AddToCart : AddToCartSimple" :product="product">
        <InStock
          :is-in-stock="product.availabilityData?.isInStock"
          :is-digital="isDigital"
          :quantity="product.availabilityData?.availableQuantity"
        />

        <CountInCart :product-id="product.id" />
      </component>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { ProductType } from "@/core/enums";
import { ROUTES } from "@/router/routes/constants";
import { AddToCart } from "@/shared/cart";
import { useShortCart } from "@/shared/cart/composables";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES } from "@/shared/catalog/constants/product";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import CountInCart from "./count-in-cart.vue";
import InStock from "./in-stock.vue";
import Price from "./price.vue";
import type { MoneyType, PriceType, Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";
import VcAlert from "@/ui-kit/components/molecules/alert/vc-alert.vue";

interface IProps {
  product: Product;
  variations?: Product[];
  templateLayout?: string;
}

const props = defineProps<IProps>();

const product = toRef(props, "product");
const variations = toRef(props, "variations");

const { cart } = useShortCart();
const { configuredLineItem, loading: configuredLineItemLoading } = useConfigurableProduct(product.value.id);
const { variationResult } = useProductVariationProperties(computed(() => variations.value ?? []));

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);

const variationsInCartQty = computed<number>(() => {
  if (!props.product) {
    return 0;
  }

  const variationsIds = props.variations?.map((variation) => variation.id) ?? [];
  const variationsInCart = cart.value?.items.filter((item) => variationsIds.includes(item.productId));

  return variationsInCart?.length ?? 0;
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

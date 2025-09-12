<template>
  <div class="space-y-6">
    <ProductPriceBlock :product="product">
      <template v-if="product.hasVariations && templateLayout === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c">
        <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
          <span>
            {{ $t("pages.product.price_label") }}
          </span>

          <span>
            <VcItemPrice v-if="variationResult" :value="variationResult?.price" />

            <VcTooltip v-else>
              <template #trigger>
                <span class="flex items-center gap-1 text-primary-500">
                  <VcIcon name="information-circle" size="xs" />

                  {{ $t("common.labels.not_available") }}
                </span>
              </template>

              <template #content>
                <span>
                  {{ $t("shared.catalog.product_details.options.select_to_proceed") }}
                </span>
              </template>
            </VcTooltip>
          </span>
        </div>

        <div class="mt-4 print:hidden">
          <AddToCart v-if="variationResult" :product="variationResult">
            <InStock
              :is-in-stock="variationResult.availabilityData?.isInStock"
              :is-digital="isDigital"
              :quantity="variationResult.availabilityData?.availableQuantity"
            />

            <CountInCart :product-id="variationResult.id" />
          </AddToCart>

          <VcButton
            v-else
            class="w-full cursor-not-allowed"
            disabled
            :title="$t('shared.catalog.product_details.options.select_to_proceed')"
          >
            {{ $t("ui_kit.buttons.add_to_cart") }}
          </VcButton>
        </div>
      </template>

      <template v-else-if="product.hasVariations">
        <div class="flex flex-wrap justify-between gap-x-2 text-base font-bold">
          <span>
            {{ $t("pages.product.variations_total_label") }}
          </span>

          <!-- todo: extract a component for price and use it here -->
          <span class="text-[--price-color]">
            {{ currentCurrency.symbol }}{{ variationsCartTotalAmount.toFixed(2) }}
          </span>
        </div>

        <VcButton class="mt-4 print:hidden" :to="{ name: ROUTES.CART.NAME }" full-width>
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

    <VcWidget v-if="showVendor && product.vendor" :title="$t('shared.catalog.product_details.vendor_label')" size="sm">
      <div class="test-base text-center font-bold [word-break:break-word]">
        {{ product.vendor.name }}
      </div>
    </VcWidget>

    <VcWidget title="Shipment options">
      <div v-for="pickupLocation in product.pickupLocations" :key="pickupLocation.name" class="mt-2 rounded border p-2">
        <div>
          {{ pickupLocation.name }}
        </div>

        <div>
          {{ pickupLocation.address }}
        </div>

        <div>
          {{ pickupLocation.shipmentHours }}
        </div>
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useCurrency, useThemeContext } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { ROUTES } from "@/router/routes/constants";
import { AddToCart, useShortCart } from "@/shared/cart";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import { useProductVariationProperties } from "@/shared/catalog/composables/useProductVariationProperties";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES } from "@/shared/catalog/constants/product";
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
import CountInCart from "./count-in-cart.vue";
import InStock from "./in-stock.vue";
import ProductPriceBlock from "./product-price-block.vue";
import type { MoneyType, PriceType, Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  variations?: Product[];
  templateLayout?: string;
}

const props = defineProps<IProps>();

const product = toRef(props, "product");
const variations = toRef(props, "variations");

const { currentCurrency } = useCurrency();
const { getItemsTotal } = useShortCart();
const { configuredLineItem, loading: configuredLineItemLoading } = useConfigurableProduct(product.value.id);
const { getComponent, isComponentRegistered, shouldRenderComponent, getComponentProps } = useCustomProductComponents();
const { variationResult } = useProductVariationProperties(computed(() => variations.value ?? []));
const { themeContext } = useThemeContext();

const isDigital = computed<boolean>(() => props.product.productType === ProductType.Digital);

const showVendor = computed(
  () => themeContext.value?.settings?.vendor_enabled && !product.value.hasVariations && product.value.vendor,
);

const variationsCartTotalAmount = computed<number>(() => {
  if (!props.product) {
    return 0;
  }

  const variationsIds = props.variations?.map((variation) => variation.id) ?? [];

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

<template>
  <div class="product-price">
    <template v-if="product.hasVariations && templateLayout === PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c">
      <div class="product-price__header">
        <div class="product-price__label">
          {{ $t("pages.product.price_label") }}
        </div>

        <Price
          v-if="variationResult && variationResult.price?.actual?.amount > 0"
          class="product-price__value"
          :value="variationResult.price"
        />

        <VcTooltip v-else>
          <template #trigger>
            <span class="product-price__unavailable">
              <VcIcon name="information-circle" size="xs" aria-hidden="true" />

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

      <div class="product-price__actions">
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
            class="product-price__disabled-button"
            disabled
            :title="$t('shared.catalog.product_details.options.select_to_proceed')"
          >
            {{ $t("ui_kit.buttons.add_to_cart") }}
          </VcButton>

          <VcAlert
            v-if="variationResult"
            class="product-price__alert"
            color="warning"
            size="sm"
            variant="solid-light"
            icon
          >
            {{ $t("shared.catalog.product_details.options.price_unavailable") }}
          </VcAlert>
        </div>
      </div>
    </template>

    <template v-else-if="product.hasVariations">
      <div class="product-price__variations">
        <span class="product-price__variations-label">
          {{ $t("pages.product.variations_in_cart_label") }}
        </span>

        <span class="product-price__variations-count">
          {{ variationsInCartQty }}
        </span>
      </div>

      <VcButton class="product-price__cart-button" :to="{ name: ROUTES.CART.NAME }" full-width>
        {{ $t("pages.product.view_cart_button") }}
      </VcButton>
    </template>

    <template v-else>
      <div class="product-price__header">
        <div class="product-price__label">
          {{ $t("pages.product.price_label") }}
        </div>

        <Price class="product-price__value" :loading="configuredLineItemLoading" :value="price" />
      </div>

      <div class="product-price__actions">
        <component
          :is="getComponent(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON)"
          v-if="
            isComponentRegistered(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON) &&
            shouldRenderComponent(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON, product)
          "
          :product="product"
          v-bind="getComponentProps(CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON)"
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
  </div>
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
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
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
const { getComponent, isComponentRegistered, shouldRenderComponent, getComponentProps } = useCustomProductComponents();
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

<style lang="scss" scoped>
.product-price {
  &__header {
    @apply flex items-center justify-between gap-x-2;
  }

  &__label {
    @apply text-base font-bold;
  }

  &__unavailable {
    @apply flex items-center gap-1 text-primary-500;
  }

  &__actions {
    @apply mt-4 print:hidden;
  }

  &__disabled-button {
    @apply w-full cursor-not-allowed;
  }

  &__alert {
    @apply mt-4;
  }

  &__variations {
    @apply flex flex-wrap justify-between gap-x-2 text-base font-bold;
  }

  &__variations-count {
    @apply text-[--price-color];
  }

  &__cart-button {
    @apply mt-4 print:hidden;
  }
}
</style>

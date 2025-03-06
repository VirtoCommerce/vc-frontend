<template>
  <div
    class="flex flex-col gap-2 bg-additional-50 lg:gap-4 lg:rounded lg:border lg:border-neutral-100 lg:p-5 lg:pb-4 lg:shadow-md"
  >
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name">
      <div class="absolute -right-2.5 -top-2 z-[2]">
        <VcButton size="xs" variant="no-border" color="danger" icon="delete-2" @click="$emit('remove', product)" />
      </div>
    </VcProductImage>

    <div class="flex grow flex-col justify-between gap-2">
      <VcProductTitle
        class="h-[3.125rem] text-sm"
        :to="link"
        :title="product.name"
        :target="$cfg.details_browser_target"
        @click="$emit('linkClick', $event)"
      >
        {{ product.name }}
      </VcProductTitle>

      <VcProductPrice
        class="h-9 text-lg"
        :actual-price="price?.actual"
        :list-price="price?.list"
        :with-from-label="product.hasVariations || product.isConfigurable"
      />
    </div>

    <div>
      <VcProductButton
        v-if="product.isConfigurable"
        class="mb-4"
        :to="link"
        :button-text="$t('pages.catalog.customize_button')"
        icon="cube-transparent"
        :target="$cfg.details_browser_target"
      />
      <VcProductButton
        v-else-if="product.hasVariations"
        class="mb-4"
        :to="link"
        :target="$cfg.details_browser_target"
        variant="outline"
        :button-text="$t('pages.catalog.variations_button', [(product.variations?.length || 0) + 1])"
      />

      <AddToCart v-else :product="product" reserved-space />

      <div class="flex flex-wrap items-center gap-1 pt-1">
        <InStock
          :is-in-stock="product.availabilityData?.isInStock"
          :is-digital="isDigital"
          :quantity="product.availabilityData?.availableQuantity"
        />

        <CountInCart :product-id="product.id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ProductType } from "@/core/enums";
import { getProductRoute } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import CountInCart from "./count-in-cart.vue";
import InStock from "./in-stock.vue";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "remove", product: Product): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));

const isDigital = computed(() => props.product.productType === ProductType.Digital);
</script>

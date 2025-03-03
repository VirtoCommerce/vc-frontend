<template>
  <div
    class="flex flex-col gap-2 bg-additional-50 xl:gap-4 xl:rounded xl:border xl:border-neutral-100 xl:p-5 xl:pb-1 xl:shadow-md"
  >
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name">
      <div
        class="absolute -right-4 -top-2.5 z-[2] space-y-1.5 rounded-3xl bg-additional-50 px-1.5 py-2 empty:hidden lg:space-y-2 print:hidden"
      >
        <AddToList :product="product" />
        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" class="relative" />
      </div>
    </VcProductImage>

    <div class="flex grow flex-col justify-between gap-2">
      <VcProductTitle
        class="text-sm"
        :to="link"
        :title="product.name"
        target="_blank"
        @click="$emit('linkClick', $event)"
      >
        {{ product.name }}
      </VcProductTitle>

      <VcProductPrice
        class="h-9 text-lg"
        :actual-price="price?.actual"
        :list-price="price?.list"
        :has-variations="product.hasVariations"
        :is-configurable="product.isConfigurable"
      />
    </div>

    <div class="h-[3.25rem] print:hidden">
      <VcProductButton
        v-if="product.isConfigurable"
        :to="link"
        :button-text="$t('pages.catalog.customize_button')"
        icon="cube-transparent"
        target="_blank"
      />

      <VcProductButton
        v-else-if="product.hasVariations"
        :to="link"
        target="_blank"
        variant="outline"
        :button-text="$t('pages.catalog.variations_button', [(product.variations?.length || 0) + 1])"
      />

      <AddToCart v-else :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>

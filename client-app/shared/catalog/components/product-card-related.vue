<template>
  <div
    class="flex flex-col gap-2 bg-[--color-additional-50] lg:gap-4 lg:rounded lg:border lg:border-[--color-neutral-100] lg:p-5 lg:pb-1 lg:shadow-md"
  >
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name">
      <div
        class="absolute -right-4 -top-2.5 z-[2] space-y-1.5 rounded-3xl bg-[--color-additional-50] px-1.5 py-2 empty:hidden lg:space-y-2"
      >
        <AddToList :product="product" />
        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" class="relative" :product="product" />
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
        :actual-price="product.price?.actual"
        :list-price="product.price?.list"
        :has-variations="product.hasVariations"
      />
    </div>

    <div class="h-[3.25rem]">
      <VcButton
        v-if="product.hasVariations"
        :to="link"
        target="_blank"
        variant="outline"
        size="sm"
        full-width
        truncate
        @click="$emit('linkClick', $event)"
      >
        {{ $t("pages.catalog.variations_button", [(product.variations?.length || 0) + 1]) }}
      </VcButton>

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
  (event: "linkClick", globalEvent: PointerEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>

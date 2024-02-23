<template>
  <div
    class="flex flex-col gap-2 bg-[--color-additional-50] lg:gap-4 lg:rounded lg:border lg:border-[--color-neutral-100] lg:p-5 lg:pb-1 lg:shadow-md"
  >
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name">
      <div class="absolute -right-2.5 -top-2 z-[2]">
        <VcButton size="xs" variant="no-border" color="danger" icon="delete-2" @click="$emit('remove', product)" />
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
</script>

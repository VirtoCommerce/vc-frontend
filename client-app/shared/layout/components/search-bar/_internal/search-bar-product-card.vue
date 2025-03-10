<template>
  <VcProductCard view-mode="list">
    <router-link :to="link" class="contents" @click="$emit('linkClick', $event)">
      <VcProductImage :img-src="product.imgSrc" :alt="product.name" size-suffix="sm" lazy />
    </router-link>

    <VcProductTitle :lines-number="2" fix-height :to="link" :title="product.name" @click="$emit('linkClick', $event)">
      {{ product.name }}
    </VcProductTitle>

    <VcProductPrice :actual-price="price?.actual" :with-from-label="product.hasVariations || product.isConfigurable" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProductRoute } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (eventName: "linkClick", globalEvent: PointerEvent): void;
}

interface IProps {
  product: Product;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));
</script>

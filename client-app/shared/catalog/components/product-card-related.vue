<template>
  <VcProductCard :border="border">
    <VcProductImage :img-src="product.imgSrc" :images="product.images" :alt="product.name" />

    <VcProductActions direction="vertical" with-background>
      <AddToList :product="product" />
      <AddToCompareCatalog v-if="$cfg.product_compare_enabled" :product="product" class="relative" />
    </VcProductActions>

    <VcProductTitle :to="link" :title="product.name" :target="linkTarget" @click="$emit('linkClick', $event)">
      {{ product.name }}
    </VcProductTitle>

    <VcProductPrice
      :actual-price="price?.actual"
      :list-price="price?.list"
      :with-from-label="product.hasVariations || product.isConfigurable"
    />

    <VcProductButton
      v-if="product.isConfigurable"
      :to="link"
      :button-text="$t('pages.catalog.customize_button')"
      icon="cube-transparent"
      :target="linkTarget"
    />

    <VcProductButton
      v-else-if="product.hasVariations"
      :to="link"
      :target="linkTarget"
      variant="outline"
      :button-text="$t('pages.catalog.variations_button', [(product.variations?.length || 0) + 1])"
    />

    <AddToCart v-else :product="product" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables/useThemeContext";
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
  border?: boolean;
  product: Product;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const { themeContext } = useThemeContext();

const price = computed(() => (props.product.hasVariations ? props.product.minVariationPrice : props.product.price));

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product.id, props.product.slug));

const linkTarget = computed(() => {
  return themeContext.value.settings.details_browser_target || "_blank";
});
</script>

<template>
  <div v-if="product && lists.length" class="recommended-products-section">
    <RecommendedProducts
      v-for="list in lists"
      :key="list.id"
      :recommended-products="list.products"
      :title="$t(`pages.product.recommended_products.${list.model}_section_title`)"
      :model="list.model"
      :product-id="product.id"
      :product-name="product.name"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useRecommendedProducts } from "@/shared/catalog/composables/useRecommendedProducts";
import RecommendedProducts from "./recommended-products.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product?: Product;
  blocks?: { id: string; model?: string; hidden?: boolean }[];
}

const props = defineProps<IProps>();

const { recommendedProducts, fetchRecommendedProducts } = useRecommendedProducts();
const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

const models = computed(() =>
  (props.blocks ?? []).filter((block): block is { id: string; model: string } => !!block.model && !block.hidden),
);

const lists = computed(() =>
  models.value
    // The composable hands out a readonly view; the lists are only rendered.
    .map(({ id, model }) => ({ id, model, products: recommendedProducts.value[model] as Product[] | undefined }))
    .filter((list) => list.products?.length),
);

// Keyed on the model names: the designer's draft re-creates the blocks on every edit, the lists stay the same.
watch(
  [() => props.product?.id, () => models.value.map(({ model }) => model).join(",")],
  async ([productId]) => {
    if (productId && models.value.length) {
      await fetchRecommendedProducts(
        models.value.map(({ model }) => ({ productId, model, currencyCodeOverride: loyaltyCurrencyOverride.value })),
      );
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.recommended-products-section {
  @apply flex flex-col gap-5;

  @media (width >= theme("screens.xl")) {
    @apply gap-6;
  }
}
</style>

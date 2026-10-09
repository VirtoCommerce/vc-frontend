<template>
  <VcWidget
    v-if="products.length"
    :title="title"
    prepend-icon="cursor-click"
    size="lg"
    data-vc-track="product-list"
    data-list-id="recently_browsed_products"
    :data-list-name="title"
  >
    <VcProductsGrid short>
      <ProductCardRecentlyBrowsed
        v-for="product in products"
        :key="product.id"
        :product="product"
        :background="false"
      />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Product } from "@/core/api/graphql/types";
import ProductCardRecentlyBrowsed from "@/shared/catalog/components/product-card-recently-browsed.vue";

interface IProps {
  products: Product[];
}

defineProps<IProps>();

const { t } = useI18n();

const title = computed(() => t("pages.cart.recently_browsed_products"));
</script>

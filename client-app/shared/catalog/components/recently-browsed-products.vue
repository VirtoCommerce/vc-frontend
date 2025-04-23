<template>
  <VcWidget
    v-if="products.length"
    :title="$t('pages.cart.recently_browsed_products')"
    prepend-icon="cursor-click"
    size="lg"
  >
    <VcProductsGrid short>
      <ProductCardRecentlyBrowsed
        v-for="product in products"
        :key="product.id"
        :product="product"
        :background="false"
        @link-click="selectItemEvent(product)"
      />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables/useAnalytics";
import type { Product } from "@/core/api/graphql/types";
import ProductCardRecentlyBrowsed from "@/shared/catalog/components/product-card-recently-browsed.vue";

const props = defineProps<IProps>();

interface IProps {
  products: Product[];
}

const products = toRef(props, "products");

const { analytics } = useAnalytics();
const { t } = useI18n();

watch(products, () => {
  if (!products.value?.length) {
    return;
  }

  analytics("viewItemList", products.value, {
    item_list_id: "recently_browsed_products",
    item_list_name: t("pages.cart.recently_browsed_products"),
    source_route: "cart",
  });
});

const selectItemEvent = (item: Product) => {
  analytics("selectItem", item, {
    item_list_id: "recently_browsed_products",
    item_list_name: t("pages.cart.recently_browsed_products"),
    source_route: "cart",
  });
};
</script>

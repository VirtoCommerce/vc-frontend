<template>
  <VcWidget

    :title="$t('pages.cart.saved_for_later')"
    prepend-icon="cursor-click"
    size="lg">
    <VcProductsGrid short>
      <CartItemForLater
        v-for="product in products"
        :key="product.id"
        :product="product"
        :saved-for-later-list="savedForLaterList"
        :background="false"
        @link-click="selectItemEvent(product)"
        @add-to-cart="(lineItemId) => $emit('addToCart', lineItemId)" />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables/useAnalytics";
import type { CartType, Product } from "@/core/api/graphql/types";
import CartItemForLater from "@/shared/cart/components/cart-item-for-later.vue";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "addToCart", lineItemId: string): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  savedForLaterList: CartType | undefined;
  products: Product[];
}

const products = toRef(props, "products");
const savedForLaterList = toRef(props, "savedForLaterList");

const listProperties = computed(() => ({
  item_list_id: "recently_browsed_products",
  item_list_name: t("pages.cart.recently_browsed_products"),
}));

const { analytics } = useAnalytics();
const { t } = useI18n();

function selectItemEvent(item: Product) {
  analytics("selectItem", item, listProperties.value);
}

watch(
  products,
  (productsValue) => {
    if (!productsValue?.length) {
      return;
    }

    analytics("viewItemList", productsValue, listProperties.value);
  },
  {
    immediate: true,
  },
);
</script>

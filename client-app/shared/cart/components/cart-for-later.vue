<template>
  <VcWidget
    :title="$t('pages.cart.saved_for_later')"
    prepend-icon="bookmark"
    size="lg">
    <VcProductsGrid short>
      <CartItemForLater
        v-for="(item, index) in savedForLaterList?.items"
        :key="index"
        :item="item"
        :saved-for-later-list="savedForLaterList"
        :background="false"
        @link-click="selectItemEvent(item.product)"
        @add-to-cart="(lineItemId) => $emit('addToCart', lineItemId)" />
    </VcProductsGrid>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables/useAnalytics";
import type { SavedForLaterListFragment, Product } from "@/core/api/graphql/types";
import CartItemForLater from "@/shared/cart/components/cart-item-for-later.vue";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
  (event: "addToCart", lineItemId: string): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  savedForLaterList: SavedForLaterListFragment | undefined;
}

const savedForLaterList = toRef(props, "savedForLaterList");

const listProperties = computed(() => ({
  item_list_id: "recently_browsed_products",
  item_list_name: t("pages.cart.recently_browsed_products"),
}));

const { analytics } = useAnalytics();
const { t } = useI18n();

function selectItemEvent(item?: Pick<SavedForLaterListFragment['items'][number], 'product'>) {
  if(!item) {
    return;
  }

  analytics("selectItem", item as Product, listProperties.value);
}
</script>

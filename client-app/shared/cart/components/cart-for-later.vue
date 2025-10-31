<template>
  <VcWidget :title="$t('pages.cart.saved_for_later')" prepend-icon="bookmark" size="lg" class="cart-for-later">
    <template v-slot:append>
      <VcButton variant="outline" :to="{ name: ROUTES.SAVED_FOR_LATER.NAME }" size="sm">
        {{ $t("common.buttons.see_all") }}
      </VcButton>
    </template>

    <VcProductsGrid>
      <CartItemForLater
        v-for="(item, index) in visibleItems"
        :key="index"
        :item="item"
        :saved-for-later-list="savedForLaterList"
        :background="false"
        :loading="loading"
        @link-click="selectItemEvent(item.product)"
        @add-to-cart="(lineItemId) => $emit('addToCart', lineItemId)"
      />
    </VcProductsGrid>

    <div v-if="maxVisibleItems < (savedForLaterList?.items.length ?? 0)" class="cart-for-later__show-more">
      <VcButton variant="no-border" append-icon="chevron-down" @click="maxVisibleItems += VISIBLE_ITEMS_STEP">
        {{ $t("common.buttons.show_more") }}
      </VcButton>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, toRef, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { ROUTES } from "@/router/routes/constants";
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
  loading?: boolean;
}

const savedForLaterList = toRef(props, "savedForLaterList");

const VISIBLE_ITEMS_STEP = 6;
const maxVisibleItems = ref(6);
const visibleItems = computed(() => savedForLaterList.value?.items.slice(0, maxVisibleItems.value));

const listProperties = computed(() => ({
  item_list_id: "recently_browsed_products",
  item_list_name: t("pages.cart.recently_browsed_products"),
}));

const { analytics } = useAnalytics();
const { t } = useI18n();

function selectItemEvent(item?: SavedForLaterListFragment["items"][number]["product"]) {
  if (!item) {
    return;
  }

  analytics("selectItem", item as Product, listProperties.value);
}
</script>

<style lang="scss">
.cart-for-later {
  &__show-more {
    @apply border-t pt-5 text-center;
  }
}
</style>

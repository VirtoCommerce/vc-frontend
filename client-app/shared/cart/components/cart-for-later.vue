<template>
  <VcWidget :title="$t('pages.cart.saved_for_later')" prepend-icon="bookmark" size="lg" class="cart-for-later">
    <template v-slot:append>
      <VcButton
        variant="outline"
        data-test-id="cart-for-later.see-all-button"
        :to="{ name: ROUTES.SAVED_FOR_LATER.NAME }"
        size="sm"
      >
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
        @link-click="selectItemEvent(item.product, index)"
        @add-to-cart="(lineItemId) => $emit('addToCart', lineItemId)"
      />
    </VcProductsGrid>

    <div v-if="maxVisibleItems < availableItems.length" class="cart-for-later__show-more">
      <VcButton
        variant="surface"
        append-icon="chevron-down"
        data-test-id="cart-for-later.show-more-button"
        @click="maxVisibleItems += VISIBLE_ITEMS_STEP"
      >
        {{ $t("common.buttons.show_more") }}
      </VcButton>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, toRef, ref, watch } from "vue";
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
const availableItems = computed(() => savedForLaterList.value?.items.filter((item) => item.product) ?? []);
const visibleItems = computed(() => availableItems.value.slice(0, maxVisibleItems.value));

const listProperties = computed(() => ({
  item_list_id: "saved_for_later",
  item_list_name: t("pages.cart.saved_for_later"),
}));

const { analytics } = useAnalytics();
const { t } = useI18n();

function selectItemEvent(item: SavedForLaterListFragment["items"][number]["product"] | undefined, index: number) {
  if (!item) {
    return;
  }

  analytics("selectItem", item as Product, { ...listProperties.value, index });
}

// Moving a line to or from the cart refetches the list, so only a changed set of lines is a new impression
let reportedSignature: string | undefined;

watch(
  availableItems,
  (items) => {
    const signature = items.map((item) => item.id).join(",");

    if (!items.length || signature === reportedSignature) {
      return;
    }
    reportedSignature = signature;

    analytics(
      "viewItemList",
      items.map((item) => item.product as Product),
      listProperties.value,
    );
  },
  { immediate: true },
);
</script>

<style lang="scss">
.cart-for-later {
  &__show-more {
    @apply border-t pt-5 text-center;
  }
}
</style>

<template>
  <VcModal
    :title="$t('shared.wishlists.delete_wishlist_product_modal.title')"
    variant="danger"
    icon="warning"
    test-id="delete-wishlist-product-modal"
  >
    <i18n-t keypath="shared.wishlists.delete_wishlist_product_modal.message" scope="global" tag="p">
      <template #productName>
        <b class="font-black">{{ listItem.name }}</b>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton
        :loading="loading"
        color="danger"
        data-test-id="delete-wishlist-product-modal.delete-button"
        @click="remove(close)"
      >
        {{ $t("shared.wishlists.delete_wishlist_product_modal.delete_button") }}
      </VcButton>

      <VcButton
        color="secondary"
        variant="outline"
        data-test-id="delete-wishlist-product-modal.cancel-button"
        class="ms-auto"
        @click="close"
      >
        {{ $t("shared.wishlists.delete_wishlist_product_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useWishlists } from "../composables/useWishlists";
import type { InputRemoveWishlistItemType, LineItemType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "result"): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  listItem: LineItemType;
  listId: string;
  loading?: boolean;
}

const { removeItemsFromWishlists } = useWishlists();

async function remove(closingHandle: () => void) {
  const payload: InputRemoveWishlistItemType = {
    lineItemId: props.listItem.id,
    listId: props.listId,
  };

  await removeItemsFromWishlists([payload]);

  emit("result");
  closingHandle();
}
</script>

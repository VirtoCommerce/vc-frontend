<template>
  <VcPopup :title="$t('shared.wishlists.delete_wishlist_product_dialog.title')" modal-width="max-w-lg" variant="danger">
    <i18n-t
      keypath="shared.wishlists.delete_wishlist_product_dialog.message"
      scope="global"
      tag="p"
      class="border-b p-6 md:py-10"
    >
      <template #productName>
        <b class="font-extrabold">{{ listItem.name }}</b>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton :loading="loading" color="danger" @click="remove(close)">
        {{ $t("shared.wishlists.delete_wishlist_product_dialog.delete_button") }}
      </VcButton>

      <VcButton color="secondary" variant="outline" class="ms-auto" @click="close">
        {{ $t("shared.wishlists.delete_wishlist_product_dialog.cancel_button") }}
      </VcButton>
    </template>
  </VcPopup>
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
}

const { loading, removeItemsFromWishlists } = useWishlists();

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

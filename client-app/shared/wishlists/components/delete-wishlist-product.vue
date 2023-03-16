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
      <div class="flex grow justify-between space-x-4">
        <VcButton :is-waiting="loading" kind="danger" class="grow uppercase lg:grow-0 lg:px-12" @click="remove(close)">
          {{ $t("shared.wishlists.delete_wishlist_product_dialog.delete_button") }}
        </VcButton>

        <VcButton kind="secondary" class="grow uppercase lg:grow-0 lg:px-5" is-outline @click="close">
          {{ $t("shared.wishlists.delete_wishlist_product_dialog.cancel_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useWishlists } from "@/shared/wishlists";
import type { InputRemoveWishlistItemType, LineItemType } from "@/xapi/types";
import type { PropType } from "vue";

const emit = defineEmits(["result"]);

const props = defineProps({
  listItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },

  listId: {
    type: String,
    required: true,
  },
});

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

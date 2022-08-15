<template>
  <VcPopup :title="$t('shared.wishlists.delete_wishlist_product_dialog.title')" modal-width="max-w-lg" variant="danger">
    <i18n-t
      keypath="shared.wishlists.delete_wishlist_product_dialog.message"
      scope="global"
      tag="p"
      class="py-6 md:py-10 px-6 border-b"
    >
      <template #productName>
        <b class="font-extrabold">{{ listItem.name }}</b>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <div class="flex grow justify-between space-x-4">
        <VcButton
          :is-waiting="loading"
          kind="danger"
          class="uppercase flex-grow lg:flex-grow-0 lg:px-12"
          @click="remove(close)"
        >
          {{ $t("shared.wishlists.delete_wishlist_product_dialog.delete_button") }}
        </VcButton>

        <VcButton kind="secondary" class="uppercase flex-grow lg:flex-grow-0 lg:px-5" is-outline @click="close">
          {{ $t("shared.wishlists.delete_wishlist_product_dialog.cancel_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useWishlists } from "@/shared/wishlists";
import { PropType } from "vue";
import { InputRemoveWishlistItemType, LineItemType } from "@/xapi/types";

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

const emit = defineEmits(["result"]);

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

<template>
  <VcPopup :title="$t('shared.wishlists.delete_wishlist_product_dialog.title')" modal-width="max-w-lg" variant="danger">
    <p
      class="py-6 md:py-10 px-6 border-b"
      v-html="$t('shared.wishlists.delete_wishlist_product_dialog.message', { productName: listItem.name })"
    />

    <template #actions="{ close }">
      <div class="flex grow justify-between space-x-4">
        <!-- TODO: add color options (success, warning, danger) to VcButton -->
        <VcButton
          :is-waiting="loading"
          class="uppercase flex-grow lg:flex-grow-0 lg:px-12 hover:!bg-[color:var(--color-danger-hover)] !bg-[color:var(--color-danger)]"
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
import { VcButton, VcPopup } from "@/components";
import { useWishlists } from "@/shared/wishlists";
import { PropType } from "vue";
import { InputRemoveWishlistItemType, LineItemType } from "@core/api/graphql/types";

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

  closingHandle();
}
</script>

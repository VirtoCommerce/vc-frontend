<template>
  <VcPopup :title="$t('shared.wishlists.delete_wishlist_dialog.title')" modal-width="max-w-lg" variant="danger">
    <i18n-t
      class="border-b p-6 md:py-10"
      keypath="shared.wishlists.delete_wishlist_dialog.message"
      tag="p"
      scope="global"
    >
      <template #listName>
        <span class="font-extrabold">{{ list.name }}</span>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton :loading="loading" color="danger" @click="remove(close)">
        {{ $t("shared.wishlists.delete_wishlist_dialog.delete_button") }}
      </VcButton>

      <VcButton class="ms-auto" color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.delete_wishlist_dialog.cancel_button") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useWishlists } from "@/shared/wishlists";
import type { WishlistType } from "@/core/api/graphql/types";
import type { PropType } from "vue";

const props = defineProps({
  list: {
    type: Object as PropType<WishlistType>,
    required: true,
  },
});

const { loading, removeWishlist } = useWishlists();

async function remove(closingHandle: () => void) {
  const result: boolean = await removeWishlist(props.list.id!);

  if (result) {
    closingHandle();
  }
}
</script>

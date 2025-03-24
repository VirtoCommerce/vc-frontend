<template>
  <VcModal :title="$t('shared.wishlists.delete_wishlist_modal.title')" variant="danger" icon="warning">
    <i18n-t keypath="shared.wishlists.delete_wishlist_modal.message" tag="p" scope="global">
      <template #listName>
        <span class="font-black">{{ list.name }}</span>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton min-width="8rem" :loading="loading" color="danger" @click="remove(close)">
        {{ $t("shared.wishlists.delete_wishlist_modal.delete_button") }}
      </VcButton>

      <VcButton min-width="8rem" class="ms-auto" color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.delete_wishlist_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useWishlists } from "../composables";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list: WishlistType;
}

const props = defineProps<IProps>();

const { loading, removeWishlist } = useWishlists();

async function remove(closingHandle: () => void) {
  const result: boolean = await removeWishlist(props.list.id!);

  if (result) {
    closingHandle();
  }
}
</script>

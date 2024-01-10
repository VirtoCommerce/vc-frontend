<template>
  <VcModal :title="$t('shared.wishlists.delete_wishlist_modal.title')" modal-width="max-w-lg" variant="danger">
    <i18n-t
      class="border-b p-6 md:py-10"
      keypath="shared.wishlists.delete_wishlist_modal.message"
      tag="p"
      scope="global"
    >
      <template #listName>
        <span class="font-extrabold">{{ list.name }}</span>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <div class="flex grow justify-between space-x-4">
        <VcButton :loading="loading" color="danger" class="flex-1 sm:flex-none" @click="remove(close)">
          {{ $t("shared.wishlists.delete_wishlist_modal.delete_button") }}
        </VcButton>

        <VcButton color="secondary" variant="outline" class="flex-1 sm:flex-none" @click="close">
          {{ $t("shared.wishlists.delete_wishlist_modal.cancel_button") }}
        </VcButton>
      </div>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useWishlists } from "../composables";
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

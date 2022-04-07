<template>
  <VcPopup :title="$t('shared.wishlists.delete_wishlist_dialog.title')" modal-width="max-w-lg" variant="danger">
    <p
      class="py-6 md:py-10 px-6 border-b"
      v-html="$t('shared.wishlists.delete_wishlist_dialog.message', { listName: list.name })"
    />

    <template #actions="{ close }">
      <div class="flex grow justify-between space-x-4">
        <!-- TODO: add color options (success, warning, danger) to VcButton -->
        <VcButton
          :is-waiting="loading"
          class="uppercase flex-grow lg:flex-grow-0 lg:px-12 hover:!bg-[color:var(--color-danger-hover)] !bg-[color:var(--color-danger)]"
          @click="remove(close)"
        >
          {{ $t("shared.wishlists.delete_wishlist_dialog.delete_button") }}
        </VcButton>

        <VcButton kind="secondary" class="uppercase flex-grow lg:flex-grow-0 lg:px-5" is-outline @click="close">
          {{ $t("shared.wishlists.delete_wishlist_dialog.cancel_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcButton, VcPopup } from "@/components";
import { useWishlists } from "@/shared/wishlists";
import { PropType } from "vue";
import { WishlistType } from "@core/api/graphql/types";

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

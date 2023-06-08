<template>
  <VcPopup variant="warn">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.wishlists.unsuccessful_create_wishlist_dialog.ok_button") }}
      </VcButton>
    </template>
    <div class="px-5 py-10 text-center">
      <span v-t="'shared.wishlists.unsuccessful_create_wishlist_dialog.message'" class="text-lg"></span>
    </div>
  </VcPopup>
</template>

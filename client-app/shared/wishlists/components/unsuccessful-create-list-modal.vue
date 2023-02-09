<template>
  <VcPopup variant="warn">
    <template #actions="{ close }">
      <VcButton class="uppercase mx-auto inline-flex px-10" @click="close">
        {{ $t("shared.wishlists.unsuccessful_create_wishlist_dialog.ok_button") }}
      </VcButton>
    </template>
    <div class="text-center px-5 py-10">
      <span v-t="'shared.wishlists.unsuccessful_create_wishlist_dialog.message'" class="text-lg"></span>
    </div>
  </VcPopup>
</template>

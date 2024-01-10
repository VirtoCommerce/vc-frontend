<template>
  <VcModal variant="warn">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.wishlists.unsuccessful_create_wishlist_modal.ok_button") }}
      </VcButton>
    </template>
    <div class="px-5 py-10 text-center">
      <span v-t="'shared.wishlists.unsuccessful_create_wishlist_modal.message'" class="text-lg"></span>
    </div>
  </VcModal>
</template>

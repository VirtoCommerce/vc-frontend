<template>
  <VcModal variant="warning">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.wishlists.unsuccessful_create_wishlist_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.wishlists.unsuccessful_create_wishlist_modal.message") }}
  </VcModal>
</template>

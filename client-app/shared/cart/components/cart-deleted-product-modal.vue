<template>
  <VcModal
    class="cart-deleted-product-modal"
    :title="$t('common.titles.remove_products')"
    variant="danger"
    icon="warning"
  >
    <template #actions="{ close }">
      <VcButton class="cart-deleted-product-modal__button" @click="close()">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>

    {{ $t("common.messages.cart_contains_deleted_products") }}
  </VcModal>
</template>

<style lang="scss">
.cart-deleted-product-modal {
  &__button {
    @apply mx-auto;
  }
}
</style>

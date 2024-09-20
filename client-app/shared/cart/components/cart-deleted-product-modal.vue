<template>
  <VcModal :title="$t('common.titles.remove_products')" variant="danger" icon="warning">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close()">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>

    {{ $t("common.messages.cart_contains_deleted_products") }}
  </VcModal>
</template>

<template>
  <VcModal :title="$t('common.titles.remove_products')" variant="danger">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close()">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>

    <div class="flex items-center justify-center px-5 py-10">
      <VcIcon name="x-circle" size="xxl" class="mr-4 text-danger" />

      <span class="text-lg">
        {{ $t("common.messages.cart_contains_deleted_products") }}
      </span>
    </div>
  </VcModal>
</template>

<script setup lang="ts"></script>

<template>
  <VcPopup :title="$t('common.titles.remove_products')" variant="danger">
    <template #actions="{ close }">
      <div class="mx-auto flex space-x-5">
        <VcButton class="mx-auto inline-flex px-10 uppercase" @click="close()">
          {{ $t("common.buttons.ok") }}
        </VcButton>
      </div>
    </template>

    <div class="flex items-center justify-center px-5 py-10">
      <VcIcon name="x-circle" size="xxl" class="mr-4 text-[color:var(--color-danger)]" />

      <span class="text-lg">
        {{ $t("common.messages.cart_contains_deleted_products") }}
      </span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts"></script>

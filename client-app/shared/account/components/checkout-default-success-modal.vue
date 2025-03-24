<template>
  <VcModal variant="success" :title="$t('shared.account.checkout_default_success_modal.title')" icon="apply">
    <template #actions="{ close }">
      <VcButton min-width="8rem" class="mx-auto" @click="close">
        {{ $t("shared.account.checkout_default_success_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.account.checkout_default_success_modal.message") }}
  </VcModal>
</template>

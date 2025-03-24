<template>
  <VcModal variant="success" :title="$t('shared.account.registration_success_modal.title')" icon="apply">
    <template #actions="{ close }">
      <VcButton to="/" min-width="8rem" class="mx-auto" @click="close">
        {{ $t("shared.account.registration_success_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.account.registration_success_modal.message") }}
  </VcModal>
</template>

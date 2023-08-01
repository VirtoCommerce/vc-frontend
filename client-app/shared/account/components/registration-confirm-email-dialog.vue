<template>
  <VcPopup variant="success" :title="$t('shared.account.registration_confirm_email_dialog.title')" is-persistent>
    <template #actions="{ close }">
      <VcButton to="/" class="mx-auto" @click="close">
        {{ $t("shared.account.registration_confirm_email_dialog.ok_button") }}
      </VcButton>
    </template>
    <div class="flex items-center justify-center px-5 py-10">
      <i class="fas fa-check-circle mr-4 text-5xl text-green-500"></i>
      <span v-t="'shared.account.registration_confirm_email_dialog.message'" class="text-lg"></span>
    </div>
  </VcPopup>
</template>

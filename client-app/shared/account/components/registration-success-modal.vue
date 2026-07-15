<template>
  <VcModal
    class="registration-success-modal"
    variant="success"
    :title="$t('shared.account.registration_success_modal.title')"
    icon="apply"
  >
    <template #actions="{ close }">
      <VcButton to="/" class="registration-success-modal__button" @click="close">
        {{ $t("shared.account.registration_success_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.account.registration_success_modal.message") }}
  </VcModal>
</template>

<style lang="scss">
.registration-success-modal {
  &__button {
    @apply mx-auto;
  }
}
</style>

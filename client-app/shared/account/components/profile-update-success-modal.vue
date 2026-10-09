<template>
  <VcModal
    class="profile-update-success-modal"
    variant="success"
    :title="$t('shared.account.profile_update_success_modal.title')"
    icon="apply"
  >
    <template #actions="{ close }">
      <VcButton class="profile-update-success-modal__button" @click="close">
        {{ $t("shared.account.profile_update_success_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.account.profile_update_success_modal.message") }}
  </VcModal>
</template>

<style lang="scss">
.profile-update-success-modal {
  &__button {
    @apply mx-auto;
  }
}
</style>

<template>
  <VcModal variant="success" :title="$t('shared.account.profile_update_success_modal.title')" icon="apply">
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.account.profile_update_success_modal.ok_button") }}
      </VcButton>
    </template>

    {{ $t("shared.account.profile_update_success_modal.message") }}
  </VcModal>
</template>

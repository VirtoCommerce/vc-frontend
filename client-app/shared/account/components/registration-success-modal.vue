<template>
  <VcModal variant="success" :title="$t('shared.account.registration_success_modal.title')" is-persistent>
    <template #actions="{ close }">
      <VcButton to="/" class="mx-auto" @click="close">
        {{ $t("shared.account.registration_success_modal.ok_button") }}
      </VcButton>
    </template>
    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="text-success" name="check-circle" size="lg" />

      <span class="text-lg">
        {{ $t("shared.account.registration_success_modal.message") }}
      </span>
    </div>
  </VcModal>
</template>

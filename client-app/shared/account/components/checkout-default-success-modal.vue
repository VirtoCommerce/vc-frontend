<template>
  <VcModal variant="success" :title="$t('shared.account.checkout_default_success_modal.title')" is-persistent>
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.account.checkout_default_success_modal.ok_button") }}
      </VcButton>
    </template>
    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="text-[--color-success-500]" name="check-circle" size="lg" />

      <span class="text-lg">
        {{ $t("shared.account.checkout_default_success_modal.message") }}
      </span>
    </div>
  </VcModal>
</template>

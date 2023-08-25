<template>
  <VcPopup variant="success" :title="$t('shared.account.profile_update_success_dialog.title')" is-persistent>
    <template #actions="{ close }">
      <VcButton class="mx-auto" @click="close">
        {{ $t("shared.account.profile_update_success_dialog.ok_button") }}
      </VcButton>
    </template>
    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="text-[--color-success-500]" name="check-circle" size="lg" />

      <span v-t="'shared.account.profile_update_success_dialog.message'" class="text-lg"></span>
    </div>
  </VcPopup>
</template>

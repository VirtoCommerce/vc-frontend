<template>
  <VcModal :title="$t('common.titles.password_expired')" variant="warning" icon="warning" is-persistent>
    <template #actions>
      <VcButton @click="$emit('confirm')">
        {{ $t("common.buttons.set_new_password") }}
      </VcButton>

      <VcButton variant="outline" @click="$emit('dismiss')">
        {{ $t("common.buttons.cancel") }}
      </VcButton>
    </template>

    {{ $t("common.messages.password_about_expire", { value: expiryInDays }) }}
  </VcModal>
</template>

<script setup lang="ts">
interface IProps {
  expiryInDays?: number;
}

interface IEmits {
  (event: "confirm"): void;
  (event: "dismiss"): void;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>

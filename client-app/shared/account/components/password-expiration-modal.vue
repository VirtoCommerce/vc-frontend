<template>
  <VcModal :title="$t('common.titles.password_expired')" variant="warning" is-persistent>
    <template #actions>
      <VcButton @click="$emit('confirm')">
        {{ $t("common.buttons.set_new_password") }}
      </VcButton>

      <VcButton variant="outline" @click="$emit('dismiss')">
        {{ $t("common.buttons.cancel") }}
      </VcButton>
    </template>

    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="text-warning" name="exclamation-circle" size="lg" />

      <span class="text-lg">
        {{ $t("common.messages.password_about_expire", { value: expiryInDays }) }}
      </span>
    </div>
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

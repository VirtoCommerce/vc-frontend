<template>
  <VcPopup :title="$t('common.titles.password_expired')" variant="warn" is-persistent>
    <template #actions>
      <VcButton @click="$emit('confirm')">
        {{ $t("common.buttons.set_new_password") }}
      </VcButton>

      <VcButton variant="outline" @click="$emit('dismiss')">
        {{ $t("common.buttons.cancel") }}
      </VcButton>
    </template>

    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="text-[--color-warning-500]" name="exclamation-circle" size="lg" />

      <span class="text-lg">
        {{ $t("common.messages.password_about_expire", { value: expiryInDays }) }}
      </span>
    </div>
  </VcPopup>
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

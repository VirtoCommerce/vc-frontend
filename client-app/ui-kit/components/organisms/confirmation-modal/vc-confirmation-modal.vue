<template>
  <VcModal :title="title" :variant="variant" modal-width="sm:max-w-[30rem]" hide-actions @close="$emit('close')">
    <template #default="{ close }">
      <div class="flex flex-row justify-center gap-x-4 px-6 py-10 lg:px-10">
        <VcIcon
          v-if="!noIcon"
          :class="`mt-0.5 size-11 flex-none text-[--color-${iconVariant}-500]`"
          name="exclamation-circle"
        />

        <p class="lg:text-lg lg:font-semibold lg:leading-snug">
          {{ text }}
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-4 px-6 pb-10">
        <VcButton
          v-if="!singleButton"
          :disabled="loading"
          min-width="9rem"
          color="secondary"
          variant="outline"
          @click="close"
        >
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton :loading="loading" min-width="9rem" @click="$emit('confirm')">
          {{ $t("common.buttons.ok") }}
        </VcButton>
      </div>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

export interface IProps {
  singleButton?: boolean;
  noIcon?: boolean;
  title?: string;
  text?: string;
  variant?: "info" | "success" | "warn" | "danger";
  iconVariant?: "info" | "success" | "warning" | "danger";
  loading?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  variant: "danger",
  iconVariant: "danger",
  loading: false,
});
</script>

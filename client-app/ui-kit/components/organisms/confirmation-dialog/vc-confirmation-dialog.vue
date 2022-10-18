<template>
  <VcPopup :title="title" :variant="variant" modal-width="sm:max-w-[30rem]" hide-actions @close="$emit('close')">
    <template #default="{ close }">
      <div class="flex flex-row justify-center px-6 lg:px-10 py-10 gap-x-4">
        <div
          v-if="!noIcon"
          :class="`bg-[color:var(--color-${iconVariant})]`"
          class="flex shrink-0 items-center justify-center w-11 h-11 mt-0.5 rounded-full"
        >
          <svg width="6" height="23" class="text-white">
            <use href="/static/images/exclamation.svg#main" />
          </svg>
        </div>

        <p class="lg:font-semibold lg:text-lg lg:leading-snug">
          {{ text }}
        </p>
      </div>

      <div class="flex flex-row justify-center px-6 pb-10 gap-x-4">
        <VcButton
          v-if="!singleButton"
          :is-disabled="loading"
          kind="secondary"
          class="uppercase w-36"
          is-outline
          @click="close"
        >
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton :is-waiting="loading" class="uppercase w-36" @click="$emit('confirm')">
          {{ $t("common.buttons.ok") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
defineEmits(["confirm", "close"]);

defineProps({
  singleButton: Boolean,
  noIcon: Boolean,
  title: String,
  text: String,

  variant: {
    type: String,
    default: "danger",
    validator: (value: string) => ["info", "success", "warn", "danger"].includes(value),
  },

  iconVariant: {
    type: String,
    default: "danger",
    validator: (value: string) => ["info", "success", "warning", "danger"].includes(value),
  },

  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <teleport to="body">
    <div class="vc-actions-popup">
      <div class="vc-actions-popup__inner">
        <div class="vc-actions-popup__header">
          <span class="vc-actions-popup__title">
            {{ $t("common.titles.all_actions") }}
          </span>

          <button
            type="button"
            class="vc-actions-popup__close-button"
            @click="$emit('close')"
            @keyup.esc="$emit('close')"
          >
            <i class="fas fa-times-circle" />
          </button>
        </div>

        <div class="vc-actions-popup__body">
          <button
            v-for="(action, index) in actions"
            :key="index"
            type="button"
            class="vc-actions-popup-button"
            @click="$emit('select', action)"
          >
            <i :class="['vc-actions-popup-button__icon', action.icon]" />
            <span class="vc-actions-popup-button__text">
              {{ action.title }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

defineEmits<{
  (event: "close"): void;
  (event: "select", action: SlidingActionsItem): void;
}>();

defineProps({
  actions: {
    type: Array as PropType<SlidingActionsItem[]>,
    default: () => [],
    required: true,
  },
});
</script>

<style scoped lang="scss">
.vc-actions-popup {
  @apply flex items-center justify-center absolute inset-0 z-40 bg-gray-900 bg-opacity-10;

  &__inner {
    @apply w-72 max-w-[90%] px-4 py-2 border rounded-md bg-white shadow-md;
  }

  &__header {
    @apply flex items-center mb-2;
  }

  &__title {
    @apply flex-1 pr-4 text-lg tracking-[-0.01em] font-semibold truncate;
  }

  &__close-button {
    @apply px-4 py-2 -mx-4 -my-2 text-[#c2d7e4];
  }

  &__body {
    @apply flex flex-wrap justify-evenly py-2 gap-1;
  }

  &-button {
    @apply flex grow flex-col items-center min-w-[80px] max-w-[80px] py-3 text-[#319ed4] select-none;

    &__icon {
      @apply text-xl leading-none mb-2;
    }

    &__text {
      @apply block font-roboto text-sm text-center leading-none;
    }
  }
}
</style>

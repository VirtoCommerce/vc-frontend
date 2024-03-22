<template>
  <VcPopover class="vc-push-messages" trigger="click" :placement="placement" :y-offset="yOffset">
    <template #trigger>
      <slot name="trigger" />
    </template>

    <template #content>
      <div class="vc-push-messages__dropdown">
        <div class="vc-push-messages__arrow-container">
          <div class="vc-push-messages__popper" data-popper-arrow>
            <div class="vc-push-messages__arrow"></div>
          </div>
        </div>

        <div class="vc-push-messages__list">
          <div class="vc-push-messages__head">
            <div class="vc-push-messages__title">
              <span>{{ $t("ui_kit.push-messages.title") }}</span>

              <VcBadge v-if="unreadCount > 0" variant="outline" size="lg" rounded>
                {{ unreadCount }}
              </VcBadge>
            </div>

            <VcDropdownMenu
              v-if="withOptions && totalCount > 0"
              class="vc-push-messages__options"
              placement="bottom-end"
            >
              <template #trigger>
                <VcIcon class="vc-push-messages__options-icon" name="dots-vertical" size="sm" />
              </template>

              <template #content="{ close }">
                <VcMenuItem
                  @click="
                    close();
                    $emit('markReadAll');
                  "
                >
                  {{ $t("ui_kit.push-messages.options.make_all_as_read") }}
                </VcMenuItem>

                <VcMenuItem
                  @click="
                    close();
                    $emit('markUnreadAll');
                  "
                >
                  {{ $t("ui_kit.push-messages.options.make_all_as_unread") }}
                </VcMenuItem>
              </template>
            </VcDropdownMenu>
          </div>

          <div class="vc-push-messages__body">
            <slot name="items" />

            <div v-if="totalCount === 0" class="vc-push-messages__empty">
              <div class="vc-push-messages__empty-title">
                {{ $t("ui_kit.push-messages.empty.title") }}
              </div>

              <div class="vc-push-messages__empty-text">
                {{ $t("ui_kit.push-messages.empty.description") }}
              </div>
            </div>
          </div>

          <div class="vc-push-messages__foot">
            <VcButton v-if="removable" variant="outline" color="secondary" size="xs" @click="$emit('clearAll')">
              {{ $t("ui_kit.push-messages.clear_all") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "markReadAll"): void;
  (event: "markUnreadAll"): void;
  (event: "clearAll"): void;
}

interface IProps {
  totalCount: number;
  unreadCount: number;
  removable?: boolean;
  withOptions?: boolean;
  yOffset?: number | string;
  placement?: VcPopoverPlacement;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  yOffset: 30,
  placement: "bottom-end",
});
</script>

<style lang="scss">
.vc-push-messages {
  &__dropdown {
    @apply px-1.5 w-screen;

    @media (min-width: theme("screens.sm")) {
      @apply max-w-none w-[25rem] px-0;
    }
  }

  &__arrow-container {
    @apply relative;
  }

  &__popper {
    @apply -top-2.5 w-5 h-2.5 p-1 overflow-hidden;
  }

  &__arrow {
    @apply w-3 h-3 bg-additional-50 rotate-45 shadow-md;
  }

  &__list {
    @apply flex flex-col divide-y bg-additional-50 rounded text-neutral-950 shadow-2xl max-h-[calc(100vh-5rem)];

    @media (min-width: theme("screens.lg")) {
      @apply max-h-[calc(100vh-10rem)];
    }
  }

  &__head {
    @apply flex items-center gap-2 ps-4 pe-2 py-4;
  }

  &__title {
    @apply flex items-center gap-2 me-auto text-base font-bold;
  }

  &__options {
    @apply ms-2;
  }

  &__options-icon {
    @apply text-neutral;

    &:hover {
      @apply text-neutral-700;
    }
  }

  &__body {
    @apply overflow-y-auto divide-y;
  }

  &__empty {
    @apply px-4.5 py-5 text-neutral-950 space-y-0.5;
  }

  &__empty-title {
    @apply text-sm font-bold;
  }

  &__empty-text {
    @apply text-xs;
  }

  &__foot {
    @apply flex justify-between p-4 empty:hidden;
  }
}
</style>

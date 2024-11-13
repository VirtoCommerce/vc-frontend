<template>
  <VcPopover class="vc-push-messages" :placement="placement" :offset-options="offsetOptions" arrow-enabled>
    <template #trigger>
      <slot name="trigger" />
    </template>

    <template #content="{ close: closeMessages }">
      <div class="vc-push-messages__dropdown">
        <div class="vc-push-messages__list">
          <div class="vc-push-messages__head">
            <div class="vc-push-messages__title">
              <span>{{ $t("ui_kit.push-messages.title") }}</span>

              <VcBadge v-if="unreadCount > 0" variant="outline" size="lg" rounded>
                {{ unreadCount }}
              </VcBadge>
            </div>

            <VcSwitch v-model="unreadVisibility" size="sm">
              {{ $t("ui_kit.push-messages.show_unread_only") }}
            </VcSwitch>

            <VcDropdownMenu
              :class="['vc-push-messages__options', { 'vc-push-messages__options--invisible': !withOptions }]"
              placement="bottom-end"
            >
              <template #trigger>
                <VcIcon class="vc-push-messages__options-icon" name="dots-vertical" size="sm" />
              </template>

              <template #content="{ close: closeMenu }">
                <VcMenuItem
                  @click="
                    closeMenu();
                    $emit('markReadAll');
                  "
                >
                  {{ $t("ui_kit.push-messages.options.make_all_as_read") }}
                </VcMenuItem>

                <VcMenuItem
                  @click="
                    closeMenu();
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
            <VcButton
              v-if="removable && totalCount"
              variant="outline"
              color="secondary"
              size="xs"
              class="vc-push-messages__action-left"
              @click="$emit('clearAll')"
            >
              {{ $t("ui_kit.push-messages.clear_all") }}
            </VcButton>
            <VcButton
              v-if="canViewAll"
              variant="outline"
              color="secondary"
              size="xs"
              class="vc-push-messages__action-right"
              @click="
                closeMessages();
                $emit('viewAll');
              "
            >
              {{ $t("ui_kit.push-messages.view_all") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";

export interface IEmits {
  (event: "markReadAll"): void;
  (event: "markUnreadAll"): void;
  (event: "clearAll"): void;
  (event: "viewAll"): void;
  (event: "update:showUnreadOnly", value: boolean): void;
}

interface IProps {
  totalCount: number;
  unreadCount: number;
  removable?: boolean;
  canViewAll?: boolean;
  showUnreadOnly?: boolean;
  withOptions?: boolean;
  offsetOptions?: VcPushMessagesOffsetOptionsType;
  placement?: VcPushMessagesPlacementType;
}

const emits = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  offsetOptions: 12,
  placement: "bottom-end",
});

const unreadVisibility = useVModel(props, "showUnreadOnly", emits);
</script>

<style lang="scss">
.vc-push-messages {
  &__dropdown {
    @apply px-1.5 w-screen;

    @media (min-width: theme("screens.sm")) {
      @apply max-w-none w-[25rem] px-0;
    }
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
    &--invisible {
      @apply invisible;
    }
  }

  &__options-icon {
    @apply fill-neutral;

    &:hover {
      @apply fill-neutral-700;
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

  &__action-left {
    @apply mr-auto;
  }

  &__action-right {
    @apply ml-auto;
  }
}
</style>

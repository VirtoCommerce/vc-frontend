<template>
  <VcPopover class="vc-push-notifications" trigger="click" :placement="placement" :y-offset="yOffset">
    <template #trigger>
      <slot />
    </template>

    <template #content>
      <div class="vc-push-notifications__dropdown">
        <div class="vc-push-notifications__arrow-container">
          <div class="vc-push-notifications__popper" data-popper-arrow>
            <div class="vc-push-notifications__arrow"></div>
          </div>
        </div>

        <div class="vc-push-notifications__list">
          <div class="vc-push-notifications__head">
            <div class="vc-push-notifications__title">
              <span>{{ $t("ui_kit.push-notifications.title") }}</span>

              <VcBadge v-if="totalCount > 0" variant="outline" size="lg" rounded>
                {{ totalCount }}
              </VcBadge>
            </div>

            <VcDropdownMenu v-if="options && totalCount" class="vc-push-notifications__options" placement="bottom-end">
              <template #trigger>
                <VcIcon class="vc-push-notifications__options-icon" name="dots-vertical" size="sm" />
              </template>

              <template #content="{ close }">
                <VcMenuItem
                  @click="
                    close();
                    $emit('readAll');
                  "
                >
                  {{ $t("ui_kit.push-notifications.options.make_all_as_read") }}
                </VcMenuItem>

                <VcMenuItem
                  @click="
                    close();
                    $emit('unreadAll');
                  "
                >
                  {{ $t("ui_kit.push-notifications.options.make_all_as_unread") }}
                </VcMenuItem>
              </template>
            </VcDropdownMenu>
          </div>

          <div class="vc-push-notifications__body">
            <VcPushNotification
              v-for="item in items"
              :key="item.id"
              :notification="item"
              :removable="removable"
              @click="$emit('itemClick', item)"
              @remove="$emit('itemRemove', item)"
            />

            <div v-if="totalCount === 0" class="vc-push-notifications__empty">
              <div class="vc-push-notifications__empty-title">
                {{ $t("ui_kit.push-notifications.empty.title") }}
              </div>

              <div class="vc-push-notifications__empty-text">
                {{ $t("ui_kit.push-notifications.empty.description") }}
              </div>
            </div>
          </div>

          <div class="vc-push-notifications__foot">
            <VcButton v-if="removable" variant="outline" color="secondary" size="xs" @click="$emit('clearAll')">
              {{ $t("ui_kit.push-notifications.clear_all") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "itemClick", item: VcPushNotificationType): void;
  (event: "itemRemove", item: VcPushNotificationType): void;
  (event: "readAll"): void;
  (event: "unreadAll"): void;
  (event: "clearAll"): void;
}

interface IProps {
  totalCount: number;
  items: VcPushNotificationType[];
  removable?: boolean;
  options?: boolean;
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
.vc-push-notifications {
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

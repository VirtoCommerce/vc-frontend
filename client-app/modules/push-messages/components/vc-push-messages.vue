<template>
  <VcPopover
    class="vc-push-messages"
    :placement="placement"
    :offset-options="offsetOptions"
    arrow-enabled
    max-height="none"
    close-on-blur
  >
    <template #trigger>
      <slot name="trigger" />
    </template>

    <template #content="{ close: closeMessages }">
      <VcDialog dividers class="vc-push-messages__dialog" tabindex="-1">
        <VcDialogHeader :closable="false">
          <template #main>
            <div class="vc-push-messages__head">
              <div class="vc-push-messages__title">
                <span>{{ $t("push_messages.title") }}</span>

                <VcBadge v-if="unreadCount > 0" variant="outline" size="lg" rounded>
                  {{ unreadCount }}
                </VcBadge>
              </div>

              <VcSwitch v-model="unreadVisibility" size="sm">
                {{ $t("push_messages.show_unread_only") }}
              </VcSwitch>

              <VcDropdownMenu
                :class="['vc-push-messages__options', { 'vc-push-messages__options--invisible': !withOptions }]"
                placement="bottom-end"
                close-on-blur
              >
                <template #trigger>
                  <VcButton size="sm" icon variant="no-background">
                    <VcIcon class="vc-push-messages__options-icon" name="dots-vertical" size="sm" />
                  </VcButton>
                </template>

                <template #content="{ close: closeMenu }">
                  <VcMenuItem
                    @click="
                      closeMenu();
                      $emit('markReadAll');
                    "
                  >
                    {{ $t("push_messages.options.make_all_as_read") }}
                  </VcMenuItem>

                  <VcMenuItem
                    @click="
                      closeMenu();
                      $emit('markUnreadAll');
                    "
                  >
                    {{ $t("push_messages.options.make_all_as_unread") }}
                  </VcMenuItem>
                </template>
              </VcDropdownMenu>
            </div>
          </template>
        </VcDialogHeader>

        <VcDialogContent>
          <template #container>
            <div class="vc-push-messages__items">
              <slot name="items" />
            </div>

            <div v-if="totalCount === 0" class="vc-push-messages__empty">
              <div class="vc-push-messages__empty-title">
                {{ $t("push_messages.empty.title") }}
              </div>

              <div class="vc-push-messages__empty-text">
                {{ $t("push_messages.empty.description") }}
              </div>
            </div>
          </template>
        </VcDialogContent>

        <VcDialogFooter>
          <template #container>
            <div class="vc-push-messages__foot" tabindex="-1">
              <VcButton
                v-if="removable && totalCount"
                variant="outline"
                color="secondary"
                size="xs"
                class="vc-push-messages__action-start"
                @click="$emit('clearAll')"
              >
                {{ $t("push_messages.clear_all") }}
              </VcButton>

              <VcButton
                v-if="canViewAll"
                variant="outline"
                color="secondary"
                size="xs"
                class="vc-push-messages__action-end"
                @click="
                  closeMessages();
                  $emit('viewAll');
                "
              >
                {{ $t("push_messages.view_all") }}
              </VcButton>
            </div>
          </template>
        </VcDialogFooter>
      </VcDialog>
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
  offsetOptions?: VcPopoverOffsetOptionsType;
  placement?: VcPopoverPlacementType;
  closeOnBlur?: boolean;
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
  --vc-dialog-width: calc(100vw - 1rem);
  --vc-dialog-max-height: calc(100vh - 5rem);

  @media (min-width: theme("screens.sm")) {
    --vc-dialog-width: 25rem;
    --vc-dialog-max-height: calc(100vh - 10rem);
  }

  &__head {
    @apply flex items-center gap-2 w-full min-h-14 ps-4 pe-1 py-1;
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
    @apply fill-neutral group-hover:fill-neutral-700;
  }

  &__dialog {
    @media (width < theme("screens.sm")) {
      @apply mx-2;
    }
  }

  &__items {
    @apply divide-y;
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

  &__action-start {
    @apply me-auto;
  }

  &__action-end {
    @apply ms-auto;
  }

  &__foot {
    @apply flex gap-3 px-4 py-2 w-full;
  }
}
</style>

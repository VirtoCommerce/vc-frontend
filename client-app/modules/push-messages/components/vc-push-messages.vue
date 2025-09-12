<template>
  <VcPopover
    class="vc-push-messages"
    :placement="placement"
    :offset-options="offsetOptions"
    arrow-enabled
    max-height="none"
  >
    <template #default="{ triggerProps }">
      <slot name="trigger" :trigger-props="triggerProps" />
    </template>

    <template #content="{ close: closeMessages }">
      <VcDialog dividers size="xs">
        <VcDialogHeader :closable="false">
          <div class="vc-push-messages__head">
            <div class="vc-push-messages__title">
              <span>{{ $t("push_messages.title") }}</span>

              <VcBadge v-if="unreadCount > 0" variant="outline" size="sm" rounded>
                {{ unreadCount }}
              </VcBadge>
            </div>

            <VcSwitch v-model="unreadVisibility" size="sm">
              {{ $t("push_messages.show_unread_only") }}
            </VcSwitch>

            <VcDropdownMenu
              :class="['vc-push-messages__options', { 'vc-push-messages__options--invisible': !withOptions }]"
              placement="bottom-end"
              width="9rem"
            >
              <template #trigger="{ triggerProps }">
                <VcButton icon variant="no-background" v-bind="triggerProps">
                  <VcIcon class="vc-push-messages__options-icon" name="dots-vertical" size="sm" />
                </VcButton>
              </template>

              <template #content="{ close: closeMenu }">
                <VcMenuItem
                  truncate
                  @click="
                    closeMenu();
                    $emit('markReadAll');
                  "
                >
                  <span>{{ $t("push_messages.options.make_all_as_read") }}</span>
                </VcMenuItem>

                <VcMenuItem
                  truncate
                  @click="
                    closeMenu();
                    $emit('markUnreadAll');
                  "
                >
                  <span>{{ $t("push_messages.options.make_all_as_unread") }}</span>
                </VcMenuItem>
              </template>
            </VcDropdownMenu>
          </div>
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
          <div class="vc-push-messages__foot">
            <VcButton
              v-if="removable && totalCount"
              variant="outline"
              color="secondary"
              class="vc-push-messages__action-start"
              @click="$emit('clearAll')"
            >
              {{ $t("push_messages.clear_all") }}
            </VcButton>

            <VcButton
              v-if="canViewAll"
              variant="outline"
              color="secondary"
              class="vc-push-messages__action-end"
              @click="
                closeMessages();
                $emit('viewAll');
              "
            >
              {{ $t("push_messages.view_all") }}
            </VcButton>
          </div>
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
    @apply flex items-center gap-2 w-full;
  }

  &__title {
    @apply flex items-center gap-2 me-auto;
  }

  &__options {
    @apply -me-3 -my-1;

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
    @apply flex gap-3 w-full;
  }
}
</style>

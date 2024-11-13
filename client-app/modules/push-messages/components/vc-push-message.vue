<template>
  <div
    :class="[
      'vc-push-message',
      `vc-push-message--size--${size}`,
      {
        'vc-push-message--unread': !pushMessage.isRead,
      },
    ]"
  >
    <VcBadge class="vc-push-message__badge" color="info" rounded />

    <div class="vc-push-message__info">
      <VcMarkdownRender class="vc-push-message__content" :src="pushMessage.shortMessage" />

      <div class="vc-push-message__date">
        {{ $d(pushMessage.createdDate, { key: "long", second: undefined }) }}
      </div>
    </div>

    <VcButton
      v-if="removable"
      class="vc-push-message__button"
      size="xs"
      color="neutral"
      variant="no-background"
      icon="delete-thin"
      @click="
        $emit('remove');
        $event.stopPropagation();
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { VcPushMessageType } from "@/modules/push-messages/types";

export interface IEmits {
  (event: "remove"): void;
}

interface IProps {
  pushMessage: VcPushMessageType;
  removable?: boolean;
  size?: "md" | "lg";
}

defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  size: "md",
});
</script>

<style lang="scss">
.vc-push-message {
  $unread: "";

  @apply flex items-start;

  &--size {
    &--md {
      @apply ps-3 pe-1 py-2;
    }

    &--lg {
      @apply ps-4 pe-2 py-3;
    }
  }

  &--unread {
    $unread: &;

    @apply bg-info-50;
  }

  &__badge {
    @apply mt-1.5 invisible;

    #{$unread} & {
      @apply visible;
    }
  }

  &__info {
    @apply grow min-w-0 px-1.5;
  }

  &__content {
    @apply text-sm *:max-w-full;
  }

  &__date {
    @apply mt-0.5 text-xs text-neutral;
  }
}
</style>

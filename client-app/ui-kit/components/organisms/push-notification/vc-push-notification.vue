<template>
  <div
    :class="[
      'vc-push-notification',
      {
        'vc-push-notification--unread': !notification.read,
      },
    ]"
  >
    <VcBadge class="vc-push-notification__badge" color="info" rounded />

    <div class="vc-push-notification__info">
      <VcMarkdownRender class="vc-push-notification__content" :src="notification.shortMessage" />

      <div class="vc-push-notification__date">
        {{ $d(notification.createdDate, "long") }}
      </div>
    </div>

    <VcButton
      v-if="removable"
      class="vc-push-notification__button"
      size="xs"
      color="neutral"
      variant="no-background"
      icon="x"
      @click="
        $emit('remove');
        $event.stopPropagation();
      "
    />
  </div>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "remove"): void;
}

interface IProps {
  notification: VcPushNotificationType;
  removable?: boolean;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.vc-push-notification {
  $unread: "";

  @apply flex items-start ps-3 pe-1 py-2;

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

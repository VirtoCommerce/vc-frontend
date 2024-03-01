<template>
  <div class="vc-notifications">
    <div class="vc-notifications__head">
      <div class="vc-notifications__title">
        <span>Notifications</span>
        <VcBadge v-if="items.length" variant="outline" size="lg" rounded>
          {{ items.length }}
        </VcBadge>
      </div>

      <VcDropdownMenu class="vc-notifications__dropdown">
        <template #trigger>
          <VcIcon class="vc-notifications__dropdown-icon" name="dots-vertical" size="sm" />
        </template>

        <template #content="{ close }">
          <VcMenuItem @click="close">Make all as read</VcMenuItem>
          <VcMenuItem @click="close">Make all as unread</VcMenuItem>
        </template>
      </VcDropdownMenu>
    </div>

    <div class="vc-notifications__body">
      <VcNotification v-for="item in items" :key="item.id" :notification="item" />

      <div v-if="!items.length" class="vc-notifications__empty">
        <div class="vc-notifications__empty-title">No new notifications at the moment.</div>
        <div class="vc-notifications__empty-text">Stay tuned for updates and important messages.</div>
      </div>
    </div>

    <div class="vc-notifications__foot">
      <VcButton variant="outline" color="secondary" size="xs">Clear recent</VcButton>
      <VcButton variant="outline" color="secondary" size="xs">View all notifications</VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  items?: VcNotificationType[];
}

withDefaults(defineProps<IProps>(), {
  items: () => [],
});
</script>

<style lang="scss">
.vc-notifications {
  @apply divide-y bg-additional-50 rounded text-neutral-950 shadow-2xl;

  &__head {
    @apply flex items-center gap-2 ps-4 pe-2 py-4;
  }

  &__title {
    @apply flex items-center gap-2 me-auto text-base font-bold;
  }

  &__dropdown {
    @apply ms-2;
  }

  &__dropdown-icon {
    @apply text-neutral;

    &:hover {
      @apply text-neutral-700;
    }
  }

  &__body {
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

  &__foot {
    @apply flex justify-between p-4;
  }
}
</style>

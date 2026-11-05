<template>
  <PushMessages>
    <template #trigger="{ totalCount, unreadCount, triggerProps }">
      <button
        type="button"
        v-bind="triggerProps"
        :aria-label="getCountLabel($t('push_messages.title'), unreadCount)"
        class="relative"
      >
        <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
          <VcIcon :key="totalCount" class="text-primary" name="notification-v2" :size="24" />
        </transition>

        <HeaderBadge :count="unreadCount" variant="outline" size="xs" overlay />
      </button>
    </template>
  </PushMessages>
</template>

<script lang="ts" setup>
import { HeaderBadge, useHeaderCountLabel } from "@/shared/layout";
import PushMessages from "./push-messages.vue";

const { getCountLabel } = useHeaderCountLabel();
</script>

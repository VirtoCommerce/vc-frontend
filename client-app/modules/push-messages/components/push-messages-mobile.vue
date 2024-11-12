<template>
  <PushMessages>
    <template #trigger="{ totalCount, unreadCount }">
      <div class="relative">
        <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
          <VcIcon :key="totalCount" class="fill-primary" name="notification-v2" :size="28" />
        </transition>

        <transition mode="out-in" name="scale">
          <VcBadge
            v-if="unreadCount"
            variant="outline"
            size="sm"
            class="absolute -right-2 -top-2 transition-transform"
            rounded
          >
            {{ unreadCount }}
          </VcBadge>
        </transition>
      </div>
    </template>
  </PushMessages>
</template>

<script lang="ts" setup>
import PushMessages from "./push-messages.vue";
</script>

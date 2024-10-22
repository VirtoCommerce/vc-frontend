<template>
  <PushMessages v-if="isPushMessagesActive" :offset-options="20">
    <template #trigger="{ totalCount, unreadCount }">
      <BottomHeaderLink :link="item" :count="unreadCount">
        <template #icon>
          <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
            <VcIcon v-if="item.icon" :key="totalCount" name="bell" class="mb-0.5 text-primary" />
          </transition>
        </template>
        {{ item.title }}
      </BottomHeaderLink>
    </template>
  </PushMessages>
</template>

<script setup lang="ts">
import { isActive as isPushMessagesActive } from "@/shared/push-messages/composables/usePushMessages";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";
import PushMessages from "@/shared/push-messages/components/push-messages.vue";

defineProps<{ item: ExtendedMenuLinkType }>();
</script>

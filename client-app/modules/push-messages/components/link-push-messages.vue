<template>
  <PushMessages v-if="isPushMessagesActive" :offset-options="20">
    <template #trigger="{ totalCount, unreadCount }">
      <BottomHeaderLink :link="item" :count="unreadCount">
        <template #icon>
          <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
            <svg v-if="item.icon" :key="totalCount" height="24" width="24" class="mb-0.5 text-primary">
              <use :href="item.icon" />
            </svg>
          </transition>
        </template>
        {{ item.title }}
      </BottomHeaderLink>
    </template>
  </PushMessages>
</template>

<script setup lang="ts">
import { isActive as isPushMessagesActive } from "../composables/usePushMessages";
import PushMessages from "./push-messages.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";

defineProps<{ item: ExtendedMenuLinkType }>();
</script>

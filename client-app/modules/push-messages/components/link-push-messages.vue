<template>
  <PushMessages v-if="isPushMessagesActive" :offset-options="20">
    <template #trigger="{ totalCount, unreadCount, triggerProps }">
      <BottomHeaderLink :link="item" :count="unreadCount" v-bind="triggerProps">
        <template #icon>
          <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
            <VcIcon
              :key="totalCount"
              :name="item.icon"
              class="mb-0.5 fill-[--header-bottom-link-icon-color]"
              :size="24"
            />
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

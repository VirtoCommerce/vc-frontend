<template>
  <PushMessages v-if="isPushMessagesActive" :offset-options="20">
    <template #trigger="{ totalCount, unreadCount, triggerProps }">
      <HeaderPod :link="item" :count="unreadCount" v-bind="triggerProps">
        <template #icon>
          <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
            <VcIcon :key="totalCount" :name="item.icon" :size="20" />
          </transition>
        </template>
      </HeaderPod>
    </template>
  </PushMessages>
</template>

<script setup lang="ts">
import { isActive as isPushMessagesActive } from "../composables/usePushMessages";
import PushMessages from "./push-messages.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import HeaderPod from "@/shared/layout/components/header/_internal/header-pod.vue";

defineProps<{ item: ExtendedMenuLinkType }>();
</script>

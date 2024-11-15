<template>
  <MobileMenuLink :link="item" :count="unreadCount" class="py-1 text-lg" @close="$emit('close')">
    {{ item.title }}
  </MobileMenuLink>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { usePushMessages } from "../composables/usePushMessages";
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  item: ExtendedMenuLinkType;
}

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
const showUnreadOnly = useLocalStorage<boolean>("showUnreadOnly_pushMessages_popup", false);

const { unreadCount } = usePushMessages({
  showUnreadOnly,
});
</script>

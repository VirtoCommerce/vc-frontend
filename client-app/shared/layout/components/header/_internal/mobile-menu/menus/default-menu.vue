<template>
  <ul class="mt-4 flex grow flex-col gap-y-2">
    <li v-for="item in items" :key="item.title">
      <template v-if="item.id && customLinkComponents[item.id]">
        <component
          :is="item.id && customLinkComponents[item.id]"
          :item="item"
          @close="$emit('close')"
          @select-item="$emit('selectItem', item)"
        />
      </template>
      <MobileMenuLink
        v-else
        :link="item"
        class="py-1 text-lg"
        @close="$emit('close')"
        @select="$emit('selectItem', item)"
      >
        {{ item.title }}
      </MobileMenuLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useCustomMobileMenuLinkComponents } from "@/shared/layout/composables/useCustomMobileMenuLinkComponents";
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";
defineEmits<IEmits>();

defineProps<IProps>();

const { customLinkComponents } = useCustomMobileMenuLinkComponents();

interface IProps {
  items: ExtendedMenuLinkType[];
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem", item: ExtendedMenuLinkType): void;
}
</script>

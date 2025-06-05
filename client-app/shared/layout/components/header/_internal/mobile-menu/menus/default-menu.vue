<template>
  <ul class="mt-4 flex grow flex-col gap-y-2">
    <li v-for="item in items" :key="item.title">
      <ExtensionPoint
        :item="item"
        category="mobileMenu"
        :name="item.id"
        @close="$emit('close')"
        @select-item="$emit('selectItem', item)"
      >
        <MobileMenuLink
          :link="item"
          :format-text-function="capitalize"
          class="py-1 text-lg"
          @close="$emit('close')"
          @select="$emit('selectItem', item)"
        >
          <template #default="{ formattedText }">
            {{ formattedText }}
          </template>
        </MobileMenuLink>
      </ExtensionPoint>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { capitalize } from "lodash";
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

defineEmits<IEmits>();

defineProps<IProps>();

interface IProps {
  items: ExtendedMenuLinkType[];
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem", item: ExtendedMenuLinkType): void;
}
</script>

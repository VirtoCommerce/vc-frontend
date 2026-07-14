<template>
  <MobileMenuLink
    :link="item"
    :count="count"
    :format-text-function="capitalize"
    class="py-1 text-lg"
    @close="$emit('close')"
    @select="$emit('selectItem')"
  >
    {{ item.title }}
  </MobileMenuLink>
</template>

<script setup lang="ts">
import { capitalize } from "lodash-es";
import { useSalesRepCustomersCount } from "../composables/useSalesRepCustomersCount";
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

defineEmits<{ (event: "close"): void; (event: "selectItem"): void }>();
defineProps<{ item: ExtendedMenuLinkType }>();
const { count } = useSalesRepCustomersCount();
</script>

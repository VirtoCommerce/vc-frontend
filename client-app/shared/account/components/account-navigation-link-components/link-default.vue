<template>
  <AccountNavigationLink :item="item" />
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationLink from "@/shared/account/components/account-navigation-link.vue";
defineProps<IProps>();

interface IProps {
  item: ExtendedMenuLinkType;
}
</script>

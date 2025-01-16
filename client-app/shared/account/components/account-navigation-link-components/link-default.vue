<template>
  <AccountNavigationItem :format-text-function="capitalize" :item="item" />
</template>

<script setup lang="ts">
import { capitalize } from "lodash";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

defineProps<IProps>();

interface IProps {
  item: ExtendedMenuLinkType;
}
</script>

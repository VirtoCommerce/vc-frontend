<template>
  <AccountNavigationItem :item="item" :format-function="capitalizeText" />
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";
defineProps<IProps>();

interface IProps {
  item: ExtendedMenuLinkType;
}

const capitalizeText = (text: string | undefined) => {
  return text
    ? text
        .toLowerCase()
        .replace(
          /^(\w)(\w*)/,
          (match: string, firstLetter: string, restOfWord: string) => firstLetter?.toUpperCase() + restOfWord,
        )
    : "";
};
</script>

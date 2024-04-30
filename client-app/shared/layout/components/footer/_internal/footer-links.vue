<template>
  <div class="mb-3 text-base font-extrabold uppercase text-white">
    {{ linksBlock.title }}
  </div>

  <div v-if="linksBlock.children?.length" class="flex flex-col space-y-1">
    <FooterLink
      v-for="(footerLinkChild, i) in linksBlock.children"
      :key="i"
      :title="footerLinkChild.title"
      :to="footerLinkChild.route!"
    />
  </div>
</template>

<script setup lang="ts">
import FooterLink from "./footer-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  linksBlock: ExtendedMenuLinkType;
}

defineProps<IProps>();
</script>

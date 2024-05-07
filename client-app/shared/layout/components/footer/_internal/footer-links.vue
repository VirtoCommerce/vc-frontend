<template>
  <div class="footer-links">
    <div class="footer-links__title">
      {{ linksBlock.title }}
    </div>

    <div v-if="linksBlock.children?.length" class="footer-links__list">
      <FooterLink
        v-for="(footerLinkChild, i) in linksBlock.children"
        :key="i"
        :title="footerLinkChild.title"
        :to="footerLinkChild.route!"
      />
    </div>
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

<style lang="scss">
.footer-links {
  &__title {
    @apply mb-3 text-base font-black uppercase;
  }

  &__list {
    @apply flex flex-col gap-1;
  }
}
</style>

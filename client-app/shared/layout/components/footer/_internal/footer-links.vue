<template>
  <VcWidget
    class="footer-links"
    size="xs"
    :border="false"
    :shadow="false"
    :collapsible="isMobile"
    :collapsed="isMobile"
  >
    <template #header-container="{ collapsible, collapsed }">
      <span class="footer-links__header">
        <span class="footer-links__title">{{ linksBlock.title }}</span>

        <VcIcon
          v-if="collapsible"
          :size="16"
          :class="['footer-links__arrow', { 'footer-links__arrow--rotate': collapsed }]"
          name="chevron-up"
        />
      </span>
    </template>

    <template #default-container>
      <div v-if="linksBlock.children?.length" class="footer-links__list">
        <FooterLink
          v-for="(footerLinkChild, i) in linksBlock.children"
          :key="i"
          :title="footerLinkChild.title"
          :to="footerLinkChild.route"
        />
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { BREAKPOINTS } from "@/core/constants";
import FooterLink from "./footer-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  linksBlock: ExtendedMenuLinkType;
}

defineProps<IProps>();

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("sm");
</script>

<style lang="scss">
.footer-links {
  --vc-widget-bg-color: transparent;
  --vc-widget-divide-color: var(--footer-top-link-color);
  --vc-widget-title-color: theme("colors.additional.50");
  --vc-icon-color: var(--footer-top-link-color);

  &__header {
    @apply flex items-center py-1 pe-3 min-h-10;
  }

  &__title {
    @apply flex-grow text-base font-bold uppercase text-additional-50 break-words min-w-0;

    @media (min-width: theme("screens.sm")) {
      @apply text-sm;
    }
  }

  &__list {
    @apply flex flex-col gap-2 pt-1.5 pb-5;

    @media (min-width: theme("screens.sm")) {
      @apply pb-3;
    }
  }

  &__arrow {
    @apply self-start mt-1.5 transition-all;

    &--rotate {
      @apply rotate-180;
    }
  }
}
</style>

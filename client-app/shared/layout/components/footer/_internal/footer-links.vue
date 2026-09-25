<template>
  <VcWidget class="footer-links" size="xs" :border="false" :shadow="false">
    <template #header-container>
      <span class="footer-links__header">
        <span class="footer-links__title">{{ linksBlock.title }}</span>
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
import FooterLink from "./footer-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  linksBlock: ExtendedMenuLinkType;
}

defineProps<IProps>();
</script>

<style lang="scss">
.footer-links {
  --vc-widget-bg-color: transparent;
  --vc-widget-divide-color: transparent;
  --vc-widget-title-color: var(--footer-top-text-color);
  --vc-icon-color: var(--footer-top-link-color);

  // The design draws no rule under a column title, at any width. The rule used to survive below
  // sm because the block was an accordion there and a collapsed header needed separating from
  // the next one; the design renders the same open columns on the phone as on the desktop, so
  // there is no collapsed state left to separate.

  &__header {
    @apply flex min-h-10 items-center py-1 pe-3;

    @media (width < theme("screens.lg")) {
      @apply min-h-0 pb-2.5 pe-0 pt-0;
    }
  }

  &__title {
    @apply min-w-0 flex-grow break-words text-base font-bold uppercase tracking-wide text-[--footer-top-text-color];

    @media (min-width: theme("screens.sm")) {
      @apply text-sm;
    }

    // An eyebrow rather than a heading: on the phone the columns are narrow and close
    // together, and a title at the links' own weight competes with them for the eye.
    @media (width < theme("screens.lg")) {
      @apply text-[0.71875rem] tracking-[0.14em];
    }
  }

  &__list {
    @apply flex flex-col gap-2 pb-5 pt-1.5;

    @media (min-width: theme("screens.sm")) {
      @apply pb-3;
    }

    @media (width < theme("screens.lg")) {
      @apply gap-0.5 pb-0 pt-0;
    }

    // A block the footer grid has widened to the full row splits its own links, rather than
    // running one long ladder under a heading the width of the page.
    @media (width < theme("screens.sm")) {
      @apply grid gap-x-6;

      grid-template-columns: repeat(var(--footer-links-list-columns, 1), minmax(0, 1fr));
    }
  }
}
</style>

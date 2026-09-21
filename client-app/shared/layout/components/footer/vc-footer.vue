<template>
  <footer id="footer" :class="['app-footer', { 'app-footer--compact': compact }]" aria-label="Footer">
    <div class="app-footer__shell">
      <!-- Top plate -->
      <div v-if="!compact" class="app-footer__top">
        <div class="app-footer__brand">
          <VcImage :src="secondaryLogoUrl" :alt="$context.storeName" class="app-footer__logo" lazy />
        </div>

        <nav class="app-footer__links">
          <template v-if="whiteLabelingFooterLinks?.length">
            <FooterLinks
              v-for="(footerLink, index) in whiteLabelingFooterLinks"
              :key="index"
              :links-block="footerLink"
            />
          </template>

          <template v-else>
            <FooterLinks v-for="footerLink in footerLinks" :key="footerLink.id" :links-block="footerLink" />
          </template>
        </nav>
      </div>

      <!-- Bottom plate -->
      <div class="app-footer__bottom">
        <span>
          {{ $t("shared.layout.footer.version") }} {{ version }}. © {{ new Date().getFullYear() }}
          <strong>{{ $t("shared.layout.footer.company_name") }}</strong
          >.
          {{ $t("shared.layout.footer.all_rights_reserved") }}
        </span>

        <i18n-t keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="span" scope="global">
          <a class="app-footer__link" href="https://virtocommerce.com" target="_blank" rel="noopener noreferrer">
            {{ $t("shared.layout.footer.by_virto") }}
          </a>
        </i18n-t>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import pkg from "../../../../../package.json";
import FooterLinks from "./_internal/footer-links.vue";

interface IProps {
  compact?: boolean;
}

const props = defineProps<IProps>();

const { secondaryLogoUrl, footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();
const { footerLinks, fetchFooterLinks } = useNavigations();

const { version } = pkg;

onMounted(() => {
  if (!props.compact) {
    void fetchFooterLinks();
  }
});
</script>

<style lang="scss">
.app-footer {
  $compact: "";

  // Two plates rather than one band: the links surface and the legal bar are separate
  // paints, so each gets its own rounded plate on the page background. A preset that gives
  // both rows the same colour (black-gold.dark, coffee.dark) reads as one band with a seam.

  // The secure layout (cart, checkout, order payment) still carries its legacy full-bleed
  // header, and a floating plate under it would be the only rounded thing on the page.
  // The compact bar therefore keeps the band it had there.
  &--compact {
    $compact: &;
  }

  &__shell {
    @apply mx-auto flex flex-col gap-2 pb-6;

    // The page inset the header plate shares with the page's own plates.
    --gutter: theme("padding.6");

    max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
    padding-inline: var(--gutter);

    @media (min-width: theme("screens.lg")) {
      --gutter: theme("padding.8");
    }

    @media print {
      @apply p-0;
    }

    #{$compact} & {
      @apply max-w-none pb-0;

      --gutter: 0px;
    }
  }

  &__top {
    // px-5 is the header plate's row padding, so the footer logo sits under the header one
    // (1px apart — the header plate also has a border).
    @apply px-5 pb-7 pt-8;

    background: var(--footer-top-bg-color);
    // The fallback keeps the plates round for a fork that drops the demo theme file.
    border-radius: var(--vc-radius-plate, 1.75rem);
    color: var(--footer-top-text-color);

    @media (min-width: theme("screens.sm")) {
      @apply flex gap-14;
    }

    @media (min-width: theme("screens.md")) {
      @apply gap-16;
    }

    @media print {
      @apply hidden;
    }
  }

  &__brand {
    @apply mb-5 flex-none;
  }

  &__logo {
    @apply h-11;
  }

  &__links {
    @apply grid;

    @media (min-width: theme("screens.sm")) {
      @apply grow grid-cols-2 gap-12;
    }

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-3;
    }

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-4;
    }

    @media (min-width: theme("screens.xl")) {
      @apply gap-19;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply grid-cols-5;
    }
  }

  &__bottom {
    @apply flex flex-col items-center justify-between gap-1 px-5 py-4 text-center text-sm;

    background: var(--footer-bottom-bg-color);
    border-radius: var(--vc-radius-plate, 1.75rem);
    color: var(--footer-bottom-text-color);

    @media (min-width: theme("screens.md")) {
      @apply flex-row py-5;
    }

    @media print {
      @apply flex-row rounded-none bg-additional-50 px-0 text-additional-950;
    }

    #{$compact} & {
      @apply rounded-none px-4;

      @media (min-width: theme("screens.md")) {
        @apply px-6;
      }

      // The modifier outranks the print block above, so print repeats here.
      @media print {
        @apply px-0;
      }
    }
  }

  &__link {
    @apply font-bold;

    color: var(--footer-bottom-link-color);

    &:hover {
      color: var(--footer-bottom-link-hover-color);
    }

    @media print {
      @apply text-additional-950;
    }
  }
}
</style>

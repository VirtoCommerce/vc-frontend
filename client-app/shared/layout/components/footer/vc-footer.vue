<template>
  <footer id="footer" :class="['app-footer', { 'app-footer--compact': compact }]" aria-label="Footer">
    <div class="app-footer__shell">
      <!-- Top plate -->
      <div v-if="!compact" class="app-footer__top">
        <div class="app-footer__brand">
          <VcImage :src="logoUrl" :alt="$context.storeName" class="app-footer__logo app-footer__logo--light" lazy />

          <VcImage
            :src="secondaryLogoUrl"
            :alt="$context.storeName"
            class="app-footer__logo app-footer__logo--inverted"
            lazy
          />
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

const { logoUrl, secondaryLogoUrl, footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();
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

  // Two plates rather than one band, as the design draws them: a light links surface and a
  // dark legal bar, each rounded on the page background with a 24px gap between. A preset
  // that paints both rows the same (black-gold.dark, coffee.dark) reads as one band with a
  // seam — the plates are the shape, the paint is the preset's.

  // The secure layout (cart, checkout, order payment) still carries its legacy full-bleed
  // header, and a floating plate under it would be the only rounded thing on the page.
  // The compact bar therefore keeps the band it had there.
  &--compact {
    $compact: &;
  }

  &__shell {
    @apply mx-auto flex flex-col;

    // The page inset and the vertical step the footer plates share with the header plate
    // and the page's own plates. The gap between the two plates is the same step as
    // everywhere else in the column; below them the design closes the page on the gutter.
    --gutter: var(--page-gutter, theme("padding.6"));

    max-width: calc(var(--vc-container-max-width, 87.75rem) + 2 * var(--gutter));
    gap: var(--page-stack, 1.5rem);
    padding: 0 var(--gutter) var(--gutter);

    @media print {
      @apply p-0;
    }

    #{$compact} & {
      @apply max-w-none pb-0;

      --gutter: 0px;
    }
  }

  &__top {
    // A plate like any other on the page: the theme's own inside (36/32, a rung down below
    // lg), the plate radius, and the soft shadow that is the only thing separating it from
    // the canvas. The fallbacks keep a fork that drops the demo theme file intact.
    padding: var(--plate-pad-y, 2.25rem) var(--plate-pad-x, 2rem);
    background: var(--footer-top-bg-color);
    border-radius: var(--plate-radius, 1.75rem);
    box-shadow: var(--plate-shadow, theme("boxShadow.xl"));
    color: var(--footer-top-text-color);

    // One column on the phone — the logo cannot stand beside five link blocks in 318px of
    // plate — and the design's own 20 between them, which replaces the margin the brand used
    // to carry. The desktop gutter comes back at lg, with the rest of the desktop ladder.
    @apply flex flex-col gap-5;

    @media (min-width: theme("screens.sm")) {
      @apply flex-row;
    }

    @media (min-width: theme("screens.lg")) {
      @apply gap-16;
    }

    @media print {
      @apply hidden;
    }
  }

  &__brand {
    @apply flex-none;

    @media (min-width: theme("screens.lg")) {
      @apply mb-5;
    }
  }

  &__logo {
    @apply h-11;

    @media (width < theme("screens.lg")) {
      @apply h-9;
    }

    // Which logo of the pair shows is the plate's paint, and only the theme knows it: every
    // preset but paprika still paints the top row dark, so the default keeps the inverted
    // logo the dark band has always needed. A theme with a light plate flips both knobs.
    // The hidden one is display:none and lazy, so it is never fetched.
    &--light {
      display: var(--footer-logo-light-display, none);
    }

    &--inverted {
      display: var(--footer-logo-inverted-display, block);
    }
  }

  &__links {
    // Two columns on the phone, three from sm up, five on the desktop — the design's ladder.
    // Two is what a 318px plate holds without the captions wrapping to one word per line; one
    // column made the footer longer than the page it closes.
    @apply grid grid-cols-2 gap-x-6 gap-y-5;

    // An odd number of blocks leaves the last one alone on its row. It takes the full width
    // instead and splits its own links in two, so the footer ends on a line rather than on a
    // column with a tail hanging off it.
    > :last-child:nth-child(odd) {
      --footer-links-list-columns: 2;

      grid-column: 1 / -1;
    }

    @media (min-width: theme("screens.sm")) {
      @apply grow grid-cols-3;

      > :last-child:nth-child(odd) {
        --footer-links-list-columns: 1;

        grid-column: auto;
      }
    }

    // The design runs five columns on a 1448 content width with a 76px gutter between
    // them — the last step used to wait for 2xl, which left the widest desktop a column
    // short of the drawing. It draws exactly five blocks and so never says what the gap
    // between ROWS should be; a store that serves more wraps, and 76px of it left a hole
    // under the shortest column, so rows fall back to the page's own step.
    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-5;

      gap: var(--page-stack, 1.5rem) 4.75rem;
    }
  }

  &__bottom {
    // The same plate, one line tall: the design keeps its horizontal inside so the legal
    // line stands on the same vertical as the columns above, and trims the vertical to 22.
    @apply flex flex-col items-center justify-between gap-1 text-center text-sm;

    padding: 1.375rem var(--plate-pad-x, 2rem);

    // Centred type needs a line it can be centred ON. Below the desktop ladder both halves of
    // the legal line wrap, and a wrapped centred paragraph reads as two ragged blocks — the
    // design sets it back on the plate's own start edge.
    @media (width < theme("screens.lg")) {
      @apply items-start gap-2.5 text-start text-[0.8125rem]/[1.5];

      padding: 1.25rem var(--plate-pad-x, 2rem);
    }
    background: var(--footer-bottom-bg-color);
    border-radius: var(--plate-radius, 1.75rem);
    box-shadow: var(--plate-shadow, theme("boxShadow.xl"));
    color: var(--footer-bottom-text-color);

    @media (min-width: theme("screens.md")) {
      @apply flex-row;
    }

    @media print {
      @apply flex-row rounded-none bg-additional-50 px-0 text-additional-950 shadow-none;
    }

    #{$compact} & {
      @apply rounded-none px-4;

      box-shadow: none;

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

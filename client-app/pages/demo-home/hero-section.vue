<template>
  <section class="hero-section">
    <div class="hero-section__copy">
      <p class="hero-section__eyebrow">{{ t("pages.demo_home.hero.eyebrow") }}</p>

      <VcTypography tag="h1" class="hero-section__title">
        {{ t("pages.demo_home.hero.title") }}
      </VcTypography>

      <p class="hero-section__subtitle">{{ t("pages.demo_home.hero.subtitle") }}</p>

      <div class="hero-section__actions">
        <VcButton :to="catalogRoute" size="md" prepend-icon="view-grid" icon-variant="solid">
          {{ t("pages.demo_home.hero.browse_catalog") }}
        </VcButton>
      </div>
    </div>

    <div class="hero-section__media">
      <div class="hero-section__art">
        <VcImage class="hero-section__art-img" src="hero-front.webp" />
      </div>

      <RouterLink :to="catalogRoute" class="hero-section__notch hero-section__notch--top">
        <span class="hero-section__notch-icon">
          <VcIcon name="search" size="sm" />
        </span>

        <div class="hero-section__notch-body">
          <VcTypography tag="div" variant="h5" class="hero-section__notch-title">
            {{ t("pages.demo_home.hero.notches.search.title") }}
          </VcTypography>

          <p class="hero-section__notch-text">{{ t("pages.demo_home.hero.notches.search.text") }}</p>
        </div>
      </RouterLink>

      <RouterLink :to="cartRoute" class="hero-section__notch hero-section__notch--bottom">
        <span class="hero-section__notch-icon hero-section__notch-icon--ink">
          <VcIcon name="shopping-cart" size="sm" />
        </span>

        <div class="hero-section__notch-body">
          <VcTypography tag="div" variant="h5" class="hero-section__notch-title">
            {{ t("pages.demo_home.hero.notches.guest_cart.title") }}
          </VcTypography>

          <p class="hero-section__notch-text">{{ t("pages.demo_home.hero.notches.guest_cart.text") }}</p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ROUTES } from "@/router/routes/constants";

const { t } = useI18n();

const catalogRoute = ROUTES.CATALOG.PATH;
const cartRoute = ROUTES.CART.PATH;
</script>

<style lang="scss">
.hero-section {
  @apply grid grid-cols-1 items-stretch gap-10 rounded-[22px] px-6 py-7;

  background: var(--plate-bg);

  &__copy {
    @apply self-center;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-5 tracking-[0.14em] text-primary-600;
  }

  &__title {
    @apply mb-[18px] max-w-[22ch];

    text-wrap: balance;
  }

  &__subtitle {
    @apply max-w-[56ch] text-lg leading-normal text-neutral-600;
  }

  &__actions {
    @apply mt-6 flex flex-wrap gap-3;
  }

  &__media {
    @apply relative min-w-0;
  }

  &__art {
    @apply size-full min-h-[400px] overflow-hidden rounded-xl bg-primary-100;
  }

  &__art-img {
    @apply size-full object-cover object-center;
  }

  &__notch {
    --notch-bg: var(--plate-bg);
    --fillet: 18px;

    // The dark plate is translucent glass and the photo would show through the notch, so the notch
    // takes the colour the plate actually reads as: its 72% of neutral-100 over the flat
    // neutral-50 canvas.
    html.dark & {
      --notch-bg: color-mix(in srgb, theme("colors.neutral.100") 72%, theme("colors.neutral.50"));
    }

    --fillet-shape: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0H100V100A100 100 0 0 0 0 0Z'/%3E%3C/svg%3E");

    @apply absolute z-[2] flex flex-col gap-2.5 p-4;

    background: var(--notch-bg);
    inline-size: clamp(9rem, 5rem + 17vw, 11rem);

    &::before,
    &::after {
      @apply absolute;

      content: "";
      width: var(--fillet);
      height: var(--fillet);
      background: var(--notch-bg);
      mask: var(--fillet-shape) center / 100% 100% no-repeat;
    }
  }

  &__notch--top {
    top: 0;
    right: 0;
    border-radius: 0 0 0 20px;

    &::before {
      top: 0;
      left: calc(-1 * var(--fillet));
    }

    &::after {
      top: 100%;
      right: 0;
    }
  }

  &__notch--bottom {
    bottom: 0;
    left: 0;
    padding-top: 20px;
    border-radius: 0 20px 0 0;

    &::before,
    &::after {
      transform: rotate(180deg);
    }

    &::before {
      bottom: 100%;
      left: 0;
    }

    &::after {
      bottom: 0;
      left: 100%;
    }
  }

  &__notch-icon {
    @apply grid size-8 place-items-center rounded-[10px] bg-primary text-additional-50;
  }

  &__notch-icon--ink {
    @apply bg-neutral-900;
  }

  &__notch-title {
    @apply text-sm;
  }

  &__notch-text {
    @apply mt-1 text-xs leading-snug text-neutral-600;
  }
}

@media (width < theme("screens.sm")) {
  .hero-section {
    &__actions > * {
      @apply w-full;
    }
  }
}

@media (width >= theme("screens.lg")) {
  .hero-section {
    @apply grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-12 rounded-[28px] px-8 py-9;

    &__title {
      --vc-typography-font-size: 3.125rem;
      --line-height: 1.02;
    }

    &__art {
      @apply min-h-[420px];
    }

    &__notch {
      --fillet: 24px;

      @apply gap-4 p-5;

      inline-size: clamp(10.5rem, 6.205rem + 7.636vw, 13.125rem);
    }

    &__notch--top {
      border-radius: 0 0 0 26px;
    }

    &__notch--bottom {
      padding-top: 24px;
      border-radius: 0 26px 0 0;
    }

    &__notch-icon {
      @apply size-9 rounded-[--vc-radius];
    }

    &__notch-title {
      @apply text-base;
    }

    &__notch-text {
      @apply text-sm;
    }
  }
}
</style>

<template>
  <section class="cta-section">
    <div>
      <VcTypography tag="h2" class="cta-section__title">{{ t("pages.demo_home.cta.title") }}</VcTypography>

      <p class="cta-section__text">{{ t("pages.demo_home.cta.text") }}</p>
    </div>

    <div class="cta-section__actions">
      <VcButton :to="{ name: 'SignUp' }" size="md">{{ t("pages.demo_home.cta.become_customer") }}</VcButton>

      <VcButton :to="catalogRoute" size="md" variant="outline">{{ t("pages.demo_home.cta.talk_to_sales") }}</VcButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ROUTES } from "@/router/routes/constants";

const { t } = useI18n();

// ponytail: no sales contact page yet, so "Talk to sales" goes to the catalog, as in the design
const catalogRoute = ROUTES.CATALOG.PATH;
</script>

<style lang="scss">
.cta-section {
  // The plate's roles, declared once per theme: the dark ramp has no pure white, so in dark the
  // plate steps back to its closest dark tint and takes its own family's near-white for ink.
  --cta-bg: theme("colors.primary.500");
  --cta-fg: theme("colors.additional.50");
  --cta-ink: theme("colors.primary.600");
  --cta-hover: theme("colors.primary.50");
  --cta-press: theme("colors.primary.100");

  html.dark & {
    --cta-bg: theme("colors.primary.300");
    --cta-fg: theme("colors.primary.950");
    --cta-ink: theme("colors.primary.200");
    --cta-hover: theme("colors.primary.900");
    --cta-press: theme("colors.primary.800");
  }

  --vc-typography-color: var(--cta-fg);

  @apply flex flex-wrap items-center justify-between gap-8 rounded-[--plate-radius] px-8 py-9;

  background: var(--cta-bg);
  color: var(--cta-fg);

  &__title {
    @apply max-w-[18ch];
  }

  &__text {
    @apply mt-2.5 max-w-[44ch];
  }

  &__actions {
    @apply flex flex-wrap gap-3;
  }

  // Buttons are inverted on the orange plate: no kit color reads on it. The colors go on the
  // button itself, since the kit's dark theme sets them there too (`html.dark .vc-button...`), and
  // the extra classes outweigh both that and the kit's `:hover:not(...)` selectors, which would
  // otherwise mix the hover and press states with white/black into opaque white.
  & &__actions .vc-button.vc-button--solid--primary {
    --bg-color: var(--cta-fg);
    --border-color: var(--cta-fg);
    --text-color: var(--cta-ink);
    --vc-icon-color: var(--cta-ink);

    box-shadow: 0 8px 24px theme("colors.additional.950 / 16%");

    // additional-950 is the light end in dark, which would make the shadow glow
    html.dark & {
      box-shadow: 0 8px 24px theme("colors.additional.50 / 16%");
    }

    &:hover {
      --bg-color: var(--cta-hover);
      --border-color: var(--bg-color);
    }

    &:active {
      --bg-color: var(--cta-press);
      --border-color: var(--bg-color);
    }
  }

  & &__actions .vc-button.vc-button--outline--primary {
    --bg-color: transparent;
    --border-color: rgb(from var(--cta-fg) r g b / 40%);
    --text-color: var(--cta-fg);
    --vc-icon-color: var(--cta-fg);

    &:hover {
      --bg-color: rgb(from var(--cta-fg) r g b / 12%);
      --border-color: rgb(from var(--cta-fg) r g b / 70%);
    }

    &:active {
      --bg-color: rgb(from var(--cta-fg) r g b / 20%);
      --border-color: rgb(from var(--cta-fg) r g b / 70%);
      --text-color: var(--cta-fg);
    }
  }
}

@media (width < theme("screens.lg")) {
  .cta-section {
    @apply p-6;
  }
}

@media (width < theme("screens.sm")) {
  .cta-section {
    &__actions {
      @apply w-full flex-col;
    }

    &__actions > * {
      @apply w-full;
    }
  }
}

@media (width >= theme("screens.lg")) {
  .cta-section {
    &__title {
      --vc-typography-font-size: 1.875rem;
      --line-height: 2.25rem;
    }

    &__text {
      @apply mt-5 leading-5;
    }
  }
}
</style>

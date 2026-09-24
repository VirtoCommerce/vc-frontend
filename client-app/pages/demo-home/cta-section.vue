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
  --vc-typography-color: theme("colors.additional.50");

  // Buttons are inverted on the orange plate: no kit color reads on it
  --vc-button-solid-primary-bg: theme("colors.additional.50");
  --vc-button-solid-primary-border: theme("colors.additional.50");
  --vc-button-solid-primary-text: theme("colors.primary.600");
  --vc-button-solid-primary-icon: theme("colors.primary.600");
  --vc-button-outline-primary-bg: transparent;
  --vc-button-outline-primary-border: theme("colors.additional.50 / 40%");
  --vc-button-outline-primary-text: theme("colors.additional.50");
  --vc-button-outline-primary-icon: theme("colors.additional.50");

  @apply flex flex-wrap items-center justify-between gap-8 rounded-[--plate-radius] bg-primary px-8 py-9 text-additional-50;

  &__title {
    @apply max-w-[18ch];
  }

  &__text {
    @apply mt-2.5 max-w-[44ch];
  }

  &__actions {
    @apply flex flex-wrap gap-3;
  }

  // The kit derives hover and press by mixing with white/black, which turns both buttons
  // opaque white here. The extra class outweighs the kit's `:hover:not(...)` selectors.
  & &__actions .vc-button--solid--primary {
    &:hover {
      --bg-color: theme("colors.primary.50");
      --border-color: var(--bg-color);
    }

    &:active {
      --bg-color: theme("colors.primary.100");
      --border-color: var(--bg-color);
    }
  }

  & &__actions .vc-button--outline--primary {
    &:hover {
      --bg-color: theme("colors.additional.50 / 12%");
      --border-color: theme("colors.additional.50 / 70%");
    }

    &:active {
      --bg-color: theme("colors.additional.50 / 20%");
      --border-color: theme("colors.additional.50 / 70%");
      --text-color: theme("colors.additional.50");
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
</style>

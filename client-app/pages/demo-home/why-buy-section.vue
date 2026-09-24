<template>
  <section class="why-buy-section">
    <div class="why-buy-section__head">
      <p class="why-buy-section__eyebrow">{{ t("pages.demo_home.why_buy.eyebrow") }}</p>

      <VcTypography tag="h2" class="why-buy-section__title">
        {{ t("pages.demo_home.why_buy.title") }}
      </VcTypography>
    </div>

    <div class="why-buy-section__grid">
      <article class="why-buy-section__col">
        <div class="why-buy-section__card why-buy-section__card--brand">
          <VcTypography tag="h3" variant="h3">{{ t("pages.demo_home.why_buy.cards.stock.title") }}</VcTypography>

          <p class="why-buy-section__card-text">{{ t("pages.demo_home.why_buy.cards.stock.text") }}</p>
        </div>

        <div class="why-buy-section__media">
          <VcImage class="why-buy-section__media-img" src="wb-stock.webp" lazy />
        </div>
      </article>

      <div class="why-buy-section__side">
        <div class="why-buy-section__row">
          <div class="why-buy-section__media">
            <VcImage class="why-buy-section__media-img" src="wb-pricing.webp" lazy />
          </div>

          <div class="why-buy-section__card why-buy-section__card--sand">
            <VcTypography tag="h3" variant="h3">{{ t("pages.demo_home.why_buy.cards.pricing.title") }}</VcTypography>

            <p class="why-buy-section__card-text">{{ t("pages.demo_home.why_buy.cards.pricing.text") }}</p>
          </div>
        </div>

        <div class="why-buy-section__row">
          <div class="why-buy-section__card why-buy-section__card--taupe">
            <VcTypography tag="h3" variant="h3">
              {{ t("pages.demo_home.why_buy.cards.fulfillment.title") }}
            </VcTypography>

            <p class="why-buy-section__card-text">{{ t("pages.demo_home.why_buy.cards.fulfillment.text") }}</p>
          </div>

          <div class="why-buy-section__media">
            <VcImage class="why-buy-section__media-img" src="wb-warehouse.webp" lazy />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style lang="scss">
.why-buy-section {
  @apply rounded-[--plate-radius] px-8 py-9;

  background: var(--plate-bg);

  &__head {
    @apply mb-8;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-none tracking-widest text-primary;
  }

  &__grid {
    @apply grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-stretch gap-6;
  }

  &__col {
    @apply flex flex-col overflow-hidden rounded-xl;
  }

  &__col > &__card {
    @apply flex-none rounded-b-none;
  }

  &__col > &__media {
    @apply flex-1;
  }

  &__side {
    @apply flex flex-col gap-6;
  }

  &__row {
    @apply grid gap-6;
  }

  &__row:first-child {
    @apply grid-cols-[minmax(0,2fr)_minmax(0,1fr)];
  }

  &__row:last-child {
    @apply grid-cols-[minmax(0,1fr)_minmax(0,2fr)];
  }

  &__card {
    @apply flex flex-col justify-center gap-2 rounded-xl p-6;
  }

  &__row > &__card {
    @apply aspect-square;
  }

  &__card--brand {
    @apply bg-primary text-additional-50;

    --vc-typography-color: theme("colors.additional.50");
  }

  &__card--taupe {
    @apply bg-secondary text-additional-50;

    --vc-typography-color: theme("colors.additional.50");
  }

  &__card--sand {
    @apply bg-neutral-100 text-neutral-700;
  }

  &__card-text {
    @apply text-sm leading-normal;
  }

  &__media {
    @apply relative overflow-hidden bg-neutral-100;
  }

  &__row > &__media {
    @apply rounded-xl;
  }

  &__media-img {
    @apply absolute inset-0 size-full object-cover;
  }
}

@media (width < theme("screens.lg")) {
  .why-buy-section {
    @apply p-6;

    &__grid {
      @apply grid-cols-[minmax(0,2fr)_minmax(0,1fr)];

      grid-template-areas:
        "col row"
        "wide wide";
    }

    &__side {
      @apply contents;
    }

    &__col {
      grid-area: col;
    }

    &__row > &__card {
      @apply aspect-auto;
    }

    &__row:first-child {
      @apply grid-cols-1;

      grid-area: row;
    }

    &__row:first-child > &__media {
      @apply aspect-square;
    }

    &__row:last-child {
      grid-area: wide;
    }
  }
}

@media (width < theme("screens.sm")) {
  .why-buy-section {
    &__grid {
      @apply block;
    }

    &__side {
      @apply space-y-3;
    }

    &__row {
      @apply block;
    }

    &__col {
      @apply mb-3;
    }

    &__col > &__media {
      @apply h-[180px] flex-none;
    }

    &__row > &__media {
      @apply hidden;
    }
  }
}
</style>

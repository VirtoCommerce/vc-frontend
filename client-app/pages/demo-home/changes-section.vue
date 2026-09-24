<template>
  <section class="changes-section">
    <div class="changes-section__head">
      <p class="changes-section__eyebrow">{{ t("pages.demo_home.changes.eyebrow") }}</p>

      <VcTypography tag="h2">{{ t("pages.demo_home.changes.title") }}</VcTypography>
    </div>

    <div class="changes-section__grid">
      <ul class="changes-section__stats">
        <li v-for="stat in STATS" :key="stat" class="changes-section__stat">
          <span class="changes-section__stat-value">{{ t(`pages.demo_home.changes.stats.${stat}.value`) }}</span>

          <span class="changes-section__stat-label">{{ t(`pages.demo_home.changes.stats.${stat}.label`) }}</span>
        </li>
      </ul>

      <figure class="changes-section__quote">
        <blockquote class="changes-section__quote-text">{{ t("pages.demo_home.changes.quote.text") }}</blockquote>

        <figcaption class="changes-section__who">
          <VcImage class="changes-section__avatar" src="changes-avatar.jpg" lazy />

          <span>
            <span class="changes-section__who-name">{{ t("pages.demo_home.changes.quote.name") }}</span>

            <span class="changes-section__who-role">{{ t("pages.demo_home.changes.quote.role") }}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const STATS = ["reorder", "trail", "prices", "calls"] as const;

const { t } = useI18n();
</script>

<style lang="scss">
.changes-section {
  @apply rounded-[--plate-radius] px-8 py-9;

  background: var(--plate-bg);

  &__head {
    @apply mb-8;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-none tracking-widest text-primary;

    html.dark & {
      @apply text-primary-600;
    }
  }

  &__grid {
    @apply grid grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] items-start gap-7;
  }

  &__stats {
    @apply grid grid-cols-2 gap-6;
  }

  &__stat {
    @apply rounded-xl border border-neutral-300 p-[1.375rem];

    background: var(--plate-bg);
  }

  &__stat-value {
    @apply mb-2 block font-geologica text-4xl font-bold leading-none tracking-[-0.035em] text-primary;

    font-variant-numeric: tabular-nums;
  }

  &__stat-label {
    @apply text-sm text-neutral-700;
  }

  &__quote {
    @apply flex h-full flex-col gap-4 rounded-xl bg-neutral-950 p-8 text-additional-50;

    // The ink tile stays dark in both themes, but the ramps flip in dark: the tile takes the dark
    // end back, and its white ink is re-pointed here, which every additional-50 utility below reads.
    html.dark & {
      --color-additional-50: var(--color-neutral-950);

      @apply bg-neutral-50/[0.82];
    }
  }

  &__quote-text {
    @apply font-geologica text-xl font-bold;
  }

  &__who {
    @apply mt-auto flex items-center gap-3;
  }

  &__avatar {
    @apply size-14 flex-none rounded-full border-2 border-additional-50 object-cover;
  }

  &__who-name {
    @apply block font-geologica text-sm font-bold;
  }

  &__who-role {
    @apply text-xs text-additional-50/60;
  }
}

@media (width < theme("screens.lg")) {
  .changes-section {
    @apply p-6;

    &__grid {
      @apply block space-y-7;
    }
  }
}

@media (width < theme("screens.sm")) {
  .changes-section {
    &__grid {
      @apply space-y-3;
    }

    &__stats {
      @apply gap-3;
    }

    &__stat-value {
      @apply text-2xl;
    }
  }
}

@media (width < theme("screens.xs")) {
  .changes-section {
    &__stat-label {
      @apply text-xs;
    }
  }
}
</style>

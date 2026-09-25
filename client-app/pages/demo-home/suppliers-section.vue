<template>
  <section class="suppliers-section">
    <div class="suppliers-section__head">
      <p class="suppliers-section__eyebrow">{{ t("pages.demo_home.suppliers.eyebrow") }}</p>

      <VcTypography tag="h2" class="suppliers-section__title">
        {{ t("pages.demo_home.suppliers.title") }}
      </VcTypography>
    </div>

    <ul class="suppliers-section__grid">
      <li v-for="name in SUPPLIERS" :key="name" class="suppliers-section__supplier">
        <VcImage class="suppliers-section__logo" :src="`sup-${name.replace('_', '-')}.webp`" lazy />

        <span class="suppliers-section__supplier-body">
          <span class="suppliers-section__supplier-name">{{ t(`pages.demo_home.suppliers.names.${name}`) }}</span>

          <span class="suppliers-section__supplier-role">{{ t("pages.demo_home.suppliers.authorized") }}</span>
        </span>
      </li>
    </ul>

    <ul class="suppliers-section__stats">
      <li v-for="stat in STATS" :key="stat" class="suppliers-section__stat">
        <span class="suppliers-section__stat-value">{{ t(`pages.demo_home.suppliers.stats.${stat}.value`) }}</span>

        <span class="suppliers-section__stat-label">{{ t(`pages.demo_home.suppliers.stats.${stat}.label`) }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const SUPPLIERS = ["northline", "cedar_pike", "vantage", "rowan"] as const;
const STATS = ["skus", "suppliers", "fulfillment"] as const;

const { t } = useI18n();
</script>

<style lang="scss">
.suppliers-section {
  @apply rounded-[--plate-radius] bg-neutral-950 px-8 py-9 text-additional-50;

  // The ink plate stays dark in both themes, but the ramps flip in dark: neutral-950 turns light
  // and additional-50 turns dark. So the plate takes the dark end back, and its white ink is
  // re-pointed here, which every additional-50 utility below reads. In dark the plate is the
  // same glass as the sections around it.
  html.dark & {
    --color-additional-50: var(--color-neutral-950);

    background: var(--plate-bg);
  }

  &__head {
    @apply mb-8;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-none tracking-widest text-additional-50/60;
  }

  &__title {
    --vc-typography-color: theme("colors.additional.50");
  }

  &__grid {
    @apply grid grid-cols-4 gap-6;
  }

  &__supplier {
    @apply flex items-center gap-3.5 rounded-xl border border-additional-50/20 bg-additional-50/10 p-5 backdrop-blur-[8px];
  }

  &__logo {
    @apply size-10 flex-none rounded-xl bg-additional-50 object-cover;

    html.dark & {
      @apply bg-secondary-950;
    }
  }

  &__supplier-body {
    @apply min-w-0;
  }

  &__supplier-name {
    @apply block truncate font-geologica text-sm font-bold;
  }

  &__supplier-role {
    @apply block text-xs text-additional-50/60;
  }

  &__stats {
    @apply mt-8 grid grid-cols-3 gap-6;
  }

  &__stat {
    @apply rounded-xl border border-additional-50/[0.16] px-6 py-4;
  }

  &__stat-value {
    @apply block font-geologica text-5xl font-bold leading-none tracking-tight;

    font-variant-numeric: tabular-nums;
  }

  &__stat:first-child &__stat-value {
    @apply text-primary-400;
  }

  &__stat:nth-child(2) &__stat-value {
    color: #deccaa;

    html.dark & {
      @apply text-secondary-800;
    }
  }

  &__stat-label {
    @apply text-base font-semibold text-additional-50/70;
  }
}

@media (width < theme("screens.lg")) {
  .suppliers-section {
    @apply p-6;

    &__supplier {
      @apply flex-col items-stretch gap-2;
    }

    &__supplier-name {
      @apply overflow-visible whitespace-normal;
    }

    &__stat-value {
      @apply text-4xl;
    }
  }
}

@media (width < theme("screens.md")) {
  .suppliers-section {
    &__grid {
      @apply grid-cols-2;
    }

    &__stat-value {
      @apply text-3xl;
    }
  }
}

@media (width < theme("screens.sm")) {
  .suppliers-section {
    &__grid {
      @apply gap-3;
    }

    &__supplier {
      @apply p-3;
    }

    &__stats {
      @apply mt-6 grid-cols-1 gap-3;
    }

    &__stat {
      @apply flex items-center gap-3 px-4 py-3;
    }

    &__stat-value {
      @apply w-32 flex-none text-2xl;
    }

    &__stat-label {
      @apply text-sm;
    }
  }
}
</style>

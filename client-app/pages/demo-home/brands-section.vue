<template>
  <section class="brands-section">
    <p class="brands-section__eyebrow">{{ t("pages.demo_home.brands.eyebrow") }}</p>

    <ul class="brands-section__grid">
      <li v-for="brand in BRANDS" :key="brand.file" class="brands-section__item">
        <VcImage class="brands-section__logo" :src="`${brand.file}.webp`" :alt="brand.name" lazy />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Brand names are proper nouns, so the alt text stays untranslated
const BRANDS = [
  { file: "wm-northline", name: "Northline" },
  { file: "wm-cedar-pike", name: "Cedar & Pike" },
  { file: "wm-harbor", name: "Harbor" },
  { file: "wm-vantage", name: "Vantage MRO" },
  { file: "wm-rowan", name: "Rowan" },
  { file: "wm-delta", name: "Delta" },
] as const;

const { t } = useI18n();
</script>

<style lang="scss">
.brands-section {
  @apply rounded-[--plate-radius] px-8 py-9;

  background: var(--plate-bg);

  &__eyebrow {
    @apply mb-[1.375rem] text-xs font-bold uppercase leading-none tracking-widest text-neutral-500;
  }

  &__grid {
    @apply grid grid-cols-6 items-center gap-6;
  }

  &__item {
    @apply flex items-center justify-center;
  }

  &__logo {
    @apply block h-auto w-[calc(100%-10px)] max-w-[calc(14rem-10px)];
  }
}

@media (width < theme("screens.xl")) {
  .brands-section {
    &__grid {
      @apply grid-cols-3;
    }
  }
}

@media (width < theme("screens.lg")) {
  .brands-section {
    @apply p-6;
  }
}

@media (width < theme("screens.sm")) {
  .brands-section {
    &__grid {
      @apply grid-cols-2;
    }
  }
}
</style>

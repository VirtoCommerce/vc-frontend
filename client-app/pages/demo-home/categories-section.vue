<template>
  <section class="categories-section">
    <div class="categories-section__head">
      <div class="categories-section__heading">
        <p class="categories-section__eyebrow">{{ t("pages.demo_home.categories.eyebrow") }}</p>

        <VcTypography tag="h2">{{ t("pages.demo_home.categories.title") }}</VcTypography>
      </div>

      <VcButton
        :to="catalogRoute"
        class="categories-section__all"
        size="sm"
        variant="outline"
        append-icon="arrow-right"
      >
        {{ t("pages.demo_home.categories.all_categories") }}
      </VcButton>
    </div>

    <div v-if="tiles.length" class="categories-section__grid">
      <div
        v-for="tile in tiles"
        :key="tile.category.id"
        :class="[
          'categories-section__tile',
          `categories-section__tile--${tile.tone}`,
          { 'categories-section__tile--xl': tile.xl, 'categories-section__tile--wide-text': tile.wideText },
        ]"
      >
        <VcImage v-if="tile.art" class="categories-section__art" :src="tile.art" alt="" />

        <div class="categories-section__body">
          <p v-if="tile.eyebrowKey" class="categories-section__tile-eyebrow">{{ t(tile.eyebrowKey) }}</p>

          <h3 class="categories-section__name">
            <RouterLink :to="getCategoryRoute(tile.category)" class="categories-section__link">
              {{ tile.category.name }}
            </RouterLink>
          </h3>

          <p v-if="tile.metaKey" class="categories-section__meta">{{ t(tile.metaKey) }}</p>

          <ul v-if="tile.chips.length" class="categories-section__chips">
            <li v-for="chip in tile.chips" :key="chip.id">
              <RouterLink :to="getCategoryRoute(chip)" class="categories-section__chip">{{ chip.name }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getCategoryRoute } from "@/core/utilities/categories";
import { ROUTES } from "@/router/routes/constants";
import { useHomeCategories } from "./use-home-categories";

type TileToneType = "sand" | "sand2" | "taupe" | "accent" | "gold" | "cocoa" | "ink";

type TileConfigType = {
  tone: TileToneType;
  art?: string;
  xl?: boolean;
  wideText?: boolean;
  eyebrowKey?: string;
  metaKey?: string;
};

const TILES: Record<string, TileConfigType> = {
  "consumer-electronics": {
    tone: "sand",
    art: "cat-consumer-electronics.webp",
    xl: true,
    wideText: true,
    eyebrowKey: "pages.demo_home.categories.tiles.consumer_electronics.eyebrow",
    metaKey: "pages.demo_home.categories.tiles.consumer_electronics.meta",
  },
  "phones-and-accessories": {
    tone: "ink",
    art: "cat-phones-and-accessories.webp",
    xl: true,
    eyebrowKey: "pages.demo_home.categories.tiles.phones_and_accessories.eyebrow",
    metaKey: "pages.demo_home.categories.tiles.phones_and_accessories.meta",
  },
  homes: { tone: "taupe", art: "cat-homes.webp" },
  "home-appliances": { tone: "accent", art: "cat-home-appliances.webp", wideText: true },
  printers: { tone: "gold", art: "cat-printers.webp" },
  "kitchen-supplies": { tone: "sand2", art: "cat-kitchen-supplies.webp" },
  "products-with-options": { tone: "cocoa", art: "cat-products-with-options.webp" },
};

const CATEGORY_SLUGS = Object.keys(TILES);

const { t } = useI18n();

const catalogRoute = ROUTES.CATALOG.PATH;

const { categories } = useHomeCategories(CATEGORY_SLUGS);

const tiles = computed(() =>
  categories.value
    .filter((category) => category.slug && TILES[category.slug])
    .map((category) => {
      const config = TILES[category.slug!];

      return {
        ...config,
        category,
        chips: category.childCategories.slice(0, config.xl ? 4 : 3),
      };
    }),
);
</script>

<style lang="scss">
.categories-section {
  @apply rounded-[--plate-radius] px-8 py-9;

  background: var(--plate-bg);

  &__head {
    @apply mb-8 flex flex-wrap items-end justify-between gap-4;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-none tracking-widest text-primary;
  }

  // First four tiles form the bento (two tall + two stacked), the rest fall into rows of three
  &__grid {
    @apply grid grid-cols-3 gap-6;

    grid-auto-rows: minmax(190px, auto);
  }

  &__tile {
    --tile-safe: 54%;
    --tile-art-h: 84%;
    --tile-art-w: 64%;
    --tile-art-x: -14px;
    --tile-art-y: -10px;

    @apply relative isolate flex min-h-[190px] flex-col justify-end overflow-hidden rounded-xl p-6 text-additional-50;

    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease;

    &::after {
      @apply pointer-events-none absolute inset-0 z-[1] opacity-0;

      content: "";
      background: linear-gradient(135deg, rgb(255 255 255 / 20%), rgb(255 255 255 / 6%) 45%, transparent 72%);
      transition: opacity 0.22s ease;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow:
        0 1px 2px rgb(var(--tile-glow) / 16%),
        0 12px 24px -10px rgb(var(--tile-glow) / 28%),
        0 24px 48px -24px rgb(var(--tile-glow) / 22%),
        inset 0 1px 0 rgb(255 255 255 / 22%);
    }

    &:hover::after {
      @apply opacity-100;
    }

    &:has(.categories-section__link:focus-visible) {
      @apply outline outline-2 outline-offset-[3px] outline-primary;
    }
  }

  // Stretched over the whole tile; chips sit above it with their own links
  &__link {
    @apply outline-none;

    &::before {
      @apply absolute inset-0 z-[2];

      content: "";
    }
  }

  &__tile--xl {
    --tile-safe: 56%;
    --tile-art-h: 76%;
    --tile-art-w: 56%;
    --tile-art-x: -10px;
    --tile-art-y: -6px;

    @apply row-span-2 p-9;
  }

  &__tile--wide-text {
    --tile-safe: 61%;
  }

  &__art {
    @apply pointer-events-none absolute z-[-1] object-contain object-right-bottom;

    inset-inline-end: var(--tile-art-x);
    bottom: var(--tile-art-y);
    width: var(--tile-art-w);
    height: var(--tile-art-h);
    filter: drop-shadow(0 18px 22px rgb(0 0 0 / 22%));
    transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }

  &__tile:hover &__art {
    transform: scale(1.035) translateY(-2px);
  }

  &__body {
    max-inline-size: var(--tile-safe);

    // The name stays static so its link's ::before stretches over the whole tile
    > :not(.categories-section__name) {
      @apply relative z-[2];
    }
  }

  &__tile-eyebrow {
    @apply mb-2 text-[11px] font-bold uppercase leading-[1.4545] tracking-[0.14em] text-primary-600;
  }

  &__name {
    @apply font-geologica text-2xl font-bold leading-[1.1667] tracking-[-0.015em];
  }

  &__tile--xl &__name {
    @apply text-[2rem] leading-[1.1875] tracking-[-0.02em];
  }

  &__meta {
    @apply mt-2 max-w-[42ch] text-sm font-medium leading-normal;
  }

  &__body > &__chips {
    @apply z-[3];
  }

  &__chips {
    @apply mt-2.5 flex flex-wrap gap-2;
  }

  &__tile--xl &__chips {
    @apply mt-6;
  }

  &__chip {
    @apply flex min-h-7 items-center rounded-[14px] border border-additional-50/30 bg-additional-50/[0.22] px-[11px] py-1 text-xs leading-tight transition-colors;

    &:hover {
      @apply bg-additional-50/40;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-primary;
    }
  }

  &__tile--sand {
    --tile-glow: from theme("colors.warning.100") r g b;

    @apply text-neutral-950;

    background: linear-gradient(121deg, theme("colors.warning.100"), theme("colors.secondary.50"));
  }

  &__tile--sand &__name {
    @apply text-secondary-700;
  }

  &__tile--sand2 {
    --tile-glow: from theme("colors.neutral.200") r g b;

    @apply text-neutral-950;

    background: linear-gradient(118deg, theme("colors.neutral.200"), theme("colors.warning.50"));
  }

  &__tile--sand2 &__name {
    @apply text-primary-600;
  }

  &__tile--sand &__chip,
  &__tile--sand2 &__chip {
    @apply border-neutral-950/[0.08] bg-neutral-950/[0.06];

    &:hover {
      @apply bg-neutral-950/[0.12];
    }
  }

  &__tile--taupe {
    --tile-glow: from theme("colors.neutral.500") r g b;

    background: linear-gradient(125deg, theme("colors.neutral.500"), theme("colors.neutral.300"));
  }

  &__tile--accent {
    --tile-glow: from theme("colors.primary.500") r g b;

    background: linear-gradient(121deg, theme("colors.primary.500"), theme("colors.danger.300"));
  }

  &__tile--gold {
    --tile-glow: from theme("colors.secondary.500") r g b;

    background: linear-gradient(125deg, theme("colors.secondary.500"), theme("colors.neutral.300"));
  }

  &__tile--cocoa {
    --tile-glow: from theme("colors.neutral.500") r g b;

    background: linear-gradient(118deg, theme("colors.neutral.500"), theme("colors.secondary.300"));
  }

  &__tile--ink {
    --tile-glow: from theme("colors.neutral.950") r g b;

    background: linear-gradient(127deg, theme("colors.neutral.950"), theme("colors.secondary.500"));
  }

  &__tile--ink &__tile-eyebrow {
    @apply text-primary-400;
  }
}

@media (width < theme("screens.lg")) {
  .categories-section {
    @apply p-6;

    &__tile--xl {
      @apply col-span-full row-span-1;
    }

    &__tile:not(&__tile--xl) {
      @apply justify-start;
    }

    &__tile:not(&__tile--xl) &__chips {
      @apply hidden;
    }

    // Five small tiles leave one cell empty in the last row of three
    &__tile:last-child {
      @apply col-span-2;
    }
  }
}

@media (width < theme("screens.sm")) {
  .categories-section {
    @apply flex flex-col;

    &__head {
      @apply contents;
    }

    &__heading {
      @apply mb-8;
    }

    &__grid {
      @apply gap-3;
    }

    &__tile {
      @apply p-4;
    }

    &__tile--xl {
      @apply p-5;
    }

    &__all {
      @apply order-last mt-6 w-full;
    }
  }
}

@media (width < theme("screens.md")) {
  .categories-section {
    &__grid {
      @apply grid-cols-2;
    }

    &__name {
      @apply text-base;
    }

    &__tile--xl &__name {
      @apply text-2xl;
    }
  }
}
</style>

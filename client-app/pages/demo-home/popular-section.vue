<template>
  <section class="popular-section">
    <div class="popular-section__head">
      <div>
        <p class="popular-section__eyebrow">{{ t("pages.demo_home.popular.eyebrow") }}</p>

        <VcTypography tag="h2">{{ t("pages.demo_home.popular.title") }}</VcTypography>
      </div>

      <SectionLink :to="categoryRoute">{{ t("pages.demo_home.popular.see_all") }}</SectionLink>
    </div>

    <div class="popular-section__list">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        class="popular-section__card"
        :product="product"
        lazy
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getCategoryRoute } from "@/core/utilities/categories";
import { ProductCard, useProducts } from "@/shared/catalog";
import SectionLink from "./section-link.vue";

const CATEGORY_ID = "83599552-64ab-42de-af90-aa1d881a53cf";
const PRODUCTS_COUNT = 10;

const { t } = useI18n();
const { products, fetchProducts } = useProducts();

const categoryRoute = getCategoryRoute({ id: CATEGORY_ID });

onMounted(async () => {
  await fetchProducts({ categoryId: CATEGORY_ID, itemsPerPage: PRODUCTS_COUNT });
});
</script>

<style lang="scss">
.popular-section {
  @apply rounded-[--plate-radius] px-8 py-9;

  background: var(--plate-bg);

  &__head {
    @apply mb-8 flex flex-wrap items-end justify-between gap-4;
  }

  &__eyebrow {
    @apply mb-2.5 text-xs font-bold uppercase leading-none tracking-widest text-primary;

    html.dark & {
      @apply text-primary-600;
    }
  }

  &__list {
    @apply grid grid-cols-5 gap-5;
  }
}

@media (width < theme("screens.lg")) {
  .popular-section {
    @apply p-6;

    &__list {
      @apply -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2;

      scroll-padding-inline: theme("spacing.6");
    }

    &__card {
      @apply w-[13.75rem] flex-none snap-start;
    }
  }
}
</style>

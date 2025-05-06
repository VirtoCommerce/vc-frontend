<template>
  <VcContainer class="brands-page">
    <FeaturedBrands
      v-if="hasFeaturedBrands"
      class="brands-page__featured-brands"
      :loading="loading"
      :brands="featuredBrands"
    />

    <VcTypography v-if="!hasFeaturedBrands" tag="h1" class="brands-page__title">
      {{ $t("pages.brands.title") }}
    </VcTypography>

    <VcWidget v-if="hasBrands" class="brands-page__widget">
      <template #header>
        <div class="brands-page__header">
          <AlphabeticList
            v-model:active-letter="activeLetter"
            class="brands-page__alphabetic-list"
            :enabled-letters="enabledLetters"
          />

          <VcInput
            v-model="search"
            :disabled="loading"
            clearable
            class="brands-page__search"
            :placeholder="$t('pages.brands.search')"
          >
            <template #append>
              <VcButton color="neutral" size="sm">
                <VcIcon name="search" />
              </VcButton>
            </template>
          </VcInput>
        </div>
      </template>

      <BrandsList :loading="loading" :grouped-brands="brandsByFirstLetter" :active-letter="activeLetter" />
    </VcWidget>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useGetBrands } from "@/core/api/graphql/brands/queries/getBrands";
import type { BrandFragment } from "@/core/api/graphql/types";
import AlphabeticList from "@/shared/brands/components/alphabetic-list.vue";
import BrandsList from "@/shared/brands/components/brands-list.vue";
import FeaturedBrands from "@/shared/brands/components/featured-brands.vue";

type GroupedBrandsType = Record<string, BrandFragment[]>;

const activeLetter = ref("all");
const search = ref("");

const brands = computed(() => {
  return result.value?.brands?.items || [];
});

const featuredBrands = computed(() => {
  return brands.value.filter((brand) => brand.featured) || [];
});

const hasBrands = computed(() => {
  return brands.value.length > 0;
});

const hasFeaturedBrands = computed(() => {
  return featuredBrands.value.length > 0;
});

const filteredBrands = computed(() => {
  if (!search.value) {
    return brands.value;
  }

  return brands.value.filter((brand) => brand.name?.toLowerCase().includes(search.value.toLowerCase()));
});

const brandsByFirstLetter = computed(() => {
  return filteredBrands.value.reduce((acc, brand) => {
    const firstChar = brand.name?.charAt(0).toUpperCase() || "";

    const key = getGroupByLetter(firstChar);

    acc[key] = acc[key] || [];
    acc[key].push(brand);
    return acc;
  }, {} as GroupedBrandsType);
});

const enabledLetters = computed(() => {
  return Object.keys(brandsByFirstLetter.value);
});

const { result, loading } = useGetBrands();

function getGroupByLetter(letter: string) {
  if (/^[A-Za-z]$/.test(letter)) {
    return letter;
  } else if (/^\d$/.test(letter)) {
    return "numbers";
  } else {
    return "others";
  }
}

watch(activeLetter, (newLetter) => {
  if (newLetter === "all") {
    scrollTo({ top: 0, behavior: "smooth" });
  }

  const group = getGroupByLetter(newLetter);

  const element = document.querySelector(`[data-letter="${group}"]`);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

watch(search, (newSearch) => {
  if (newSearch) {
    activeLetter.value = "all";
  }
});
</script>

<style lang="scss">
.brands-page {
  @apply lg:py-10;

  &__title {
    @apply mb-5;
  }

  &__featured-brands {
    @apply mb-7;
  }

  &__widget {
    --slot-p-t: theme("padding.7");
    --p-x: theme("padding.7");
    --header-p-y: theme("padding.5");
  }

  &__alphabetic-list {
    @apply xl:shrink-0;
  }

  &__header {
    @apply 2xl:flex items-center justify-between w-full;
  }

  &__search {
    @apply w-full 2xl:mt-0 mt-2 2xl:ml-5;
  }
}
</style>

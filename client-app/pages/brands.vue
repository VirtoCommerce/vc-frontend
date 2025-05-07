<template>
  <VcContainer class="brands">
    <VcBreadcrumbs class="brands__breadcrumbs" :items="breadcrumbs" />

    <VcTypography tag="h1" class="brands__title">
      {{
        featuredBrands.length
          ? $t("pages.brands.top_brands_title")
          : $t("pages.brands.title", { count: groupedBrands.length })
      }}
    </VcTypography>

    <div v-if="featuredBrandsTrimmed.length" class="brands__top">
      <router-link
        v-for="brand in featuredBrandsTrimmed"
        :key="brand.id"
        class="brands__tile"
        :title="brand.name"
        to="#"
      >
        <VcImage v-if="brand.image" class="brands__img" :src="brand.image" :alt="brand.name" />
        <span v-else class="brands__img-fallback">
          {{ brand.name }}
        </span>
      </router-link>
    </div>

    <VcWidget>
      <template #title>
        <div class="brands__filters">
          <div class="brands__letters">
            <VcButton
              v-for="[navValue, navLabel] in Object.entries(brandNavIndex)"
              :key="navValue"
              size="xs"
              :disabled="!enabledNavItems.includes(navValue)"
              :color="activeNavItem === navValue ? 'primary' : 'neutral'"
              :variant="activeNavItem === navValue ? 'solid' : 'no-background'"
              square
              class="brands__nav-letter"
              @click="setActiveNavItem(navValue)"
            >
              {{ navLabel }}
            </VcButton>
          </div>

          <VcInput
            v-model="searchInput"
            class="brands__search"
            maxlength="64"
            clearable
            :placeholder="$t('pages.brands.search')"
            @clear="search = ''"
            @keyup.enter="search = searchInput"
          >
            <template #append>
              <VcButton
                :aria-label="$t('pages.brands.search')"
                icon="search"
                icon-size="1.25rem"
                @click="search = searchInput"
              />
            </template>
          </VcInput>
        </div>
      </template>

      <div class="brands__list">
        <div
          v-for="letter in sortedNavItems"
          :id="'brands-' + letter"
          :key="letter"
          class="brands__items"
          :class="{ 'brands__items--full': isFullWidthItem(letter) }"
        >
          <div class="brands__letter" :class="{ 'brands__letter--active': activeNavItem === letter }">
            {{ brandNavIndex[letter] }}
          </div>

          <ul class="brands__links">
            <li v-for="brand in groupedBrands[letter]" :key="brand.id">
              <router-link to="#" class="brands__link">
                {{ brand.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </VcWidget>

    <VcScrollTopButton />
  </VcContainer>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { NAV_INDEX_ITEMS } from "@/core/constants/brands";
import { getGroupByLetter } from "@/core/utilities/brands";
import { useBrands } from "@/shared/catalog";

const ITEMS_PER_PAGE = 1000;
const MIN_ITEMS_TO_SHOW_FULL_WIDTH = 10;

const { t } = useI18n();

usePageHead({
  title: t("pages.brands.title"),
});

const activeNavItem = ref(NAV_INDEX_ITEMS.all);
const searchInput = ref("");

const breadcrumbs = useBreadcrumbs([{ title: t("pages.brands.title") }]);
const { brandNavIndex, groupedBrands, featuredBrands, search } = useBrands({ itemsPerPage: ITEMS_PER_PAGE });
const breakpoints = useBreakpoints(breakpointsTailwind);

const featuredBrandsTrimmed = computed(() => {
  if (breakpoints.greaterOrEqual("xs").value) {
    return featuredBrands.value.slice(0, 12);
  }

  if (breakpoints.greaterOrEqual("lg").value) {
    return featuredBrands.value.slice(0, 10);
  }

  if (breakpoints.greaterOrEqual("md").value) {
    return featuredBrands.value.slice(0, 8);
  }

  if (breakpoints.smaller("md").value) {
    return featuredBrands.value.slice(0, 6);
  }

  return featuredBrands.value;
});

const sortedNavItems = computed(() => {
  return Object.keys(groupedBrands.value).sort();
});

const enabledNavItems = computed(() => {
  return [...sortedNavItems.value, NAV_INDEX_ITEMS.all];
});

function setActiveNavItem(value: string) {
  activeNavItem.value = value;
}

function isFullWidthItem(letter: string) {
  return letter === NAV_INDEX_ITEMS.others && groupedBrands.value[letter].length > MIN_ITEMS_TO_SHOW_FULL_WIDTH;
}

watch(activeNavItem, (newActiveNavItem) => {
  const group = getGroupByLetter(newActiveNavItem);
  const element = document.getElementById(`brands-${group}`);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
</script>

<style lang="scss">
.brands {
  $fullWidthItem: "";

  @apply bg-neutral-50;

  &__breadcrumbs {
    @apply mb-3;
  }

  &__title {
    @apply mb-5;
  }

  &__top {
    @apply grid mb-5 grid-cols-2 gap-4;

    @media (min-width: theme("screens.xs")) {
      @apply grid-cols-3;
    }

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-4;
    }

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-5 mb-7 gap-6;
    }

    @media (min-width: theme("screens.xl")) {
      @apply grid-cols-6;
    }
  }

  &__tile {
    @apply flex items-center justify-center p-3 aspect-[204/100] bg-additional-50 shadow-md rounded-sm;
  }

  &__img {
    @apply max-w-full max-h-full;
  }

  &__img-fallback {
    @apply text-center text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis;
  }

  &__filters {
    @apply flex items-center gap-3;
  }

  &__letters {
    @apply grow;

    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__search {
    @apply w-full;

    @media (min-width: theme("screens.lg")) {
      @apply max-w-[18.75rem];
    }
  }

  &__list {
    @apply grid grid-cols-2 gap-x-3 gap-y-16;

    @media (min-width: theme("screens.xs")) {
      @apply grid-cols-3;
    }

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-4;
    }

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-5;
    }

    @media (min-width: theme("screens.xl")) {
      @apply gap-x-16;
    }
  }

  &__items {
    &--full {
      $fullWidthItem: &;

      @apply col-span-full grid grid-cols-subgrid;
    }
  }

  &__letter {
    @apply mb-3.5 text-secondary-700 text-3xl font-bold;

    &--active {
      @apply text-primary;
    }

    #{$fullWidthItem} & {
      @apply col-span-full;
    }
  }

  &__nav-letter {
    @apply disabled:opacity-20;
  }

  &__links {
    @apply flex flex-col gap-1 text-base;

    #{$fullWidthItem} & {
      @apply contents;
    }
  }

  &__link {
    @apply inline-block max-w-full text-additional-950 truncate;

    &:hover {
      @apply text-[--link-hover-color];
    }
  }
}
</style>

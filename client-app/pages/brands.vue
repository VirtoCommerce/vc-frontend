<template>
  <VcContainer class="brands">
    <VcBreadcrumbs class="brands__breadcrumbs" :items="breadcrumbs" />

    <VcTypography tag="h1" class="brands__title">
      {{ $t("pages.brands.title") }}
    </VcTypography>

    <VcWidget>
      <template #title>
        <div class="brands__filters">
          <div class="brands__letters">
            <VcButton size="xs" square>All</VcButton>

            <VcButton
              v-for="letter in letters"
              :key="letter"
              size="xs"
              color="neutral"
              variant="no-background"
              square
              @click="scrollToLetter(letter)"
            >
              {{ letter }}
            </VcButton>
          </div>

          <VcInput class="brands__search" maxlength="64" clearable :placeholder="$t('pages.brands.search')">
            <template #append>
              <VcButton :aria-label="$t('commmon.buttons.search_orders')" icon="search" icon-size="1.25rem" />
            </template>
          </VcInput>
        </div>
      </template>

      <div class="brands__list">
        <div v-for="letter in letters" :id="'brands-' + letter" :key="letter" class="brands__items">
          <div class="brands__letter">
            {{ letter }}
          </div>

          <ul class="brands__links">
            <li v-for="i in Math.floor(Math.random() * 20)" :key="i">
              <router-link to="#" class="brands__link"> {{ letter }}brand name {{ i }} </router-link>
            </li>
          </ul>
        </div>
      </div>
    </VcWidget>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";

const { t } = useI18n();

usePageHead({
  title: t("pages.brands.title"),
});

const letters = computed(() => "abcdefghijklmnopqrstuvwxyz".toUpperCase().split(""));
const breadcrumbs = useBreadcrumbs([{ title: t("pages.brands.title") }]);

function scrollToLetter(letter: string) {
  const element = document.getElementById(`brands-${letter}`);

  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}
</script>

<style lang="scss">
.brands {
  @apply bg-neutral-50;

  &__breadcrumbs {
    @apply mb-3;
  }

  &__title {
    @apply mb-5;
  }

  &__filters {
    @apply flex items-center gap-3;
  }

  &__letters {
    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__search {
    @apply grow;
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
  }

  &__items {
  }

  &__letter {
    @apply mb-3.5 text-secondary-700 text-3xl font-bold;
  }

  &__links {
    @apply flex flex-col gap-1;
  }

  &__link {
    @apply inline-block max-w-full text-additional-950 truncate;

    &:hover {
      @apply text-[--link-hover-color];
    }
  }
}
</style>

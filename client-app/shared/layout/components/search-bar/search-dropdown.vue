<template>
  <div ref="dropdownElement" class="search-dropdown" :style="dropdownStyle" data-dropdown @focusout="handleFocusOut">
    <div class="search-dropdown__sidebar">
      <!-- Search history and suggestions -->
      <template v-if="(searchHistoryQueries.length && !searchHistoryLoading) || (suggestions.length && !loading)">
        <header class="search-dropdown__head">
          {{ $t("shared.layout.search_bar.suggestions_and_history_label") }}
        </header>

        <ul class="search-dropdown__list">
          <VcMenuItem
            v-for="query in searchHistoryQueries"
            :key="query"
            role="menuitem"
            :label="query"
            tag="li"
            truncate
            nowrap
            color="secondary"
            @click="$emit('historyClick', query)"
            @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => $emit('focusChange', 'UP', $event)"
            @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => $emit('focusChange', 'DOWN', $event)"
          >
            <template #prepend>
              <VcIcon name="history" size="md" />
            </template>

            <span v-html-safe="highlightSearchText(query, searchPhrase)" class="[word-break:break-word]" />
          </VcMenuItem>

          <VcMenuItem
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            :to="getSearchRoute(suggestion.text)"
            role="menuitem"
            tag="li"
            truncate
            color="secondary"
            @click="$emit('hide')"
            @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => $emit('focusChange', 'UP', $event)"
            @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => $emit('focusChange', 'DOWN', $event)"
          >
            <span v-html-safe="suggestion.label" class="[word-break:break-word]" />
          </VcMenuItem>
        </ul>
      </template>

      <!-- Pages -->
      <template v-if="pages.length">
        <header class="search-dropdown__head">
          {{ $t("shared.layout.search_bar.pages_label") }}
        </header>

        <ul class="search-dropdown__grid">
          <VcMenuItem
            v-for="(page, index) in pages"
            :key="index"
            class="w-full"
            role="menuitem"
            :to="page.permalink"
            tag="li"
            size="xs"
            color="secondary"
            @click="$emit('hide')"
            @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => $emit('focusChange', 'UP', $event)"
            @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => $emit('focusChange', 'DOWN', $event)"
          >
            <span v-html-safe="page.name" class="[word-break:break-word]" />
          </VcMenuItem>
        </ul>
      </template>

      <!-- Categories -->
      <template v-if="categories.length">
        <header class="search-dropdown__head">
          {{ $t("shared.layout.search_bar.categories_label") }}
        </header>

        <ul v-for="(column, index) in categoriesColumns" :key="index" class="search-dropdown__grid">
          <VcMenuItem
            v-for="category in column"
            :key="category.name"
            :to="categoriesRoutes[category.id]"
            tag="li"
            role="menuitem"
            color="secondary"
            @click="$emit('hide')"
            @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => $emit('focusChange', 'UP', $event)"
            @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => $emit('focusChange', 'DOWN', $event)"
          >
            <span v-html-safe="category.name" class="[word-break:break-word]" />
          </VcMenuItem>
        </ul>
      </template>
    </div>

    <div class="search-dropdown__content">
      <!-- Products -->
      <template v-if="products.length">
        <header class="search-dropdown__head">
          {{ $t("shared.layout.search_bar.products_label") }}
        </header>

        <div class="search-dropdown__products">
          <SearchBarProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @link-click="
              $emit('hide');
              $emit('productSelect', product);
            "
            @changeFocus="$emit('focusChange', $event.direction, $event.event)"
          />
        </div>
      </template>

      <!-- Actions -->
      <div v-if="total" class="search-dropdown__actions">
        <VcButton
          size="sm"
          tabindex="0"
          @click="$emit('search')"
          @keydown.arrow-up.arrow-left="($event: KeyboardEvent) => $emit('focusChange', 'UP', $event)"
          @keydown.arrow-down.arrow-right="($event: KeyboardEvent) => $emit('focusChange', 'DOWN', $event)"
        >
          {{ $t("shared.layout.search_bar.view_all_results_button", { total }) }}
        </VcButton>
      </div>
    </div>

    <!-- Not found -->
    <template v-if="!searchInProgress && !isExistResults && searchPhrase">
      <header class="search-dropdown__head">
        {{ $t("shared.layout.search_bar.search_label") }}
      </header>

      <div class="search-dropdown__not-found">
        <VcIcon name="search-not-found" size="md" />

        <i18n-t keypath="shared.layout.search_bar.no_results" tag="div">
          <template #keyword>
            <strong>{{ searchPhrase }}</strong>
          </template>
        </i18n-t>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { highlightSearchText } from "@/shared/layout/utils";
import SearchBarProductCard from "./_internal/search-bar-product-card.vue";
import type { Category, PageType, Product } from "@/core/api/graphql/types";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  dropdownStyle?: StyleValue;
  searchHistoryQueries: string[];
  searchHistoryLoading: boolean;
  suggestions: Array<{ text: string; label: string }>;
  loading: boolean;
  pages: PageType[];
  categories: Category[];
  categoriesColumns: Array<Category[]>;
  categoriesRoutes: Record<string, RouteLocationRaw>;
  products: Product[];
  total: number;
  searchInProgress: boolean;
  isExistResults: boolean;
  searchPhrase: string;
  getSearchRoute: (phrase: string) => RouteLocationRaw;
}

interface IEmits {
  (e: "hide"): void;
  (e: "search"): void;
  (e: "historyClick", query: string): void;
  (e: "productSelect", product: Product): void;
  (e: "focusChange", direction: "UP" | "DOWN", event: KeyboardEvent): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();

const dropdownElement = ref<HTMLElement | null>(null);

function handleFocusOut(event: FocusEvent) {
  if (!dropdownElement.value?.contains(event.relatedTarget as Node)) {
    emit("hide");
  }
}

defineExpose({
  dropdownElement,
});
</script>

<style lang="scss">
.search-dropdown {
  @apply z-20 bg-additional-50;

  @media (width < theme("screens.md")) {
    @apply fixed top-16 inset-x-0 bottom-0;
  }

  @media (min-width: theme("screens.md")) {
    @apply absolute left-0 top-[3.45rem] flex w-full min-w-[640px] max-w-[100vw] overflow-y-auto rounded-[--vc-radius] shadow-lg;
  }

  &__head {
    @apply bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-600;
  }

  &__list {
    @apply px-2 py-3;
  }

  &__grid {
    @apply grid grid-cols-4 gap-2 px-2 py-3;
  }

  &__products {
    @apply grid grid-cols-2 gap-y-0.5 p-3;
  }

  &__actions {
    @apply sticky bottom-0 mt-4 border-t border-neutral-100 bg-additional-50 px-5 py-3;
  }

  &__not-found {
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1.5 px-4 py-6 text-sm text-neutral-500;
  }
}
</style>

<template>
  <VcWidgetSkeleton v-if="loading" size="xs">
    <div v-for="i in 6" :key="i" />
  </VcWidgetSkeleton>

  <VcWidget
    v-else-if="!!parentCategory || subcategories.length"
    size="xs"
    :title="$t('shared.layout.search_dropdown.categories_label')"
    class="category-selector"
  >
    <!-- The design's secondary-nav list: the way up, the section the reader is in as the active row,
         then what lies inside it. -->
    <nav class="category-selector__list">
      <router-link
        v-if="parentCategory"
        :to="getCategoryRoute(parentCategory, locationQuery, catalogBasePath)"
        class="category-selector__item category-selector__item--up"
      >
        <VcIcon name="chevron-left" size="xs" class="category-selector__up-icon" />

        <span class="category-selector__name">{{ parentCategory.name }}</span>
      </router-link>

      <span class="category-selector__item category-selector__item--active" aria-current="page">
        <span class="category-selector__name">
          <template v-if="objectType === 'Category' && category?.name">{{ category.name }}</template>

          <template v-else-if="objectType === 'Catalog'">{{ seoInfo?.pageTitle }}</template>
        </span>
      </span>

      <router-link
        v-for="(item, index) in subcategories"
        :key="index"
        :to="subcategoriesRoutes[item.id]"
        class="category-selector__item category-selector__item--child"
      >
        <span class="category-selector__name">{{ item.name }}</span>

        <VcBadge
          v-if="item.facet?.count"
          class="category-selector__count"
          variant="soft"
          size="sm"
          rounded
          color="secondary"
        >
          {{ $n(item.facet.count, "decimal") }}
        </VcBadge>
      </router-link>
    </nav>
  </VcWidget>
</template>

<script setup lang="ts">
import { pickBy } from "lodash-es";
import { computed, toValue } from "vue";
import { useRoute } from "vue-router";
import { useCategoriesRoutes, useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { getCategoryRoute } from "@/core/utilities";
import { useCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";
import { useSlugInfo } from "@/shared/common";
import type { Category } from "@/core/api/graphql/types";
import type { FacetValueItemType } from "@/core/types";

type CategoryType = Pick<Category, "name" | "parent" | "id" | "slug"> & { childCategories: CategoryType[] } & {
  facet?: FacetType;
};
type FacetType = Pick<FacetValueItemType, "label" | "count">;

interface IProps {
  category?: CategoryType | null;
  loading?: boolean;
  categoryFacets?: FacetType[];
}

const props = defineProps<IProps>();

const route = useRoute();
const { objectType, seoInfo } = useSlugInfo(route.path.slice(1));

const parentCategory = computed<CategoryType | undefined>(() => props.category?.parent);
const subcategories = computed<CategoryType[]>(
  () =>
    props.category?.childCategories
      .map((el) => {
        return {
          ...el,
          facet: getFacet(el),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)) || [],
);

const searchParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const facetsParam = useRouteQueryParam<string>(QueryParamName.Facets);
const sortParam = useRouteQueryParam<string>(QueryParamName.Sort);

const locationQuery = computed(() => {
  const hasToKeepQuery = !!searchParam.value;

  if (!hasToKeepQuery) {
    return {};
  }

  return pickBy(
    {
      [QueryParamName.SearchPhrase]: toValue(searchParam),
      [QueryParamName.Facets]: toValue(facetsParam),
      [QueryParamName.Sort]: toValue(sortParam),
    },
    (value) => !!value,
  );
});

const catalogBasePath = useCatalogBasePath();
const subcategoriesRoutes = useCategoriesRoutes(subcategories, locationQuery, catalogBasePath);

function getFacet(category: CategoryType) {
  return props.categoryFacets?.find((el) => {
    return el.label.toLowerCase() === category.name.toLowerCase();
  });
}
</script>

<style lang="scss">
.category-selector {
  // The design heads this block with an h5 — the rail's one sentence-case heading — rather than the
  // uppercase label the facets below carry: it names where the reader is, not what they can filter.
  .vc-widget__title {
    @apply text-base normal-case;
  }

  &__list {
    @apply flex flex-col gap-0.5;
  }

  // The design's size-sm menu row: 10px above and below a 14px name. Its plate bleeds 12px past the
  // text on both sides, so the names stand on the heading's vertical while the hover and the active
  // fill still read as a row — the side-menu device from the account pages.
  &__item {
    @apply -mx-3 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm leading-[1.35] text-neutral-950 transition-colors;

    &:is(a):hover {
      @apply bg-neutral-100;
    }

    &--up {
      @apply text-neutral-600;
    }

    &--active {
      @apply bg-secondary-100 font-bold;
    }

    // Children sit one step in, under the section they belong to.
    &--child {
      @apply ps-6;
    }
  }

  &__up-icon {
    @apply text-primary;
  }

  &__name {
    @apply line-clamp-2 min-w-0 [word-break:break-word];
  }

  &__count {
    @apply ms-auto shrink-0;
  }
}
</style>

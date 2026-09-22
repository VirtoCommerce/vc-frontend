<template>
  <VcWidgetSkeleton v-if="loading" size="xs">
    <div v-for="i in 6" :key="i" />
  </VcWidgetSkeleton>

  <VcWidget v-else-if="!!parentCategory || subcategories.length" size="xs" class="category-selector">
    <!-- Where the reader stands, as one line: the section it sits in, then its own name. The section
         is the way back up, so it stays a link. -->
    <template #header>
      <div class="category-selector__crumb">
        <template v-if="parentCategory">
          <router-link
            :to="getCategoryRoute(parentCategory, locationQuery, catalogBasePath)"
            class="category-selector__parent"
          >
            {{ parentCategory.name }}
          </router-link>

          <span class="category-selector__dot" aria-hidden="true">&middot;</span>
        </template>

        <span class="category-selector__current">
          <template v-if="objectType === 'Category' && category?.name">{{ category.name }}</template>

          <template v-else-if="objectType === 'Catalog'">{{ seoInfo?.pageTitle }}</template>
        </span>
      </div>
    </template>

    <template v-if="subcategories.length" #default>
      <div class="category-selector__list">
        <router-link
          v-for="(item, index) in subcategories"
          :key="index"
          :to="subcategoriesRoutes[item.id]"
          class="category-selector__item"
        >
          <span class="category-selector__name">{{ item.name }}</span>

          <VcBadge
            v-if="item.facet?.count"
            class="category-selector__count"
            variant="soft"
            size="sm"
            rounded
            color="neutral"
          >
            {{ $n(item.facet.count, "decimal") }}
          </VcBadge>
        </router-link>
      </div>
    </template>
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
  &__crumb {
    @apply flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[0.9375rem] leading-snug;
  }

  &__parent {
    @apply text-neutral-500 hover:text-neutral-950 hover:underline;
  }

  &__dot {
    @apply text-neutral-400;
  }

  &__current {
    @apply font-bold text-neutral-950;
  }

  &__list {
    @apply flex flex-col;
  }

  // The same row as a facet option — 34px, a 16px name, the count pinned right — so the rail reads
  // as one list from top to bottom rather than two kinds of list stacked.
  &__item {
    @apply flex min-h-[2.125rem] items-center gap-2.5 py-1 text-base text-neutral-700 hover:text-neutral-950;
  }

  &__name {
    @apply line-clamp-2 [word-break:break-word];
  }

  &__count {
    @apply ms-auto h-6 min-w-[1.875rem] shrink-0 justify-center rounded-full border-0 px-2 text-[0.8125rem] font-semibold text-neutral-700;

    background: color-mix(in srgb, theme("colors.neutral.950") 6%, transparent);
  }
}
</style>

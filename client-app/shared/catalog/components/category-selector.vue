<template>
  <VcWidgetSkeleton v-if="loading" size="xs">
    <div v-for="i in 6" :key="i" />
  </VcWidgetSkeleton>

  <VcWidget v-else-if="!!parentCategory || subcategories.length" size="xs">
    <template v-if="!!parentCategory" #header>
      <router-link
        :to="getCategoryRoute(parentCategory, locationQuery)"
        class="-mx-2 flex grow items-center gap-1.5 rounded-sm px-2 py-1 text-sm hover:bg-neutral-50"
      >
        <VcIcon class="fill-primary" name="chevron-left" size="xs" />
        <span class="font-bold">
          {{ parentCategory.name }}
        </span>
      </router-link>
    </template>

    <template v-if="subcategories.length" #default>
      <div class="-mt-1 mb-0.5 py-0.5 text-xs font-black uppercase text-neutral-900">
        <template v-if="objectType === 'Category' && category?.name">
          {{ category.name }}
        </template>

        <template v-else-if="objectType === 'Catalog'">
          {{ seoInfo?.pageTitle }}
        </template>
      </div>

      <div class="flex flex-col pl-4">
        <router-link
          v-for="(item, index) in subcategories"
          :key="index"
          :to="subcategoriesRoutes[item.id]"
          class="-mx-2 mt-0.5 flex items-center gap-1 rounded-sm px-2 py-0.5 text-sm transition-colors hover:bg-neutral-50"
        >
          <span class="line-clamp-2 [word-break:break-word]">{{ item.name }}</span>

          <VcBadge
            v-if="item.facet?.count"
            class=""
            :class="['ml-auto', 'items-center', 'h-3.5', { 'px-1': item.facet.count > 9 }]"
            variant="outline"
            size="sm"
            rounded
            color="secondary"
          >
            {{ $n(item.facet.count, "decimal") }}
          </VcBadge>
        </router-link>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import pickBy from "lodash/pickBy";
import { computed, toValue } from "vue";
import { useRoute } from "vue-router";
import { useCategoriesRoutes, useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { getCategoryRoute } from "@/core/utilities";
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
    props.category?.childCategories.map((el) => {
      return {
        ...el,
        facet: getFacet(el),
      };
    }) || [],
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

const subcategoriesRoutes = useCategoriesRoutes(subcategories, locationQuery);

function getFacet(category: CategoryType) {
  return props.categoryFacets?.find((el) => {
    return el.label.toLowerCase() === category.name.toLowerCase();
  });
}
</script>

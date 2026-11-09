<template>
  <VcContainer v-if="!isWaitingForCategory">
    <PageBuilderSection
      v-for="item in templateParts.before"
      :key="item.id"
      :item="item"
      :context="sectionContext"
      :id="getAnchorId(item)"
      class="mb-5 xl:mb-6"
    />

    <VcBreadcrumbs
      v-if="currentCategory?.breadcrumbs && !listing?.hideBreadcrumbs"
      class="mb-2.5 md:mb-4"
      :items="breadcrumbs"
    />

    <Category
      v-bind="{ ...listingSettings, ...getPreviewSectionAttrs(listing?.id) }"
      :category-id="categoryId"
      :currency-code-override="loyaltyCurrencyOverride"
      allow-set-meta
    />

    <PageBuilderSection
      v-for="item in templateParts.after"
      :key="item.id"
      :item="item"
      :context="sectionContext"
      :lazy="lazySections"
      :id="getAnchorId(item)"
      class="mt-5 xl:mt-6"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, toRefs, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import {
  getAnchorId,
  getPreviewSectionAttrs,
  isLazySectionsEnabled,
  MAIN_SECTION_TYPES,
  PageBuilderSection,
  splitTemplate,
  useTemplateResolution,
} from "@/shared/static-content";
import Category from "@/shared/catalog/components/category.vue";

interface IProps {
  categoryId?: string;
  /** From the slug, so the template is chosen before the category loads. */
  outline?: string;
}

const props = defineProps<IProps>();

const LISTING_SETTINGS = [
  "hideSidebar",
  "hideControls",
  "hideSorting",
  "hideTotal",
  "viewMode",
  "filtersOrientation",
  "filtersDisplayOrder",
  "cardType",
  "columnsAmountTablet",
  "columnsAmountDesktop",
  "showButtonToDefaultView",
] as const;

/** A setting the schema offers as "<unset>" keeps the listing's own default. */
const UNSET_VALUE = "<unset>";

const { categoryId } = toRefs(props);

const { category: currentCategory, fetchCategory } = useCategory();
const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(currentCategory.value?.breadcrumbs));

const { isCategoryScope, isScopePending, holdScope } = useSearchScore();

const lazySections = isLazySectionsEnabled();

const settledCategoryId = ref<string>();

/** Without the slug's outline, a theme rule can depend on the loaded category, so waiting avoids a template switch. */
const isWaitingForCategory = computed(
  () =>
    isNewPageBuilderEnabled() && !!props.categoryId && !props.outline && settledCategoryId.value !== props.categoryId,
);

const templateResolution = useTemplateResolution("category", () => {
  if (isWaitingForCategory.value) {
    return undefined;
  }

  // The loaded category may still be the previous one: this route component stays when only the id changes.
  const loadedOutline = currentCategory.value?.id === props.categoryId ? currentCategory.value?.outline : undefined;
  const outline = props.outline ?? loadedOutline;
  return props.categoryId
    ? { categoryId: props.categoryId, categoryPaths: outline ? [outline.split("/")] : [] }
    : undefined;
});

const templateParts = computed(() =>
  splitTemplate(templateResolution.value?.document.content ?? [], MAIN_SECTION_TYPES.category),
);

const listing = computed(() => templateParts.value.main);

const listingSettings = computed(() =>
  Object.fromEntries(
    LISTING_SETTINGS.map((key) => [key, listing.value?.[key]]).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && value !== UNSET_VALUE,
    ),
  ),
);

const sectionContext = computed(() => ({ category: currentCategory.value }));

// Runs before the child drops its scope or preparation; held a tick for a matcher mounting in its place.
onBeforeUnmount(() => {
  if (isCategoryScope.value || isScopePending.value) {
    void nextTick(holdScope());
  }
});

watch(
  categoryId,
  (newCategoryId) => {
    if (newCategoryId) {
      void loadCategory(newCategoryId);
    }
  },
  { immediate: true },
);

async function loadCategory(id: string): Promise<void> {
  try {
    await fetchCategory({ categoryId: id, maxLevel: 0, currencyCode: loyaltyCurrencyOverride.value });
  } finally {
    if (id === props.categoryId) {
      settledCategoryId.value = id;
    }
  }
}
</script>

<template>
  <VcContainer>
    <PageBuilderSection
      v-for="item in templateParts.before"
      :key="item.id"
      :item="item"
      :context="sectionContext"
      :id="getAnchorId(item)"
      :model="item"
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
      :model="item"
      class="mt-5 xl:mt-6"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, toRefs, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { buildBreadcrumbs } from "@/core/utilities";
import { isDesignerPreview } from "@/plugins/builder-preview/utils";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import {
  getAnchorId,
  getPreviewSectionAttrs,
  MAIN_SECTION_TYPES,
  PageBuilderSection,
  splitTemplate,
  useTemplateResolution,
} from "@/shared/static-content";
import Category from "@/shared/catalog/components/category.vue";

interface IProps {
  categoryId?: string;
  /** The category's outline from its slug: the template is chosen before the category loads. */
  outline?: string;
}

const props = defineProps<IProps>();

/** The settings of the `category-listing` section the product listing takes, as the `category` section does. */
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

/** With the new Page Builder, sections below the listing mount as they come near the viewport. */
const lazySections = isNewPageBuilderEnabled() && !isDesignerPreview();

const templateResolution = useTemplateResolution("category", () => {
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
      void fetchCategory({
        categoryId: newCategoryId,
        maxLevel: 0,
        currencyCode: loyaltyCurrencyOverride.value,
      });
    }
  },
  { immediate: true },
);
</script>

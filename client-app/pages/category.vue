<template>
  <VcContainer v-if="!isWaitingForFirstCategory">
    <PageBuilderSections :items="templateParts.before" :context="sectionContext" spaced class="mb-5 xl:mb-6" />

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

    <PageBuilderSections
      :items="templateParts.after"
      :context="sectionContext"
      :lazy="lazySections"
      spaced
      class="mt-5 xl:mt-6"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, shallowRef, toRefs, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useScopeHandOver } from "@/shared/layout/composables/useScopeHandOver";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import {
  getPreviewSectionAttrs,
  isLazySectionsEnabled,
  MAIN_SECTION_TYPES,
  PageBuilderSections,
  splitTemplate,
  useAnchorScroll,
  useTemplateResolution,
} from "@/shared/static-content";
import type { ITemplateSubject } from "@/shared/static-content";
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

/** A setting the schema offers as unset keeps the listing's own default. */
const UNSET_VALUE = "<unset>";

const { categoryId } = toRefs(props);

const { category: currentCategory, fetchCategory } = useCategory();
const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(currentCategory.value?.breadcrumbs));

const { isCategoryScope, isScopePending, holdScope } = useSearchScore();

const lazySections = isLazySectionsEnabled();

/** The last category whose request has finished, as the template rules see it. */
const settledSubject = shallowRef<ITemplateSubject>();

const templateSubject = computed<ITemplateSubject | undefined>(() => {
  if (!props.categoryId) {
    return undefined;
  }

  // Without the slug's outline a theme rule can depend on the loaded category, so the template follows the settled
  // one: the next category switches it once it has loaded, while the page and its listing stay as they are.
  if (isNewPageBuilderEnabled() && !props.outline) {
    return settledSubject.value;
  }

  return toTemplateSubject(props.categoryId, props.outline ?? getLoadedOutline(props.categoryId));
});

const isWaitingForFirstCategory = computed(() => !!props.categoryId && !templateSubject.value);

const templateResolution = useTemplateResolution("category", templateSubject);

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

useAnchorScroll(() => templateResolution.value);

// Runs before the child drops its scope or preparation; held a tick for a matcher mounting in its place.
onBeforeUnmount(() => {
  if (isCategoryScope.value || isScopePending.value) {
    void nextTick(holdScope());
  }
});

// The listing that takes the scope over mounts once the first category loads. Registered after the hook above, so
// leaving mid-wait still hands this hold on.
useScopeHandOver(isWaitingForFirstCategory);

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
      settledSubject.value = toTemplateSubject(id, getLoadedOutline(id));
    }
  }
}

// The loaded category may still be the previous one: this route component stays when only the id changes.
function getLoadedOutline(id: string): string | undefined {
  return currentCategory.value?.id === id ? (currentCategory.value.outline ?? undefined) : undefined;
}

function toTemplateSubject(id: string, outline: string | undefined): ITemplateSubject {
  return { categoryId: id, categoryPaths: outline ? [outline.split("/")] : [] };
}
</script>

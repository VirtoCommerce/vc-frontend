<template>
  <!-- Collapsable mode -->
  <VcWidget v-if="mode === 'collapsable'" class="facet-filter-widget" size="xs" collapsible collapsed>
    <template #default-container>
      <div v-if="searchFieldVisible" class="facet-filter-widget__search">
        <VcInput
          v-model="searchKeyword"
          size="sm"
          maxlength="30"
          :disabled="loading"
          :placeholder="$t('common.labels.search', [facet.label])"
          truncate
        />
      </div>

      <div class="facet-filter-widget__container" :style="{ maxHeight }">
        <VcMenuItem
          v-for="item in searchedValues"
          :key="item.value"
          size="xs"
          color="secondary"
          :data-test-id="`filter-${facet.paramName}-${item.value}`"
          @click="handleFacetItemClick(item)"
        >
          <template #prepend>
            <VcCheckbox
              :model-value="isSelected(item)"
              tabindex="-1"
              size="xs"
              :disabled="loading"
              @change="handleFacetItemClick(item)"
              @click.stop
            />
          </template>

          <span>{{ item.label }}</span>

          <template #append>
            <VcBadge
              :class="{ 'px-1': item.count && item.count > 9 }"
              variant="outline"
              size="sm"
              rounded
              color="secondary"
            >
              {{ $n(Number(item.count), "decimal") }}
            </VcBadge>
          </template>
        </VcMenuItem>

        <VcMenuItem v-if="isNoResults" size="xs" disabled>
          {{ $t("pages.catalog.no_facet_found_message") }}
        </VcMenuItem>

        <div v-if="isAnchorAdded" ref="fadeVisibilityAnchor"></div>

        <div v-if="hasFade" class="facet-filter-widget__fade"></div>
      </div>
    </template>

    <template v-if="isShowMoreVisible" #footer-container>
      <VcButtonSeeMoreLess v-model="isExpanded" class="facet-filter-widget__more" />
    </template>

    <template #title>
      <span class="facet-filter-widget__title">
        <span class="facet-filter-widget__title-label">{{ facet.label }}</span>

        <VcBadge
          v-if="hasSelected"
          size="xs"
          rounded
          variant="outline"
          color="secondary"
          class="facet-filter-widget__title-badge"
        >
          {{ selectedFiltersCount }}
        </VcBadge>
      </span>
    </template>
  </VcWidget>

  <!-- Dropdown mode -->
  <VcDropdownMenu
    v-if="mode === 'dropdown'"
    :disabled="disabled"
    :offset-options="4"
    class="facet-filter-dropdown"
    z-index="10"
    max-height="20rem"
    width="15rem"
    :dividers="false"
  >
    <template #trigger="{ opened, triggerProps }">
      <VcButton
        :class="['facet-filter-dropdown__trigger', { 'facet-filter-dropdown__trigger--opened': opened }]"
        size="sm"
        :color="hasSelected ? 'accent' : 'secondary'"
        variant="outline"
        v-bind="triggerProps"
      >
        {{ facet.label }}

        <template #append>
          <span class="facet-filter-dropdown__append">
            <VcBadge v-if="hasSelected" size="sm" rounded color="info">
              {{ selectedFiltersCount }}
            </VcBadge>

            <VcIcon v-else name="chevron-down" class="facet-filter-dropdown__arrow" />
          </span>
        </template>
      </VcButton>
    </template>

    <template #content="{ close }">
      <div v-if="searchFieldVisible" class="facet-filter-dropdown__search">
        <VcInput
          v-model="searchKeyword"
          size="sm"
          maxlength="30"
          :disabled="loading"
          :placeholder="$t('common.labels.search', [facet.label])"
          truncate
        />
      </div>

      <div class="facet-filter-dropdown__items">
        <VcMenuItem v-if="isNoResults" disabled>{{ $t("pages.catalog.no_facet_found_message") }}</VcMenuItem>

        <VcMenuItem
          v-for="item in filtered"
          :key="item.value"
          size="xs"
          color="secondary"
          truncate
          :active="isSelected(item)"
          :title="item.label"
          @click="
            handleFacetItemClick(item);
            close();
          "
        >
          <template #prepend>
            <VcCheckbox
              :model-value="isSelected(item)"
              size="xs"
              :disabled="loading"
              @change="handleFacetItemClick(item)"
              @click.stop
            />
          </template>

          {{ item.label }}

          <template #append>
            <VcBadge variant="outline" size="sm" rounded color="secondary">
              {{ $n(item.count as number, "decimal") }}
            </VcBadge>
          </template>
        </VcMenuItem>
      </div>
    </template>
  </VcDropdownMenu>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { computed, ref, shallowRef, toRef, watch } from "vue";
import { areStringOrNumberEqual } from "@/core/utilities";
import type {
  SearchProductFilterRangeValue,
  SearchProductFilterResult,
  SearchProductFilterValue,
} from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";

interface IEmits {
  (event: "update:filter", filters: SearchProductFilterResult): void;
}

interface IProps {
  facet: FacetItemType;
  loading?: boolean;
  disabled?: boolean;
  mode: "dropdown" | "collapsable";
  filter?: SearchProductFilterResult;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const facet = toRef(props, "facet");

const breakpoints = useBreakpoints(breakpointsTailwind);

const SHOW_MORE_AMOUNT = 8;
const SEARCH_FIELD_AMOUNT = 10;
const ITEM_HEIGHT = 38;
const MAX_ITEMS_VISIBLE = 14;
const INNER_MARGIN = 0;

const isMobile = breakpoints.smaller("lg");

const MAX_HEIGHT = ITEM_HEIGHT * (MAX_ITEMS_VISIBLE + 1) + INNER_MARGIN;

const maxHeight = computed(() => (isMobile.value ? "unset" : `${MAX_HEIGHT}px`));

const selectedTerms = ref([] as string[]);

const selectedRanges = ref([] as SearchProductFilterRangeValue[]);

function handleFacetItemClick(item: FacetValueItemType): void {
  if (facet.value.type === "terms") {
    const index = selectedTerms.value.findIndex((value) => value === item.value);
    if (index === -1) {
      selectedTerms.value.push(item.value);
    } else {
      selectedTerms.value.splice(index, 1);
    }
  }

  if (facet.value.type === "range") {
    const index = selectedRanges.value.findIndex((value) => {
      return (
        value.includeLowerBound === item.includeFrom &&
        value.includeUpperBound === item.includeTo &&
        areStringOrNumberEqual(item.from, value.lower) &&
        areStringOrNumberEqual(item.to, value.upper)
      );
    });

    if (index === -1) {
      selectedRanges.value.push({
        includeLowerBound: item.includeFrom || false,
        includeUpperBound: item.includeTo || false,
        lower: numberToString(item.from),
        upper: numberToString(item.to),
      });
    } else {
      selectedRanges.value.splice(index, 1);
    }
  }

  emit("update:filter", {
    isGenerated: false,
    filterType: facet.value.type,
    name: facet.value.paramName,
    termValues: selectedTerms.value.map((value) => ({
      value,
      label: facet.value.values.find((el) => el.value === value)?.label || value,
    })),
    rangeValues: selectedRanges.value,
  });
}

function numberToString(value?: number): string | undefined {
  return typeof value === "number" ? String(value) : undefined;
}

watch(
  () => [props.filter?.termValues, props.filter?.rangeValues] as const,
  ([termValues, rangeValues]: readonly [
    SearchProductFilterValue[] | undefined,
    SearchProductFilterRangeValue[] | undefined,
  ]) => {
    selectedTerms.value = termValues?.map((item) => item.value) || [];
    selectedRanges.value = rangeValues || [];
  },
  { immediate: true },
);

const isExpanded = ref(false);

const searchKeyword = ref("");

const searchFieldVisible = computed<boolean>(() => facet.value.values.length > SEARCH_FIELD_AMOUNT);
const filtered = computed(() => {
  return facet.value.values.filter(
    (item) => item.label.toLowerCase().indexOf(searchKeyword.value.trim().toLowerCase()) >= 0,
  );
});
const searchedValues = computed(() => {
  // 1 - for fade at the bottom
  return isExpanded.value ? filtered.value : filtered.value.slice(0, SHOW_MORE_AMOUNT + 1);
});

const isShowMoreVisible = computed(() => filtered.value.length > SHOW_MORE_AMOUNT + 1);

const isSearchPerformed = computed(() => searchKeyword.value.trim().length);

const isNoResults = computed(() => !searchedValues.value.length && isSearchPerformed.value);

const fadeVisibilityAnchor = shallowRef<HTMLElement | null>(null);
const fadeVisibilityAnchorIsVisible = useElementVisibility(fadeVisibilityAnchor);

const isAnchorAdded = computed(() => searchedValues.value.length > MAX_ITEMS_VISIBLE);

const hasFade = computed(
  () =>
    (filtered.value.length > SHOW_MORE_AMOUNT + 1 && !isExpanded.value) ||
    (isAnchorAdded.value && !fadeVisibilityAnchorIsVisible.value),
);
const selectedFiltersCount = computed(() => facet.value.values.filter((item) => isSelected(item)).length);
const hasSelected = computed(() => selectedFiltersCount.value > 0);

function isSelected(item: FacetValueItemType) {
  if (facet.value.type === "terms") {
    return selectedTerms.value.includes(item.value);
  }

  if (facet.value.type === "range") {
    return selectedRanges.value.some((value) => {
      return (
        value.includeLowerBound === item.includeFrom &&
        value.includeUpperBound === item.includeTo &&
        areStringOrNumberEqual(item.from, value.lower) &&
        areStringOrNumberEqual(item.to, value.upper)
      );
    });
  }
}
</script>

<style lang="scss">
.facet-filter-widget {
  &__search {
    @apply p-3 border-b;
  }

  &__fade {
    @apply sticky bottom-0 pointer-events-none;

    &:after {
      @apply w-full absolute block -bottom-1.5 content-[''] h-10 bg-gradient-to-t from-additional-50;

      @media print {
        @apply content-none;
      }
    }
  }

  &__container {
    --scrollbar-width: 0.875rem;

    @apply overflow-y-auto relative py-1.5;
  }

  &__label {
    @apply flex-grow;
  }

  &__more {
    @apply m-1;
  }

  &__title {
    @apply flex flex-row items-center justify-start gap-2;
  }
}

.facet-filter-dropdown {
  $opened: "";

  @apply shrink-0;

  &__trigger {
    width: max-content;

    &--opened {
      $opened: &;
    }
  }

  &__search {
    @apply p-3 border-b;
  }

  &__append {
    @apply ms-2;
  }

  &__arrow {
    @apply transition-transform;

    #{$opened} & {
      @apply rotate-180;
    }
  }

  &__items {
    @apply flex-grow py-1.5;
  }
}
</style>

<template>
  <div :class="['facet-filter', `facet-filter--${mode}`, hasFade && 'facet-filter--fade-bottom']">
    <!-- Collapsable mode -->
    <VcWidget v-if="mode === 'collapsable'" size="xs" collapsible :title="facet.label" collapsed>
      <div class="facet-filter__content">
        <VcInput
          v-if="searchFieldVisible"
          v-model.trim="searchKeyword"
          size="sm"
          class="facet-filter__search"
          maxlength="30"
          :disabled="loading"
          :placeholder="$t('common.labels.search', [facet.label])"
          truncate
        />

        <div class="facet-filter__items-container">
          <VcCheckbox
            v-for="item in searchedValues"
            :key="item.value"
            v-model="item.selected"
            :class="['facet-filter__item', item.selected && 'facet-filter__item--selected']"
            :disabled="loading"
            @change="() => changeFacetValues()"
          >
            <div class="facet-filter__item-wrapper">
              <span class="facet-filter__item-label">{{ item.label }}</span>
              <VcBadge class="facet-filter__item-count" variant="outline" size="sm" rounded color="secondary">{{
                $n(item.count as number, "decimal")
              }}</VcBadge>
            </div>
          </VcCheckbox>

          <div v-if="isNoResults" class="facet-filter__no-results">
            {{ $t("pages.catalog.no_facet_found_message") }}
          </div>

          <div v-if="isAnchorAdded" ref="fadeVisibilityAnchor" class="!mt-0 h-px"></div>
        </div>
      </div>

      <template v-if="isShowMoreVisible" #footer-container>
        <div class="facet-filter__more">
          <VcButtonSeeMoreLess v-model="isExpanded" />
        </div>
      </template>
    </VcWidget>

    <!-- Dropdown mode -->
    <VcDropdownMenu
      v-if="mode === 'dropdown'"
      :offset-options="4"
      class="facet-filter__wrapper"
      :max-height="maxHeight"
    >
      <template #trigger="{ opened }">
        <VcButton
          :class="['facet-filter__trigger', opened && 'facet-filter__trigger--opened']"
          size="sm"
          :color="hasSelected ? 'accent' : 'secondary'"
          variant="outline"
        >
          <span class="facet-filter__trigger-wrapper">
            <span class="facet-filter__trigger-label">{{ facet.label }}</span>
            <VcBadge v-if="hasSelected" class="facet-filter__trigger-count" size="sm" rounded color="info">{{
              selectedFiltersCount
            }}</VcBadge>
          </span>
          <template v-if="!hasSelected" #append>
            <VcIcon name="chevron-down" class="facet-filter__trigger-arrow" />
          </template>
        </VcButton>
      </template>

      <template #content="{ close }">
        <div class="facet-filter__content">
          <VcInput
            v-if="searchFieldVisible"
            v-model.trim="searchKeyword"
            size="sm"
            class="facet-filter__search"
            maxlength="30"
            :disabled="loading"
            :placeholder="$t('common.labels.search', [facet.label])"
            truncate
          />
          <VcMenuItem
            v-for="item in searchedValues"
            :key="item.value"
            :class="['facet-filter__item', item.selected && 'facet-filter__item--selected']"
            size="sm"
            @click="() => handleFacetItemClick(item, close)"
          >
            <VcCheckbox
              v-model="item.selected"
              class="facet-filter__item-input"
              :disabled="loading"
              @change="() => changeFacetValues(close)"
              @click.stop
            >
              <div class="facet-filter__item-inner">
                <div class="facet-filter__item-label" :title="item.label">
                  {{ item.label }}
                </div>
                <VcBadge class="facet-filter__item-count" variant="outline" size="sm" rounded color="secondary">{{
                  $n(item.count as number, "decimal")
                }}</VcBadge>
              </div>
            </VcCheckbox>
          </VcMenuItem>
          <div v-if="isNoResults" class="facet-filter__no-results">
            {{ $t("pages.catalog.no_facet_found_message") }}
          </div>
          <div v-if="isAnchorAdded" ref="fadeVisibilityAnchor" class="!mt-0 h-px"></div>
        </div>
        <template v-if="isShowMoreVisible">
          <div class="facet-filter__more">
            <VcButtonSeeMoreLess v-model="isExpanded" />
          </div>
        </template>
      </template>
    </VcDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { computed, ref, watchEffect, shallowRef } from "vue";
import type { FacetItemType, FacetValueItemType } from "@/core/types";

interface IEmits {
  (event: "update:facet", facet: FacetItemType): void;
}

interface IProps {
  facet: FacetItemType;
  loading?: boolean;
  mode: "dropdown" | "collapsable";
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);

const SHOW_MORE_AMOUNT = 8;
const SEARCH_FIELD_AMOUNT = 10;
const ITEM_HEIGHT = 30;
const MAX_ITEMS_VISIBLE = 14;
const INNER_MARGIN = 16;

const isMobile = breakpoints.smaller("lg");

const MAX_HEIGHT = ITEM_HEIGHT * (MAX_ITEMS_VISIBLE + 1) + INNER_MARGIN;
const maxHeight = computed(() => (isMobile.value ? "unset" : `${MAX_HEIGHT}px`));

const facet = ref<FacetItemType>(cloneDeep(props.facet));

function changeFacetValues(close?: (() => void) | undefined): void {
  emit("update:facet", facet.value);
  if (close) {
    close();
  }
}
function handleFacetItemClick(item: FacetValueItemType, close: () => void): void {
  item.selected = !item.selected;
  changeFacetValues();
  close();
}
watchEffect(() => {
  facet.value = cloneDeep(props.facet);
});

const isExpanded = ref(false);

const searchKeyword = ref("");

const searchFieldVisible = computed<boolean>(() => facet.value.values.length > SEARCH_FIELD_AMOUNT);
const filtered = computed(() => {
  return facet.value.values.filter((item) => item.label.toLowerCase().indexOf(searchKeyword.value.toLowerCase()) >= 0);
});
const searchedValues = computed(() => {
  // 1 - for fade at the bottom
  return isExpanded.value ? filtered.value : filtered.value.slice(0, SHOW_MORE_AMOUNT + 1);
});

const isShowMoreVisible = computed(() => filtered.value.length > SHOW_MORE_AMOUNT + 1);

const isSearchPerformed = computed(() => searchKeyword.value.length);

const isNoResults = computed(() => !searchedValues.value.length && isSearchPerformed.value);

const fadeVisibilityAnchor = shallowRef<HTMLElement | null>(null);
const fadeVisibilityAnchorIsVisible = useElementVisibility(fadeVisibilityAnchor);

const isAnchorAdded = computed(() => searchedValues.value.length > MAX_ITEMS_VISIBLE);

const hasFade = computed(
  () =>
    (filtered.value.length > SHOW_MORE_AMOUNT + 1 && !isExpanded.value) ||
    (isAnchorAdded.value && !fadeVisibilityAnchorIsVisible.value),
);
const selectedFiltersCount = computed(() => facet.value.values.filter((item) => item.selected)?.length);
const hasSelected = computed(() => selectedFiltersCount.value > 0);
</script>

<style lang="scss">
.facet-filter {
  $collapsable: "";
  $dropdown: "";
  $selectedItem: "";
  $fadeBottom: "";
  $triggerOpened: "";

  &--collapsable {
    $collapsable: &;
  }

  &--dropdown {
    $dropdown: &;

    .vc-popover__content {
      @apply min-w-44;
    }

    .vc-menu-item__inner {
      @apply py-1.5 px-4;
    }

    .vc-button--color--secondary {
      @apply text-secondary-600 #{!important};
    }
  }

  &--fade-bottom {
    $fadeBottom: &;
  }

  .vc-checkbox__label {
    @apply w-full;
  }

  &__trigger {
    @apply border-2 border-r-4;

    &--opened {
      $triggerOpened: &;
    }
  }

  &__wrapper {
    @apply relative z-10;
  }

  &__trigger-wrapper {
    @apply flex items-center gap-2;
  }

  &__trigger-arrow {
    @apply ms-2 transition-transform;

    #{$triggerOpened} & {
      @apply rotate-180;
    }
  }

  &__item-input {
    @apply w-full;
  }

  &__item {
    &--selected {
      $selectedItem: &;
    }
  }

  &__item-inner {
    @apply flex items-center;
  }

  &__item-count {
    @apply ms-auto;
  }

  &__content {
    #{$dropdown} & {
      @apply max-w-72 overflow-y-auto py-2;
    }

    #{$fadeBottom}#{$dropdown} & {
      @apply pb-0;
    }

    #{$fadeBottom} & {
      --scrollbar-width: 15px;
      @apply relative;

      &:after {
        @apply w-full absolute block bottom-0 content-[''] h-10 bg-gradient-to-t from-additional-50;

        @media print {
          @apply content-none;
        }
      }
    }
  }

  &__search {
    #{$collapsable} & {
      @apply mb-4;
    }

    #{$dropdown} & {
      @apply mx-4 my-2;
    }
  }

  &__items-container {
    #{$collapsable} & {
      @apply -me-1 space-y-3 overflow-y-auto pe-1;

      max-height: v-bind(maxHeight);
    }
  }

  &__item-label {
    @apply truncate;

    #{$dropdown} & {
      @apply me-5 text-sm;
    }

    #{$selectedItem} & {
      @apply font-bold;
    }
  }

  &__item-wrapper {
    #{$collapsable} & {
      @apply flex text-sm items-center;
    }
  }

  &__no-results {
    @apply text-sm;

    #{$dropdown} & {
      @apply px-4 py-2;
    }
  }

  &__more {
    #{$collapsable} & {
      @apply px-2 py-0.5;
    }

    #{$dropdown} & {
      @apply px-4 py-2;
    }

    #{$fadeBottom}#{$dropdown} & {
      @apply mt-2;
    }
  }
}
</style>

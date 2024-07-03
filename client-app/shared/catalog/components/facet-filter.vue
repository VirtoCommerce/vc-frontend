<template>
  <div :class="`facet-filter facet-filter--${mode}`">
    <!-- Collapsable mode -->
    <VcWidget v-if="mode === 'collapsable'" size="xs" collapsible :title="facet.label" collapsed>
      <div :class="['facet-filter__content', hasFade && 'facet-filter__content--fade-bottom']">
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
            @change="changeFacetValues"
          >
            <div class="facet-filter__item-wrapper">
              <span class="facet-filter__item-label">{{ item.label }}</span>
              <span class="facet-filter__item-count">{{
                $t("pages.catalog.facet_card.item_count_format", [item.count])
              }}</span>
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
            @click="close"
          >
            <VcCheckbox
              v-model="item.selected"
              class="facet-filter__item-input"
              :disabled="loading"
              @change="changeFacetValues"
            >
              <div class="facet-filter__item-inner">
                <div class="facet-filter__item-label" :title="item.label">
                  {{ item.label }}
                </div>
                <VcBadge class="facet-filter__item-count" variant="outline" size="sm" rounded color="secondary">{{
                  item.count
                }}</VcBadge>
              </div>
            </VcCheckbox>
          </VcMenuItem>
          <div v-if="isNoResults" class="facet-filter__no-results">
            {{ $t("pages.catalog.no_facet_found_message") }}
          </div>

          <template v-if="isShowMoreVisible">
            <div class="facet-filter__more">
              <VcButtonSeeMoreLess v-model="isExpanded" />
            </div>
          </template>
        </div>
      </template>
    </VcDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { computed, ref, watchEffect, shallowRef } from "vue";
import type { FacetItemType } from "@/core/types";

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

function changeFacetValues(): void {
  emit("update:facet", facet.value);
}
watchEffect(() => {
  facet.value = cloneDeep(props.facet);
});

const isExpanded = ref(false);

const searchKeyword = ref("");

const searchFieldVisible = computed<boolean>(() => facet.value.values.length > SEARCH_FIELD_AMOUNT);
const searchedValues = computed(() => {
  const filtered = facet.value.values.filter(
    (item) => item.label.toLowerCase().indexOf(searchKeyword.value.toLowerCase()) >= 0,
  );
  // 1 - for fade at the bottom
  return isExpanded.value ? filtered : filtered.slice(0, SHOW_MORE_AMOUNT + 1);
});

const isShowMoreVisible = computed(() => searchedValues.value.length > SHOW_MORE_AMOUNT);

const isSearchPerformed = computed(() => searchKeyword.value.length);

const isNoResults = computed(() => !searchedValues.value.length && isSearchPerformed.value);

const fadeVisibilityAnchor = shallowRef<HTMLElement | null>(null);
const fadeVisibilityAnchorIsVisible = useElementVisibility(fadeVisibilityAnchor);

const isAnchorAdded = computed(() => searchedValues.value.length > MAX_ITEMS_VISIBLE);

const hasFade = computed(
  () =>
    (searchedValues.value.length > SHOW_MORE_AMOUNT && !isExpanded.value) ||
    (isAnchorAdded.value && !fadeVisibilityAnchorIsVisible.value),
);
const selectedFiltersCount = computed(() => facet.value.values.filter((item) => item.selected)?.length);
const hasSelected = computed(() => selectedFiltersCount.value > 0);
</script>

<style lang="scss">
.facet-filter {
  &__trigger {
    @apply border-2 border-r-4;

    &--opened {
      .facet-filter__trigger-arrow {
        @apply rotate-180;
      }
    }
  }

  &__wrapper {
    @apply relative z-10;
  }

  &__trigger-wrapper {
    @apply flex items-center gap-2;
  }

  &__trigger-arrow {
    @apply ml-2 transition-transform;
  }

  &__item-input {
    @apply w-full;
  }

  &__item-inner {
    @apply flex items-center;
  }

  &--collapsable {
    .facet-filter__content {
      &--fade-bottom {
        --scrollbar-width: 15px;

        position: relative;
        &:after {
          width: calc(100% - var(--scrollbar-width));
          @apply absolute block bottom-0 content-[''] h-10 bg-gradient-to-t from-white;

          @media print {
            @apply content-none;
          }
        }
      }
    }

    .facet-filter__search {
      @apply mb-4;
    }

    .facet-filter__items-container {
      @apply -me-1 space-y-3 overflow-y-auto pe-1;

      max-height: v-bind(maxHeight);
    }

    .facet-filter__item {
      &--selected {
        .facet-filter__item-label {
          @apply font-semibold;
        }
      }
    }

    .facet-filter__item-count {
      @apply ml-1;
    }

    .facet-filter__item-label {
      @apply truncate;
    }

    .facet-filter__item-wrapper {
      @apply flex text-13 font-medium text-gray-500;
    }

    .facet-filter__no-results {
      @apply text-sm font-medium;
    }

    .facet-filter__more {
      @apply px-2 py-0.5;
    }
  }

  &--dropdown {
    .vc-popover__content {
      @apply min-w-44;
    }

    .vc-checkbox__label {
      @apply w-full;
    }

    .vc-checkbox__container {
      @apply px-4 py-1.5;
    }

    .vc-menu-item__inner {
      @apply p-0;
    }

    .vc-button--color--secondary {
      color: var(--color-secondary-600);
    }

    .facet-filter__search {
      @apply mx-4 my-2;
    }

    .facet-filter__content {
      @apply max-w-72 overflow-y-auto py-2;
    }

    .facet-filter__item {
      &--selected {
        .facet-filter__item-label {
          @apply font-semibold;
        }
      }
    }

    .facet-filter__item-count {
      @apply ml-auto;
    }

    .facet-filter__item-label {
      @apply mr-5 truncate text-13 font-medium text-gray-500;
    }

    .facet-filter__no-results {
      @apply px-4 py-2 text-sm font-medium;
    }

    .facet-filter__more {
      @apply px-4 py-2;
    }
  }
}
</style>

<template>
  <div class="facet-filter">
    <!-- Collapsable mode -->
    <VcWidget v-if="mode === 'collapsable'" size="xs" collapsible :title="facet.label" collapsed>
      <template #default-container>
        <div v-if="searchFieldVisible" class="facet-filter__search">
          <VcInput
            v-model.trim="searchKeyword"
            size="sm"
            maxlength="30"
            :disabled="loading"
            :placeholder="$t('common.labels.search', [facet.label])"
            truncate
          />
        </div>

        <div class="facet-filter__items-container" :style="{ maxHeight }">
          <VcMenuItem
            v-for="item in searchedValues"
            :key="item.value"
            size="xs"
            color="secondary"
            @click="() => handleFacetItemClick(item)"
          >
            <VcCheckbox v-model="item.selected" size="sm" :disabled="loading" @change="() => changeFacetValues()" />

            <span class="facet-filter__item-label">{{ item.label }}</span>

            <VcBadge variant="outline" size="sm" rounded color="secondary">
              {{ item.count }}
            </VcBadge>
          </VcMenuItem>

          <div v-if="isNoResults" class="facet-filter__no-results">
            {{ $t("pages.catalog.no_facet_found_message") }}
          </div>

          <div v-if="isAnchorAdded" ref="fadeVisibilityAnchor" class="facet-filter__anchor"></div>
          <div v-if="hasFade" class="facet-filter__fade"></div>
        </div>
      </template>

      <template v-if="isShowMoreVisible" #footer-container>
        <VcButtonSeeMoreLess v-model="isExpanded" class="m-1" />
      </template>
    </VcWidget>

    <!-- Dropdown mode -->
    <VcDropdownMenu v-if="mode === 'dropdown'" :offset-options="4" :max-height="maxHeight" width="15rem" z-index="10">
      <template #trigger="{ opened }">
        <VcButton size="sm" :color="hasSelected ? 'accent' : 'secondary'" variant="outline">
          {{ facet.label }}

          <template #append>
            <VcBadge v-if="hasSelected" size="sm" rounded color="info">
              {{ selectedFiltersCount }}
            </VcBadge>

            <VcIcon
              v-else
              name="chevron-down"
              :class="[
                'facet-filter__arrow',
                {
                  'facet-filter__arrow--rotate': opened,
                },
              ]"
            />
          </template>
        </VcButton>
      </template>

      <template #content="{ close }">
        <div v-if="searchFieldVisible" class="facet-filter__search">
          <VcInput
            v-model.trim="searchKeyword"
            size="sm"
            class="facet-filter__search"
            maxlength="30"
            :disabled="loading"
            :placeholder="$t('common.labels.search', [facet.label])"
            truncate
          />
        </div>

        <VcMenuItem
          v-for="item in searchedValues"
          :key="item.value"
          size="sm"
          truncate
          :active="item.selected"
          :title="item.label"
          @click="() => handleFacetItemClick(item, close)"
        >
          <VcCheckbox
            v-model="item.selected"
            :disabled="loading"
            @change="() => changeFacetValues(close)"
            @click.stop
          />

          <div class="facet-filter__item-label">
            {{ item.label }}
          </div>

          <VcBadge variant="outline" size="sm" rounded color="secondary">
            {{ item.count }}
          </VcBadge>
        </VcMenuItem>

        <div v-if="isNoResults" class="facet-filter__no-results">
          {{ $t("pages.catalog.no_facet_found_message") }}
        </div>
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

function handleFacetItemClick(item: FacetValueItemType, close?: () => void): void {
  item.selected = !item.selected;
  changeFacetValues();

  if (close) {
    close();
  }
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
  &__trigger-arrow {
    @apply ms-2 transition-transform;

    &--rotate {
      @apply rotate-180;
    }
  }

  &__search {
    @apply p-3 border-b;
  }

  &__items-container {
    --scrollbar-width: 1rem;
    @apply relative overflow-y-auto pt-2;
  }

  &__item-label {
    @apply flex-grow;
  }

  &__no-results {
    @apply text-sm px-4 py-2;
  }

  &__fade {
    @apply sticky bottom-0;

    &:after {
      @apply w-full absolute block bottom-0 content-[''] h-10 bg-gradient-to-t from-additional-50;

      @media print {
        @apply content-none;
      }
    }
  }
}
</style>

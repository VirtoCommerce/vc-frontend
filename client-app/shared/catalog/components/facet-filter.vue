<template>
  <div :class="`facet-filter facet-filter--${mode}`">
    <VcWidget v-if="mode === 'collapsable'" size="xs" collapsible :title="facet.label" collapsed>
      <div :class="{ 'fade-bottom': hasFade }">
        <VcInput
          v-if="searchFieldVisible"
          v-model.trim="searchKeyword"
          size="sm"
          class="mb-4"
          maxlength="30"
          :disabled="loading"
          :placeholder="$t('common.labels.search', [facet.label])"
          truncate
        />

        <div class="-me-1 space-y-3 overflow-y-auto pe-1" :style="{ maxHeight }">
          <VcCheckbox
            v-for="item in searchedValues"
            :key="item.value"
            v-model="item.selected"
            :disabled="loading"
            @change="changeFacetValues"
          >
            <div :class="['flex text-13', item.selected ? 'font-semibold' : 'font-medium text-gray-500']">
              <span class="truncate">{{ item.label }}</span>
              <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
            </div>
          </VcCheckbox>

          <div v-if="isNoResults" class="text-sm font-medium">{{ $t("pages.catalog.no_facet_found_message") }}</div>

          <div v-if="isAnchorAdded" ref="fadeVisibilityAnchor" class="!mt-0 h-px"></div>
        </div>
      </div>

      <template v-if="isShowMoreVisible" #footer-container>
        <div class="px-2 py-0.5">
          <VcButtonSeeMoreLess v-model="isExpanded" />
        </div>
      </template>
    </VcWidget>

    <VcDropdownMenu v-if="mode === 'dropdown'" :offset-options="4" class="relative z-10" max-height="20rem">
      <template #trigger="{ opened }">
        <VcButton
          class="facet-filter__trigger border-2 border-r-4"
          size="sm"
          :color="hasSelected ? 'accent' : 'secondary'"
          variant="outline"
          :append-icon="!hasSelected && (opened ? 'chevron-up' : 'chevron-down')"
        >
          <span class="flex items-center gap-2">
            {{ facet.label }}
            <VcBadge v-if="hasSelected" size="sm" rounded color="info">{{ selectedFiltersCount }}</VcBadge>
          </span>
        </VcButton>
      </template>
      <template #content="{ close }">
        <div class="max-w-72 py-2">
          <VcMenuItem
            v-for="item in searchedValues"
            :key="item.value + '_'"
            class="facet-filter__item"
            size="sm"
            @click="close"
          >
            <VcCheckbox v-model="item.selected" class="w-full" :disabled="loading" @change="changeFacetValues">
              <div class="flex items-center">
                <div
                  :class="['mr-5 truncate text-13', item.selected ? 'font-semibold' : 'font-medium text-gray-500']"
                  :title="item.label"
                >
                  {{ item.label }}
                </div>
                <VcBadge class="ml-auto" variant="outline" size="sm" rounded color="secondary">{{
                  item.count
                }}</VcBadge>
              </div>
            </VcCheckbox>
          </VcMenuItem>
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

<style scoped lang="scss">
.fade-bottom {
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

.facet-filter--dropdown {
  :deep(.vc-popover__content) {
    @apply min-w-full;
  }

  :deep(.vc-checkbox__label) {
    @apply w-full;
  }

  :deep(.vc-checkbox__container) {
    @apply px-4 py-1.5;
  }

  :deep(.vc-menu-item__inner) {
    @apply p-0;
  }
}
</style>

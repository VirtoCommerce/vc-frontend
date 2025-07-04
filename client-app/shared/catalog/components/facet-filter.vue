<template>
  <!-- Collapsable mode -->
  <VcWidget
    v-if="mode === 'collapsable'"
    class="facet-filter-widget"
    size="xs"
    collapsible
    :title="facet.label"
    collapsed
  >
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

      <div class="mb-2 mt-8 px-3">
        <VcSlider
          v-if="type === 'slider'"
          v-model="sliderValue"
          :min="facetMin"
          :max="facetMax"
          :cols="sliderCols"
          show-tooltip-on-col-hover
          update-on-column-click
        />
      </div>

      <div class="facet-filter-widget__container" :style="{ maxHeight }">
        <VcMenuItem
          v-for="item in searchedValues"
          :key="item.value"
          size="xs"
          color="secondary"
          @click="handleFacetItemClick(item)"
        >
          <template #prepend>
            <VcCheckbox
              v-model="item.selected"
              tabindex="-1"
              size="xs"
              :disabled="loading"
              @change="changeFacetValues"
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
  </VcWidget>

  <!-- Dropdown mode -->
  <VcDropdownMenu
    v-if="mode === 'dropdown'"
    :offset-options="4"
    class="facet-filter-dropdown"
    z-index="10"
    max-height="20rem"
    width="15rem"
    :dividers="false"
    data-facet-filter-dropdown
  >
    <template #trigger="{ opened }">
      <VcButton
        :class="['facet-filter-dropdown__trigger', { 'facet-filter-dropdown__trigger--opened': opened }]"
        size="sm"
        :color="hasSelected ? 'accent' : 'secondary'"
        variant="outline"
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
          :active="item.selected"
          :title="item.label"
          @click="
            handleFacetItemClick(item);
            close();
          "
        >
          <template #prepend>
            <VcCheckbox
              v-model="item.selected"
              size="xs"
              :disabled="loading"
              @change="
                changeFacetValues();
                close();
              "
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
import { breakpointsTailwind, useBreakpoints, useElementVisibility, watchDebounced } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { computed, ref, watchEffect, shallowRef, toRef } from "vue";
import { getFilterExpressionFromFacetRange } from "@/core/utilities";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ColType } from "@/ui-kit/components/molecules/slider/vc-slider.vue";

interface IEmits {
  (event: "update:facet", facet: FacetItemType): void;
}

interface IProps {
  facet: FacetItemType;
  loading?: boolean;
  mode: "dropdown" | "collapsable";
  type?: "default" | "slider";
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  type: "default",
});

const breakpoints = useBreakpoints(breakpointsTailwind);

const SHOW_MORE_AMOUNT = 8;
const SEARCH_FIELD_AMOUNT = 10;
const ITEM_HEIGHT = 38;
const MAX_ITEMS_VISIBLE = 14;
const INNER_MARGIN = 0;

const isMobile = breakpoints.smaller("lg");

const MAX_HEIGHT = ITEM_HEIGHT * (MAX_ITEMS_VISIBLE + 1) + INNER_MARGIN;
const maxHeight = computed(() => (isMobile.value ? "unset" : `${MAX_HEIGHT}px`));

const facet = ref<FacetItemType>(cloneDeep(toRef(props, "facet").value));

function changeFacetValues(): void {
  emit("update:facet", facet.value);
}

function handleFacetItemClick(item: FacetValueItemType): void {
  item.selected = !item.selected;
  changeFacetValues();
}

watchEffect(() => {
  facet.value = cloneDeep(props.facet);
});

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
const selectedFiltersCount = computed(() => facet.value.values.filter((item) => item.selected)?.length);
const hasSelected = computed(() => selectedFiltersCount.value > 0);

const facetMin = computed(() => {
  return facet.value.values[0].from || 0;
});

const facetMax = computed(() => {
  return facet.value.values.at(-1)?.to || 1799999999;
});

const sliderValue = ref<[number, number]>([50, 600]);

const sliderCols = computed<ColType[]>(() => {
  return facet.value.values
    .filter((item) => item.count !== undefined && item.from !== undefined && item.to !== undefined)
    .map((item) => {
      return {
        count: item.count!,
        value: [item.from!, item.to!] as [number, number],
      };
    });
});

watchDebounced(
  sliderValue,
  (value) => {
    emit("update:facet", {
      label: "price",
      paramName: "price",
      type: "range",
      values: [
        {
          label: "slider",
          selected: true,
          value: getFilterExpressionFromFacetRange({
            from: value[0],
            to: value[1],
            includeFrom: true,
            includeTo: true,
          }),
        },
      ],
    });
  },
  { debounce: 200 },
);
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

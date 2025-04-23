<template>
  <VcWidget
    v-if="!model.hidden"
    :class="[
      'variations',
      {
        'variations--full-view': isFullView && !isSmallScreen,
      },
    ]"
    size="lg"
    :title="model.title || $t('shared.catalog.product_details.variations.title')"
    prepend-icon="cube"
  >
    <template v-if="!isSmallScreen && isTableView" #append>
      <VcButton
        :icon="isFullView ? 'delete-2' : 'arrows-expand'"
        color="neutral"
        variant="no-border"
        size="sm"
        @click="isFullView = !isFullView"
      />
    </template>

    <div class="variations__views">
      <div v-if="!isSmallScreen" class="variations__view-mode">
        <VcTabSwitch
          v-model="isTableView"
          :value="false"
          icon="list"
          :label="$t('shared.catalog.product_details.variations.list')"
          @change="toggleView"
        />

        <VcTabSwitch
          v-model="isTableView"
          :value="Boolean(true)"
          icon="table"
          :label="$t('shared.catalog.product_details.variations.table')"
          @change="toggleView"
        />
      </div>

      <VcButton variant="outline" @click="$emit('showFilters')">
        {{ $t("common.buttons.filters") }}
      </VcButton>
    </div>

    <!-- Filters chips -->
    <div v-if="hasSelectedFilters" class="variations__chips">
      <template v-for="facet in productsFilters?.facets">
        <template v-for="filterItem in facet.values">
          <VcChip
            v-if="filterItem.selected"
            :key="facet.paramName + filterItem.value"
            color="secondary"
            closable
            @close="
              $emit('removeFacetFilter', {
                paramName: facet.paramName,
                value: filterItem.value,
              })
            "
          >
            {{ filterItem.label }}
          </VcChip>
        </template>
      </template>

      <VcChip color="secondary" variant="outline" clickable @click="$emit('resetFacetFilters')">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
      </VcChip>
    </div>

    <VariationsDefault
      v-if="isSmallScreen || (!isSmallScreen && !isTableView)"
      :variations="variations"
      :fetching="fetchingVariations"
      :page-number="pageNumber"
      :pages-count="pagesCount"
      @change-page="changePage"
    />

    <VariationsTable
      v-else
      :variations="variations"
      :sort="sort"
      :fetching="fetchingVariations"
      :page-number="pageNumber"
      :pages-count="pagesCount"
      @apply-sorting="applySorting"
      @change-page="changePage"
    />

    <VcEmptyView
      v-if="variations.length === 0 && !fetchingVariations"
      :text="$t('shared.catalog.product_details.variations.no_results')"
      icon="outline-stock"
    />
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables";
import { BREAKPOINTS } from "@/core/constants";
import VariationsDefault from "./variations-default.vue";
import VariationsTable from "./variations-table.vue";
import type { Product } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType, ISortInfo } from "@/core/types";
import type { ProductsFiltersType } from "@/shared/catalog";

interface IEmits {
  (event: "applySorting", item: ISortInfo): void;
  (event: "changePage", pageNumber: number): void;
  (event: "showFilters"): void;
  (event: "removeFacetFilter", payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">): void;
  (event: "resetFacetFilters"): void;
}

interface IProps {
  variations: Product[];
  fetchingVariations: boolean;
  sort: ISortInfo;
  model: {
    title?: string;
    hidden?: boolean;
  };
  pageNumber: number;
  pagesCount: number;
  productsFilters?: ProductsFiltersType;
  hasSelectedFilters: boolean;
  productId: string;
  productName: string;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const variations = toRef(props, "variations");

const { analytics } = useAnalytics();
const { t } = useI18n();
const breakpoints = useBreakpoints(BREAKPOINTS);

const isFullView = ref(false);
const isTableView = ref(false);
const isSmallScreen = breakpoints.smaller("xl");

function toggleView() {
  isTableView.value = !isTableView.value;
  isFullView.value = false;
}

function applySorting(sortInfo: ISortInfo): void {
  emit("applySorting", sortInfo);
}

function changePage(page: number): void {
  emit("changePage", page);
}

onMounted(() => {
  window.addEventListener("keyup", handleKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("keyup", handleKeyUp);
});

function handleKeyUp(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isFullView.value = false;
  }
}

watch(
  variations,
  (newVariations) => {
    if (!newVariations.length) {
      return;
    }

    analytics("viewItemList", newVariations, {
      item_list_id: `variations_${props.productId}`,
      item_list_name: `${t("shared.catalog.product_details.variations.title")} ${props.productName}`,
    });
  },
  { immediate: true },
);
</script>

<style lang="scss">
.variations {
  &--full-view {
    @media (width >= theme("screens.xl")) {
      --variations-margin-x: theme("margin.4");

      @apply z-10 shadow-2xl;

      width: calc(100vw - var(--variations-margin-x) * 2);
      margin-left: calc((var(--vc-container-offset) - var(--variations-margin-x)) * -1);
    }
  }

  &__views {
    @apply flex justify-between items-center mb-6 gap-3;
  }

  &__view-mode {
    @apply space-x-2;
  }

  &__chips {
    @apply flex flex-wrap gap-x-3 gap-y-2 pb-6;
  }
}
</style>

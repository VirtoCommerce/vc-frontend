<template>
  <VcFilterCard is-collapsible :title="facet.label" :is-collapsed="!filterHasSelectedValues">
    <div class="py-1">
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

      <div class="space-y-3 overflow-y-auto" :style="{ maxHeight: `${MAX_HEIGHT}px` }">
        <VcCheckbox
          v-for="item in searchedValues"
          :key="item.value"
          v-model="item.selected"
          :disabled="loading"
          @change="changeFacetValues"
        >
          <div :class="[item.selected ? 'font-semibold' : 'font-medium text-gray-500']" class="flex text-13">
            <span class="truncate">{{ item.label }}</span>
            <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
          </div>
        </VcCheckbox>
        <p v-if="isNoResults" class="text-sm font-medium">{{ $t("pages.catalog.no_facet_found_message") }}</p>
      </div>
    </div>
    <template v-if="isShowMoreVisible" #footer>
      <VcButtonSeeMoreLess v-model="isExpanded" class="!py-0" />
    </template>
  </VcFilterCard>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { computed, ref, watchEffect } from "vue";
import type { FacetItemType } from "@/core/types";
import VcFilterCard from "@/ui-kit/components/atoms/filter-card/vc-filter-card.vue";
import VcButtonSeeMoreLess from "@/ui-kit/components/molecules/button-see-more-less/vc-button-see-more-less.vue";

interface IEmits {
  (event: "update:facet", facet: FacetItemType): void;
}

interface IProps {
  facet: FacetItemType;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const SHOW_MORE_AMOUNT = 8;
const SEARCH_FIELD_AMOUNT = 10;

// approx item height 30px plus space
const MAX_HEIGHT = 30 * 14 + 16;

const facet = ref<FacetItemType>(cloneDeep(props.facet));

const isShowMoreVisible = computed(() => facet.value.values.length > SHOW_MORE_AMOUNT);
const isExpanded = ref(false);

const searchKeyword = ref("");

const searchFieldVisible = computed<boolean>(() => facet.value.values.length > SEARCH_FIELD_AMOUNT);
const searchedValues = computed(() => {
  const filtered = facet.value.values.filter(
    (item) => item.label.toLowerCase().indexOf(searchKeyword.value.toLowerCase()) >= 0
  );
  return isExpanded.value ? filtered : filtered.slice(0, SHOW_MORE_AMOUNT);
});

const isNoResults = computed(
  () => searchKeyword.value.length && searchFieldVisible.value && !searchedValues.value.length
);

function changeFacetValues(): void {
  emit("update:facet", facet.value);
}

watchEffect(() => {
  facet.value = cloneDeep(props.facet);
});

const filterHasSelectedValues = computed(() => facet.value.values.some((value) => value.selected));
</script>

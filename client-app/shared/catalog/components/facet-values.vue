<template>
  <div>
    <VcInput
      v-if="searchFieldVisible"
      v-model.trim="searchKeyword"
      size="sm"
      maxlength="30"
      :disabled="loading"
      :placeholder="$t('common.labels.search', [facet.label])"
      @input="searchFacetValues"
    />

    <VcCheckbox
      v-for="item in searchedValues"
      :key="item.value"
      v-model="item.selected"
      :disabled="loading"
      class="mt-3 first:mt-1 last:mb-2"
      @change="changeFacetValues"
    >
      <div :class="[item.selected ? 'font-semibold' : 'font-medium text-gray-500']" class="flex text-13">
        <span class="truncate">{{ item.label }}</span>
        <span class="ml-1">{{ $t("pages.catalog.facet_card.item_count_format", [item.count]) }}</span>
      </div>
    </VcCheckbox>
  </div>
</template>

<script lang="ts" setup>
import { computedEager } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { ref, watch } from "vue";
import type { FacetItemType } from "@/core/types";

interface IEmits {
  (event: "update:facet", facet: FacetItemType): void;
}

interface IProps {
  facet: FacetItemType;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const facet = ref<FacetItemType>(cloneDeep(props.facet));

const searchKeyword = ref("");
const searchedValues = ref(facet.value.values);

const searchFieldVisible = computedEager<boolean>(() => props.facet.values.length > 10);

function changeFacetValues(): void {
  emit("update:facet", facet.value);
}

function searchFacetValues(): void {
  searchedValues.value = props.facet.values.filter((item) => item.label.indexOf(searchKeyword.value) >= 0);
}

watch(
  () => props.facet,
  (value: FacetItemType) => {
    facet.value = cloneDeep(value);
  },
  { deep: true }
);
</script>

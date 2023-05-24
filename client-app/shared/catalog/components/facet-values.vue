<template>
  <div class="space-y-3 py-1">
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
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { computed, ref, watchEffect } from "vue";
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

const searchFieldVisible = computed<boolean>(() => facet.value.values.length > 10);
const searchedValues = computed(() =>
  facet.value.values.filter((item) => item.label.toLowerCase().indexOf(searchKeyword.value.toLowerCase()) >= 0)
);

function changeFacetValues(): void {
  emit("update:facet", facet.value);
}

watchEffect(() => {
  facet.value = cloneDeep(props.facet);
});
</script>
